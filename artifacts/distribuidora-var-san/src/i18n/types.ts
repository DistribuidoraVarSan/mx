/**
 * Estructura de diccionario i18n para Distribuidora Var San.
 * Si agregas una clave aquí, TypeScript verificará los 8 idiomas.
 */

export type LegalSection = {
  title?: string;
  paragraphs?: string[];
  list?: string[];
  highlight?: string;
  subsections?: Array<{
    title: string;
    paragraphs?: string[];
    list?: string[];
  }>;
};

export type LegalDoc = {
  title: string;
  lastUpdated: string;
  intro: string[];
  sections: LegalSection[];
  contactBlock: {
    brand: string;
    email: string;
  };
  signoff: {
    brand: string;
    tagline: string;
  };
};

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
    backToHome: string;
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
    sessionsTitle: string;
    sessionsSubtitle: string;
    currentDeviceBadge: string;
    lastActiveLabel: string;
    locationLabel: string;
    revokeSession: string;
    revokeAllOthers: string;
    confirmRevokeAll: string;
    noActiveSessions: string;
    sessionRevokedSuccess: string;
    sessionsRevokedAllSuccess: string;
    loadingSessions: string;
    refreshSessions: string;
    revokeAllTotal: string;
    confirmRevokeAllTotal: string;
    sessionsRevokedTotalSuccess: string;
    itWasntMe: string;
    itWasntMeSuccess: string;
    securityActivityTitle: string;
    securityActivitySubtitle: string;
    noSecurityActivity: string;
    loadingActivity: string;
    reportSuspiciousActivity: string;
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
    lineIndustrial: string;
    lineMedical: string;
    andConjunction: string;
    industrialProducts: Array<{
      category: string;
      title: string;
      tabTitle: string;
      description: string;
      features: string[];
    }>;
    medicalProducts: Array<{
      category: string;
      title: string;
      tabTitle: string;
      description: string;
      features: string[];
    }>;
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
    upcoming: string;
    submitting: string;
    submitSuccess: string;
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
    upcoming: string;
  };

  splash: {
    ariaLabel: string;
    tagline: string;
  };

  twoFactor: {
    title: string;
    subtitle: string;
    enabledBadge: string;
    disabledBadge: string;
    enableBtn: string;
    disableBtn: string;
    setupTitle: string;
    setupIntro: string;
    step1Title: string;
    step1Scan: string;
    step1ManualKey: string;
    step2Title: string;
    step2EnterCode: string;
    step3Title: string;
    step3BackupCodes: string;
    step3BackupIntro: string;
    copyKey: string;
    keyCopied: string;
    copyBackupCodes: string;
    backupCodesCopied: string;
    confirmAndActivate: string;
    activating: string;
    deactivating: string;
    disableConfirmTitle: string;
    disableConfirmIntro: string;
    enterCodeToDisable: string;
    confirmDisable: string;
    challengeTitle: string;
    challengeIntro: string;
    inputCodePlaceholder: string;
    verifyButton: string;
    verifying: string;
    useBackupCodeLink: string;
    useTotpLink: string;
    enterBackupCodePlaceholder: string;
    rescueEmailLink: string;
    rescueEmailSent: string;
    enterRescueCodePlaceholder: string;
    cancel: string;
    errorInvalidCode: string;
    errorLocked: string;
    remainingBackupCodes: string;
  };

  legal: {
    backToHome: string;
    cookies: LegalDoc;
    privacy: LegalDoc;
    terms: LegalDoc;
  };
};
