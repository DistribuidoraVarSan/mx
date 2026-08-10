/**
 * Base de conocimiento REAL de Distribuidora Var San.
 *
 * Todo lo que aparece aquí proviene directamente del contenido ya existente
 * en el sitio (artifacts/distribuidora-var-san/src/App.tsx: industrialProducts,
 * medicalProducts, sectors, brands) y de las páginas legales (Términos y
 * Condiciones, Política de Privacidad, Política de Cookies).
 *
 * NO agregar precios, disponibilidad, marcas, tiempos de entrega ni
 * características que no existan en el proyecto. Si algo no está aquí,
 * el asistente debe decir que no cuenta con esa información y orientar
 * al usuario a contacto directo.
 */

export const COMPANY_NAME = "Distribuidora Var San";

export const CONTACT = {
  email: "distribuidora.varsan@outlook.com",
  phone: "+52 833 218 9032",
};

export const DELIVERY_CITIES = [
  "Tampico, Tamaulipas",
  "Ciudad Madero, Tamaulipas",
  "Altamira, Tamaulipas",
];

export const PAYMENT_METHODS = ["Efectivo", "Transferencia bancaria"];

export const SECTORS = [
  "Empresas",
  "Oficinas",
  "Comercios",
  "Industrias",
  "Escuelas",
  "Hospitales y Clínicas",
  "Restaurantes",
  "Hoteles",
  "Instituciones",
  "Negocios en general",
];

export const BRANDS = [
  "DermaCare",
  "3M",
  "SteelPro Safety",
  "SUK",
  "SAFE",
  "Climax",
  "ABUS",
];

type ProductLine = {
  category: string;
  title: string;
  description: string;
  features: string[];
};

export const INDUSTRIAL_PRODUCTS: ProductLine[] = [
  {
    category: "SEGURIDAD INDUSTRIAL",
    title: "Guantes de Seguridad",
    description:
      "Soluciones de protección para manos diseñadas para distintos niveles de riesgo, manipulación, contacto químico, corte y actividades industriales.",
    features: ["Anticorte", "Recubiertos", "Desechables", "Contra químicos", "Textiles", "Piel"],
  },
  {
    category: "PROTECCIÓN RESPIRATORIA",
    title: "Protección Respiratoria",
    description:
      "Equipos y componentes para protección respiratoria frente a partículas, polvos, neblinas, vapores, gases y otros contaminantes.",
    features: ["Mascarillas", "Respiradores", "Filtros y cartuchos", "Válvulas", "Accesorios", "Autorrescatadores"],
  },
  {
    category: "PROTECCIÓN OCULAR",
    title: "Protección Ocular",
    description:
      "Equipos diseñados para proteger los ojos y el rostro frente a partículas, impactos, proyecciones y salpicaduras durante las actividades laborales.",
    features: ["Lentes", "Goggles", "Máscaras para soldar", "Micas", "Cabezales"],
  },
  {
    category: "PROTECCIÓN AUDITIVA",
    title: "Protección Auditiva",
    description:
      "Soluciones para reducir la exposición al ruido y brindar protección auditiva en distintas áreas de trabajo.",
    features: ["Orejeras", "Orejeras para casco", "Tapones desechables", "Tapones reutilizables"],
  },
  {
    category: "PROTECCIÓN PARA LA CABEZA",
    title: "Cascos de Seguridad",
    description:
      "Protección para la cabeza destinada a construcción, industria, mantenimiento, trabajo en alturas y áreas operativas.",
    features: ["Cascos industriales", "Cascos ventilados", "Cascos para alturas", "Suspensiones", "Barbiquejos"],
  },
  {
    category: "TRABAJO EN ALTURA",
    title: "Protección Contra Alturas",
    description:
      "Sistemas y equipos destinados a prevenir y detener caídas, posicionar al trabajador y desarrollar actividades en altura de forma segura.",
    features: ["Arneses", "Líneas de vida", "Retráctiles", "Eslingas", "Anclajes", "Absorbedores"],
  },
  {
    category: "VESTUARIO Y PROTECCIÓN",
    title: "Ropa Industrial",
    description:
      "Prendas, accesorios y soluciones de protección personal para actividades operativas y distintos sectores industriales.",
    features: ["Ropa industrial", "Desechables", "Impermeables", "Calzado industrial", "Overoles", "Ergonómicos"],
  },
  {
    category: "SEÑALIZACIÓN Y TRÁNSITO",
    title: "Seguridad Vial",
    description:
      "Elementos de señalización, delimitación y alta visibilidad para proteger zonas de tránsito y trabajo.",
    features: ["Chalecos", "Cintas", "Cadenas", "Postes", "Trafitambos", "Conos", "Señalización"],
  },
  {
    category: "CONTROL DE ENERGÍA",
    title: "Bloqueo y Etiquetado",
    description:
      "Dispositivos para procedimientos de bloqueo y etiquetado orientados al aislamiento seguro de fuentes de energía durante el mantenimiento.",
    features: ["Candados", "Aspas de bloqueo", "Cajas grupales", "Bloqueos eléctricos", "Bloqueos de válvulas", "Etiquetas"],
  },
];

export const MEDICAL_PRODUCTS: ProductLine[] = [
  {
    category: "LÍNEA MÉDICA · MANEJO DE RPBI",
    title: "Recolectores",
    description:
      "Soluciones para la recolección segura de residuos peligrosos biológico-infecciosos, incluyendo punzocortantes y residuos líquidos.",
    features: ["Punzocortantes", "Líquidos", "Sujetadores", "Canastillas", "Botes con pedal"],
  },
  {
    category: "LÍNEA MÉDICA · RESIDUOS",
    title: "Bolsas RPBI",
    description:
      "Bolsas para la identificación, separación y manejo de residuos, disponibles en diferentes capacidades y presentaciones.",
    features: ["Rojo", "Amarillo", "Diferentes capacidades", "Calibre", "Identificación"],
  },
  {
    category: "LÍNEA MÉDICA · ALMACENAMIENTO",
    title: "Almacenamiento Temporal",
    description:
      "Soluciones para organizar y almacenar temporalmente residuos y materiales dentro de espacios médicos y operativos.",
    features: ["Organización", "Seguridad", "Traslado", "Resistencia", "Señalización"],
  },
  {
    category: "LÍNEA MÉDICA · CONTENEDORES",
    title: "Contenedores",
    description:
      "Contenedores y accesorios para el manejo responsable de residuos y suministros en instituciones de salud.",
    features: ["Contenedores", "Tapas", "Pedal", "Recolección", "Higiene"],
  },
];

function formatProductLine(items: ProductLine[]): string {
  return items
    .map(
      (item) =>
        `- ${item.title} (${item.category}): ${item.description} Características: ${item.features.join(", ")}.`,
    )
    .join("\n");
}

/**
 * Rutas y recursos REALES ya existentes en el proyecto (App.tsx / public/).
 * El asistente solo puede elegir "actions" de este conjunto fijo; el backend
 * es quien resuelve la etiqueta y el destino real, así el modelo nunca puede
 * inventar una URL.
 */
export const ASSISTANT_ACTION_KEYS = [
  "privacy",
  "cookies",
  "terms",
  "catalog-industrial",
  "catalog-medical",
] as const;

export type AssistantActionKey = (typeof ASSISTANT_ACTION_KEYS)[number];

export const ASSISTANT_ACTIONS: Record<
  AssistantActionKey,
  { label: string; href: string; kind: "internal" | "pdf" }
> = {
  privacy: { label: "Ver Aviso de Privacidad", href: "/privacidad", kind: "internal" },
  cookies: { label: "Ver Política de Cookies", href: "/cookies", kind: "internal" },
  terms: { label: "Ver Términos y Condiciones", href: "/terminos", kind: "internal" },
  "catalog-industrial": { label: "Catálogo Seguridad Industrial", href: "catalogo.pdf", kind: "pdf" },
  "catalog-medical": { label: "Catálogo Línea Médica", href: "catalogo-medico.pdf", kind: "pdf" },
};

export function buildSystemInstruction(): string {
  return `Eres el "Asistente Var San", el asistente oficial de ${COMPANY_NAME}, una distribuidora de productos de seguridad industrial, línea médica (manejo de RPBI) y soluciones de limpieza y protección para empresas.

TONO Y ESTILO:
- Responde siempre en español.
- Sé profesional, claro, amable, directo y orientado a ayudar al cliente (tono comercial, no de chatbot genérico).
- Respuestas breves y útiles, sin relleno innecesario.

REGLAS ESTRICTAS SOBRE LA INFORMACIÓN:
- SOLO puedes usar la información que se te da a continuación sobre productos, sectores, marcas, cobertura de entrega, formas de pago y contacto.
- NUNCA inventes productos, precios, disponibilidad, marcas, tiempos de entrega ni características que no aparezcan en esta información.
- Si te preguntan algo que no está en esta información (precio exacto, existencia, tiempos de entrega, disponibilidad específica), dilo honestamente y dirige al cliente a contacto: ${CONTACT.email} o ${CONTACT.phone}.

INFORMACIÓN DE LA EMPRESA:
- Nombre: ${COMPANY_NAME}
- Sectores que atendemos: ${SECTORS.join(", ")}.
- Marcas con las que trabajamos: ${BRANDS.join(", ")}.
- Ciudades de entrega actuales: ${DELIVERY_CITIES.join(", ")}. (La cobertura puede ampliarse a futuro, pero hoy es únicamente esa).
- Formas de pago: ${PAYMENT_METHODS.join(" o ")}.
- Contacto: correo ${CONTACT.email}, teléfono/WhatsApp ${CONTACT.phone}.

CATÁLOGO DE SEGURIDAD INDUSTRIAL (líneas reales que manejamos):
${formatProductLine(INDUSTRIAL_PRODUCTS)}

CATÁLOGO DE LÍNEA MÉDICA (líneas reales que manejamos):
${formatProductLine(MEDICAL_PRODUCTS)}

BOTONES / ACCIONES:
Cuando la pregunta del usuario lo amerite, además de tu respuesta en texto debes indicar qué acciones mostrar, usando ÚNICAMENTE estas claves (nunca inventes otras, nunca escribas una URL en el texto de tu respuesta):
- "privacy": cuando pregunten por el aviso o política de privacidad, o cómo se usan sus datos personales.
- "cookies": cuando pregunten por cookies o qué cookies se utilizan.
- "terms": cuando pregunten por los términos y condiciones.
- "catalog-industrial": cuando pidan ver el catálogo de seguridad industrial o productos industriales en general.
- "catalog-medical": cuando pidan ver el catálogo de línea médica o productos médicos/RPBI en general.
- Si piden "catálogos" o "productos" de forma general sin especificar línea, incluye AMBAS: "catalog-industrial" y "catalog-medical".
- Si la pregunta no requiere ningún botón, deja "actions" como un arreglo vacío.

Responde siempre en el formato JSON solicitado: un campo "reply" con tu respuesta en texto (sin URLs ni markdown de links) y un campo "actions" con las claves correspondientes.`;
}
