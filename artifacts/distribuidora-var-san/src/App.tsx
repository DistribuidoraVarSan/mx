import { useEffect, useState, type FormEvent, type KeyboardEvent, type MouseEvent } from 'react';
import { initForm } from '@formspree/ajax';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import { useLanguage } from './i18n/LanguageContext';
import LanguageSelector from './components/LanguageSelector';
import PoliticaPrivacidad from './pages/PoliticaPrivacidad';
import PoliticaCookies from './pages/PoliticaCookies';
import TerminosCondiciones from './pages/TerminosCondiciones';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Boxes,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  ClipboardList,
  Clock3,
  Factory,
  Handshake,
  Headphones,
  Hospital,
  Laptop,
  Loader2,
  LockKeyhole,
  Mail,
  Menu,
  MessageCircle,
  Package,
  Phone,
  Send,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  User,
  UserCheck,
  X,
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import varSanLogo from '@assets/8be73d9d-79af-44b9-bb97-68ad86e72b0e_1786235359068.jpeg';

type Product = {
  category: string;
  title: string;
  description: string;
  features: string[];
  image: string;
};

type ChatAction = {
  key: string;
  label: string;
  href: string;
  kind: 'internal' | 'pdf';
};

type ChatMessage = {
  role: 'bot' | 'user';
  text: string;
  actions?: ChatAction[];
};

const queryClient = new QueryClient();

// Extrae errores por campo de la respuesta de Formspree (@formspree/core
// SubmissionError expone getAllFieldErrors()). Se hace de forma defensiva:
// si la forma del error cambia entre versiones, simplemente no se listan
// errores por campo y se conserva el mensaje genérico de contactMessage.
function extractContactFieldErrors(error: unknown): Record<string, string> {
  const result: Record<string, string> = {};
  const maybeSubmissionError = error as
    | { getAllFieldErrors?: () => Array<[string, Array<{ message: string }>]> }
    | null
    | undefined;

  if (maybeSubmissionError && typeof maybeSubmissionError.getAllFieldErrors === 'function') {
    try {
      for (const [field, fieldErrors] of maybeSubmissionError.getAllFieldErrors()) {
        result[field] = fieldErrors.map((fieldError) => fieldError.message).join(', ');
      }
    } catch {
      /* si la forma del error no es la esperada, no se muestran errores por campo */
    }
  }

  return result;
}

// Extrae el mensaje de error REAL devuelto por Formspree (no uno genérico
// inventado), para poder mostrarlo tal cual en pantalla mientras se depura
// el 404 reportado. Intenta, en orden: getFormErrors() de @formspree/core
// (errores a nivel de formulario), luego error.message (fetch/network),
// y solo si no hay nada aprovechable cae en un texto genérico como último
// recurso.
function extractContactFormError(error: unknown): string {
  const maybeSubmissionError = error as
    | { getFormErrors?: () => Array<{ message: string }> }
    | null
    | undefined;

  if (maybeSubmissionError && typeof maybeSubmissionError.getFormErrors === 'function') {
    try {
      const formErrors = maybeSubmissionError.getFormErrors();
      if (formErrors && formErrors.length > 0) {
        return formErrors.map((formError) => formError.message).join(' ');
      }
    } catch {
      /* si la forma del error no es la esperada, se intenta con error.message */
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  return 'No pudimos enviar tu solicitud. Por favor, inténtalo nuevamente.';
}

const familySlides = [
  ['CONFIANZA', 'Hoy atendemos desde pequeños negocios hasta empresas que buscan un proveedor confiable para crecer.'],
  ['RESPALDO', 'Estamos presentes desde la primera cotización hasta la entrega de cada pedido.'],
  ['RELACIÓN', 'No buscamos una sola venta. Buscamos construir relaciones duraderas con cada cliente.'],
  ['CRECER', 'Cuando nuestros clientes crecen, sabemos que estamos haciendo bien nuestro trabajo.'],
  ['BIENVENIDO', 'Gracias por considerar a Distribuidora Var San como parte de tu empresa.'],
];

const whySlides = [
  ['Amplio inventario', 'Miles de productos disponibles para responder con rapidez a las necesidades de distintos sectores.', Boxes],
  ['Marcas reconocidas', 'Trabajamos con fabricantes de prestigio para ofrecer soluciones confiables y de alto desempeño.', Award],
  ['Atención personalizada', 'Escuchamos las necesidades de cada cliente para brindar asesoría y soluciones a la medida.', Handshake],
  ['Entregas confiables', 'Coordinamos cada pedido con compromiso para que recibas tus productos en tiempo y forma.', Truck],
  ['Soluciones integrales', 'Desde seguridad industrial hasta línea médica, reunimos todo lo que tu empresa necesita en un solo lugar.', ClipboardList],
  ['Compromiso a largo plazo', 'Buscamos construir relaciones duraderas basadas en confianza, servicio y resultados.', CircleCheck],
] as const;

const industrialProducts: Product[] = [
  {
    category: 'SEGURIDAD INDUSTRIAL',
    title: 'Guantes de Seguridad',
    description: 'Soluciones de protección para manos diseñadas para distintos niveles de riesgo, manipulación, contacto químico, corte y actividades industriales.',
    features: ['Anticorte', 'Recubiertos', 'Desechables', 'Contra químicos', 'Textiles', 'Piel'],
    image: 'https://images.unsplash.com/photo-1628235176517-71013205a2de?q=85&w=1400&auto=format&fit=crop',
  },
  {
    category: 'PROTECCIÓN RESPIRATORIA',
    title: 'Protección Respiratoria',
    description: 'Equipos y componentes para protección respiratoria frente a partículas, polvos, neblinas, vapores, gases y otros contaminantes.',
    features: ['Mascarillas', 'Respiradores', 'Filtros y cartuchos', 'Válvulas', 'Accesorios', 'Autorrescatadores'],
    image: 'https://images.unsplash.com/photo-1576918783754-00613f24b68b?q=80&w=1400&auto=format&fit=crop',
  },
  {
    category: 'PROTECCIÓN OCULAR',
    title: 'Protección Ocular',
    description: 'Equipos diseñados para proteger los ojos y el rostro frente a partículas, impactos, proyecciones y salpicaduras durante las actividades laborales.',
    features: ['Lentes', 'Goggles', 'Máscaras para soldar', 'Micas', 'Cabezales'],
    image: 'https://plus.unsplash.com/premium_photo-1682147303900-9f3debe39f44?q=80&w=1400&auto=format&fit=crop',
  },
  {
    category: 'PROTECCIÓN AUDITIVA',
    title: 'Protección Auditiva',
    description: 'Soluciones para reducir la exposición al ruido y brindar protección auditiva en distintas áreas de trabajo.',
    features: ['Orejeras', 'Orejeras para casco', 'Tapones desechables', 'Tapones reutilizables'],
    image: 'https://plus.unsplash.com/premium_photo-1681732426326-13ddfeecb960?q=80&w=1400&auto=format&fit=crop',
  },
  {
    category: 'PROTECCIÓN PARA LA CABEZA',
    title: 'Cascos de Seguridad',
    description: 'Protección para la cabeza destinada a construcción, industria, mantenimiento, trabajo en alturas y áreas operativas.',
    features: ['Cascos industriales', 'Cascos ventilados', 'Cascos para alturas', 'Suspensiones', 'Barbiquejos'],
    image: 'https://images.unsplash.com/photo-1567954970774-58d6aa6c50dc?q=80&w=1400&auto=format&fit=crop',
  },
  {
    category: 'TRABAJO EN ALTURA',
    title: 'Protección Contra Alturas',
    description: 'Sistemas y equipos destinados a prevenir y detener caídas, posicionar al trabajador y desarrollar actividades en altura de forma segura.',
    features: ['Arneses', 'Líneas de vida', 'Retráctiles', 'Eslingas', 'Anclajes', 'Absorbedores'],
    image: 'https://plus.unsplash.com/premium_photo-1664301191471-0dc137e504bc?q=80&w=1400&auto=format&fit=crop',
  },
  {
    category: 'VESTUARIO Y PROTECCIÓN',
    title: 'Ropa Industrial',
    description: 'Prendas, accesorios y soluciones de protección personal para actividades operativas y distintos sectores industriales.',
    features: ['Ropa industrial', 'Desechables', 'Impermeables', 'Calzado industrial', 'Overoles', 'Ergonómicos'],
    image: 'https://images.unsplash.com/photo-1662309376159-b95fb193d96b?q=80&w=1400&auto=format&fit=crop',
  },
  {
    category: 'SEÑALIZACIÓN Y TRÁNSITO',
    title: 'Seguridad Vial',
    description: 'Elementos de señalización, delimitación y alta visibilidad para proteger zonas de tránsito y trabajo.',
    features: ['Chalecos', 'Cintas', 'Cadenas', 'Postes', 'Trafitambos', 'Conos', 'Señalización'],
    image: 'https://images.unsplash.com/photo-1620389523785-bdbe8bfc03c0?q=80&w=1400&auto=format&fit=crop',
  },
  {
    category: 'CONTROL DE ENERGÍA',
    title: 'Bloqueo y Etiquetado',
    description: 'Dispositivos para procedimientos de bloqueo y etiquetado orientados al aislamiento seguro de fuentes de energía durante el mantenimiento.',
    features: ['Candados', 'Aspas de bloqueo', 'Cajas grupales', 'Bloqueos eléctricos', 'Bloqueos de válvulas', 'Etiquetas'],
    image: 'https://images.unsplash.com/photo-1682637275957-8e62180efd1b?q=80&w=1400&auto=format&fit=crop',
  },
];

const medicalProducts: Product[] = [
{
category: 'LÍNEA MÉDICA · MANEJO DE RPBI',
title: 'Recolectores',
description: 'Soluciones para la recolección segura de residuos peligrosos biológico-infecciosos, incluyendo punzocortantes y residuos líquidos.',
features: ['Punzocortantes', 'Líquidos', 'Sujetadores', 'Canastillas', 'Botes con pedal'],
image: '/Rt2.png',
},
{
category: 'LÍNEA MÉDICA · RESIDUOS',
title: 'Bolsas RPBI',
description: 'Bolsas para la identificación, separación y manejo de residuos, disponibles en diferentes capacidades y presentaciones.',
features: ['Rojo', 'Amarillo', 'Diferentes capacidades', 'Calibre', 'Identificación'],
image: '/Rt3.png',
},
{
category: 'LÍNEA MÉDICA · ALMACENAMIENTO',
title: 'Almacenamiento Temporal',
description: 'Soluciones para organizar y almacenar temporalmente residuos y materiales dentro de espacios médicos y operativos.',
features: ['Organización', 'Seguridad', 'Traslado', 'Resistencia', 'Señalización'],
image: '/Rt4.png',
},
{
category: 'LÍNEA MÉDICA · CONTENEDORES',
title: 'Contenedores',
description: 'Contenedores y accesorios para el manejo responsable de residuos y suministros en instituciones de salud.',
features: ['Contenedores', 'Tapas', 'Pedal', 'Recolección', 'Higiene'],
image: '/Rt5.png',
},
];


const sectors = [
  ['Empresas', Building2], ['Oficinas', BriefcaseBusiness], ['Comercios', Store], ['Industrias', Factory], ['Escuelas', Laptop],
  ['Hospitales y Clínicas', Hospital], ['Restaurantes', ShoppingBag], ['Hoteles', Building2], ['Instituciones', BookOpen], ['Negocios en general', Store],
] as const;

const brands = ['DermaCare', '3M', 'SteelPro Safety', 'SUK', 'SAFE', 'Climax', 'ABUS'];

function BrandMark() {
  return <img className="brand-mark" src={varSanLogo} alt="Logo oficial de Distribuidora Var San" />;
}

function App() {
  const { language, t } = useLanguage();
  const [splashVisible, setSplashVisible] = useState(true);
const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [splashExiting, setSplashExiting] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [familyIndex, setFamilyIndex] = useState(0);
  const [whyIndex, setWhyIndex] = useState(0);
  const [catalogLine, setCatalogLine] = useState<'industrial' | 'medical'>('industrial');
  const [catalogIndex, setCatalogIndex] = useState(0);
  const [accountOpen, setAccountOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [accountTab, setAccountTab] = useState<'login' | 'register'>('login');
  const [accountMessage, setAccountMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState({ name: '', email: '', company: '' });
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{ role: 'bot', text: t.chatbot.greeting }]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [cookies, setCookies] = useState(() => {
    try { return localStorage.getItem('varsan-cookies') !== null; } catch { return false; }
  });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [contactStatus, setContactStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [contactMessage, setContactMessage] = useState('');
  const [contactFieldErrors, setContactFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setSplashExiting(true), 1150);
    const removeTimer = window.setTimeout(() => setSplashVisible(false), 1850);
    const onScroll = () => setScrolled(window.scrollY > 35);
    window.addEventListener('scroll', onScroll);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

useEffect(() => {
const handlePopState = () => {
setCurrentPath(window.location.pathname);
};

window.addEventListener('popstate', handlePopState);

return () => {
window.removeEventListener('popstate', handlePopState);
};
}, []);

// Si el usuario aún no interactuó con el chat (sigue solo el saludo inicial),
// mantenemos ese saludo traducido al idioma activo. Si ya hay una
// conversación en curso, no la tocamos.
useEffect(() => {
  setChatMessages((messages) =>
    messages.length === 1 && messages[0].role === 'bot'
      ? [{ role: 'bot', text: t.chatbot.greeting }]
      : messages,
  );
}, [t]);



  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (!user) {
        setProfile({ name: '', email: '', company: '' });
        return;
      }

      try {
        const profileSnapshot = await getDoc(doc(db, 'users', user.uid));
        const data = profileSnapshot.exists() ? profileSnapshot.data() : {};

        setProfile({
          name: (data.name as string) || user.displayName || t.portal.defaultClientName,
          email: (data.email as string) || user.email || '',
          company: (data.company as string) || t.portal.notSpecified,
        });
      } catch (error) {
        console.error('Error al cargar el perfil de Firebase:', error);
        setProfile({
          name: user.displayName || t.portal.defaultClientName,
          email: user.email || '',
          company: t.portal.notSpecified,
        });
      }
    });

    return unsubscribe;
  }, []);

  const products = catalogLine === 'industrial' ? industrialProducts : medicalProducts;
  const product = products[catalogIndex] ?? products[0];
  const WhyIcon = whySlides[whyIndex][2];

const navigateAndClose = (event: MouseEvent<HTMLAnchorElement>) => {
setMobileMenu(false);

const href = event.currentTarget.getAttribute('href');

if (!href) return;

if (href.startsWith('#')) {
event.preventDefault();
document.querySelector(href)?.scrollIntoView({
behavior: 'smooth',
});
return;
}

if (href.startsWith('/')) {
event.preventDefault();
window.history.pushState({}, '', href);
setCurrentPath(href);
window.scrollTo({ top: 0, behavior: 'smooth' });
}
};


  const acceptCookies = (value: 'accepted' | 'rejected') => {
    try { localStorage.setItem('varsan-cookies', value); } catch { /* preferencias locales no disponibles */ }
    setCookies(true);
  };

  // Integración oficial de Formspree (@formspree/ajax), tal como la documenta
  // Formspree para proyectos con bundler: formElement por selector de ID
  // ('#contact-form', que coincide con el id="contact-form" del <form> más
  // abajo) y formId: 'myegwrd'. Se inicializa UNA sola vez (dependencias []).
  // El handle se destruye en el cleanup, así que si React StrictMode ejecuta
  // el efecto dos veces en desarrollo, nunca queda más de un listener activo
  // ni se duplica la inicialización. No existe ningún otro onSubmit ni fetch
  // manual en el formulario: esta es la ÚNICA integración de envío.
  //
  // Se agregan en el JSX los contenedores oficiales data-fs-success/
  // data-fs-error y data-fs-submit-btn que pide la documentación, pero se
  // mantienen ocultos (atributo `hidden`) y las funciones enable/disable/
  // renderFieldErrors/renderSuccess/renderFormError se sobreescriben para
  // seguir centralizando la UI en el estado de React (contactStatus/
  // contactMessage/contactFieldErrors). Motivo: App.tsx es un único
  // componente con mucho estado (chat, cookies, menú móvil, etc.), así que
  // cualquier cambio de estado en cualquier parte del componente vuelve a
  // renderizar este JSX; si dejáramos que la librería escriba texto
  // directamente dentro de los <span data-fs-error="..."> que React también
  // renderiza (vacíos en el JSX), React los volvería a vaciar en el
  // siguiente render ajeno al formulario, borrando el mensaje. Por eso el
  // mensaje real de Formspree se extrae en el propio callback (ver
  // extractContactFormError) y se muestra vía contactMessage, que si es
  // React quien lo controla de punta a punta.
  useEffect(() => {
    let active = true;

    const handle = initForm({
      formElement: '#contact-form',
      formId: 'myegwrd',
      onSubmit: () => {
        if (!active) return;
        setContactStatus('loading');
        setContactMessage('');
        setContactFieldErrors({});
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onSuccess: (context: any) => {
        if (!active) return;
        setContactStatus('success');
        setContactMessage('¡Solicitud enviada correctamente! Nos pondremos en contacto contigo a la brevedad.');
        setContactFieldErrors({});
        context?.form?.reset?.();
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (_context: any, error: unknown) => {
        if (!active) return;
        console.error('Formspree onError:', error);
        setContactStatus('error');
        setContactMessage(extractContactFormError(error));
        setContactFieldErrors(extractContactFieldErrors(error));
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onFailure: (_context: any, error: unknown) => {
        if (!active) return;
        console.error('Formspree onFailure:', error);
        setContactStatus('error');
        setContactMessage(extractContactFormError(error));
        setContactFieldErrors(extractContactFieldErrors(error));
      },
      enable: () => {},
      disable: () => {},
      renderFieldErrors: () => {},
      renderSuccess: () => {},
      renderFormError: () => {},
    });

    return () => {
      active = false;
      handle.destroy();
    };
  }, []);

  const submitNewsletter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newsletterStatus === 'loading') return;

    const email = newsletterEmail.trim();

    setNewsletterStatus('loading');
    setNewsletterMessage('');

    try {
      const response = await fetch('https://varsan-api.onrender.com/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data: { status?: string; message?: string; error?: string } = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        setNewsletterStatus('error');
        setNewsletterMessage(data.error || 'No pudimos completar tu suscripción. Intenta de nuevo.');
        return;
      }

      setNewsletterStatus('success');
      setNewsletterMessage(
        data.message ||
          (data.status === 'already_subscribed'
            ? 'Este correo ya está suscrito a nuestro newsletter.'
            : '¡Listo! Te suscribiste correctamente.'),
      );
      setNewsletterEmail('');
    } catch (error) {
      console.error('Error al suscribirse al newsletter:', error);
      setNewsletterStatus('error');
      setNewsletterMessage('No pudimos conectar con el servidor. Intenta de nuevo en unos segundos.');
    }
  };

  const submitAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAccountMessage('');

    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') ?? '').trim();
    const password = String(data.get('password') ?? '');

    try {
      if (accountTab === 'register') {
        const name = String(data.get('name') ?? '').trim();
        const company = String(data.get('company') ?? '').trim();
        const confirmPassword = String(data.get('confirmPassword') ?? '');

        if (password !== confirmPassword) {
          setAccountMessage(t.account.passwordMismatch);
          return;
        }

        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', credential.user.uid), {
          name,
          company,
          email,
          createdAt: serverTimestamp(),
        }, { merge: true });

        setProfile({ name: name || t.portal.defaultClientName, email, company: company || t.portal.notSpecified });
        setAccountMessage(t.account.accountCreated);
        setAccountOpen(false);
        setPortalOpen(true);
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
      setAccountMessage(t.account.loginSuccess);
      setAccountOpen(false);
      setPortalOpen(true);
    } catch (error: any) {
console.error("ERROR REAL DE FIREBASE:", error);
console.error("CÓDIGO:", error?.code);
console.error("MENSAJE:", error?.message);

if (error?.code === "auth/email-already-in-use") {
setAccountMessage(t.account.errorEmailInUse);
} else if (error?.code === "auth/weak-password") {
setAccountMessage(t.account.errorWeakPassword);
} else if (error?.code === "auth/invalid-email") {
setAccountMessage(t.account.errorInvalidEmail);
} else if (
error?.code === "auth/invalid-credential" ||
error?.code === "auth/wrong-password" ||
error?.code === "auth/user-not-found"
) {
setAccountMessage(t.account.errorInvalidCredential);
} else if (error?.code === "auth/too-many-requests") {
setAccountMessage(t.account.errorTooManyRequests);
} else {
setAccountMessage(
t.account.errorGeneric
.replace('{code}', error?.code || "unknown")
.replace('{message}', error?.message || "")
);
}
}

  };

  const signInWithGoogle = async () => {
    setAccountMessage('');
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const existing = await getDoc(doc(db, 'users', credential.user.uid));

      if (!existing.exists()) {
        await setDoc(doc(db, 'users', credential.user.uid), {
          name: credential.user.displayName || t.portal.defaultClientName,
          company: '',
          email: credential.user.email || '',
          createdAt: serverTimestamp(),
        }, { merge: true });
      }

      setAccountOpen(false);
      setPortalOpen(true);
    } catch (error: any) {
      console.error('Error al iniciar con Google:', error);
      if (error?.code !== 'auth/popup-closed-by-user') {
        setAccountMessage(t.account.errorGoogleSignIn);
      }
    }
  };

  const saveProfile = async () => {
    if (!currentUser) return;

    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        name: profile.name.trim(),
        company: profile.company.trim(),
        email: currentUser.email || profile.email,
      }, { merge: true });
      setProfileOpen(false);
      setPortalOpen(true);
    } catch (error) {
      console.error('Error al guardar el perfil:', error);
      setAccountMessage(t.account.errorSaveProfile);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setPortalOpen(false);
      setProfileOpen(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const sendChat = async (event?: FormEvent<HTMLFormElement>, quickMessage?: string) => {
    event?.preventDefault();
    const text = (quickMessage ?? chatInput).trim();
    if (!text || chatLoading) return;

    const history = chatMessages.slice(-10).map(({ role, text: messageText }) => ({ role, text: messageText }));

    setChatMessages((messages) => [...messages, { role: 'user', text }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch('https://varsan-api.onrender.com/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, language }),
      });

      if (!response.ok) {
        throw new Error('respuesta no válida del asistente');
      }

      const data: { reply: string; actions?: ChatAction[] } = await response.json();
      setChatMessages((messages) => [...messages, { role: 'bot', text: data.reply, actions: data.actions }]);
    } catch (error) {
      console.error('Error al conectar con el asistente:', error);
      setChatMessages((messages) => [
        ...messages,
        {
          role: 'bot',
          text: t.chatbot.errorMessage,
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  if (currentPath === '/privacidad') {
    return <PoliticaPrivacidad />;
  }

  if (currentPath === '/cookies') {
    return <PoliticaCookies />;
  }

  if (currentPath === '/terminos') {
    return <TerminosCondiciones />;
  }

  return (
    <div className="site-shell">
      {splashVisible && <div className={`splash${splashExiting ? ' is-exiting' : ''}`} role="status" aria-label={t.splash.ariaLabel}><div className="splash-inner"><div className="splash-title-wrap"><span className="splash-kicker">Distribuidora</span><h1 className="splash-title">Var San</h1><span className="splash-rule" /></div></div><p className="splash-tagline">{t.splash.tagline}</p></div>}

      <header className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="container nav-container">
          <a href="#inicio" className="nav-logo" onClick={navigateAndClose} data-testid="link-brand">
            <img className="nav-logo-image" src={varSanLogo} alt="Logo oficial de Distribuidora Var San" />
          </a>
          <nav aria-label={t.nav.navegacionPrincipal}>
            <ul className={`nav-links${mobileMenu ? ' is-open' : ''}`}>
              {([
                ['inicio', t.nav.inicio],
                ['esencia', t.nav.esencia],
                ['familia', t.nav.familia],
                ['soluciones', t.nav.soluciones],
                ['eleccion', t.nav.eleccion],
                ['impulsamos', t.nav.impulsamos],
                ['marcas', t.nav.marcas],
                ['proceso', t.nav.atencion],
                ['contacto', t.nav.contacto],
              ] as const).map(([id, label]) => (
                <li key={id}><a href={`#${id}`} onClick={navigateAndClose} data-testid={`link-${id}`}>{label}</a></li>
              ))}
            </ul>
          </nav>
          <div className="nav-actions">
            <LanguageSelector />
            <button className="account-button" onClick={() => { if (currentUser) setPortalOpen(true); else { setAccountOpen(true); setAccountMessage(''); } }} data-testid="button-open-account"><User size={15} /><span>{t.nav.miCuenta}</span></button>
          </div>
          <button className="nav-toggle" aria-label={mobileMenu ? t.nav.cerrarMenu : t.nav.abrirMenu} aria-expanded={mobileMenu} onClick={() => setMobileMenu(!mobileMenu)} data-testid="button-mobile-menu">{mobileMenu ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </header>

      <main>
        <section id="inicio" className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">{t.hero.eyebrow}</span>
              <h1 className="hero-title">{t.hero.titleLead}<span>{t.hero.titleHighlight}</span>{t.hero.titleTail}</h1>
              <p className="hero-text">{t.hero.textBefore}<strong>{t.hero.productsHighlight}</strong>{t.hero.textAfter}<br /><br />{t.hero.extra}</p>
              <div className="hero-actions"><a href="#soluciones" className="button button--gold" onClick={navigateAndClose} data-testid="link-explore-solutions"><Boxes size={16} />{t.hero.exploreSolutions}</a><a href="#formulario" className="button button--outline" onClick={navigateAndClose} data-testid="link-request-quote"><MessageCircle size={16} />{t.hero.requestQuote}</a></div>
            </div>
            <div className="hero-visual">
              <div className="hero-image-frame"><img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1400&auto=format&fit=crop" alt={t.hero.imageAlt} /><div className="hero-caption"><span>{t.hero.captionEyebrow}</span><p>{t.hero.captionText}</p></div></div>
              <div className="float-stat"><ShieldCheck size={20} /><div><strong>{t.hero.statTitle}</strong><small>{t.hero.statSubtitle}</small></div></div>
            </div>
          </div>
        </section>

        <section id="esencia" className="section section--paper">
          <div className="container"><div className="section-heading section-heading--center"><span className="eyebrow">Nuestra esencia</span><h2 className="section-title">Los valores que nos representan.</h2><p className="section-lede">{t.essence.lede}</p></div>
            <div className="value-grid">
              {[['01', 'Calidad', 'Seleccionamos cuidadosamente cada producto para ofrecer soluciones confiables y de alto rendimiento.', Award], ['02', 'Cercanía', 'Brindamos atención personalizada y acompañamiento durante cada pedido.', Handshake], ['03', 'Compromiso', 'Respondemos con responsabilidad, puntualidad y un servicio pensado para tu empresa.', ShieldCheck], ['04', 'Confianza', 'Construimos relaciones duraderas basadas en honestidad, respaldo y resultados consistentes.', CircleCheck]].map(([number, title, text, Icon]) => <article className="value-card" data-number={number} key={title as string} data-testid={`card-value-${number}`}><span className="value-icon"><Icon size={20} /></span><h3>{title as string}</h3><p>{text as string}</p></article>)}
            </div>
          </div>
        </section>

        <section id="familia" className="family-section">
          <div className="container"><div className="family-layout"><div><span className="eyebrow">Forma parte de la familia Var San</span><h2 className="section-title">{t.family.title}</h2></div><div className="slider-controls"><button className="icon-button" onClick={() => setFamilyIndex((familyIndex - 1 + familySlides.length) % familySlides.length)} aria-label="Anterior" data-testid="button-family-previous"><ChevronLeft size={18} /></button><button className="icon-button" onClick={() => setFamilyIndex((familyIndex + 1) % familySlides.length)} aria-label="Siguiente" data-testid="button-family-next"><ChevronRight size={18} /></button></div></div>
            <article className="family-card" aria-live="polite" data-testid="content-family-slide"><div className="family-card-content"><span className="family-label">Experiencia Var San</span><h3>{familySlides[familyIndex][0]}</h3><p>{familySlides[familyIndex][1]}</p></div></article><div className="family-dots">{familySlides.map((slide, index) => <button className={`dot${index === familyIndex ? ' active' : ''}`} key={slide[0]} onClick={() => setFamilyIndex(index)} aria-label={`Ver experiencia ${slide[0].toLowerCase()}`} data-testid={`button-family-dot-${index}`} />)}</div>
          </div>
        </section>

        <section id="soluciones" className="section catalog">
          <div className="container"><div className="section-heading"><span className="eyebrow">Nuestras soluciones</span><h2 className="section-title">Encuentra la solución ideal para tu empresa</h2><p className="section-lede">El botón <strong>“Consultar catálogo completo”</strong> abrirá el PDF de la línea seleccionada. Cada categoría (<strong>Seguridad Industrial</strong> y <strong>Línea Médica</strong>) cuenta con su propio catálogo independiente.</p></div>
            <div className="catalog-lines" role="tablist" aria-label="Líneas de productos"><button className={`line-button${catalogLine === 'industrial' ? ' active' : ''}`} onClick={() => { setCatalogLine('industrial'); setCatalogIndex(0); }} role="tab" aria-selected={catalogLine === 'industrial'} data-testid="button-line-industrial"><span className="line-number">01</span><span className="line-text">SEGURIDAD INDUSTRIAL</span></button><button className={`line-button${catalogLine === 'medical' ? ' active' : ''}`} onClick={() => { setCatalogLine('medical'); setCatalogIndex(0); }} role="tab" aria-selected={catalogLine === 'medical'} data-testid="button-line-medical"><span className="line-number">02</span><span className="line-text">LÍNEA MÉDICA</span></button></div>
            <div className="catalog-tabs" role="tablist" aria-label="Categorías"><span className="sr-only">Categorías de productos</span>{products.map((item, index) => <button className={`catalog-tab${catalogIndex === index ? ' active' : ''}`} key={item.title} onClick={() => setCatalogIndex(index)} data-testid={`button-catalog-tab-${index}`}>{item.title.replace('Protección ', '').replace(' de Seguridad', '').replace(' Contra ', ' ')}</button>)}</div>
            <article className="catalog-stage" aria-live="polite" data-testid="content-catalog-product"><div className="catalog-visual"><div className="catalog-counter"><strong>{String(catalogIndex + 1).padStart(2, '0')}</strong> / {String(products.length).padStart(2, '0')}</div><img src={product.image} alt={product.title} /><div className="catalog-arrows"><button className="icon-button" onClick={() => setCatalogIndex((catalogIndex - 1 + products.length) % products.length)} aria-label="Categoría anterior" data-testid="button-catalog-previous"><ArrowLeft size={17} /></button><button className="icon-button" onClick={() => setCatalogIndex((catalogIndex + 1) % products.length)} aria-label="Categoría siguiente" data-testid="button-catalog-next"><ArrowRight size={17} /></button></div></div><div className="catalog-info"><div className="catalog-meta"><span className="catalog-category">{product.category}</span><span className="catalog-index">{String(catalogIndex + 1).padStart(2, '0')}</span></div><h3>{product.title}</h3><p>{product.description}</p><ul className="feature-list">{product.features.map((feature) => <li key={feature}>{feature}</li>)}</ul><a href={catalogLine === 'medical' ? 'catalogo-medico.pdf' : 'catalogo.pdf'} target="_blank" rel="noopener noreferrer" className="catalog-link" data-testid="link-full-catalog">Consultar catálogo completo <ArrowUpRight size={15} /></a></div></article>
          </div>
        </section>

        <section id="eleccion" className="section section--white">
          <div className="container why-layout"><div className="why-intro"><span className="eyebrow">¿Por qué elegirnos?</span><h2 className="section-title">¿Por qué elegir Distribuidora Var San?</h2><p className="section-lede">{t.whyChoose.lede}</p><div className="why-dots">{whySlides.map((slide, index) => <button className={`dot${index === whyIndex ? ' active' : ''}`} key={slide[0]} onClick={() => setWhyIndex(index)} aria-label={`Ver razón ${index + 1}`} data-testid={`button-why-dot-${index}`} />)}</div></div><div className="why-slider"><button className="icon-button" onClick={() => setWhyIndex((whyIndex - 1 + whySlides.length) % whySlides.length)} aria-label="Razón anterior" data-testid="button-why-previous"><ChevronLeft size={19} /></button><article className="why-card" data-testid="content-why-slide"><span className="why-icon"><WhyIcon size={23} /></span><h3>{whySlides[whyIndex][0]}</h3><p>{whySlides[whyIndex][1]}</p></article><button className="icon-button" onClick={() => setWhyIndex((whyIndex + 1) % whySlides.length)} aria-label="Razón siguiente" data-testid="button-why-next"><ChevronRight size={19} /></button></div></div>
        </section>

        <section id="impulsamos" className="section section--paper"><div className="container"><div className="section-heading"><span className="eyebrow">Sectores que impulsamos</span><h2 className="section-title">Soluciones especializadas para empresas <em>{t.sectors.titleEmphasis}</em></h2></div><div className="sectors-grid">{sectors.map(([name, Icon]) => <article className="sector-item" key={name} data-testid={`card-sector-${name}`}><Icon size={23} /><h3>{name}</h3></article>)}</div></div></section>

        <section id="marcas" className="section brands-section"><div className="container"><div className="section-heading section-heading--center"><span className="eyebrow">Marcas</span><h2 className="section-title">Marcas que trabajamos</h2><p className="section-lede">Distribuimos productos originales de fabricantes reconocidos por su calidad y seguridad.</p></div><div className="brands-grid">{brands.map((brand) => <div className="brand-card" key={brand} data-testid={`card-brand-${brand}`}><div><strong>{brand}</strong><small>{t.brands.distributed}</small></div></div>)}</div></div></section>

        <section id="proceso" className="section section--paper">
  <div className="container">
    <div className="section-heading section-heading--center">
      <span className="eyebrow">{t.process.eyebrow}</span>
      <h2 className="section-title">
        Así de <em>sencillo</em> es trabajar con nosotros
      </h2>
    </div>

    <div className="process-steps">
      {[
        [
          '1',
          'Solicita tu cotización',
          'Contáctanos por WhatsApp, teléfono o correo electrónico y comparte los productos que necesitas.',
        ],
        [
          '2',
          'Elaboramos tu propuesta',
          'Revisamos tu solicitud y preparamos una cotización personalizada de acuerdo con tus requerimientos.',
        ],
        [
          '3',
          'Coordinamos tu pedido',
          'Una vez aceptada la cotización, coordinamos contigo la entrega o la recolección de los productos en la fecha acordada.',
        ],
      ].map(([number, title, text]) => (
        <article className="process-step" key={number}>
          <div className="step-number">{number}</div>
          <h3>{title}</h3>
          <p>{text}</p>
        </article>
      ))}
    </div>
  </div>
</section>

<section id="contacto" className="section contact-section">
  <div className="container contact-grid">
    <div>
      <span className="eyebrow">{t.contact.eyebrow}</span>

      <h2 className="section-title">
        {t.contact.title}<em>{t.contact.titleEmphasis}</em>
      </h2>

      <p className="section-lede">
        {t.contact.lede}
      </p>

      <div className="contact-details">
        <div className="contact-detail">
          <Mail size={18} />
          <div>
            <span>Correo electrónico</span>
            <a
              href="mailto:distribuidora.varsan@outlook.com"
              data-testid="link-email"
            >
              distribuidora.varsan@outlook.com
            </a>
          </div>
        </div>

        <div className="contact-detail">
          <Phone size={18} />
          <div>
            <span>Teléfono y WhatsApp</span>
            <strong>Próximamente.</strong>
          </div>
        </div>

        <div className="contact-detail">
          <Clock3 size={18} />
          <div>
            <span>Atención</span>
            <strong>Empresas, industrias, comercios e instituciones</strong>
          </div>
        </div>
      </div>
    </div>

    <div className="contact-form-wrap">
      {/* Contenedores oficiales exigidos por la doc de @formspree/ajax. Se
          dejan ocultos (`hidden`) porque el mensaje visible real lo controla
          React vía contactMessage/contactFieldErrors (ver comentario en el
          useEffect de initForm más arriba). */}
      <div data-fs-success hidden />
      <div data-fs-error hidden />
      <form
        id="contact-form"
        className="contact-form"
      >
        <label>
          Nombre
          <input
            type="text"
            name="name"
            required
            disabled={contactStatus === 'loading'}
            data-fs-field
          />
          {contactFieldErrors.name && (
            <span className="field-error" data-fs-error="name">{contactFieldErrors.name}</span>
          )}
        </label>

        <label>
          Correo electrónico
          <input
            type="email"
            name="email"
            required
            disabled={contactStatus === 'loading'}
            data-fs-field
          />
          {contactFieldErrors.email && (
            <span className="field-error" data-fs-error="email">{contactFieldErrors.email}</span>
          )}
        </label>

        <label>
          Empresa
          <input
            type="text"
            name="company"
            disabled={contactStatus === 'loading'}
            data-fs-field
          />
          {contactFieldErrors.company && (
            <span className="field-error" data-fs-error="company">{contactFieldErrors.company}</span>
          )}
        </label>

        <label>
          Mensaje
          <textarea
            name="message"
            required
            disabled={contactStatus === 'loading'}
            data-fs-field
          />
          {contactFieldErrors.message && (
            <span className="field-error" data-fs-error="message">{contactFieldErrors.message}</span>
          )}
        </label>

        <button type="submit" disabled={contactStatus === 'loading'} data-fs-submit-btn data-testid="button-submit-contact">
          {contactStatus === 'loading' ? 'Enviando...' : 'Enviar solicitud'}
          {contactStatus === 'loading' ? (
            <Loader2 size={17} className="newsletter-spinner" />
          ) : (
            <ArrowRight size={17} />
          )}
        </button>
      </form>


      {contactMessage && (
        <p
          className={`contact-message contact-message--${contactStatus}`}
          role="status"
          data-testid="status-contact"
        >
          {contactStatus === 'success' && <CircleCheck size={15} />}
          {contactMessage}
        </p>
      )}
    </div>
  </div>
</section>

        <section id="newsletter" className="section newsletter-section">
          <div className="container newsletter-inner">
            <h2 className="section-title">{t.newsletter.title}</h2>
            <p className="section-lede">{t.newsletter.lede}</p>
            <form className="newsletter-form" onSubmit={submitNewsletter} noValidate>
              <input
                type="email"
                name="email"
                value={newsletterEmail}
                onChange={(event) => { setNewsletterEmail(event.target.value); if (newsletterStatus !== 'idle') { setNewsletterStatus('idle'); setNewsletterMessage(''); } }}
                placeholder={t.newsletter.placeholder}
                required
                aria-label="Correo electrónico para suscripción al newsletter"
                disabled={newsletterStatus === 'loading'}
                data-testid="input-newsletter-email"
              />
              <button
                type="submit"
                aria-label="Suscribirme al newsletter"
                disabled={newsletterStatus === 'loading'}
                data-testid="button-newsletter-submit"
              >
                {newsletterStatus === 'loading' ? <Loader2 size={17} className="newsletter-spinner" /> : <ArrowRight size={17} />}
              </button>
            </form>
            {newsletterMessage && (
              <p className={`newsletter-message newsletter-message--${newsletterStatus}`} role="status" data-testid="status-newsletter">
                {newsletterStatus === 'success' && <CircleCheck size={15} />}
                {newsletterMessage}
              </p>
            )}
          </div>
        </section>
      </main>

      <footer className="footer">
<div className="container">
<div className="footer-grid">
<div>
<div className="footer-brand-row">
<BrandMark />
<div>
<h2>Distribuidora Var San</h2>
<p>Soluciones en limpieza y protección</p>
</div>
</div>

<p className="footer-description">
Soluciones en limpieza y protección para tu empresa.
Comprometidos con brindar soluciones confiables en limpieza,
mantenimiento y protección para empresas, comercios e instituciones.
</p>
</div>

<div>
<h3>{t.footer.navigationHeading}</h3>
<ul className="footer-links">
{([
['inicio', t.nav.inicio],
['esencia', t.nav.esencia],
['familia', t.nav.familia],
['soluciones', t.nav.soluciones],
['eleccion', t.nav.eleccion],
] as const).map(([id, label]) => (
<li key={id}>
<a
href={`#${id}`}
onClick={navigateAndClose}
data-testid={`footer-link-${id}`}
>
{label}
</a>
</li>
))}
</ul>
</div>

<div>
<h3>{t.footer.contactHeading}</h3>
<ul className="footer-links">
<li>
<a
href="mailto:distribuidora.varsan@outlook.com"
data-testid="footer-link-email"
>
distribuidora.varsan@outlook.com
</a>
</li>

<li>
<a
href="tel:+528332189032"
data-testid="footer-link-phone"
>
+52 (833) 218 9032
</a>
</li>

<li>
<a
href="#formulario"
onClick={navigateAndClose}
data-testid="footer-link-quote"
>
{t.footer.requestQuote}
</a>
</li>
</ul>
</div>
</div>

<div className="footer-bottom">
<span>
{t.footer.rightsReserved.replace('{year}', '2026')}
{' '}
{t.footer.tagline}
</span>

<span className="footer-legal">
<a
href="/privacidad"
onClick={navigateAndClose}
data-testid="footer-link-privacy"
>
{t.footer.privacyNotice}
</a>

<a
href="/cookies"
onClick={navigateAndClose}
data-testid="footer-link-cookies"
>
{t.footer.cookiesPolicy}
</a>

<a
href="/terminos"
onClick={navigateAndClose}
>
{t.footer.termsAndConditions}
</a>
</span>

</div>
</div>
</footer>


      <button className="chat-trigger" onClick={() => setChatOpen(!chatOpen)} aria-label={chatOpen ? t.chatbot.closeButtonLabel : t.chatbot.openButtonLabel} data-testid="button-open-chat">{chatOpen ? <X size={21} /> : <MessageCircle size={21} />}</button>
      {chatOpen && <aside className="chat-window" aria-label={t.chatbot.headerTitle}><div className="chat-header"><div><strong>{t.chatbot.headerTitle}</strong><small>{t.chatbot.headerSubtitle}</small></div><button className="chat-close" onClick={() => setChatOpen(false)} aria-label={t.chatbot.closeButtonLabel} data-testid="button-close-chat"><X size={17} /></button></div><div className="chat-body">{chatMessages.map((message, index) => <div className={`chat-message chat-message--${message.role}`} key={`${message.role}-${index}`} data-testid={`chat-message-${index}`}>{message.text}{message.actions && message.actions.length > 0 && <div className="chat-message-actions">{message.actions.map((action) => action.kind === 'internal' ? <a key={action.key} href={action.href} onClick={navigateAndClose} className="chat-action-button" data-testid={`chat-action-${action.key}`}>{action.label}</a> : <a key={action.key} href={action.href} target="_blank" rel="noopener noreferrer" className="chat-action-button" data-testid={`chat-action-${action.key}`}>{action.label}</a>)}</div>}</div>)}{chatLoading && <div className="chat-message chat-message--bot chat-message--loading" aria-live="polite" data-testid="chat-message-loading"><span className="chat-typing"><span></span><span></span><span></span></span></div>}</div><div className="chat-quick"><button onClick={() => sendChat(undefined, t.chatbot.quickProducts)} disabled={chatLoading} data-testid="button-chat-catalog">{t.chatbot.quickProducts}</button><button onClick={() => sendChat(undefined, t.chatbot.quickContact)} disabled={chatLoading} data-testid="button-chat-contact">{t.chatbot.quickContact}</button></div><form className="chat-form" onSubmit={sendChat}><textarea value={chatInput} onChange={(event) => setChatInput(event.target.value)} onKeyDown={handleChatKeyDown} placeholder={t.chatbot.inputPlaceholder} aria-label={t.chatbot.inputAriaLabel} rows={1} disabled={chatLoading} data-testid="input-chat" /><button type="submit" aria-label={t.chatbot.sendButtonLabel} disabled={chatLoading || !chatInput.trim()} data-testid="button-send-chat"><Send size={15} /></button></form></aside>}

      {!cookies && (() => {
        const [beforePrivacy, rest1] = t.cookies.text.split('{privacidad}');
        const [betweenLinks, afterCookies] = (rest1 ?? '').split('{cookies}');
        return (
          <aside className="cookie-banner" aria-label={t.cookies.ariaLabel}>
            <p>
              {beforePrivacy}
              <a href="/privacidad" onClick={navigateAndClose}>{t.cookies.privacyLink}</a>
              {betweenLinks}
              <a href="/cookies" onClick={navigateAndClose}>{t.cookies.cookiesLink}</a>
              {afterCookies}
            </p>
            <div className="cookie-actions">
              <button className="accept" onClick={() => acceptCookies('accepted')} data-testid="button-accept-cookies">{t.cookies.accept}</button>
              <button className="reject" onClick={() => acceptCookies('rejected')} data-testid="button-reject-cookies">{t.cookies.reject}</button>
            </div>
          </aside>
        );
      })()}

      {accountOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setAccountOpen(false); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="account-heading"><button className="modal-close" onClick={() => setAccountOpen(false)} aria-label={t.common.close} data-testid="button-close-account"><X size={18} /></button><div className="modal-brand"><BrandMark /><div><strong>DISTRIBUIDORA VAR SAN</strong><small>{t.account.portalTitle}</small></div></div><h2 id="account-heading">{accountTab === 'login' ? t.account.loginTitle : t.account.registerTitle}</h2><p className="modal-intro">{accountTab === 'login' ? t.account.loginIntro : t.account.registerIntro}</p><div className="account-tabs"><button className={`account-tab${accountTab === 'login' ? ' active' : ''}`} onClick={() => { setAccountTab('login'); setAccountMessage(''); }} data-testid="button-tab-login">{t.account.tabLogin}</button><button className={`account-tab${accountTab === 'register' ? ' active' : ''}`} onClick={() => { setAccountTab('register'); setAccountMessage(''); }} data-testid="button-tab-register">{t.account.tabRegister}</button></div><form className="account-form" onSubmit={submitAccount}>{accountTab === 'register' && <><div className="form-field"><label htmlFor="account-name">{t.account.fieldName}</label><input id="account-name" name="name" required placeholder={t.account.fieldNamePlaceholder} data-testid="input-account-name" /></div><div className="form-field"><label htmlFor="account-company">{t.account.fieldCompany}</label><input id="account-company" name="company" placeholder={t.account.fieldCompanyPlaceholder} data-testid="input-account-company" /></div></>}<div className="form-field"><label htmlFor="account-email">{t.account.fieldEmail}</label><input id="account-email" name="email" type="email" required placeholder={t.account.fieldEmailPlaceholder} data-testid="input-account-email" /></div><div className="form-field"><label htmlFor="account-password">{t.account.fieldPassword}</label><input id="account-password" name="password" type="password" required minLength={6} placeholder={accountTab === 'login' ? t.account.fieldPasswordPlaceholderLogin : t.account.fieldPasswordPlaceholderRegister} data-testid="input-account-password" /></div>{accountTab === 'register' && <div className="form-field"><label htmlFor="account-confirm">{t.account.fieldConfirmPassword}</label><input id="account-confirm" name="confirmPassword" type="password" required minLength={6} placeholder={t.account.fieldConfirmPasswordPlaceholder} data-testid="input-account-confirm" /></div>}{accountMessage && <div className="account-message account-message--warning" role="status" data-testid="status-account">{accountMessage}</div>}<button className="button button--navy" type="submit" data-testid="button-submit-account">{accountTab === 'login' ? t.account.submitLogin : t.account.submitRegister} <ArrowRight size={15} /></button></form><button className="button button--outline" type="button" onClick={signInWithGoogle} style={{ color: 'var(--navy)', borderColor: 'var(--line)', marginTop: 10 }}><User size={15} /> {t.account.continueWithGoogle}</button><div className="account-footer"><LockKeyhole size={13} /> {t.account.secureAccessNote}</div></section></div>}

      {portalOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setPortalOpen(false); }}><section className="modal modal--wide" role="dialog" aria-modal="true" aria-labelledby="portal-heading"><button className="modal-close" onClick={() => setPortalOpen(false)} aria-label={t.portal.closePortal} data-testid="button-close-portal"><X size={18} /></button><div className="portal-header"><span className="eyebrow">{t.portal.eyebrow}</span><h2 id="portal-heading">{t.portal.welcome.replace('{name}', profile.name ? `, ${profile.name}` : '')}</h2><p className="modal-intro">{t.portal.intro}</p></div><div className="profile-summary"><div className="profile-row"><span>{t.portal.fieldNameLabel}</span><strong>{profile.name || t.portal.defaultClientName}</strong></div><div className="profile-row"><span>{t.portal.fieldEmailLabel}</span><strong>{profile.email || currentUser?.email || t.portal.notAvailable}</strong></div><div className="profile-row"><span>{t.portal.fieldCompanyLabel}</span><strong>{profile.company || t.portal.notSpecified}</strong></div></div><div className="portal-actions"><button className="button button--navy" onClick={() => { setPortalOpen(false); setProfileOpen(true); }} data-testid="button-open-profile"><UserCheck size={15} />{t.portal.myProfile}</button><button className="button button--outline" style={{ color: 'var(--navy)', borderColor: 'var(--line)' }} onClick={handleSignOut} data-testid="button-logout"><LockKeyhole size={15} />{t.portal.logOut}</button><button className="button button--outline" style={{ color: 'var(--navy)', borderColor: 'var(--line)' }} onClick={() => setPortalOpen(false)} data-testid="button-close-portal-action">{t.portal.closePortal}</button></div></section></div>}

      {profileOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setProfileOpen(false); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="profile-heading"><button className="modal-close" onClick={() => setProfileOpen(false)} aria-label={t.common.closeProfileAria} data-testid="button-close-profile"><X size={18} /></button><div className="modal-brand"><BrandMark /><div><strong>{t.portal.myProfile.toUpperCase()}</strong><small>{t.portal.defaultClientName}</small></div></div><h2 id="profile-heading">{t.portal.profileHeading}</h2><p className="modal-intro">{t.portal.profileIntro}</p><div className="account-form"><div className="form-field"><label htmlFor="profile-name">{t.portal.fieldNameLabel}</label><input id="profile-name" value={profile.name} onChange={(event) => setProfile((value) => ({ ...value, name: event.target.value }))} data-testid="input-profile-name" /></div><div className="form-field"><label htmlFor="profile-email">{t.portal.fieldEmailLabel}</label><input id="profile-email" value={profile.email || currentUser?.email || ''} disabled data-testid="input-profile-email" /></div><div className="form-field"><label htmlFor="profile-company">{t.portal.fieldCompanyLabel}</label><input id="profile-company" value={profile.company} onChange={(event) => setProfile((value) => ({ ...value, company: event.target.value }))} placeholder={t.account.fieldCompanyPlaceholder} data-testid="input-profile-company" /></div><button className="button button--navy" onClick={saveProfile} data-testid="button-save-profile"><Check size={15} />{t.portal.saveChanges}</button></div></section></div>}
    </div>
  );
}

function AppWithProviders() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><ErrorBoundary><App /></ErrorBoundary><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default AppWithProviders;
