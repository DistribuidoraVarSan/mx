export interface OrganizationItem {
  id: string;
  name: string;
  category: 'universidades' | 'escuelas' | 'empresas' | 'instituciones' | 'oficinas' | 'otros';
  categoryLabel: string;
}

export const ORGANIZATION_CATEGORIES = [
  { id: 'all', label: 'Todas las categorías' },
  { id: 'universidades', label: 'Universidades e Institutos' },
  { id: 'escuelas', label: 'Escuelas y Colegios' },
  { id: 'empresas', label: 'Empresas y Corporativos' },
  { id: 'instituciones', label: 'Instituciones de Salud y Gobierno' },
  { id: 'oficinas', label: 'Oficinas y Despachos' },
  { id: 'otros', label: 'Otros' },
] as const;

export const ORGANIZATION_CATALOG: OrganizationItem[] = [
  // Universidades e Institutos
  { id: 'unam', name: 'Universidad Nacional Autónoma de México (UNAM)', category: 'universidades', categoryLabel: 'Universidades e Institutos' },
  { id: 'ipn', name: 'Instituto Politécnico Nacional (IPN)', category: 'universidades', categoryLabel: 'Universidades e Institutos' },
  { id: 'itesm', name: 'Tecnológico de Monterrey (ITESM)', category: 'universidades', categoryLabel: 'Universidades e Institutos' },
  { id: 'tecnm', name: 'Tecnológico Nacional de México (TecNM)', category: 'universidades', categoryLabel: 'Universidades e Institutos' },
  { id: 'uam', name: 'Universidad Autónoma Metropolitana (UAM)', category: 'universidades', categoryLabel: 'Universidades e Institutos' },
  { id: 'uanl', name: 'Universidad Autónoma de Nuevo León (UANL)', category: 'universidades', categoryLabel: 'Universidades e Institutos' },
  { id: 'udg', name: 'Universidad de Guadalajara (UDG)', category: 'universidades', categoryLabel: 'Universidades e Institutos' },
  { id: 'ibero', name: 'Universidad Iberoamericana (IBERO)', category: 'universidades', categoryLabel: 'Universidades e Institutos' },
  { id: 'anahuac', name: 'Universidad Anáhuac', category: 'universidades', categoryLabel: 'Universidades e Institutos' },
  { id: 'udem', name: 'Universidad de Monterrey (UDEM)', category: 'universidades', categoryLabel: 'Universidades e Institutos' },
  { id: 'iteso', name: 'ITESO Universidad Jesuita de Guadalajara', category: 'universidades', categoryLabel: 'Universidades e Institutos' },
  { id: 'up', name: 'Universidad Panamericana (UP)', category: 'universidades', categoryLabel: 'Universidades e Institutos' },
  { id: 'uv', name: 'Universidad Veracruzana (UV)', category: 'universidades', categoryLabel: 'Universidades e Institutos' },
  { id: 'uaslp', name: 'Universidad Autónoma de San Luis Potosí', category: 'universidades', categoryLabel: 'Universidades e Institutos' },
  { id: 'uaemex', name: 'Universidad Autónoma del Estado de México', category: 'universidades', categoryLabel: 'Universidades e Institutos' },
  { id: 'buap', name: 'Benemérita Universidad Autónoma de Puebla', category: 'universidades', categoryLabel: 'Universidades e Institutos' },

  // Escuelas y Colegios
  { id: 'cch', name: 'Colegio de Ciencias y Humanidades (CCH)', category: 'escuelas', categoryLabel: 'Escuelas y Colegios' },
  { id: 'enp', name: 'Escuela Nacional Preparatoria (ENP)', category: 'escuelas', categoryLabel: 'Escuelas y Colegios' },
  { id: 'cecyt', name: 'Centros de Estudios Científicos y Tecnológicos (CECyT)', category: 'escuelas', categoryLabel: 'Escuelas y Colegios' },
  { id: 'conalep', name: 'Colegio Nacional de Educación Profesional Técnica (CONALEP)', category: 'escuelas', categoryLabel: 'Escuelas y Colegios' },
  { id: 'bachilleres', name: 'Colegio de Bachilleres (COLBACH)', category: 'escuelas', categoryLabel: 'Escuelas y Colegios' },
  { id: 'cbtis', name: 'Centro de Bachillerato Tecnológico Industrial (CBTis)', category: 'escuelas', categoryLabel: 'Escuelas y Colegios' },
  { id: 'cetis', name: 'Centro de Estudios Tecnológicos (CETis)', category: 'escuelas', categoryLabel: 'Escuelas y Colegios' },
  { id: 'instituto-cumbre', name: 'Colegio Cumbres / Red Semper Altius', category: 'escuelas', categoryLabel: 'Escuelas y Colegios' },
  { id: 'instituto-aleman', name: 'Colegio Alemán Alexander von Humboldt', category: 'escuelas', categoryLabel: 'Escuelas y Colegios' },
  { id: 'liceo-mexicano', name: 'Liceo Mexicano Japonés', category: 'escuelas', categoryLabel: 'Escuelas y Colegios' },

  // Empresas y Corporativos
  { id: 'grupo-carso', name: 'Grupo Carso', category: 'empresas', categoryLabel: 'Empresas y Corporativos' },
  { id: 'femsa', name: 'Fomento Económico Mexicano (FEMSA)', category: 'empresas', categoryLabel: 'Empresas y Corporativos' },
  { id: 'grupo-bimbo', name: 'Grupo Bimbo', category: 'empresas', categoryLabel: 'Empresas y Corporativos' },
  { id: 'walmart-mexico', name: 'Walmart de México y Centroamérica', category: 'empresas', categoryLabel: 'Empresas y Corporativos' },
  { id: 'america-movil', name: 'América Móvil / Telcel', category: 'empresas', categoryLabel: 'Empresas y Corporativos' },
  { id: 'cemex', name: 'CEMEX México', category: 'empresas', categoryLabel: 'Empresas y Corporativos' },
  { id: 'alfa', name: 'Alfa Corporativo', category: 'empresas', categoryLabel: 'Empresas y Corporativos' },
  { id: 'grupo-mexico', name: 'Grupo México', category: 'empresas', categoryLabel: 'Empresas y Corporativos' },
  { id: 'grupo-bal', name: 'Grupo BAL', category: 'empresas', categoryLabel: 'Empresas y Corporativos' },
  { id: 'soriana', name: 'Organización Soriana', category: 'empresas', categoryLabel: 'Empresas y Corporativos' },
  { id: 'liverpool', name: 'El Puerto de Liverpool', category: 'empresas', categoryLabel: 'Empresas y Corporativos' },
  { id: 'peñoles', name: 'Industrias Peñoles', category: 'empresas', categoryLabel: 'Empresas y Corporativos' },
  { id: 'arce-medica', name: 'Industrias Médicas y Laboratorios', category: 'empresas', categoryLabel: 'Empresas y Corporativos' },

  // Instituciones de Salud y Gobierno
  { id: 'imss', name: 'Instituto Mexicano del Seguro Social (IMSS)', category: 'instituciones', categoryLabel: 'Instituciones de Salud y Gobierno' },
  { id: 'issste', name: 'ISSSTE México', category: 'instituciones', categoryLabel: 'Instituciones de Salud y Gobierno' },
  { id: 'hospital-angeles', name: 'Grupo Hospitales Ángeles', category: 'instituciones', categoryLabel: 'Instituciones de Salud y Gobierno' },
  { id: 'hospital-abc', name: 'Centro Médico ABC', category: 'instituciones', categoryLabel: 'Instituciones de Salud y Gobierno' },
  { id: 'hospital-medica-sur', name: 'Médica Sur', category: 'instituciones', categoryLabel: 'Instituciones de Salud y Gobierno' },
  { id: 'hospital-espanol', name: 'Hospital Español de México', category: 'instituciones', categoryLabel: 'Instituciones de Salud y Gobierno' },
  { id: 'salud-cdmx', name: 'Secretaría de Salud (SSa)', category: 'instituciones', categoryLabel: 'Instituciones de Salud y Gobierno' },
  { id: 'sep', name: 'Secretaría de Educación Pública (SEP)', category: 'instituciones', categoryLabel: 'Instituciones de Salud y Gobierno' },
  { id: 'cfe', name: 'Comisión Federal de Electricidad (CFE)', category: 'instituciones', categoryLabel: 'Instituciones de Salud y Gobierno' },
  { id: 'pemex', name: 'Petróleos Mexicanos (PEMEX)', category: 'instituciones', categoryLabel: 'Instituciones de Salud y Gobierno' },
  { id: 'conacyt', name: 'CONAHCYT', category: 'instituciones', categoryLabel: 'Instituciones de Salud y Gobierno' },

  // Oficinas y Despachos
  { id: 'despacho-juridico', name: 'Despacho Jurídico / Notaría Pública', category: 'oficinas', categoryLabel: 'Oficinas y Despachos' },
  { id: 'despacho-contable', name: 'Consultoría y Auditoría Contable', category: 'oficinas', categoryLabel: 'Oficinas y Despachos' },
  { id: 'estudio-arquitectura', name: 'Estudio de Arquitectura e Ingeniería', category: 'oficinas', categoryLabel: 'Oficinas y Despachos' },
  { id: 'agencia-servicios', name: 'Agencia de Servicios y Logística', category: 'oficinas', categoryLabel: 'Oficinas y Despachos' },
  { id: 'oficina-privada', name: 'Oficina Corporativa / Consultoría Privada', category: 'oficinas', categoryLabel: 'Oficinas y Despachos' },

  // Otros
  { id: 'otros', name: 'Otros (Especificar empresa o institución)', category: 'otros', categoryLabel: 'Otros' },
];

export function filterOrganizations(query: string, categoryFilter: string = 'all'): OrganizationItem[] {
  const cleanQuery = query.toLowerCase().trim();
  return ORGANIZATION_CATALOG.filter((item) => {
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesQuery = !cleanQuery || item.name.toLowerCase().includes(cleanQuery) || item.categoryLabel.toLowerCase().includes(cleanQuery);
    return matchesCategory && matchesQuery;
  });
}
