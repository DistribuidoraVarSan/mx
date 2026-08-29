import React, { useEffect, useState } from 'react';

export type CharacterFormState =
  | 'idle'
  | 'email'
  | 'name'
  | 'username'
  | 'company'
  | 'phone'
  | 'password-hidden'
  | 'password-visible'
  | 'error'
  | 'success';

interface AuthCharactersProps {
  formState: CharacterFormState;
  passwordLength?: number;
}

export const AuthCharacters: React.FC<AuthCharactersProps> = ({
  formState,
  passwordLength = 0,
}) => {
  const [blinkLeft, setBlinkLeft] = useState(false);
  const [blinkCenter, setBlinkCenter] = useState(false);
  const [blinkRight, setBlinkRight] = useState(false);

  // Parpadeos independientes y asíncronos para mayor naturalidad
  useEffect(() => {
    const i1 = setInterval(() => {
      if (formState === 'idle' || formState === 'email' || formState === 'username') {
        setBlinkCenter(true);
        setTimeout(() => setBlinkCenter(false), 160);
      }
    }, 4200);

    const i2 = setInterval(() => {
      if (formState === 'idle' || formState === 'name' || formState === 'company') {
        setBlinkLeft(true);
        setTimeout(() => setBlinkLeft(false), 180);
      }
    }, 3500);

    const i3 = setInterval(() => {
      if (formState === 'idle' || formState === 'phone') {
        setBlinkRight(true);
        setTimeout(() => setBlinkRight(false), 170);
      }
    }, 4800);

    return () => {
      clearInterval(i1);
      clearInterval(i2);
      clearInterval(i3);
    };
  }, [formState]);

  // Cálculos de offset y estados
  let pupilOffsetY = 0;
  let pupilOffsetX = 0;
  let isPasswordHidden = formState === 'password-hidden';
  let isPasswordVisible = formState === 'password-visible';
  let isWorried = formState === 'error';
  let isHappy = formState === 'success';

  switch (formState) {
    case 'email':
      pupilOffsetY = 4;
      pupilOffsetX = -2;
      break;
    case 'name':
    case 'username':
      pupilOffsetY = 4;
      pupilOffsetX = -3;
      break;
    case 'company':
    case 'phone':
      pupilOffsetY = 4;
      pupilOffsetX = 3;
      break;
    case 'password-visible':
      pupilOffsetY = 2;
      pupilOffsetX = 0;
      break;
    case 'error':
      pupilOffsetY = 1;
      pupilOffsetX = 0;
      break;
    case 'success':
      pupilOffsetY = -3;
      pupilOffsetX = 0;
      break;
    default:
      pupilOffsetY = 0;
      pupilOffsetX = 0;
  }

  return (
    <div className={`auth-characters-container state--${formState}`} aria-hidden="true">
      <svg
        viewBox="0 0 340 145"
        className="auth-characters-svg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Degradado Azul Principal */}
          <linearGradient id="mainBlueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          {/* Degradado Azul Marino Secundario */}
          <linearGradient id="deepNavyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#0a1f44" />
          </linearGradient>

          {/* Degradado Dorado Expresivo */}
          <linearGradient id="vibrantGoldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#c9a84c" />
          </linearGradient>

          {/* Sombra de suelo y profundidad */}
          <filter id="charDropShadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#0a1f44" floodOpacity="0.14" />
          </filter>
        </defs>

        {/* SOMBRAS DE SUELO CONJUNTAS */}
        <ellipse cx="105" cy="134" rx="34" ry="6" fill="#0a1f44" opacity="0.08" />
        <ellipse cx="170" cy="136" rx="46" ry="7.5" fill="#0a1f44" opacity="0.12" />
        <ellipse cx="235" cy="134" rx="36" ry="6" fill="#0a1f44" opacity="0.08" />

        {/* =========================================================
            1. PERSONAJE AZUL MARINO (Izquierda/Atrás, más pequeño y discreto)
            ========================================================= */}
        <g
          className={`char char--navy-back ${isHappy ? 'char--bounce-left' : ''} ${isWorried ? 'char--worried' : ''}`}
          style={{
            transformOrigin: '105px 130px',
            transition: 'transform 0.35s ease',
          }}
        >
          {/* Cuerpo redondeado compacto */}
          <path
            d="M 75 132 C 75 88, 84 64, 105 64 C 126 64, 135 88, 135 132 Z"
            fill="url(#deepNavyGrad)"
            filter="url(#charDropShadow)"
          />

          {/* Ojos del personaje Azul Marino */}
          {isPasswordHidden ? (
            // Cierra los ojos con discreción (líneas curvas serenas)
            <g>
              <path d="M 90 92 Q 96 97 102 92" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M 108 92 Q 114 97 120 92" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" />
            </g>
          ) : isHappy ? (
            // Ojos felices ^ ^
            <g>
              <path d="M 90 90 Q 96 83 102 90" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 108 90 Q 114 83 120 90" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          ) : isWorried ? (
            <g>
              <circle cx="96" cy="90" r="3.5" fill="#ffffff" />
              <circle cx="114" cy="90" r="3.5" fill="#ffffff" />
              <circle cx="96" cy="90" r="1.8" fill="#0a1f44" />
              <circle cx="114" cy="90" r="1.8" fill="#0a1f44" />
            </g>
          ) : blinkLeft ? (
            <g>
              <line x1="90" y1="90" x2="102" y2="90" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <line x1="108" y1="90" x2="120" y2="90" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            </g>
          ) : (
            // Ojos atentos con seguimiento
            <g>
              <circle cx="96" cy="90" r="6" fill="#ffffff" />
              <circle cx="114" cy="90" r="6" fill="#ffffff" />
              <circle
                cx={96 + pupilOffsetX * 0.7}
                cy={90 + pupilOffsetY * 0.7}
                r="3"
                fill="#0f172a"
                style={{ transition: 'cx 0.2s ease, cy 0.2s ease' }}
              />
              <circle
                cx={114 + pupilOffsetX * 0.7}
                cy={90 + pupilOffsetY * 0.7}
                r="3"
                fill="#0f172a"
                style={{ transition: 'cx 0.2s ease, cy 0.2s ease' }}
              />
            </g>
          )}

          {/* Boca discreta */}
          {isHappy ? (
            <path d="M 100 104 Q 105 110 110 104" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          ) : isWorried ? (
            <path d="M 101 106 Q 105 102 109 106" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" />
          ) : (
            <circle cx="105" cy="103" r="1.5" fill="#94a3b8" />
          )}

          {/* Manos del personaje Azul Marino (se cubren en modo privacidad) */}
          <g
            style={{
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: isPasswordHidden ? 'translateY(-18px)' : isPasswordVisible ? 'translateY(-8px)' : 'translateY(0)',
            }}
          >
            <ellipse cx="86" cy="116" rx="5" ry="4.5" fill="#0a1f44" stroke="#1e3a8a" strokeWidth="1" />
            <ellipse cx="124" cy="116" rx="5" ry="4.5" fill="#0a1f44" stroke="#1e3a8a" strokeWidth="1" />
          </g>
        </g>

        {/* =========================================================
            2. PERSONAJE DORADO (Derecha/Atrás, expresivo y con personalidad)
            ========================================================= */}
        <g
          className={`char char--gold-back ${isHappy ? 'char--bounce-right' : ''} ${isWorried ? 'char--worried' : ''}`}
          style={{
            transformOrigin: '235px 130px',
            transition: 'transform 0.35s ease',
          }}
        >
          {/* Pequeño mechón / orejita redondeada con personalidad */}
          <circle cx="235" cy="62" r="6" fill="#f59e0b" />

          {/* Cuerpo redondeado expresivo */}
          <path
            d="M 205 132 C 205 84, 214 66, 235 66 C 256 66, 265 84, 265 132 Z"
            fill="url(#vibrantGoldGrad)"
            filter="url(#charDropShadow)"
          />

          {/* Insignia dorada Var San */}
          <circle cx="235" cy="118" r="3.5" fill="#ffffff" opacity="0.6" />

          {/* Ojos del personaje Dorado */}
          {isPasswordHidden ? (
            // Se tapa / cierra los ojos fuertemente
            <g>
              <path d="M 220 90 L 228 94 M 220 94 L 228 90" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
              <path d="M 238 90 L 246 94 M 238 94 L 246 90" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
            </g>
          ) : isHappy ? (
            <g>
              <path d="M 220 88 Q 225 80 230 88" stroke="#78350f" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M 238 88 Q 243 80 248 88" stroke="#78350f" strokeWidth="2.8" strokeLinecap="round" />
            </g>
          ) : isWorried ? (
            <g>
              <circle cx="225" cy="88" r="4.5" fill="#ffffff" />
              <circle cx="243" cy="88" r="4.5" fill="#ffffff" />
              <circle cx="225" cy="88" r="2.2" fill="#78350f" />
              <circle cx="243" cy="88" r="2.2" fill="#78350f" />
            </g>
          ) : blinkRight ? (
            <g>
              <line x1="220" y1="88" x2="230" y2="88" stroke="#78350f" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="238" y1="88" x2="248" y2="88" stroke="#78350f" strokeWidth="2.2" strokeLinecap="round" />
            </g>
          ) : (
            // Ojos alegres y expresivos
            <g>
              <circle cx="225" cy="88" r="6.5" fill="#ffffff" />
              <circle cx="243" cy="88" r="6.5" fill="#ffffff" />
              <circle
                cx={225 + pupilOffsetX * 0.8}
                cy={88 + pupilOffsetY * 0.8}
                r="3.4"
                fill="#78350f"
                style={{ transition: 'cx 0.2s ease, cy 0.2s ease' }}
              />
              <circle
                cx={243 + pupilOffsetX * 0.8}
                cy={88 + pupilOffsetY * 0.8}
                r="3.4"
                fill="#78350f"
                style={{ transition: 'cx 0.2s ease, cy 0.2s ease' }}
              />
              {/* Brillo */}
              <circle cx={223 + pupilOffsetX * 0.8} cy={86 + pupilOffsetY * 0.8} r="1.2" fill="#ffffff" />
              <circle cx={241 + pupilOffsetX * 0.8} cy={86 + pupilOffsetY * 0.8} r="1.2" fill="#ffffff" />
            </g>
          )}

          {/* Boca del personaje Dorado */}
          {isHappy ? (
            <path d="M 229 101 Q 235 110 241 101" stroke="#78350f" strokeWidth="2.2" fill="#ffffff" strokeLinecap="round" />
          ) : isWorried ? (
            <path d="M 230 104 Q 235 99 240 104" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M 231 101 Q 235 105 239 101" stroke="#78350f" strokeWidth="1.8" strokeLinecap="round" />
          )}

          {/* Manos del personaje Dorado */}
          <g
            style={{
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: isPasswordHidden ? 'translateY(-20px)' : isPasswordVisible ? 'translateY(-10px)' : 'translateY(0)',
            }}
          >
            <circle cx="216" cy="112" r="5" fill="#b45309" />
            <circle cx="254" cy="112" r="5" fill="#b45309" />
          </g>
        </g>

        {/* =========================================================
            3. PERSONAJE AZUL (Centro/Frente, Principal, Ligeramente más grande y amigable)
            ========================================================= */}
        <g
          className={`char char--main-blue ${isHappy ? 'char--bounce-center' : ''} ${isWorried ? 'char--worried' : ''}`}
          style={{
            transformOrigin: '170px 135px',
            transform: isPasswordHidden
              ? 'rotate(-8deg) translateY(-2px)'
              : isPasswordVisible
              ? 'rotate(2deg) translateY(-2px)'
              : 'none',
            transition: 'transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* Cuerpo principal estilizado, alto y redondeado */}
          <path
            d="M 132 134 C 132 56, 142 32, 170 32 C 198 32, 208 56, 208 134 Z"
            fill="url(#mainBlueGrad)"
            filter="url(#charDropShadow)"
          />

          {/* Ojos del personaje Azul Principal */}
          {isPasswordHidden ? (
            // Se gira ligeramente y baja la mirada respetando la privacidad
            <g>
              <line x1="156" y1="68" x2="166" y2="70" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="174" y1="70" x2="184" y2="72" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          ) : isHappy ? (
            // Gran sonrisa y ojos alegres ^ ^
            <g>
              <path d="M 154 66 Q 161 56 168 66" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" />
              <path d="M 174 66 Q 181 56 188 66" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" />
            </g>
          ) : isWorried ? (
            <g>
              <circle cx="161" cy="67" r="8" fill="#ffffff" />
              <circle cx="181" cy="67" r="8" fill="#ffffff" />
              <circle cx="161" cy="67" r="3.5" fill="#0a1f44" />
              <circle cx="181" cy="67" r="3.5" fill="#0a1f44" />
              {/* Cejas preocupadas */}
              <line x1="154" y1="56" x2="164" y2="60" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <line x1="188" y1="56" x2="178" y2="60" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            </g>
          ) : blinkCenter ? (
            <g>
              <line x1="154" y1="67" x2="168" y2="67" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
              <line x1="174" y1="67" x2="188" y2="67" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
            </g>
          ) : (
            // Ojos grandes, nítidos y amigables con seguimiento dinámico
            <g>
              <circle cx="161" cy="67" r="9" fill="#ffffff" />
              <circle cx="181" cy="67" r="9" fill="#ffffff" />
              <circle
                cx={161 + pupilOffsetX}
                cy={67 + pupilOffsetY}
                r="4.8"
                fill="#0a1f44"
                style={{ transition: 'cx 0.18s ease, cy 0.18s ease' }}
              />
              <circle
                cx={181 + pupilOffsetX}
                cy={67 + pupilOffsetY}
                r="4.8"
                fill="#0a1f44"
                style={{ transition: 'cx 0.18s ease, cy 0.18s ease' }}
              />
              {/* Brillos */}
              <circle cx={159 + pupilOffsetX} cy={64 + pupilOffsetY} r="1.8" fill="#ffffff" />
              <circle cx={179 + pupilOffsetX} cy={64 + pupilOffsetY} r="1.8" fill="#ffffff" />
            </g>
          )}

          {/* Sonrisa / Boca del personaje Azul Principal */}
          {isHappy ? (
            <path d="M 163 83 Q 171 96 179 83" stroke="#ffffff" strokeWidth="2.8" fill="#e2e8f0" strokeLinecap="round" />
          ) : isWorried ? (
            <path d="M 164 85 Q 171 80 178 85" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
          ) : isPasswordHidden ? (
            <circle cx="168" cy="83" r="1.8" fill="#ffffff" opacity="0.7" />
          ) : (
            <path d="M 165 82 Q 171 87 177 82" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
          )}

          {/* Brazos / Manos del personaje Azul Principal */}
          <g
            style={{
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: isPasswordHidden
                ? 'translateX(-4px) translateY(2px)'
                : isPasswordVisible
                ? 'translateY(-12px)'
                : 'translateY(0)',
            }}
          >
            <ellipse cx="146" cy="108" rx="6.5" ry="6" fill="#1e40af" />
            <ellipse cx="194" cy="108" rx="6.5" ry="6" fill="#1e40af" />
          </g>
        </g>
      </svg>
    </div>
  );
};
