import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type MouseEvent } from 'react';
import { useForm, ValidationError } from '@formspree/react';
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
  Globe,
  Handshake,
  Headphones,
  Hospital,
  Laptop,
  Loader2,
  LockKeyhole,
  Mail,
  Menu,
  MessageCircle,
  Monitor,
  Package,
  Phone,
  RefreshCw,
  Send,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Store,
  Tablet,
  Trash2,
  Truck,
  User,
  UserCheck,
  X,
} from 'lucide-react';
import {
  registerDeviceSession,
  fetchUserSessions,
  revokeUserSession,
  revokeAllOtherSessions,
  type DeviceSession,
} from './lib/session-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import varSanLogo from '@assets/dvs-logo-transparent.png';

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

const industrialImages = [
  'https://images.unsplash.com/photo-1628235176517-71013205a2de?q=85&w=1400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1576918783754-00613f24b68b?q=80&w=1400&auto=format&fit=crop',
  'https://plus.unsplash.com/premium_photo-1682147303900-9f3debe39f44?q=80&w=1400&auto=format&fit=crop',
  'https://plus.unsplash.com/premium_photo-1681732426326-13ddfeecb960?q=80&w=1400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1567954970774-58d6aa6c50dc?q=80&w=1400&auto=format&fit=crop',
  'https://plus.unsplash.com/premium_photo-1664301191471-0dc137e504bc?q=80&w=1400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1662309376159-b95fb193d96b?q=80&w=1400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1620389523785-bdbe8bfc03c0?q=80&w=1400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1682637275957-8e62180efd1b?q=80&w=1400&auto=format&fit=crop',
];

const medicalImages = ['/Rt2.png', '/Rt3.png', '/Rt4.png', '/Rt5.png'];

const whyIcons = [Boxes, Award, Handshake, Truck, ClipboardList, CircleCheck];

const sectorIcons = [
  Building2,
  BriefcaseBusiness,
  Store,
  Factory,
  Laptop,
  Hospital,
  ShoppingBag,
  Building2,
  BookOpen,
  Store,
];

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
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionActionLoading, setSessionActionLoading] = useState<string | null>(null);
  const [sessionFeedback, setSessionFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
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
  const [contactState, handleContactSubmit] = useForm("myegrwrd");
  const contactFormRef = useRef<HTMLFormElement>(null);

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
        setSessions([]);
        return;
      }

      // Registrar dispositivo / sesión en segundo plano al autenticarse
      registerDeviceSession(user).catch((err) => {
        console.warn('No se pudo registrar la sesión del dispositivo:', err);
      });

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

  const industrialProducts = t.solutions.industrialProducts.map((p, idx) => ({
    ...p,
    image: industrialImages[idx] ?? industrialImages[0],
  }));

  const medicalProducts = t.solutions.medicalProducts.map((p, idx) => ({
    ...p,
    image: medicalImages[idx] ?? medicalImages[0],
  }));

  const products = catalogLine === 'industrial' ? industrialProducts : medicalProducts;
  const product = products[catalogIndex] ?? products[0];

  const whySlides = t.whyChoose.reasons.map(([title, desc], idx) => [
    title,
    desc,
    whyIcons[idx] ?? Boxes,
  ] as const);

  const WhyIcon = whySlides[whyIndex]?.[2] ?? Boxes;


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

  // Integración oficial de Formspree para React (@formspree/react): el hook
  // useForm("myegrwrd") se encarga de enviar el formulario, exponer el estado
  // (submitting/succeeded/errors) y no requiere ningún fetch manual ni
  // listener sobre el DOM. Aquí solo limpiamos los campos del <form> (que
  // permanece sin controlar, igual que antes) cuando el envío tiene éxito,
  // tal como hacía la integración anterior.
  useEffect(() => {
    if (contactState.succeeded) {
      contactFormRef.current?.reset();
    }
  }, [contactState.succeeded]);

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
      setSessions([]);
      setSessionFeedback(null);
      setPortalOpen(false);
      setProfileOpen(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const loadSessions = async (user = currentUser) => {
    if (!user) return;
    setLoadingSessions(true);
    setSessionFeedback(null);
    try {
      const userSessions = await fetchUserSessions(user);
      setSessions(userSessions);
    } catch (err: any) {
      console.error('Error al obtener sesiones:', err);
      if (err?.message?.includes('SESSION_REVOKED')) {
        await handleSignOut();
      } else {
        setSessionFeedback({ type: 'error', text: err.message || 'No se pudieron cargar las sesiones.' });
      }
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    if ((portalOpen || profileOpen) && currentUser) {
      loadSessions(currentUser);
    }
  }, [portalOpen, profileOpen, currentUser]);

  const handleRevokeSession = async (sessionId: string) => {
    if (!currentUser) return;
    setSessionActionLoading(sessionId);
    setSessionFeedback(null);
    try {
      const success = await revokeUserSession(currentUser, sessionId);
      if (success) {
        setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
        setSessionFeedback({ type: 'success', text: t.portal.sessionRevokedSuccess });
      }
    } catch (err: any) {
      console.error('Error al revocar sesión:', err);
      if (err?.message?.includes('SESSION_REVOKED')) {
        await handleSignOut();
      } else {
        setSessionFeedback({ type: 'error', text: err.message || 'Error al revocar la sesión' });
      }
    } finally {
      setSessionActionLoading(null);
    }
  };

  const handleRevokeAllOthers = async () => {
    if (!currentUser) return;
    if (!window.confirm(t.portal.confirmRevokeAll)) return;
    setSessionActionLoading('all-others');
    setSessionFeedback(null);
    try {
      const res = await revokeAllOtherSessions(currentUser);
      if (res.success) {
        setSessions((prev) => prev.filter((s) => s.isCurrent));
        setSessionFeedback({ type: 'success', text: t.portal.sessionsRevokedAllSuccess });
      }
    } catch (err: any) {
      console.error('Error al revocar otras sesiones:', err);
      if (err?.message?.includes('SESSION_REVOKED')) {
        await handleSignOut();
      } else {
        setSessionFeedback({ type: 'error', text: err.message || 'Error al revocar sesiones' });
      }
    } finally {
      setSessionActionLoading(null);
    }
  };

  const renderDeviceIcon = (deviceType: string) => {
    if (deviceType === 'mobile') return <Smartphone size={17} />;
    if (deviceType === 'tablet') return <Tablet size={17} />;
    return <Monitor size={17} />;
  };

  const formatSessionDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
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
      {splashVisible && <div className={`splash${splashExiting ? ' is-exiting' : ''}`} role="status" aria-label={t.splash.ariaLabel}><div className="splash-inner"><div className="splash-title-wrap"><span className="splash-kicker">Distribuidora</span><span className="splash-title">Var San</span><span className="splash-rule" /></div></div><p className="splash-tagline">{t.splash.tagline}</p></div>}

      <header className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="container nav-container">
          <a href="#inicio" className="nav-logo" onClick={navigateAndClose} data-testid="link-brand">
            <img className="nav-logo-image" src={varSanLogo} alt="Logo oficial de Distribuidora Var San" />
            <span className="nav-wordmark">
              <strong>Distribuidora</strong>
              <small>Var San</small>
            </span>
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
            <button
              className="account-button"
              onClick={() => { if (currentUser) setPortalOpen(true); else { setAccountOpen(true); setAccountMessage(''); } }}
              aria-label={currentUser ? t.portal.myProfile : t.nav.miCuenta}
              data-testid="button-open-account"
            >
              <User size={18} />
              <span className="account-button-label">{t.nav.miCuenta}</span>
            </button>
            <button
              className={`nav-toggle${mobileMenu ? ' is-active' : ''}`}
              aria-label={mobileMenu ? t.nav.cerrarMenu : t.nav.abrirMenu}
              aria-expanded={mobileMenu}
              onClick={() => setMobileMenu(!mobileMenu)}
              data-testid="button-mobile-menu"
            >
              <span className="nav-toggle-bar nav-toggle-bar--top" />
              <span className="nav-toggle-bar nav-toggle-bar--mid" />
              <span className="nav-toggle-bar nav-toggle-bar--bot" />
            </button>
          </div>
        </div>
      </header>

      <main>
        <section id="inicio" className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">{t.hero.eyebrow}</span>
              <h1 className="hero-title">{t.hero.titleLead}<span>{t.hero.titleHighlight}</span>{t.hero.titleTail}</h1>
              <p className="hero-text">{t.hero.textBefore}<strong>{t.hero.productsHighlight}</strong>{t.hero.textAfter}<br /><br />{t.hero.extra}</p>
              <div className="hero-actions"><a href="#soluciones" className="button button--gold" onClick={navigateAndClose} data-testid="link-explore-solutions"><Boxes size={16} />{t.hero.exploreSolutions}</a><a href="#contacto" className="button button--outline" onClick={navigateAndClose} data-testid="link-request-quote"><MessageCircle size={16} />{t.hero.requestQuote}</a></div>
            </div>
            <div className="hero-visual">
              <div className="hero-image-frame"><img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1400&auto=format&fit=crop" alt={t.hero.imageAlt} /><div className="hero-caption"><span>{t.hero.captionEyebrow}</span><p>{t.hero.captionText}</p></div></div>
              <div className="float-stat"><ShieldCheck size={20} /><div><strong>{t.hero.statTitle}</strong><small>{t.hero.statSubtitle}</small></div></div>
            </div>
          </div>
        </section>

        <section id="esencia" className="section section--paper">
          <div className="container">
            <div className="section-heading section-heading--center">
              <span className="eyebrow">{t.essence.eyebrow}</span>
              <h2 className="section-title">{t.essence.title}</h2>
              <p className="section-lede">{t.essence.lede}</p>
            </div>
            <div className="value-grid">
              {[
                ['01', t.essence.values.quality.title, t.essence.values.quality.description, Award],
                ['02', t.essence.values.closeness.title, t.essence.values.closeness.description, Handshake],
                ['03', t.essence.values.commitment.title, t.essence.values.commitment.description, ShieldCheck],
                ['04', t.essence.values.trust.title, t.essence.values.trust.description, CircleCheck],
              ].map(([number, title, text, Icon]) => (
                <article className="value-card" data-number={number} key={title as string} data-testid={`card-value-${number}`}>
                  <span className="value-icon"><Icon size={20} /></span>
                  <h3>{title as string}</h3>
                  <p>{text as string}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="familia" className="family-section">
          <div className="container">
            <div className="family-layout">
              <div>
                <span className="eyebrow">{t.family.eyebrow}</span>
                <h2 className="section-title">{t.family.title}</h2>
              </div>
              <div className="slider-controls">
                <button className="icon-button" onClick={() => setFamilyIndex((familyIndex - 1 + t.family.slides.length) % t.family.slides.length)} aria-label={t.common.previous} data-testid="button-family-previous">
                  <ChevronLeft size={18} />
                </button>
                <button className="icon-button" onClick={() => setFamilyIndex((familyIndex + 1) % t.family.slides.length)} aria-label={t.common.next} data-testid="button-family-next">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
            <article className="family-card" aria-live="polite" data-testid="content-family-slide">
              <div className="family-card-content">
                <span className="family-label">{t.family.subtitle}</span>
                <h3>{t.family.slides[familyIndex]?.[0]}</h3>
                <p>{t.family.slides[familyIndex]?.[1]}</p>
              </div>
            </article>
            <div className="family-dots">
              {t.family.slides.map((slide, index) => (
                <button
                  className={`dot${index === familyIndex ? ' active' : ''}`}
                  key={slide[0]}
                  onClick={() => setFamilyIndex(index)}
                  aria-label={t.family.ariaLabel.replace('{slide}', slide[0].toLowerCase())}
                  data-testid={`button-family-dot-${index}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="soluciones" className="section catalog">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">{t.solutions.eyebrow}</span>
              <h2 className="section-title">{t.solutions.title}</h2>
              <p className="section-lede">
                {t.solutions.catalogPart1}
                <strong>{t.solutions.catalogStrongPart}</strong>
                {t.solutions.catalogPart2}
                <strong>{t.solutions.lineIndustrial}</strong>
                {t.solutions.andConjunction}
                <strong>{t.solutions.lineMedical}</strong>
                {t.solutions.catalogPart3}
              </p>
            </div>
            <div className="catalog-lines" role="tablist" aria-label={t.solutions.tabListLabel}>
              <button
                className={`line-button${catalogLine === 'industrial' ? ' active' : ''}`}
                onClick={() => { setCatalogLine('industrial'); setCatalogIndex(0); }}
                role="tab"
                aria-selected={catalogLine === 'industrial'}
                data-testid="button-line-industrial"
              >
                <span className="line-number">01</span>
                <span className="line-text">{t.solutions.lineIndustrial}</span>
              </button>
              <button
                className={`line-button${catalogLine === 'medical' ? ' active' : ''}`}
                onClick={() => { setCatalogLine('medical'); setCatalogIndex(0); }}
                role="tab"
                aria-selected={catalogLine === 'medical'}
                data-testid="button-line-medical"
              >
                <span className="line-number">02</span>
                <span className="line-text">{t.solutions.lineMedical}</span>
              </button>
            </div>
            <div className="catalog-tabs" role="tablist" aria-label={t.solutions.categoriesLabel}>
              <span className="sr-only">{t.solutions.categoriesScreenReader}</span>
              {products.map((item, index) => (
                <button
                  className={`catalog-tab${catalogIndex === index ? ' active' : ''}`}
                  key={item.tabTitle}
                  onClick={() => setCatalogIndex(index)}
                  data-testid={`button-catalog-tab-${index}`}
                >
                  {item.tabTitle}
                </button>
              ))}
            </div>
            <article className="catalog-stage" aria-live="polite" data-testid="content-catalog-product">
              <div className="catalog-visual">
                <div className="catalog-counter">
                  <strong>{String(catalogIndex + 1).padStart(2, '0')}</strong> / {String(products.length).padStart(2, '0')}
                </div>
                <img src={product.image} alt={product.title} />
                <div className="catalog-arrows">
                  <button
                    className="icon-button"
                    onClick={() => setCatalogIndex((catalogIndex - 1 + products.length) % products.length)}
                    aria-label={t.solutions.previousCategory}
                    data-testid="button-catalog-previous"
                  >
                    <ArrowLeft size={17} />
                  </button>
                  <button
                    className="icon-button"
                    onClick={() => setCatalogIndex((catalogIndex + 1) % products.length)}
                    aria-label={t.solutions.nextCategory}
                    data-testid="button-catalog-next"
                  >
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
              <div className="catalog-info">
                <div className="catalog-meta">
                  <span className="catalog-category">{product.category}</span>
                  <span className="catalog-index">{String(catalogIndex + 1).padStart(2, '0')}</span>
                </div>
                <h3>{product.title}</h3>
                <p>{product.description}</p>
                <ul className="feature-list">
                  {product.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <a
                  href={catalogLine === 'medical' ? 'catalogo-medico.pdf' : 'catalogo.pdf'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="catalog-link"
                  data-testid="link-full-catalog"
                >
                  {t.solutions.fullCatalog} <ArrowUpRight size={15} />
                </a>
              </div>
            </article>
          </div>
        </section>

        <section id="eleccion" className="section section--white">
          <div className="container why-layout">
            <div className="why-intro">
              <span className="eyebrow">{t.whyChoose.eyebrow}</span>
              <h2 className="section-title">{t.whyChoose.title}</h2>
              <p className="section-lede">{t.whyChoose.lede}</p>
              <div className="why-dots">
                {whySlides.map((slide, index) => (
                  <button
                    className={`dot${index === whyIndex ? ' active' : ''}`}
                    key={slide[0]}
                    onClick={() => setWhyIndex(index)}
                    aria-label={t.whyChoose.reasonLabel.replace('{number}', String(index + 1))}
                    data-testid={`button-why-dot-${index}`}
                  />
                ))}
              </div>
            </div>
            <div className="why-slider">
              <button
                className="icon-button"
                onClick={() => setWhyIndex((whyIndex - 1 + whySlides.length) % whySlides.length)}
                aria-label={t.whyChoose.previousReason}
                data-testid="button-why-previous"
              >
                <ChevronLeft size={19} />
              </button>
              <article className="why-card" data-testid="content-why-slide">
                <span className="why-icon"><WhyIcon size={23} /></span>
                <h3>{whySlides[whyIndex][0]}</h3>
                <p>{whySlides[whyIndex][1]}</p>
              </article>
              <button
                className="icon-button"
                onClick={() => setWhyIndex((whyIndex + 1) % whySlides.length)}
                aria-label={t.whyChoose.nextReason}
                data-testid="button-why-next"
              >
                <ChevronRight size={19} />
              </button>
            </div>
          </div>
        </section>

        <section id="impulsamos" className="section section--paper">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">{t.sectors.eyebrow}</span>
              <h2 className="section-title">
                {t.sectors.title} <em>{t.sectors.titleEmphasis}</em>
              </h2>
            </div>
            <div className="sectors-grid">
              {t.sectors.names.map((name, index) => {
                const Icon = sectorIcons[index] ?? Store;
                return (
                  <article className="sector-item" key={name} data-testid={`card-sector-${name}`}>
                    <Icon size={23} />
                    <h3>{name}</h3>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="marcas" className="section brands-section">
          <div className="container">
            <div className="section-heading section-heading--center">
              <span className="eyebrow">{t.brands.eyebrow}</span>
              <h2 className="section-title">{t.brands.title}</h2>
              <p className="section-lede">{t.brands.lede}</p>
            </div>
            <div className="brands-grid">
              {brands.map((brand) => (
                <div className="brand-card" key={brand} data-testid={`card-brand-${brand}`}>
                  <div>
                    <strong>{brand}</strong>
                    <small>{t.brands.distributed}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="proceso" className="section section--paper">
          <div className="container">
            <div className="section-heading section-heading--center">
              <span className="eyebrow">{t.process.eyebrow}</span>
              <h2 className="section-title">
                {t.process.title.split(t.process.titleEmphasis)[0]}
                <em>{t.process.titleEmphasis}</em>
                {t.process.title.split(t.process.titleEmphasis)[1] ?? ''}
              </h2>
            </div>

            <div className="process-steps">
              {t.process.steps.map(([number, title, text]) => (
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
            <span>{t.contact.email}</span>
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
            <span>{t.contact.phone}</span>
            <strong>{t.contact.upcoming}</strong>
          </div>
        </div>

        <div className="contact-detail">
          <Clock3 size={18} />
          <div>
            <span>{t.contact.attention}</span>
            <strong>{t.contact.attentionInfo}</strong>
          </div>
        </div>
      </div>
    </div>

    <div className="contact-form-wrap">
      <form
        id="contact-form"
        ref={contactFormRef}
        className="contact-form"
        onSubmit={handleContactSubmit}
      >
        <label>
          {t.contact.form.nameLabel}
          <input
            type="text"
            name="name"
            required
            disabled={contactState.submitting}
          />
          <ValidationError
            className="field-error"
            prefix={t.contact.form.nameLabel}
            field="name"
            errors={contactState.errors}
          />
        </label>

        <label>
          {t.contact.form.emailLabel}
          <input
            type="email"
            name="email"
            required
            disabled={contactState.submitting}
          />
          <ValidationError
            className="field-error"
            prefix={t.contact.form.emailLabel}
            field="email"
            errors={contactState.errors}
          />
        </label>

        <label>
          {t.contact.form.companyLabel}
          <input
            type="text"
            name="company"
            disabled={contactState.submitting}
          />
          <ValidationError
            className="field-error"
            prefix={t.contact.form.companyLabel}
            field="company"
            errors={contactState.errors}
          />
        </label>

        <label>
          {t.contact.form.messageLabel}
          <textarea
            name="message"
            required
            disabled={contactState.submitting}
          />
          <ValidationError
            className="field-error"
            prefix={t.contact.form.messageLabel}
            field="message"
            errors={contactState.errors}
          />
        </label>

        <button type="submit" disabled={contactState.submitting} data-testid="button-submit-contact">
          {contactState.submitting ? t.contact.submitting : t.contact.form.submitButton}
          {contactState.submitting ? (
            <Loader2 size={17} className="newsletter-spinner" />
          ) : (
            <ArrowRight size={17} />
          )}
        </button>
      </form>

      {contactState.succeeded && (
        <p
          className="contact-message contact-message--success"
          role="status"
          data-testid="status-contact"
        >
          <CircleCheck size={15} />
          {t.contact.submitSuccess}
        </p>
      )}

      <ValidationError
        errors={contactState.errors}
        className="contact-message contact-message--error"
        role="status"
        data-testid="status-contact-error"
      />
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
                aria-label={t.newsletter.ariaLabelInput}
                disabled={newsletterStatus === 'loading'}
                data-testid="input-newsletter-email"
              />
              <button
                type="submit"
                aria-label={t.newsletter.ariaLabelButton}
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
                  <p>{t.footer.brandDescription}</p>
                </div>
              </div>

              <p className="footer-description">
                {t.footer.footerTagline}
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
                  <span data-testid="footer-link-phone">
                    {t.footer.upcoming}
                  </span>
                </li>

                <li>
                  <a
                    href="#contacto"
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

      {portalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setPortalOpen(false); }}>
          <section className="modal modal--wide" role="dialog" aria-modal="true" aria-labelledby="portal-heading">
            <button className="modal-close" onClick={() => setPortalOpen(false)} aria-label={t.portal.closePortal} data-testid="button-close-portal">
              <X size={18} />
            </button>
            <div className="portal-header">
              <span className="eyebrow">{t.portal.eyebrow}</span>
              <h2 id="portal-heading">{t.portal.welcome.replace('{name}', profile.name ? `, ${profile.name}` : '')}</h2>
              <p className="modal-intro">{t.portal.intro}</p>
            </div>
            <div className="profile-summary">
              <div className="profile-row">
                <span>{t.portal.fieldNameLabel}</span>
                <strong>{profile.name || t.portal.defaultClientName}</strong>
              </div>
              <div className="profile-row">
                <span>{t.portal.fieldEmailLabel}</span>
                <strong>{profile.email || currentUser?.email || t.portal.notAvailable}</strong>
              </div>
              <div className="profile-row">
                <span>{t.portal.fieldCompanyLabel}</span>
                <strong>{profile.company || t.portal.notSpecified}</strong>
              </div>
            </div>

            {/* Gestión de sesiones y dispositivos */}
            <div className="sessions-section">
              <div className="sessions-header">
                <div>
                  <h3 className="sessions-title">{t.portal.sessionsTitle}</h3>
                  <p className="sessions-subtitle">{t.portal.sessionsSubtitle}</p>
                </div>
                <button
                  type="button"
                  className="sessions-refresh-btn"
                  onClick={() => loadSessions(currentUser)}
                  disabled={loadingSessions}
                  aria-label={t.portal.refreshSessions}
                  title={t.portal.refreshSessions}
                >
                  <RefreshCw size={14} className={loadingSessions ? 'animate-spin' : ''} />
                </button>
              </div>

              {sessionFeedback && (
                <div className={`account-message account-message--${sessionFeedback.type === 'success' ? 'success' : 'warning'}`} role="status" style={{ marginBottom: 12 }}>
                  {sessionFeedback.text}
                </div>
              )}

              {loadingSessions && sessions.length === 0 ? (
                <div className="sessions-loading">
                  <Loader2 size={16} className="animate-spin" />
                  <span>{t.portal.loadingSessions}</span>
                </div>
              ) : sessions.length === 0 ? (
                <div className="sessions-empty">
                  <span>{t.portal.noActiveSessions}</span>
                </div>
              ) : (
                <div className="sessions-list">
                  {sessions.map((sess) => (
                    <div key={sess.sessionId} className={`session-item${sess.isCurrent ? ' session-item--current' : ''}`}>
                      <div className="session-icon-wrap">
                        {renderDeviceIcon(sess.deviceType)}
                      </div>
                      <div className="session-info">
                        <div className="session-title-row">
                          <strong className="session-device-name">
                            {sess.os || 'Dispositivo'} • {sess.browser || 'Navegador'}
                          </strong>
                          {sess.isCurrent && (
                            <span className="session-badge">{t.portal.currentDeviceBadge}</span>
                          )}
                        </div>
                        <div className="session-meta">
                          {sess.country && (
                            <span><Globe size={11} /> {sess.country === 'MX' ? 'México' : sess.country}</span>
                          )}
                          {sess.ip && <span>IP: {sess.ip}</span>}
                          <span>{t.portal.lastActiveLabel}: {formatSessionDate(sess.lastActiveAt)}</span>
                        </div>
                      </div>
                      {!sess.isCurrent && (
                        <button
                          type="button"
                          className="session-revoke-btn"
                          onClick={() => handleRevokeSession(sess.sessionId)}
                          disabled={sessionActionLoading === sess.sessionId}
                          aria-label={t.portal.revokeSession}
                        >
                          {sessionActionLoading === sess.sessionId ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                          <span>{t.portal.revokeSession}</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {sessions.filter((s) => !s.isCurrent).length > 0 && (
                <div className="sessions-footer-action">
                  <button
                    type="button"
                    className="button button--outline revoke-others-btn"
                    onClick={handleRevokeAllOthers}
                    disabled={sessionActionLoading === 'all-others'}
                  >
                    {sessionActionLoading === 'all-others' ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <LockKeyhole size={14} />
                    )}
                    <span>{t.portal.revokeAllOthers}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="portal-actions">
              <button className="button button--navy" onClick={() => { setPortalOpen(false); setProfileOpen(true); }} data-testid="button-open-profile">
                <UserCheck size={15} />{t.portal.myProfile}
              </button>
              <button className="button button--outline" style={{ color: 'var(--navy)', borderColor: 'var(--line)' }} onClick={handleSignOut} data-testid="button-logout">
                <LockKeyhole size={15} />{t.portal.logOut}
              </button>
              <button className="button button--outline" style={{ color: 'var(--navy)', borderColor: 'var(--line)' }} onClick={() => setPortalOpen(false)} data-testid="button-close-portal-action">
                {t.portal.closePortal}
              </button>
            </div>
          </section>
        </div>
      )}

      {profileOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setProfileOpen(false); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="profile-heading"><button className="modal-close" onClick={() => setProfileOpen(false)} aria-label={t.common.closeProfileAria} data-testid="button-close-profile"><X size={18} /></button><div className="modal-brand"><BrandMark /><div><strong>{t.portal.myProfile.toUpperCase()}</strong><small>{t.portal.defaultClientName}</small></div></div><h2 id="profile-heading">{t.portal.profileHeading}</h2><p className="modal-intro">{t.portal.profileIntro}</p><div className="account-form"><div className="form-field"><label htmlFor="profile-name">{t.portal.fieldNameLabel}</label><input id="profile-name" value={profile.name} onChange={(event) => setProfile((value) => ({ ...value, name: event.target.value }))} data-testid="input-profile-name" /></div><div className="form-field"><label htmlFor="profile-email">{t.portal.fieldEmailLabel}</label><input id="profile-email" value={profile.email || currentUser?.email || ''} disabled data-testid="input-profile-email" /></div><div className="form-field"><label htmlFor="profile-company">{t.portal.fieldCompanyLabel}</label><input id="profile-company" value={profile.company} onChange={(event) => setProfile((value) => ({ ...value, company: event.target.value }))} placeholder={t.account.fieldCompanyPlaceholder} data-testid="input-profile-company" /></div><button className="button button--navy" onClick={saveProfile} data-testid="button-save-profile"><Check size={15} />{t.portal.saveChanges}</button></div></section></div>}
    </div>
  );
}

function AppWithProviders() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><ErrorBoundary><App /></ErrorBoundary><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default AppWithProviders;
