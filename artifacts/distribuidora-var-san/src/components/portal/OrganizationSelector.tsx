import React, { useState, useEffect, useRef } from 'react';
import { Search, Building2, ChevronDown, Check, Edit3 } from 'lucide-react';
import { ORGANIZATION_CATALOG, ORGANIZATION_CATEGORIES, filterOrganizations, OrganizationItem } from './organizationCatalog';

interface OrganizationSelectorProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export const OrganizationSelector: React.FC<OrganizationSelectorProps> = ({
  value,
  onChange,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Determinar si el valor actual coincide con alguno del catálogo o es personalizado
  useEffect(() => {
    if (!value) {
      setIsCustom(false);
      setCustomValue('');
      return;
    }
    const found = ORGANIZATION_CATALOG.find(
      (o) => o.name.trim().toLowerCase() === value.trim().toLowerCase() && o.id !== 'otros'
    );
    if (found) {
      setIsCustom(false);
      setCustomValue('');
    } else {
      setIsCustom(true);
      const isGenericOtros = value.trim() === 'Otros' || value.startsWith('Otros (') || value.toLowerCase().includes('especificar empresa');
      setCustomValue(isGenericOtros ? '' : value);
    }
  }, [value]);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredItems = filterOrganizations(searchQuery, selectedCategory);

  const handleSelectItem = (item: OrganizationItem) => {
    if (item.id === 'otros') {
      setIsCustom(true);
      setIsOpen(false);
      onChange(customValue.trim());
    } else {
      setIsCustom(false);
      setCustomValue('');
      onChange(item.name);
      setIsOpen(false);
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomValue(val);
    onChange(val);
  };

  return (
    <div className="organization-selector-container" ref={containerRef}>
      <label className="form-label" htmlFor="organization-input">
        Empresa / Institución {required && <span style={{ color: '#b91c1c' }}>*</span>}
      </label>

      {/* Botón / Input disparador */}
      <div
        className={`organization-trigger ${isOpen ? 'organization-trigger--active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        data-testid="organization-selector-trigger"
      >
        <Building2 size={16} className="organization-trigger-icon" />
        <span className={`organization-trigger-text ${(!value && !customValue) ? 'placeholder' : ''}`}>
          {isCustom ? (customValue || value || 'Buscar empresa, escuela u organización...') : (value || 'Buscar empresa, escuela u organización...')}
        </span>
        <ChevronDown size={16} className={`organization-chevron ${isOpen ? 'rotate' : ''}`} />
      </div>

      {/* Menú desplegable con buscador y categorías */}
      {isOpen && (
        <div className="organization-dropdown" role="listbox">
          <div className="organization-search-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre o tipo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="organization-search-input"
              data-testid="input-search-organization"
            />
          </div>

          {/* Filtros de categoría */}
          <div className="organization-category-chips">
            {ORGANIZATION_CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat.id}
                className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCategory(cat.id);
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Lista de resultados */}
          <div className="organization-results-list">
            {filteredItems.length === 0 ? (
              <div className="organization-empty">
                <p>No se encontraron coincidencias.</p>
                <button
                  type="button"
                  className="button button--outline choose-custom-btn"
                  onClick={() => {
                    setIsCustom(true);
                    setIsOpen(false);
                    const q = searchQuery.trim();
                    setCustomValue(q);
                    onChange(q);
                  }}
                >
                  <Edit3 size={13} /> Escribir &quot;{searchQuery || 'mi organización'}&quot; manualmente
                </button>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = value === item.name || (item.id === 'otros' && isCustom);
                return (
                  <div
                    key={item.id}
                    className={`organization-item ${isSelected ? 'selected' : ''} ${item.id === 'otros' ? 'organization-item--special' : ''}`}
                    onClick={() => handleSelectItem(item)}
                    role="option"
                    aria-selected={isSelected}
                    data-testid={`org-item-${item.id}`}
                  >
                    <div className="organization-item-content">
                      <span className="organization-item-name">{item.name}</span>
                      <span className="organization-item-badge">{item.categoryLabel}</span>
                    </div>
                    {isSelected && <Check size={14} className="organization-item-check" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Campo adicional al seleccionar "Otros" */}
      {isCustom && (
        <div className="organization-custom-field animate-fade-in" style={{ marginTop: 8 }}>
          <label className="form-sublabel" htmlFor="custom-org-name">
            Escribe el nombre de tu empresa o institución:
          </label>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              id="custom-org-name"
              type="text"
              className="form-input"
              placeholder="Ej. Instituto Tecnológico Superior, Clínica San Juan, etc."
              value={customValue}
              onChange={handleCustomChange}
              required={required}
              data-testid="input-custom-organization"
            />
            <button
              type="button"
              className="button button--outline reset-custom-btn"
              onClick={() => {
                setIsCustom(false);
                setCustomValue('');
                onChange('');
                setIsOpen(true);
              }}
              title="Volver al catálogo"
            >
              Catálogo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
