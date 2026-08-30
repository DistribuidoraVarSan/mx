import { getApiBaseUrl } from '../../lib/session-client';

export interface UsernameValidationResult {
  valid: boolean;
  error?: string;
}

const RESERVED_USERNAMES = new Set([
  'admin', 'administrator', 'root', 'support', 'soporte',
  'varsan', 'distribuidora', 'distribuidoravarsan', 'emilia',
  'system', 'null', 'undefined', 'moderator', 'help', 'ayuda',
  'contacto', 'contact', 'ventas', 'sales', 'info', 'billing',
  'facturacion', 'api', 'auth', 'security', 'seguridad', 'test',
  'demo', 'bot', 'owner', 'ceo', 'director', 'distribuidor',
]);

const PROFANE_PATTERNS = [
  /put[oa]/i, /mierda/i, /pendej[oa]/i, /chinga/i, /cabron/i,
  /verga/i, /cul[oa]/i, /fuck/i, /shit/i, /bitch/i, /asshole/i,
  /nazi/i, /hitler/i, /idiot/i, /estupid[oa]/i, /maric[oa]n/i,
];

/**
 * Valida un nombre de usuario en frontend antes de la comprobación asíncrona con el backend/Firestore.
 */
export function validateUsernameFormat(username: string): UsernameValidationResult {
  const trimmed = username.trim().toLowerCase();

  if (!trimmed) {
    return { valid: false, error: 'El nombre de usuario es obligatorio.' };
  }

  if (trimmed.length < 6) {
    return { valid: false, error: 'El usuario debe tener al menos 6 caracteres.' };
  }

  if (trimmed.length > 30) {
    return { valid: false, error: 'El usuario no puede exceder 30 caracteres.' };
  }

  // Solo caracteres permitidos: a-z, 0-9, punto y guion bajo
  if (!/^[a-z0-9_.]+$/.test(trimmed)) {
    return { valid: false, error: 'Solo se permiten letras, números, puntos y guiones bajos.' };
  }

  if (trimmed.startsWith('.') || trimmed.endsWith('.') || trimmed.startsWith('_') || trimmed.endsWith('_')) {
    return { valid: false, error: 'El usuario no puede iniciar ni terminar con punto o guion bajo.' };
  }

  if (trimmed.includes('..')) {
    return { valid: false, error: 'No se permiten puntos consecutivos.' };
  }

  // Filtro de palabras reservadas y ofensivas
  if (RESERVED_USERNAMES.has(trimmed)) {
    return { valid: false, error: 'Este usuario no está disponible.' };
  }

  for (const pattern of PROFANE_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { valid: false, error: 'Este usuario no está disponible.' };
    }
  }

  return { valid: true };
}

/**
 * Comprueba disponibilidad con el backend API y Firestore.
 */
export async function checkUsernameAvailability(username: string): Promise<UsernameValidationResult> {
  const localCheck = validateUsernameFormat(username);
  if (!localCheck.valid) {
    return localCheck;
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}/auth/username/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim().toLowerCase() }),
    });

    if (!response.ok) {
      return { valid: false, error: 'Error al comprobar disponibilidad.' };
    }

    const data = await response.json();
    if (!data.available) {
      return { valid: false, error: data.error || 'Este usuario no está disponible.' };
    }

    return { valid: true };
  } catch (error) {
    console.warn('Error al verificar username en backend:', error);
    // En caso de fallo de red en dev, permitimos si el formato es correcto
    return { valid: true };
  }
}
