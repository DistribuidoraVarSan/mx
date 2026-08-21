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
    solicitarCotizacion: string;
    portalClientes: string;
    iniciarSesion: string;
    crearCuenta: string;
  };

  languageSelector: {
    label: string; // texto accesible del botón, ej. "Seleccionar idioma"
  };

  cookies: {
    text: string; // usa {privacidad} y {cookies} como marcadores de los links
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
  };

  portal: {
    eyebrow: string;
    welcome: string; // usa {name}
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
    rightsReserved: string; // usa {year}
    tagline: string;
    privacyNotice: string;
    cookiesPolicy: string;
    termsAndConditions: string;
  };
};
