import React, { useState, useEffect } from 'react';
import { HardDrive, Trash2, Loader2, CheckCircle2, AlertTriangle, RefreshCw, Info } from 'lucide-react';

interface StorageScreenProps {
  username?: string;
  onBack: () => void;
}

interface RealStorageMetric {
  key: string;
  name: string;
  bytes: number;
  type: 'real' | 'estimate';
  color: string;
}

export const StorageScreen: React.FC<StorageScreenProps> = ({ username, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [totalDiskBytes, setTotalDiskBytes] = useState<number>(0);
  const [totalUsageBytes, setTotalUsageBytes] = useState<number>(0);
  const [metrics, setMetrics] = useState<RealStorageMetric[]>([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const displayUsername = username ? `@${username.replace(/^@/, '')}` : '@usuario';

  const calculateStorage = async () => {
    setLoading(true);
    try {
      let quota = 0;
      let usage = 0;

      // 1. Medición de localStorage real
      let localBytes = 0;
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k) {
            localBytes += k.length * 2 + (localStorage.getItem(k)?.length || 0) * 2;
          }
        }
      } catch {
        // ignore
      }

      // 2. Medición de sessionStorage real
      let sessionBytes = 0;
      try {
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i);
          if (k) {
            sessionBytes += k.length * 2 + (sessionStorage.getItem(k)?.length || 0) * 2;
          }
        }
      } catch {
        // ignore
      }

      // 3. Estimación general de cuota del navegador
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        if (estimate.quota) quota = estimate.quota;
        if (estimate.usage) usage = estimate.usage;
      }

      // El total real utilizado por el sitio en este navegador
      const resolvedTotalUsage = Math.max(usage, localBytes + sessionBytes);
      const cacheBytes = Math.max(0, resolvedTotalUsage - (localBytes + sessionBytes));

      setTotalDiskBytes(quota || 120 * 1024 * 1024 * 1024);
      setTotalUsageBytes(resolvedTotalUsage);

      const items: RealStorageMetric[] = [
        {
          key: 'web-storage',
          name: 'Almacenamiento web (Local y Sesión)',
          bytes: localBytes + sessionBytes,
          type: 'real',
          color: '#0a1f44',
        },
        {
          key: 'cache-storage',
          name: 'Caché de red y recursos temporales',
          bytes: cacheBytes,
          type: 'estimate',
          color: '#c9a84c',
        },
      ];

      setMetrics(items);
    } catch (err) {
      console.warn('Error estimating storage:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateStorage();
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const handleClearStorage = async () => {
    setClearing(true);
    setFeedback(null);
    try {
      // 1. Limpiar caches de service worker
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      // 2. Limpiar sessionStorage
      sessionStorage.clear();

      // 3. Limpiar claves no-auth de localStorage preservando credenciales de Firebase Auth
      const keysToKeep = ['firebase:authUser', 'loglevel'];
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && !keysToKeep.some((prefix) => k.startsWith(prefix))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));

      setConfirmModalOpen(false);
      setFeedback({
        type: 'success',
        message: 'Se ha liberado la caché y almacenamiento temporal local sin cerrar tu sesión.',
      });
      await calculateStorage();
    } catch (err) {
      console.error('Error clearing storage:', err);
      setFeedback({ type: 'error', message: 'No se pudo limpiar todo el almacenamiento local.' });
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="subscreen-container">
      <div className="subscreen-header">
        <button
          type="button"
          className="subscreen-back-btn"
          onClick={onBack}
          aria-label="Regresar a configuración"
          data-testid="button-back-storage"
        >
          ←
        </button>
        <div className="subscreen-title-wrap">
          <h2 className="subscreen-title">Almacenamiento</h2>
          <span className="subscreen-subtitle">{displayUsername}</span>
        </div>
        <button
          type="button"
          className="sessions-refresh-icon-btn"
          onClick={calculateStorage}
          disabled={loading}
          title="Recalcular almacenamiento"
          aria-label="Recalcular almacenamiento"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="subscreen-body">
        <p className="subscreen-intro">
          Administra cómo Var San usa el almacenamiento de este dispositivo.
        </p>

        {feedback && (
          <div
            className={`account-message account-message--${feedback.type === 'success' ? 'success' : 'warning'}`}
            role={feedback.type === 'error' ? 'alert' : 'status'}
            aria-live="polite"
            style={{ marginBottom: 16 }}
          >
            {feedback.type === 'success' ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Resumen dinámico del dispositivo */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 22, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <HardDrive size={22} style={{ color: 'var(--navy)' }} />
            <h3 style={{ margin: 0, color: 'var(--navy)', fontSize: '1.05rem', fontWeight: 700 }}>
              Uso del dispositivo
            </h3>
          </div>

          <p style={{ fontSize: '0.94rem', color: '#1e293b', fontWeight: 600, margin: '8px 0 16px' }}>
            Var San está usando {formatSize(totalUsageBytes)} de almacenamiento en este dispositivo ({formatSize(totalDiskBytes)} de cuota estimada).
          </p>

          {/* Barra Horizontal Proporcional */}
          <div style={{ marginBottom: 18 }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>
              Desglose de datos reales disponibles
            </span>

            <div style={{ height: 12, width: '100%', background: '#f1f5f9', borderRadius: 6, display: 'flex', overflow: 'hidden' }}>
              {metrics.map((m) => {
                const widthPct = totalUsageBytes > 0 ? (m.bytes / totalUsageBytes) * 100 : 50;
                return (
                  <div
                    key={m.key}
                    style={{
                      width: `${Math.max(widthPct, 4)}%`,
                      backgroundColor: m.color,
                      transition: 'width 0.4s ease',
                    }}
                    title={`${m.name}: ${formatSize(m.bytes)}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Lista de métricas reales */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {metrics.map((m) => (
              <div
                key={m.key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: '#f8fafc',
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: m.color }} />
                  <div>
                    <span style={{ fontSize: '0.88rem', color: 'var(--navy)', fontWeight: 600, display: 'block' }}>
                      {m.name}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      {m.type === 'real' ? 'Dato real medido' : 'Estimación del navegador'}
                    </span>
                  </div>
                </div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--navy)' }}>{formatSize(m.bytes)}</strong>
              </div>
            ))}
          </div>

          {/* Nota de transparencia */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 16, padding: '10px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, color: '#166534', fontSize: '0.78rem' }}>
            <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              Las cifras provienen directamente de la API <code>navigator.storage</code> y del almacenamiento local del navegador asignado a Distribuidora Var San.
            </span>
          </div>
        </div>

        {/* Zona de Borrado Seguro */}
        <div style={{ background: '#ffffff', border: '1px solid #fecaca', borderRadius: 10, padding: 20 }}>
          <h4 style={{ margin: '0 0 6px', color: '#991b1b', fontSize: '0.96rem', fontWeight: 700 }}>
            Limpieza de almacenamiento local
          </h4>
          <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '0.84rem', lineHeight: 1.5 }}>
            Al borrar el almacenamiento se eliminarán los archivos en caché y datos temporales guardados en este navegador. Tu sesión activa permanecerá abierta y tu cuenta en el servidor no se modificará.
          </p>

          <button
            type="button"
            className="button button--danger"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontSize: '0.88rem' }}
            onClick={() => setConfirmModalOpen(true)}
            data-testid="button-clear-storage"
          >
            <Trash2 size={16} />
            <span>Borrar todo el almacenamiento</span>
          </button>
        </div>
      </div>

      {/* Modal de Confirmación de Borrado */}
      {confirmModalOpen && (
        <div
          className="modal-backdrop animate-fade-in"
          style={{ zIndex: 10000 }}
          role="presentation"
          onMouseDown={(e) => {
            if (e.currentTarget === e.target) setConfirmModalOpen(false);
          }}
        >
          <div
            className="modal"
            style={{ maxWidth: 440, padding: 24, textAlign: 'center' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-storage-title"
          >
            <AlertTriangle size={36} style={{ color: '#d97706', margin: '0 auto 12px' }} />
            <h3 id="clear-storage-title" style={{ color: 'var(--navy)', fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px' }}>
              ¿Borrar almacenamiento local?
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 20px', lineHeight: 1.5 }}>
              Esta acción vaciará la caché de recursos y datos temporales en este dispositivo. Tu cuenta y sesión de usuario continuarán protegidas.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                type="button"
                className="button button--outline"
                onClick={() => setConfirmModalOpen(false)}
                disabled={clearing}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="button button--danger"
                onClick={handleClearStorage}
                disabled={clearing}
                data-testid="button-confirm-clear-storage"
              >
                {clearing ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Borrando...</span>
                  </>
                ) : (
                  <span>Sí, borrar almacenamiento</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
