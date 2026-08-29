import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

export function validatePasswordRules(password: string) {
  return {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
}

export function isPasswordValid(password: string): boolean {
  const rules = validatePasswordRules(password);
  return rules.minLength && rules.hasUpper && rules.hasLower && rules.hasNumber && rules.hasSpecial;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const rules = validatePasswordRules(password);

  const items = [
    { label: 'Al menos 8 caracteres', passed: rules.minLength },
    { label: 'Una mayúscula', passed: rules.hasUpper },
    { label: 'Una minúscula', passed: rules.hasLower },
    { label: 'Un número', passed: rules.hasNumber },
    { label: 'Un carácter especial (!@#$%...)', passed: rules.hasSpecial },
  ];

  if (!password) {
    return (
      <div className="password-rules-container">
        <span className="password-rules-title">Requisitos de contraseña:</span>
        <div className="password-rules-list">
          {items.map((item, index) => (
            <div key={index} className="password-rule-item password-rule-item--idle">
              <span className="password-rule-bullet">•</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const passedCount = Object.values(rules).filter(Boolean).length;
  const isFull = passedCount === 5;

  return (
    <div className="password-rules-container">
      <div className="password-strength-bar">
        <div
          className={`password-strength-fill password-strength-fill--${passedCount}`}
          style={{ width: `${(passedCount / 5) * 100}%` }}
        />
      </div>
      <div className="password-rules-list">
        {items.map((item, index) => (
          <div
            key={index}
            className={`password-rule-item ${item.passed ? 'password-rule-item--passed' : 'password-rule-item--failed'}`}
          >
            {item.passed ? (
              <Check size={13} className="password-rule-icon" />
            ) : (
              <X size={13} className="password-rule-icon" />
            )}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
