import crypto from "node:crypto";

/**
 * Alfabeto estándar Base32 según RFC 4648.
 */
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Codifica un Buffer binario en una cadena Base32.
 */
export function encodeBase32(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Decodifica una cadena Base32 en un Buffer binario.
 */
export function decodeBase32(input: string): Buffer {
  const cleaned = input.toUpperCase().replace(/=+$/, "").replace(/[\s-]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) {
      throw new Error(`Carácter Base32 inválido detectado: ${char}`);
    }

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Genera un secreto criptográfico aleatorio de 160 bits (20 bytes) codificado en Base32.
 */
export function generateTotpSecret(): string {
  const randomBytes = crypto.randomBytes(20);
  return encodeBase32(randomBytes);
}

/**
 * Calcula el código TOTP de 6 dígitos para un secreto Base32 y un paso de tiempo dado (RFC 6238).
 */
export function computeTotp(secretBase32: string, timeStep: number): string {
  const key = decodeBase32(secretBase32);

  // Buffer de 8 bytes en formato Big-Endian para el contador de tiempo
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigInt64BE(BigInt(timeStep), 0);

  const hmac = crypto.createHmac("sha1", key);
  hmac.update(timeBuffer);
  const digest = hmac.digest();

  // Dynamic Truncation (RFC 4226 / RFC 6238)
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = (binary % 1_000_000).toString().padStart(6, "0");
  return otp;
}

export interface VerifyTotpResult {
  valid: boolean;
  step?: number;
  reason?: "invalid_code" | "replayed_step" | "invalid_format";
}

/**
 * Verifica un código TOTP de 6 dígitos con ventana de tolerancia de ±1 paso (30s antes y después).
 * Evita repetición si se especifica lastVerifiedStep.
 */
export function verifyTotp(
  secretBase32: string,
  code: string,
  options?: {
    window?: number; // Tolerancia en pasos (default: 1, equivalente a ±30s)
    currentTimestampMs?: number;
    lastVerifiedStep?: number;
  },
): VerifyTotpResult {
  const trimmed = code.trim().replace(/\s+/g, "");
  if (!/^\d{6}$/.test(trimmed)) {
    return { valid: false, reason: "invalid_format" };
  }

  const nowMs = options?.currentTimestampMs ?? Date.now();
  const currentStep = Math.floor(nowMs / 1000 / 30);
  const windowSteps = options?.window ?? 1;
  const lastStep = options?.lastVerifiedStep;

  for (let offset = -windowSteps; offset <= windowSteps; offset++) {
    const step = currentStep + offset;

    // Protección contra replay: no permitir reusar el mismo paso de tiempo ya verificado
    if (lastStep !== undefined && step <= lastStep) {
      continue;
    }

    try {
      const computed = computeTotp(secretBase32, step);
      if (crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(trimmed))) {
        return { valid: true, step };
      }
    } catch {
      return { valid: false, reason: "invalid_format" };
    }
  }

  return { valid: false, reason: "invalid_code" };
}

/**
 * Genera el URI estándar otpauth:// para escanear en apps autenticadoras.
 */
export function generateOtpauthUri(
  accountName: string,
  secretBase32: string,
  issuer: string = "Distribuidora Var San",
): string {
  const encodedAccount = encodeURIComponent(accountName);
  const encodedIssuer = encodeURIComponent(issuer);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secretBase32}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Genera 8 códigos de respaldo criptográficos únicos de formato "XXXX-XXXX".
 */
export function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = [];
  const charSet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // Caracteres claros, omitiendo I, 1, O, 0

  for (let i = 0; i < count; i++) {
    const randomBytes = crypto.randomBytes(8);
    let codePart1 = "";
    let codePart2 = "";

    for (let j = 0; j < 4; j++) {
      codePart1 += charSet[randomBytes[j] % charSet.length];
      codePart2 += charSet[randomBytes[j + 4] % charSet.length];
    }

    codes.push(`${codePart1}-${codePart2}`);
  }

  return codes;
}

/**
 * Calcula el hash SHA-256 de un código de respaldo o código de rescate.
 */
export function hashSecurityCode(code: string, salt: string = ""): string {
  const normalized = code.trim().toUpperCase().replace(/[\s-]/g, "");
  return crypto.createHmac("sha256", salt || "dvs-2fa-salt").update(normalized).digest("hex");
}

/**
 * Genera un código OTP de rescate de 6 dígitos numéricos usando crypto.randomInt.
 */
export function generateRescueCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

let devMasterKeyBuffer: Buffer | null = null;

/**
 * Clave interna derivada para el cifrado autenticado AES-256-GCM de secretos TOTP en reposo.
 * En producción (NODE_ENV === 'production'), TWO_FACTOR_MASTER_KEY es estrictamente obligatoria.
 */
function getEncryptionKey(): Buffer {
  const masterSecret = process.env.TWO_FACTOR_MASTER_KEY;

  if (masterSecret && masterSecret.trim().length > 0) {
    return crypto.createHash("sha256").update(masterSecret.trim()).digest();
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[FATAL SECURITY CONFIGURATION] La variable de entorno TWO_FACTOR_MASTER_KEY es requerida en producción para el cifrado de secretos 2FA pero no fue provista.",
    );
  }

  // En entorno de desarrollo / pruebas locales sin master key explícita,
  // generamos una clave efímera segura en memoria para la sesión actual del proceso,
  // impidiendo el uso de contraseñas estáticas o hardcodeadas en el código fuente.
  if (!devMasterKeyBuffer) {
    devMasterKeyBuffer = crypto.randomBytes(32);
  }
  return devMasterKeyBuffer;
}

/**
 * Cifra el secreto Base32 en reposo mediante AES-256-GCM.
 */
export function encryptTotpSecret(secretBase32: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(secretBase32, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  // Formato: iv:tag:ciphertext (en hex)
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Descifra el secreto Base32 mediante AES-256-GCM.
 */
export function decryptTotpSecret(encryptedPayload: string): string {
  const [ivHex, tagHex, encryptedHex] = encryptedPayload.split(":");
  if (!ivHex || !tagHex || !encryptedHex) {
    throw new Error("Formato de secreto cifrado inválido.");
  }

  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
