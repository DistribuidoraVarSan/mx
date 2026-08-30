import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Globe, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { updateProfile, type User as FirebaseUser } from 'firebase/auth';
import { OrganizationSelector } from './OrganizationSelector';

interface AccountInfoScreenProps {
  currentUser: FirebaseUser | null;
  profile: {
    name: string;
    lastName?: string;
    company?: string;
    email?: string;
    phone?: string;
    username?: string;
    country?: string;
  };
  onProfileUpdate: (updated: any) => void;
  onBack: () => void;
}

const COUNTRIES = [
  'México',
  'Estados Unidos',
  'Canadá',
  'España',
  'Colombia',
  'Argentina',
  'Chile',
  'Perú',
  'Guatemala',
  'Costa Rica',
  'Panamá',
  'Reino Unido',
  'Francia',
  'Italia',
  'Alemania',
  'China',
  'Japón',
  'Corea del Sur',
  'Otro país',
];

export const AccountInfoScreen: React.FC<AccountInfoScreenProps> = ({
  currentUser,
  profile,
  onProfileUpdate,
  onBack,
}) => {
  const [name, setName] = useState(profile.name || '');
  const [lastName, setLastName] = useState(profile.lastName || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [company, setCompany] = useState(profile.company || '');
  const [country, setCountry] = useState(profile.country || 'México');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sincronizar estado local si el perfil se actualiza o carga de forma asíncrona
  useEffect(() => {
    if (profile.name !== undefined) setName(profile.name || '');
    if (profile.lastName !== undefined) setLastName(profile.lastName || '');
    if (profile.phone !== undefined) setPhone(profile.phone || '');
    if (profile.company !== undefined) setCompany(profile.company || '');
    if (profile.country !== undefined) setCountry(profile.country || 'México');
  }, [profile.name, profile.lastName, profile.phone, profile.company, profile.country]);

  const displayUsername = profile.username ? `@${profile.username.replace(/^@/, '')}` : (currentUser?.email ? `@${currentUser.email.split('@')[0]}` : '@usuario');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSaving(true);
    setFeedback(null);

    const cleanName = name.trim();
    const cleanLastName = lastName.trim();
    const cleanPhone = phone.trim();
    const cleanCompany = company.trim();
    const cleanCountry = country.trim() || 'México';

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const updateData: any = {
        name: cleanName,
        lastName: cleanLastName,
        phone: cleanPhone,
        company: cleanCompany,
        country: cleanCountry,
        updatedAt: serverTimestamp(),
      };

      // Sincronizar nombre completo (Nombre + Apellido) en Firebase Auth displayName
      const fullName = `${cleanName} ${cleanLastName}`.trim();
      if (fullName) {
        await updateProfile(currentUser, { displayName: fullName }).catch(() => {});
      }

      await setDoc(userRef, updateData, { merge: true });

      const updatedProfile = {
        ...profile,
        name: cleanName,
        lastName: cleanLastName,
        phone: cleanPhone,
        company: cleanCompany,
        country: cleanCountry,
      };

      onProfileUpdate(updatedProfile);
      setFeedback({ type: 'success', message: 'Información de cuenta actualizada correctamente.' });
    } catch (err: any) {
      console.error('Error al guardar datos de cuenta:', err);
      setFeedback({ type: 'error', message: 'No se pudo guardar la información. Intenta de nuevo.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="subscreen-container">
      {/* Encabezado fijo de la pantalla */}
      <div className="subscreen-header">
        <button
          type="button"
          className="subscreen-back-btn"
          onClick={onBack}
          aria-label="Regresar a configuración"
          data-testid="button-back-account-info"
        >
          ←
        </button>
        <div className="subscreen-title-wrap">
          <h2 className="subscreen-title">Cuenta</h2>
          <span className="subscreen-subtitle">{displayUsername}</span>
        </div>
      </div>

      <div className="subscreen-body">
        <p className="subscreen-intro">
          Consulta y actualiza la información de tu cuenta personal y de empresa.
        </p>

        {feedback && (
          <div
            className={`account-message account-message--${feedback.type === 'success' ? 'success' : 'warning'}`}
            role={feedback.type === 'error' ? 'alert' : 'status'}
            aria-live="polite"
            style={{ marginBottom: 16 }}
          >
            {feedback.type === 'success' && <CheckCircle2 size={15} />}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="account-info-form">
          {/* Nombre de usuario (Readonly / inmutable) */}
          <div className="form-field">
            <label className="form-label" htmlFor="info-username">
              Nombre de usuario:
            </label>
            <div className="input-with-icon">
              <User size={15} className="input-icon" />
              <input
                id="info-username"
                type="text"
                className="form-input form-input--readonly"
                value={displayUsername}
                readOnly
                disabled
              />
            </div>
            <span className="form-field-hint">El nombre de usuario identifica tu cuenta de forma única.</span>
          </div>

          {/* Nombre y Apellido */}
          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-field">
              <label className="form-label" htmlFor="info-name">
                Nombre:
              </label>
              <input
                id="info-name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Nombre"
                data-testid="input-info-name"
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="info-lastname">
                Apellido:
              </label>
              <input
                id="info-lastname"
                type="text"
                className="form-input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Apellido"
                data-testid="input-info-lastname"
              />
            </div>
          </div>

          {/* Correo Electrónico (Asociado a Auth) */}
          <div className="form-field">
            <label className="form-label" htmlFor="info-email">
              Correo electrónico:
            </label>
            <div className="input-with-icon">
              <Mail size={15} className="input-icon" />
              <input
                id="info-email"
                type="email"
                className="form-input form-input--readonly"
                value={profile.email || currentUser?.email || ''}
                readOnly
                disabled
              />
            </div>
            <span className="form-field-hint">Tu correo electrónico se utiliza para inicio de sesión y notificaciones de seguridad.</span>
          </div>

          {/* Número Celular */}
          <div className="form-field">
            <label className="form-label" htmlFor="info-phone">
              Teléfono:
            </label>
            <div className="input-with-icon">
              <Phone size={15} className="input-icon" />
              <input
                id="info-phone"
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+52 XXX XXX XXXX"
                data-testid="input-info-phone"
              />
            </div>
            <span className="form-field-hint">Utilizado para verificación en dos pasos y contacto de pedidos.</span>
          </div>

          {/* Empresa / Institución (Selector categorizado con opción Otros) */}
          <div style={{ marginBottom: 16 }}>
            <OrganizationSelector
              value={company}
              onChange={(val) => setCompany(val)}
            />
          </div>

          {/* País y selector */}
          <div className="form-field">
            <label className="form-label" htmlFor="info-country">
              País:
            </label>
            <div className="input-with-icon">
              <Globe size={15} className="input-icon" />
              <select
                id="info-country"
                className="form-select"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                data-testid="select-info-country"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <span className="form-field-hint">Selecciona el país en el que vives.</span>
          </div>

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              className="button button--outline"
              onClick={onBack}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="button button--navy"
              disabled={saving}
              data-testid="button-save-account-info"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>{saving ? 'Guardando...' : 'Guardar cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
