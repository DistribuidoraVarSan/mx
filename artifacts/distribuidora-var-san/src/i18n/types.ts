/**
 * Forma que debe tener CADA archivo en /i18n/locales.
 * Si agregas una clave nueva aquí, TypeScript te obligará
 * a agregarla en los 8 idiomas (así no se te olvida ninguno).
 */
export type Dictionary = {
  nav: {
    inicio: string;
    esencia: string;
    familia: string;
    soluciones: string;
    eleccion: string;
    impulsamos: string;
    marcas: string;
    atencion: string;
    contacto: string;
    solicitarCotizacion: string;
    portalClientes: string;
    iniciarSesion: string;
    crearCuenta: string;
    miCuenta: string;
    abrirMenu: string;
    cerrarMenu: string;
    navegacionPrincipal: string;
  };

  languageSelector: {
    label: string;
  };

  common: {
    close: string;
    closeProfileAria: string;
    previous: string;
    next: string;
    loading: string;
  };

  cookies: {
    ariaLabel: string;
    text: string;
    privacyLink: string;
    cookiesLink: string;
    accept: string;
    reject: string;
  };

  account: {
    portalTitle: string;
    loginTitle: string;
    registerTitle: string;
    loginIntro: string;
    registerIntro: string;
    tabLogin: string;
    tabRegister: string;
    fieldName: string;
    fieldNamePlaceholder: string;
    fieldCompany: string;
    fieldCompanyPlaceholder: string;
    fieldEmail: string;
    fieldEmailPlaceholder: string;
    fieldPassword: string;
    fieldPasswordPlaceholderLogin: string;
    fieldPasswordPlaceholderRegister: string;
    fieldConfirmPassword: string;
    fieldConfirmPasswordPlaceholder: string;
    submitLogin: string;
    submitRegister: string;
    continueWithGoogle: string;
    secureAccessNote: string;
    passwordMismatch: string;
    accountCreated: string;
    loginSuccess: string;
    errorEmailInUse: string;
    errorWeakPassword: string;
    errorInvalidEmail: string;
    errorInvalidCredential: string;
    errorTooManyRequests: string;
    errorGeneric: string;
    errorGoogleSignIn: string;
    errorSaveProfile: string;
  };

  portal: {
    eyebrow: string;
    welcome: string;
    intro: string;
    fieldNameLabel: string;
    fieldEmailLabel: string;
    fieldCompanyLabel: string;
    defaultClientName: string;
    notSpecified: string;
    notAvailable: string;
    myProfile: string;
    logOut: string;
    closePortal: string;
    profileHeading: string;
    profileIntro: string;
    saveChanges: string;
  };

  hero: {
    eyebrow: string;
    titleLead: string;
    titleHighlight: string;
    titleTail: string;
    textBefore: string;
    textAfter: string;
    productsHighlight: string;
    extra: string;
    exploreSolutions: string;
    requestQuote: string;
    imageAlt: string;
    captionEyebrow: string;
    captionText: string;
    statTitle: string;
    statSubtitle: string;
  };

  essence: {
    eyebrow: string;
    title: string;
    lede: string;
    values: {
      quality: { title: string; description: string };
      closeness: { title: string; description: string };
      commitment: { title: string; description: string };
      trust: { title: string; description: string };
    };
  };

  family: {
    eyebrow: string;
    title: string;
    subtitle: string;
    label: string;
    ariaLabel: string;
    slides: Array<[string, string]>;
  };

  solutions: {
    eyebrow: string;
    title: string;
    lede: string;
    catalogPart1: string;
    catalogStrongPart: string;
    catalogPart2: string;
    catalogPart3: string;
    tabListLabel: string;
    categoriesLabel: string;
    categoriesScreenReader: string;
    previousCategory: string;
    nextCategory: string;
    fullCatalog: string;
  };

  whyChoose: {
    eyebrow: string;
    title: string;
    lede: string;
    ariaLabel: string;
    reasonLabel: string;
    previousReason: string;
    nextReason: string;
    reasons: Array<[string, string]>;
  };

  sectors: {
    eyebrow: string;
    title: string;
    titleEmphasis: string;
    names: string[];
  };

  brands: {
    eyebrow: string;
    title: string;
    lede: string;
    distributed: string;
  };

  process: {
    eyebrow: string;
    title: string;
    titleEmphasis: string;
    steps: Array<[string, string, string]>;
  };

  contact: {
    eyebrow: string;
    title: string;
    titleEmphasis: string;
    lede: string;
    email: string;
    phone: string;
    attention: string;
    attentionInfo: string;
    form: {
      nameLabel: string;
      emailLabel: string;
      companyLabel: string;
      messageLabel: string;
      submitButton: string;
    };
  };

  newsletter: {
    title: string;
    lede: string;
    placeholder: string;
    ariaLabelInput: string;
    ariaLabelButton: string;
    alreadySubscribed: string;
    subscriptionSuccess: string;
    subscriptionError: string;
    networkError: string;
  };

  chatbot: {
    openButtonLabel: string;
    closeButtonLabel: string;
    headerTitle: string;
    headerSubtitle: string;
    greeting: string;
    inputPlaceholder: string;
    inputAriaLabel: string;
    sendButtonLabel: string;
    quickProducts: string;
    quickQuote: string;
    quickSupport: string;
    quickContact: string;
    loadingMessage: string;
    errorMessage: string;
  };

  footer: {
    navigationHeading: string;
    contactHeading: string;
    requestQuote: string;
    rightsReserved: string;
    tagline: string;
    privacyNotice: string;
    cookiesPolicy: string;
    termsAndConditions: string;
    brandDescription: string;
    footerTagline: string;
  };

  splash: {
    ariaLabel: string;
    tagline: string;
  };
};
