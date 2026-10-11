import {
  type AccountDeletionEmailParams,
  type AccountDeactivationEmailParams,
  type EmailChangeNotificationParams,
  type EmailContent,
  type EmailLanguage,
  type NewDeviceLoginEmailParams,
  type PasswordChangedEmailParams,
  type PasswordResetEmailParams,
  type SecurityAlertEmailParams,
  type TwoFactorStatusEmailParams,
  type VerificationCodeEmailParams,
  type BackupCodesEmailParams,
  type ClientWelcomeEmailParams,
  type DataExportCodeEmailParams,
  type DataExportReadyEmailParams,
  escapeHtml,
} from "./types";

interface AuthTranslations {
  verification: {
    subject: string;
    kicker: string;
    heading: string;
    greeting: string;
    intro: string;
    codeLabel: string;
    expiryNotice: string;
    securityWarning: string;
  };
  passwordReset: {
    subject: string;
    kicker: string;
    heading: string;
    greeting: string;
    intro: string;
    codeLabel: string;
    buttonLabel: string;
    expiryNotice: string;
    ignoreWarning: string;
  };
  passwordChanged: {
    subject: string;
    kicker: string;
    heading: string;
    greeting: string;
    message: string;
    timeLabel: string;
    alertWarning: string;
    contactAction: string;
  };
  newDevice: {
    subject: string;
    kicker: string;
    heading: string;
    greeting: string;
    intro: string;
    detailsHeader: string;
    deviceLabel: string;
    osLabel: string;
    browserLabel: string;
    ipLabel: string;
    locationLabel: string;
    timeLabel: string;
    revokePrompt: string;
    revokeButton: string;
    allGoodNotice: string;
  };
  twoFactor: {
    enabledSubject: string;
    disabledSubject: string;
    kicker: string;
    enabledHeading: string;
    disabledHeading: string;
    greeting: string;
    enabledMessage: string;
    disabledMessage: string;
    warning: string;
  };
  securityAlert: {
    subject: string;
    kicker: string;
    heading: string;
    greeting: string;
    detailsLabel: string;
    timeLabel: string;
    actionPrompt: string;
    actionButton: string;
  };
  emailChange: {
    subject: string;
    kicker: string;
    heading: string;
    greeting: string;
    intro: string;
    oldEmailLabel: string;
    newEmailLabel: string;
    timeLabel: string;
    warning: string;
  };
  accountStatus: {
    deactivatedSubject: string;
    deactivatedHeading: string;
    deactivatedMessage: string;
    deletedSubject: string;
    deletedHeading: string;
    deletedMessage: string;
    timeLabel: string;
    supportNote: string;
  };
  common: {
    tagline: string;
    footerCopyright: string;
    companyName: string;
    officialBadge: string;
    supportPrompt: string;
  };
}

export const AUTH_TRANSLATIONS: Record<EmailLanguage, AuthTranslations> = {
  es: {
    verification: {
      subject: "Tu código de verificación — Distribuidora Var San",
      kicker: "VERIFICACIÓN DE CUENTA",
      heading: "Verifica tu correo electrónico",
      greeting: "Hola,",
      intro: "Utiliza el siguiente código para verificar tu dirección de correo electrónico.",
      codeLabel: "CÓDIGO DE VERIFICACIÓN",
      expiryNotice: "Este código es válido durante {min} minutos.",
      securityWarning: "NO compartas este código con nadie.",
    },
    passwordReset: {
      subject: "Recuperación de contraseña — Distribuidora Var San",
      kicker: "SEGURIDAD",
      heading: "Restablecimiento de contraseña",
      greeting: "Hola,",
      intro: "Recibimos una solicitud para restablecer la contraseña de tu cuenta.",
      codeLabel: "CÓDIGO DE VERIFICACIÓN",
      buttonLabel: "RESTABLECER CONTRASEÑA",
      expiryNotice: "Este código es válido durante {min} minutos.",
      ignoreWarning: "Si tú no solicitaste este cambio, puedes ignorar este mensaje.",
    },
    passwordChanged: {
      subject: "Contraseña actualizada — Distribuidora Var San",
      kicker: "SEGURIDAD",
      heading: "Contraseña actualizada",
      greeting: "Hola,",
      message: "Tu contraseña se actualizó correctamente.",
      timeLabel: "FECHA Y HORA",
      alertWarning: "Si no realizaste este cambio, protege tu cuenta inmediatamente.",
      contactAction: "Reportar actividad sospechosa",
    },
    newDevice: {
      subject: "Nuevo inicio de sesión detectado — Distribuidora Var San",
      kicker: "ACCESO",
      heading: "Nuevo inicio de sesión",
      greeting: "Hola,",
      intro: "Detectamos un nuevo inicio de sesión en tu cuenta.",
      detailsHeader: "DETALLES DE LA ACTIVIDAD",
      deviceLabel: "DISPOSITIVO",
      osLabel: "SISTEMA OPERATIVO",
      browserLabel: "NAVEGADOR",
      ipLabel: "DIRECCIÓN IP",
      locationLabel: "UBICACIÓN",
      timeLabel: "FECHA Y HORA",
      revokePrompt: "¿No reconoces esta actividad? Protege tu cuenta inmediatamente.",
      revokeButton: "REVISAR SEGURIDAD",
      allGoodNotice: "Si fuiste tú, no es necesario realizar ninguna acción.",
    },
    twoFactor: {
      enabledSubject: "Autenticación en dos pasos activada — Distribuidora Var San",
      disabledSubject: "Autenticación en dos pasos desactivada — Distribuidora Var San",
      kicker: "SEGURIDAD",
      enabledHeading: "Autenticación en dos fases activada",
      disabledHeading: "Autenticación en dos fases desactivada",
      greeting: "Hola,",
      enabledMessage: "La autenticación en dos fases se activó correctamente en tu cuenta. Ahora cuentas con una capa adicional de protección.",
      disabledMessage: "La autenticación en dos fases fue desactivada correctamente de tu cuenta.",
      warning: "Si no realizaste esta acción, revisa la seguridad de tu cuenta de inmediato.",
    },
    securityAlert: {
      subject: "Alerta de seguridad importante — Distribuidora Var San",
      kicker: "ALERTA DE SEGURIDAD",
      heading: "Alerta de seguridad",
      greeting: "Hola,",
      detailsLabel: "DETALLES DEL EVENTO",
      timeLabel: "FECHA",
      actionPrompt: "Si no reconoces esta actividad, revisa tu cuenta inmediatamente.",
      actionButton: "REVISAR SEGURIDAD",
    },
    emailChange: {
      subject: "Notificación de cambio de correo — Distribuidora Var San",
      kicker: "CUENTA",
      heading: "Correo electrónico actualizado",
      greeting: "Hola,",
      intro: "Tu dirección de correo electrónico se actualizó correctamente.",
      oldEmailLabel: "CORREO ANTERIOR",
      newEmailLabel: "NUEVO CORREO",
      timeLabel: "FECHA",
      warning: "Si no realizaste este cambio, protege tu cuenta de inmediato.",
    },
    accountStatus: {
      deactivatedSubject: "Cuenta desactivada — Distribuidora Var San",
      deactivatedHeading: "Cuenta desactivada",
      deactivatedMessage: "Tu cuenta de Distribuidora Var San ha sido desactivada correctamente.",
      deletedSubject: "Tu cuenta ha sido eliminada — Distribuidora Var San",
      deletedHeading: "Cuenta eliminada",
      deletedMessage: "La eliminación de tu cuenta de Distribuidora Var San se completó correctamente.",
      timeLabel: "FECHA",
      supportNote: "Si necesitas asistencia o deseas volver a crear una cuenta, nuestro equipo está a tu disposición.",
    },
    common: {
      tagline: "Soluciones en limpieza y protección para tu empresa.",
      footerCopyright: "© 2026 Distribuidora Var San",
      companyName: "Distribuidora Var San",
      officialBadge: "DISTRIBUIDORA VAR SAN",
      supportPrompt: "¿Necesitas ayuda?",
    },
  },
  "en-GB": {
    verification: {
      subject: "Your verification code — Distribuidora Var San",
      kicker: "ACCOUNT VERIFICATION",
      heading: "Verify your email address",
      greeting: "Hello,",
      intro: "Please use the following code to verify your email address.",
      codeLabel: "VERIFICATION CODE",
      expiryNotice: "This code is valid for {min} minutes.",
      securityWarning: "DO NOT share this code with anyone.",
    },
    passwordReset: {
      subject: "Password reset request — Distribuidora Var San",
      kicker: "SECURITY",
      heading: "Password reset",
      greeting: "Hello,",
      intro: "We received a request to reset the password for your account.",
      codeLabel: "VERIFICATION CODE",
      buttonLabel: "RESET PASSWORD",
      expiryNotice: "This code is valid for {min} minutes.",
      ignoreWarning: "If you did not request this change, you can safely ignore this email.",
    },
    passwordChanged: {
      subject: "Password updated successfully — Distribuidora Var San",
      kicker: "SECURITY",
      heading: "Password updated",
      greeting: "Hello,",
      message: "Your password has been successfully updated.",
      timeLabel: "DATE & TIME",
      alertWarning: "If you did not make this change, please secure your account immediately.",
      contactAction: "Report suspicious activity",
    },
    newDevice: {
      subject: "New login detected — Distribuidora Var San",
      kicker: "ACCESS",
      heading: "New login detected",
      greeting: "Hello,",
      intro: "We detected a new login to your account.",
      detailsHeader: "ACTIVITY DETAILS",
      deviceLabel: "DEVICE",
      osLabel: "OPERATING SYSTEM",
      browserLabel: "BROWSER",
      ipLabel: "IP ADDRESS",
      locationLabel: "LOCATION",
      timeLabel: "DATE & TIME",
      revokePrompt: "Do not recognize this activity? Secure your account immediately.",
      revokeButton: "REVIEW SECURITY",
      allGoodNotice: "If this was you, no action is needed.",
    },
    twoFactor: {
      enabledSubject: "Two-factor authentication enabled — Distribuidora Var San",
      disabledSubject: "Two-factor authentication disabled — Distribuidora Var San",
      kicker: "SECURITY",
      enabledHeading: "Two-factor authentication enabled",
      disabledHeading: "Two-factor authentication disabled",
      greeting: "Hello,",
      enabledMessage: "Two-factor authentication has been successfully activated on your account. You now have an extra layer of protection.",
      disabledMessage: "Two-factor authentication has been deactivated on your account.",
      warning: "If you did not perform this action, please secure your account immediately.",
    },
    securityAlert: {
      subject: "Important security alert — Distribuidora Var San",
      kicker: "SECURITY ALERT",
      heading: "Security alert",
      greeting: "Hello,",
      detailsLabel: "EVENT DETAILS",
      timeLabel: "DATE",
      actionPrompt: "If you do not recognize this activity, please review your account immediately.",
      actionButton: "REVIEW SECURITY",
    },
    emailChange: {
      subject: "Email change notification — Distribuidora Var San",
      kicker: "ACCOUNT",
      heading: "Email address updated",
      greeting: "Hello,",
      intro: "Your email address has been successfully updated.",
      oldEmailLabel: "PREVIOUS EMAIL",
      newEmailLabel: "NEW EMAIL",
      timeLabel: "DATE",
      warning: "If you did not make this change, secure your account immediately.",
    },
    accountStatus: {
      deactivatedSubject: "Account deactivated — Distribuidora Var San",
      deactivatedHeading: "Account deactivated",
      deactivatedMessage: "Your Distribuidora Var San account has been deactivated.",
      deletedSubject: "Your account has been deleted — Distribuidora Var San",
      deletedHeading: "Account deleted",
      deletedMessage: "The deletion of your Distribuidora Var San account has been completed.",
      timeLabel: "DATE",
      supportNote: "If you need assistance, our support team is always here to help.",
    },
    common: {
      tagline: "Cleaning and protective solutions for your business.",
      footerCopyright: "© 2026 Distribuidora Var San",
      companyName: "Distribuidora Var San",
      officialBadge: "DISTRIBUIDORA VAR SAN",
      supportPrompt: "Need help?",
    },
  },
  fr: {
    verification: {
      subject: "Votre code de vérification — Distribuidora Var San",
      kicker: "VÉRIFICATION DU COMPTE",
      heading: "Vérifiez votre adresse e-mail",
      greeting: "Bonjour,",
      intro: "Veuillez utiliser le code suivant pour vérifier votre adresse e-mail.",
      codeLabel: "CODE DE VÉRIFICATION",
      expiryNotice: "Ce code est valide pendant {min} minutes.",
      securityWarning: "Ne partagez ce code avec personne.",
    },
    passwordReset: {
      subject: "Réinitialisation de mot de passe — Distribuidora Var San",
      kicker: "SÉCURITÉ",
      heading: "Réinitialisation de mot de passe",
      greeting: "Bonjour,",
      intro: "Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte.",
      codeLabel: "CODE DE VÉRIFICATION",
      buttonLabel: "RÉINITIALISER LE MOT DE PASSE",
      expiryNotice: "Ce code est valide pendant {min} minutes.",
      ignoreWarning: "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.",
    },
    passwordChanged: {
      subject: "Mot de passe mis à jour — Distribuidora Var San",
      kicker: "SÉCURITÉ",
      heading: "Mot de passe mis à jour",
      greeting: "Bonjour,",
      message: "Votre mot de passe a été mis à jour avec succès.",
      timeLabel: "DATE ET HEURE",
      alertWarning: "Si vous n'avez pas effectué cette modification, sécurisez votre compte immédiatement.",
      contactAction: "Signaler une activité suspecte",
    },
    newDevice: {
      subject: "Nouvelle connexion détectée — Distribuidora Var San",
      kicker: "ACCÈS",
      heading: "Nouvelle connexion",
      greeting: "Bonjour,",
      intro: "Une nouvelle connexion a été détectée sur votre compte.",
      detailsHeader: "DÉTAILS DE L'ACTIVITÉ",
      deviceLabel: "APPAREIL",
      osLabel: "SYSTÈME D'EXPLOITATION",
      browserLabel: "NAVIGATEUR",
      ipLabel: "ADRESSE IP",
      locationLabel: "EMPLACEMENT",
      timeLabel: "DATE ET HEURE",
      revokePrompt: "Vous ne reconnaissez pas cette activité ? Sécurisez votre compte immédiatement.",
      revokeButton: "VÉRIFIER LA SÉCURITÉ",
      allGoodNotice: "S'il s'agissait de vous, aucune action n'est requise.",
    },
    twoFactor: {
      enabledSubject: "Authentification à deux facteurs activée — Distribuidora Var San",
      disabledSubject: "Authentification à deux facteurs désactivée — Distribuidora Var San",
      kicker: "SÉCURITÉ",
      enabledHeading: "Authentification 2FA activée",
      disabledHeading: "Authentification 2FA désactivée",
      greeting: "Bonjour,",
      enabledMessage: "L'authentification à deux facteurs a été activée sur votre compte.",
      disabledMessage: "L'authentification à deux facteurs a été désactivée de votre compte.",
      warning: "Si vous n'avez pas effectué cette action, sécurisez votre compte immédiatement.",
    },
    securityAlert: {
      subject: "Alerte de sécurité importante — Distribuidora Var San",
      kicker: "ALERTE DE SÉCURITÉ",
      heading: "Alerte de sécurité",
      greeting: "Bonjour,",
      detailsLabel: "DÉTAILS DE L'ÉVÉNEMENT",
      timeLabel: "DATE",
      actionPrompt: "Si vous ne reconnaissez pas cette activité, vérifiez votre compte immédiatement.",
      actionButton: "VÉRIFIER LA SÉCURITÉ",
    },
    emailChange: {
      subject: "Changement d'adresse e-mail — Distribuidora Var San",
      kicker: "COMPTE",
      heading: "Adresse e-mail mise à jour",
      greeting: "Bonjour,",
      intro: "Votre adresse e-mail a été mise à jour avec succès.",
      oldEmailLabel: "ANCIENNE ADRESSE",
      newEmailLabel: "NOUVELLE ADRESSE",
      timeLabel: "DATE",
      warning: "Si vous n'avez pas effectué ce changement, sécurisez votre compte.",
    },
    accountStatus: {
      deactivatedSubject: "Compte désactivé — Distribuidora Var San",
      deactivatedHeading: "Compte désactivé",
      deactivatedMessage: "Votre compte Distribuidora Var San a été désactivé.",
      deletedSubject: "Compte supprimé — Distribuidora Var San",
      deletedHeading: "Compte supprimé",
      deletedMessage: "La suppression de votre compte Distribuidora Var San est terminée.",
      timeLabel: "DATE",
      supportNote: "Si vous avez besoin d'aide, notre équipe est à votre disposition.",
    },
    common: {
      tagline: "Solutions de nettoyage et de protection pour votre entreprise.",
      footerCopyright: "© 2026 Distribuidora Var San",
      companyName: "Distribuidora Var San",
      officialBadge: "DISTRIBUIDORA VAR SAN",
      supportPrompt: "Besoin d'aide ?",
    },
  },
  pt: {
    verification: {
      subject: "Seu código de verificação — Distribuidora Var San",
      kicker: "VERIFICAÇÃO DE CONTA",
      heading: "Verifique seu e-mail",
      greeting: "Olá,",
      intro: "Use o código abaixo para verificar seu endereço de e-mail.",
      codeLabel: "CÓDIGO DE VERIFICAÇÃO",
      expiryNotice: "Este código é válido por {min} minutos.",
      securityWarning: "NÃO compartilhe este código com ninguém.",
    },
    passwordReset: {
      subject: "Recuperação de senha — Distribuidora Var San",
      kicker: "SEGURANÇA",
      heading: "Redefinição de senha",
      greeting: "Olá,",
      intro: "Recebemos uma solicitação para redefinir a senha da sua conta.",
      codeLabel: "CÓDIGO DE VERIFICAÇÃO",
      buttonLabel: "REDEFINIR SENHA",
      expiryNotice: "Este código é válido por {min} minutos.",
      ignoreWarning: "Se você não solicitou esta alteração, pode ignorar esta mensagem.",
    },
    passwordChanged: {
      subject: "Senha atualizada com sucesso — Distribuidora Var San",
      kicker: "SEGURANÇA",
      heading: "Senha atualizada",
      greeting: "Olá,",
      message: "Sua senha foi atualizada com sucesso.",
      timeLabel: "DATA E HORA",
      alertWarning: "Se você não realizou esta alteração, proteja sua conta imediatamente.",
      contactAction: "Denunciar atividade suspeita",
    },
    newDevice: {
      subject: "Novo acesso detectado — Distribuidora Var San",
      kicker: "ACESSO",
      heading: "Novo acesso detectado",
      greeting: "Olá,",
      intro: "Detectamos um novo acesso à sua conta.",
      detailsHeader: "DETALHES DA ATIVIDADE",
      deviceLabel: "DISPOSITIVO",
      osLabel: "SISTEMA OPERACIONAL",
      browserLabel: "NAVEGADOR",
      ipLabel: "ENDEREÇO IP",
      locationLabel: "LOCALIZAÇÃO",
      timeLabel: "DATA E HORA",
      revokePrompt: "Não reconhece esta atividade? Proteja sua conta imediatamente.",
      revokeButton: "REVISAR SEGURANÇA",
      allGoodNotice: "Se foi você, nenhuma ação é necessária.",
    },
    twoFactor: {
      enabledSubject: "Autenticação em duas etapas ativada — Distribuidora Var San",
      disabledSubject: "Autenticação em duas etapas desativada — Distribuidora Var San",
      kicker: "SEGURANÇA",
      enabledHeading: "Autenticação 2FA ativada",
      disabledHeading: "Autenticação 2FA desativada",
      greeting: "Olá,",
      enabledMessage: "A autenticação em duas etapas foi ativada com sucesso.",
      disabledMessage: "A autenticação em duas etapas foi desativada.",
      warning: "Se você não realizou esta ação, proteja sua conta imediatamente.",
    },
    securityAlert: {
      subject: "Alerta de segurança importante — Distribuidora Var San",
      kicker: "ALERTA DE SEGURANÇA",
      heading: "Alerta de segurança",
      greeting: "Olá,",
      detailsLabel: "DETALHES DO EVENTO",
      timeLabel: "DATA",
      actionPrompt: "Se não reconhece esta atividade, revise sua conta imediatamente.",
      actionButton: "REVISAR SEGURANÇA",
    },
    emailChange: {
      subject: "Notificação de alteração de e-mail — Distribuidora Var San",
      kicker: "CONTA",
      heading: "E-mail atualizado",
      greeting: "Olá,",
      intro: "Seu endereço de e-mail foi atualizado com sucesso.",
      oldEmailLabel: "E-MAIL ANTERIOR",
      newEmailLabel: "NOVO E-MAIL",
      timeLabel: "DATA",
      warning: "Se você não realizou esta alteração, proteja sua conta.",
    },
    accountStatus: {
      deactivatedSubject: "Conta desativada — Distribuidora Var San",
      deactivatedHeading: "Conta desativada",
      deactivatedMessage: "Sua conta da Distribuidora Var San foi desativada.",
      deletedSubject: "Conta excluída — Distribuidora Var San",
      deletedHeading: "Conta excluída",
      deletedMessage: "A exclusão da sua conta foi concluída.",
      timeLabel: "DATA",
      supportNote: "Se precisar de assistência, nossa equipe está à disposição.",
    },
    common: {
      tagline: "Soluções em limpeza e proteção para sua empresa.",
      footerCopyright: "© 2026 Distribuidora Var San",
      companyName: "Distribuidora Var San",
      officialBadge: "DISTRIBUIDORA VAR SAN",
      supportPrompt: "Precisa de ajuda?",
    },
  },
  it: {
    verification: {
      subject: "Il tuo codice di verifica — Distribuidora Var San",
      kicker: "VERIFICA ACCOUNT",
      heading: "Verifica la tua email",
      greeting: "Ciao,",
      intro: "Utilizza il seguente codice per verificare il tuo indirizzo email.",
      codeLabel: "CODICE DI VERIFICA",
      expiryNotice: "Questo codice è valido per {min} minuti.",
      securityWarning: "NON condividere questo codice con nessuno.",
    },
    passwordReset: {
      subject: "Recupero password — Distribuidora Var San",
      kicker: "SICUREZZA",
      heading: "Reimpostazione password",
      greeting: "Ciao,",
      intro: "Abbiamo ricevuto una richiesta di reimpostazione password per il tuo account.",
      codeLabel: "CODICE DI VERIFICA",
      buttonLabel: "REIMPOSTA PASSWORD",
      expiryNotice: "Questo codice è valido per {min} minuti.",
      ignoreWarning: "Se non hai richiesto questa modifica, puoi ignorare questo messaggio.",
    },
    passwordChanged: {
      subject: "Password aggiornata — Distribuidora Var San",
      kicker: "SICUREZZA",
      heading: "Password aggiornata",
      greeting: "Ciao,",
      message: "La tua password è stata aggiornata con successo.",
      timeLabel: "DATA E ORA",
      alertWarning: "Se non hai effettuato questa modifica, proteggi subito il tuo account.",
      contactAction: "Segnala attività sospetta",
    },
    newDevice: {
      subject: "Nuovo accesso rilevato — Distribuidora Var San",
      kicker: "ACCESSO",
      heading: "Nuovo accesso",
      greeting: "Ciao,",
      intro: "Abbiamo rilevato un nuovo accesso al tuo account.",
      detailsHeader: "DETTAGLI ATTIVITÀ",
      deviceLabel: "DISPOSITIVO",
      osLabel: "SISTEMA OPERATIVO",
      browserLabel: "BROWSER",
      ipLabel: "INDIRIZZO IP",
      locationLabel: "POSIZIONE",
      timeLabel: "DATA E ORA",
      revokePrompt: "Non riconosci questa attività? Proteggi subito il tuo account.",
      revokeButton: "VERIFICA SICUREZZA",
      allGoodNotice: "Se eri tu, non è richiesta alcuna azione.",
    },
    twoFactor: {
      enabledSubject: "Autenticazione a due fattori attivata — Distribuidora Var San",
      disabledSubject: "Autenticazione a due fattori disattivata — Distribuidora Var San",
      kicker: "SICUREZZA",
      enabledHeading: "Autenticazione 2FA attivata",
      disabledHeading: "Autenticazione 2FA disattivata",
      greeting: "Ciao,",
      enabledMessage: "L'autenticazione a due fattori è stata attivata con successo.",
      disabledMessage: "L'autenticazione a due fattori è stata disattivata.",
      warning: "Se non hai effettuato questa azione, proteggi subito il tuo account.",
    },
    securityAlert: {
      subject: "Avviso di sicurezza importante — Distribuidora Var San",
      kicker: "AVVISO DI SICUREZZA",
      heading: "Avviso di sicurezza",
      greeting: "Ciao,",
      detailsLabel: "DETTAGLI EVENTO",
      timeLabel: "DATA",
      actionPrompt: "Se non riconosci questa attività, controlla subito il tuo account.",
      actionButton: "VERIFICA SICUREZZA",
    },
    emailChange: {
      subject: "Notifica cambio email — Distribuidora Var San",
      kicker: "ACCOUNT",
      heading: "Email aggiornata",
      greeting: "Ciao,",
      intro: "Il tuo indirizzo email è stato aggiornato con successo.",
      oldEmailLabel: "VECCHIA EMAIL",
      newEmailLabel: "NUOVA EMAIL",
      timeLabel: "DATA",
      warning: "Se non hai effettuato questa modifica, proteggi il tuo account.",
    },
    accountStatus: {
      deactivatedSubject: "Account disattivato — Distribuidora Var San",
      deactivatedHeading: "Account disattivato",
      deactivatedMessage: "Il tuo account Distribuidora Var San è stato disattivato.",
      deletedSubject: "Account eliminato — Distribuidora Var San",
      deletedHeading: "Account eliminato",
      deletedMessage: "L'eliminazione del tuo account è stata completata.",
      timeLabel: "DATA",
      supportNote: "Se hai bisogno di assistenza, il nostro team è a disposizione.",
    },
    common: {
      tagline: "Soluzioni per la pulizia e la protezione della tua azienda.",
      footerCopyright: "© 2026 Distribuidora Var San",
      companyName: "Distribuidora Var San",
      officialBadge: "DISTRIBUIDORA VAR SAN",
      supportPrompt: "Hai bisogno di aiuto?",
    },
  },
  "zh-CN": {
    verification: {
      subject: "您的验证码 — Distribuidora Var San",
      kicker: "账户验证",
      heading: "验证您的电子邮件",
      greeting: "您好，",
      intro: "请使用以下验证码完成您的电子邮箱验证。",
      codeLabel: "验证码",
      expiryNotice: "此验证码有效期为 {min} 分钟。",
      securityWarning: "请勿将此验证码透露给任何人。",
    },
    passwordReset: {
      subject: "密码重置请求 — Distribuidora Var San",
      kicker: "安全通知",
      heading: "重置密码",
      greeting: "您好，",
      intro: "我们收到了重置您账户密码的请求。",
      codeLabel: "验证码",
      buttonLabel: "重置密码",
      expiryNotice: "此验证码有效期为 {min} 分钟。",
      ignoreWarning: "如果您未请求此操作，可直接忽略此邮件。",
    },
    passwordChanged: {
      subject: "密码已更新 — Distribuidora Var San",
      kicker: "安全通知",
      heading: "密码已更新",
      greeting: "您好，",
      message: "您的账户密码已成功更新。",
      timeLabel: "日期与时间",
      alertWarning: "若非您本人操作，请立即保护您的账户。",
      contactAction: "报告可疑活动",
    },
    newDevice: {
      subject: "检测到新登录 — Distribuidora Var San",
      kicker: "访问通知",
      heading: "新登录通知",
      greeting: "您好，",
      intro: "我们检测到您的账户有新的登录活动。",
      detailsHeader: "活动详情",
      deviceLabel: "设备",
      osLabel: "操作系统",
      browserLabel: "浏览器",
      ipLabel: "IP 地址",
      locationLabel: "位置",
      timeLabel: "时间",
      revokePrompt: "无法识别此活动？请立即保护您的账户。",
      revokeButton: "检查安全设置",
      allGoodNotice: "如为您本人操作，无需进行任何处理。",
    },
    twoFactor: {
      enabledSubject: "双重验证已启用 — Distribuidora Var San",
      disabledSubject: "双重验证已停用 — Distribuidora Var San",
      kicker: "安全通知",
      enabledHeading: "双重验证已开启",
      disabledHeading: "双重验证已停用",
      greeting: "您好，",
      enabledMessage: "您的账户已成功启用双重认证保护。",
      disabledMessage: "您的双重认证已停用。",
      warning: "若非您本人操作，请立即检查账户安全设置。",
    },
    securityAlert: {
      subject: "重要安全提示 — Distribuidora Var San",
      kicker: "安全警报",
      heading: "安全警报",
      greeting: "您好，",
      detailsLabel: "事件详情",
      timeLabel: "时间",
      actionPrompt: "无法识别此活动？请立即检查您的账户。",
      actionButton: "检查安全设置",
    },
    emailChange: {
      subject: "邮箱更改通知 — Distribuidora Var San",
      kicker: "账户通知",
      heading: "邮箱已更新",
      greeting: "您好，",
      intro: "您的电子邮箱地址已成功更新。",
      oldEmailLabel: "原邮箱",
      newEmailLabel: "新邮箱",
      timeLabel: "时间",
      warning: "若非您本人操作，请立即保护账户安全。",
    },
    accountStatus: {
      deactivatedSubject: "账户已停用 — Distribuidora Var San",
      deactivatedHeading: "账户已停用",
      deactivatedMessage: "您的 Distribuidora Var San 账户已停用。",
      deletedSubject: "账户已删除 — Distribuidora Var San",
      deletedHeading: "账户已删除",
      deletedMessage: "您的账户删除已完成。",
      timeLabel: "时间",
      supportNote: "如需帮助，欢迎随时联系我们的客服团队。",
    },
    common: {
      tagline: "企业专业清洁与防护解决方案。",
      footerCopyright: "© 2026 Distribuidora Var San",
      companyName: "Distribuidora Var San",
      officialBadge: "DISTRIBUIDORA VAR SAN",
      supportPrompt: "需要帮助？",
    },
  },
  "zh-TW": {
    verification: {
      subject: "您的驗證碼 — Distribuidora Var San",
      kicker: "帳戶驗證",
      heading: "驗證您的電子郵件",
      greeting: "您好，",
      intro: "請使用以下驗證碼完成電子郵件驗證。",
      codeLabel: "驗證碼",
      expiryNotice: "此驗證碼有效期限為 {min} 分鐘。",
      securityWarning: "請勿將此驗證碼透露給任何人。",
    },
    passwordReset: {
      subject: "密碼重設請求 — Distribuidora Var San",
      kicker: "安全通知",
      heading: "重設密碼",
      greeting: "您好，",
      intro: "我們收到了重設您帳戶密碼的請求。",
      codeLabel: "驗證碼",
      buttonLabel: "重設密碼",
      expiryNotice: "此驗證碼有效期限為 {min} 分鐘。",
      ignoreWarning: "若您未提出此請求，請忽略此郵件。",
    },
    passwordChanged: {
      subject: "密碼已更新 — Distribuidora Var San",
      kicker: "安全通知",
      heading: "密碼已更新",
      greeting: "您好，",
      message: "您的帳戶密碼已成功更新。",
      timeLabel: "日期與時間",
      alertWarning: "若非您本人操作，請立即保護您的帳戶。",
      contactAction: "回報可疑活動",
    },
    newDevice: {
      subject: "偵測到新登入 — Distribuidora Var San",
      kicker: "存取通知",
      heading: "新登入通知",
      greeting: "您好，",
      intro: "我們偵測到您的帳戶有新的登入活動。",
      detailsHeader: "活動詳情",
      deviceLabel: "裝置",
      osLabel: "作業系統",
      browserLabel: "瀏覽器",
      ipLabel: "IP 位址",
      locationLabel: "位置",
      timeLabel: "時間",
      revokePrompt: "無法識別此活動？請立即保護您的帳戶。",
      revokeButton: "檢查安全設定",
      allGoodNotice: "如為本人操作，無需進行任何動作。",
    },
    twoFactor: {
      enabledSubject: "雙重驗證已啟用 — Distribuidora Var San",
      disabledSubject: "雙重驗證已停用 — Distribuidora Var San",
      kicker: "安全通知",
      enabledHeading: "雙重驗證已開啟",
      disabledHeading: "雙重驗證已停用",
      greeting: "您好，",
      enabledMessage: "您的帳戶已成功啟用雙重驗證。",
      disabledMessage: "您的雙重驗證已停用。",
      warning: "若非本人操作，請立即檢查帳戶安全設定。",
    },
    securityAlert: {
      subject: "重要安全提示 — Distribuidora Var San",
      kicker: "安全警報",
      heading: "安全警報",
      greeting: "您好，",
      detailsLabel: "事件詳情",
      timeLabel: "時間",
      actionPrompt: "無法識別此活動？請立即檢查您的帳戶。",
      actionButton: "檢查安全設定",
    },
    emailChange: {
      subject: "電子郵件變更通知 — Distribuidora Var San",
      kicker: "帳戶通知",
      heading: "電子郵件已更新",
      greeting: "您好，",
      intro: "您的電子郵件地址已成功更新。",
      oldEmailLabel: "原電子郵件",
      newEmailLabel: "新電子郵件",
      timeLabel: "時間",
      warning: "若非本人操作，請立即保護帳戶安全。",
    },
    accountStatus: {
      deactivatedSubject: "帳戶已停用 — Distribuidora Var San",
      deactivatedHeading: "帳戶已停用",
      deactivatedMessage: "您的 Distribuidora Var San 帳戶已停用。",
      deletedSubject: "帳戶已刪除 — Distribuidora Var San",
      deletedHeading: "帳戶已刪除",
      deletedMessage: "您的帳戶刪除已完成。",
      timeLabel: "時間",
      supportNote: "如需協助，歡迎隨時聯繫客服團隊。",
    },
    common: {
      tagline: "企業專業清潔與防護解決方案。",
      footerCopyright: "© 2026 Distribuidora Var San",
      companyName: "Distribuidora Var San",
      officialBadge: "DISTRIBUIDORA VAR SAN",
      supportPrompt: "需要協助？",
    },
  },
  ko: {
    verification: {
      subject: "인증 코드 안내 — Distribuidora Var San",
      kicker: "계정 인증",
      heading: "이메일 주소 인증",
      greeting: "안녕하세요,",
      intro: "이메일 인증을 완료하려면 아래 코드를 입력해 주세요.",
      codeLabel: "인증 코드",
      expiryNotice: "이 코드는 {min}분 동안 유효합니다.",
      securityWarning: "이 코드를 타인과 공유하지 마세요.",
    },
    passwordReset: {
      subject: "비밀번호 재설정 요청 — Distribuidora Var San",
      kicker: "보안 안내",
      heading: "비밀번호 재설정",
      greeting: "안녕하세요,",
      intro: "계정 비밀번호 재설정 요청이 접수되었습니다.",
      codeLabel: "인증 코드",
      buttonLabel: "비밀번호 재설정",
      expiryNotice: "이 코드는 {min}분 동안 유효합니다.",
      ignoreWarning: "요청하지 않으셨다면 이 메일을 무시하셔도 됩니다.",
    },
    passwordChanged: {
      subject: "비밀번호 변경 완료 — Distribuidora Var San",
      kicker: "보안 안내",
      heading: "비밀번호 변경 완료",
      greeting: "안녕하세요,",
      message: "계정 비밀번호가 성공적으로 업데이트되었습니다.",
      timeLabel: "일시",
      alertWarning: "직접 변경하지 않으셨다면 즉시 계정을 보호해 주세요.",
      contactAction: "의심스러운 활동 신고",
    },
    newDevice: {
      subject: "새로운 로그인 감지 — Distribuidora Var San",
      kicker: "접속 알림",
      heading: "새로운 로그인 감지",
      greeting: "안녕하세요,",
      intro: "계정에 새로운 로그인이 감지되었습니다.",
      detailsHeader: "활동 세부 정보",
      deviceLabel: "기기",
      osLabel: "운영체제",
      browserLabel: "브라우저",
      ipLabel: "IP 주소",
      locationLabel: "위치",
      timeLabel: "일시",
      revokePrompt: "직접 로그인하지 않으셨나요? 즉시 계정을 보호하세요.",
      revokeButton: "보안 검토",
      allGoodNotice: "본인이 로그인한 경우 추가 조치가 필요하지 않습니다.",
    },
    twoFactor: {
      enabledSubject: "2단계 인증 활성화 — Distribuidora Var San",
      disabledSubject: "2단계 인증 비활성화 — Distribuidora Var San",
      kicker: "보안 안내",
      enabledHeading: "2단계 인증 활성화됨",
      disabledHeading: "2단계 인증 비활성화됨",
      greeting: "안녕하세요,",
      enabledMessage: "계정에 2단계 인증이 성공적으로 활성화되었습니다.",
      disabledMessage: "2단계 인증이 비활성화되었습니다.",
      warning: "직접 진행하지 않으셨다면 즉시 계정 보안 설정을 확인하세요.",
    },
    securityAlert: {
      subject: "중요 보안 알림 — Distribuidora Var San",
      kicker: "보안 경고",
      heading: "보안 알림",
      greeting: "안녕하세요,",
      detailsLabel: "이벤트 세부 정보",
      timeLabel: "일시",
      actionPrompt: "의심스러운 활동이 있다면 즉시 계정을 확인해 주세요.",
      actionButton: "보안 검토",
    },
    emailChange: {
      subject: "이메일 변경 알림 — Distribuidora Var San",
      kicker: "계정 알림",
      heading: "이메일 변경 완료",
      greeting: "안녕하세요,",
      intro: "이메일 주소가 성공적으로 변경되었습니다.",
      oldEmailLabel: "이전 이메일",
      newEmailLabel: "새 이메일",
      timeLabel: "일시",
      warning: "직접 변경하지 않으셨다면 즉시 계정을 보호하세요.",
    },
    accountStatus: {
      deactivatedSubject: "계정 비활성화 완료 — Distribuidora Var San",
      deactivatedHeading: "계정 비활성화 완료",
      deactivatedMessage: "Distribuidora Var San 계정이 비활성화되었습니다.",
      deletedSubject: "계정 삭제 완료 — Distribuidora Var San",
      deletedHeading: "계정 삭제 완료",
      deletedMessage: "계정 삭제 처리가 완료되었습니다.",
      timeLabel: "일시",
      supportNote: "도움이 필요하시면 언제든 지원팀에 문의해 주세요.",
    },
    common: {
      tagline: "기업을 위한 전문 청소 및 위생 솔루션.",
      footerCopyright: "© 2026 Distribuidora Var San",
      companyName: "Distribuidora Var San",
      officialBadge: "DISTRIBUIDORA VAR SAN",
      supportPrompt: "도움이 필요하신가요?",
    },
  },
};

/**
 * Renderizador base editorial y sofisticado para Distribuidora Var San.
 * Diseño limpio: contenedor blanco de 600px sobre lienzo #F4F6F8, header claro con logo y badge,
 * tipografía cuidada, soporte compacto y footer refinado.
 */
function renderEditorialEmail({
  language,
  badgeText,
  heading,
  bodyHtml,
  textBody,
  subject,
}: {
  language: EmailLanguage;
  badgeText: string;
  heading: string;
  bodyHtml: string;
  textBody: string;
  subject: string;
}): EmailContent {
  const tr = AUTH_TRANSLATIONS[language] || AUTH_TRANSLATIONS.es;
  const htmlLang = language === "en-GB" ? "en" : language;

  const html = `<!doctype html>
<html lang="${htmlLang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
<title>${subject}</title>
<!--[if mso]>
<style type="text/css">
body, table, td, p, a, h1, h2, h3, span { font-family: Arial, sans-serif !important; }
</style>
<![endif]-->
<style type="text/css">
body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
table { border-collapse: collapse !important; }
body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #F4F6F8; }
@media screen and (max-width: 600px) {
  .email-container { width: 100% !important; max-width: 100% !important; margin: 0 auto !important; border-radius: 0 !important; border: none !important; }
  .header-cell { padding: 24px 20px 18px !important; }
  .body-cell { padding: 24px 20px 24px !important; }
  .footer-cell { padding: 20px 20px !important; }
  .h1-title { font-size: 22px !important; line-height: 1.3 !important; }
  .hero-code { font-size: 32px !important; letter-spacing: 6px !important; }
  .button-cta { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; }
  .grid-col { display: block !important; width: 100% !important; box-sizing: border-box !important; }
  .data-col { display: block !important; width: 100% !important; box-sizing: border-box !important; margin-bottom: 12px !important; }
}
</style>
</head>
<body style="margin:0;padding:0;background-color:#F4F6F8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#172033;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0;padding:0;background-color:#F4F6F8;">
<tr>
<td align="center" style="padding:36px 12px;">

<!-- CONTENEDOR PRINCIPAL TIPO TARJETA EDITORIAL -->
<table role="presentation" class="email-container" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background-color:#FFFFFF;margin:0 auto;box-shadow:0 4px 24px rgba(7,29,58,0.05);border-radius:14px;overflow:hidden;border:1px solid #E5E9F0;">

<!-- TOP BAR CON LOGOTIPO Y BADGE DE CATEGORÍA -->
<tr>
<td class="header-cell" style="background-color:#FFFFFF;padding:32px 36px 20px;border-bottom:1px solid #EEF2F6;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
<tr>
<td align="left" style="vertical-align:middle;">
  <img src="https://distribuidoravarsan.com.mx/dvs-logo-transparent.png" alt="Distribuidora Var San" width="140" style="display:block;border:0;outline:none;text-decoration:none;max-width:140px;height:auto;" />
</td>
<td align="right" style="vertical-align:middle;">
  <span style="background-color:#071D3A;color:#C9A84C;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:6px 14px;border-radius:20px;display:inline-block;white-space:nowrap;">
    ${badgeText}
  </span>
</td>
</tr>
</table>
</td>
</tr>

<!-- CUERPO PRINCIPAL DEL CORREO -->
<tr>
<td class="body-cell" style="background-color:#FFFFFF;padding:36px 36px 28px;color:#172033;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;">
${bodyHtml}

<!-- SECCIÓN DE SOPORTE COMPACTA -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:32px;padding-top:20px;border-top:1px solid #EEF2F6;">
<tr>
<td style="color:#667085;font-size:13px;line-height:1.5;">
  ${tr.common.supportPrompt} <a href="mailto:distribuidora.varsan@outlook.com" style="color:#071D3A;font-weight:700;text-decoration:underline;">distribuidora.varsan@outlook.com</a>
</td>
</tr>
</table>

</td>
</tr>

<!-- FOOTER COMPACTO Y ELEGANTE -->
<tr>
<td class="footer-cell" style="background-color:#F8FAFC;padding:24px 36px;border-top:1px solid #EEF2F6;text-align:center;">
<p style="margin:0 0 4px;color:#071D3A;font-size:13px;font-weight:700;letter-spacing:0.3px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  ${tr.common.companyName}
</p>
<p style="margin:0 0 6px;color:#667085;font-size:12px;line-height:1.4;">
  ${tr.common.tagline}
</p>
<p style="margin:0;color:#8C9BAE;font-size:11px;">
  ${tr.common.footerCopyright}
</p>
</td>
</tr>

</table>

</td>
</tr>
</table>
</body>
</html>`;

  const text = `${heading.replace(/<br\s*\/?>/gi, " ")}
[${badgeText}]

${textBody}

${tr.common.supportPrompt} distribuidora.varsan@outlook.com

${tr.common.companyName}
${tr.common.tagline}
${tr.common.footerCopyright}`;

  return { subject, html, text };
}

/**
 * 1. Correo de Bienvenida al Portal (Onboarding / Familia Var San)
 */
export function buildClientWelcomeEmail(
  language: EmailLanguage = "es",
  params: ClientWelcomeEmailParams = {},
): EmailContent {
  const greetingName = params.recipientName ? escapeHtml(params.recipientName) : "";
  const safeCompany = params.company ? escapeHtml(params.company) : "Distribuidora Var San";
  const safeCountry = params.country ? escapeHtml(params.country) : "México";
  const safeEmail = params.email ? escapeHtml(params.email) : "vargassmanolo@gmail.com";
  const portalUrl = params.portalUrl || "https://distribuidoravarsan.com.mx";

  const subject = "¡Bienvenido a la familia Var San! — Distribuidora Var San";

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
<title>${subject}</title>
<!--[if mso]>
<style type="text/css">
body, table, td, p, a, h1, h2, h3, span { font-family: Arial, sans-serif !important; }
</style>
<![endif]-->
<style type="text/css">
body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
table { border-collapse: collapse !important; }
body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #011855; }
@media screen and (max-width: 600px) {
  .email-container { width: 100% !important; max-width: 100% !important; margin: 0 auto !important; border-radius: 0 !important; border: none !important; }
  .header-cell { padding: 26px 20px 20px !important; }
  .body-cell { padding: 28px 20px 24px !important; }
  .footer-cell { padding: 22px 20px !important; }
  .h1-title { font-size: 24px !important; line-height: 1.25 !important; }
  .quote-box { padding: 18px 16px !important; }
  .button-cta { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; }
}
</style>
</head>
<body style="margin:0;padding:0;background-color:#011855;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#E2E8F0;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0;padding:0;background-color:#011855;">
<tr>
<td align="center" style="padding:36px 12px;">

<!-- CONTENEDOR PRINCIPAL AZUL CORPORATIVO #011855 -->
<table role="presentation" class="email-container" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background-color:#011855;margin:0 auto;box-shadow:0 12px 36px rgba(0,0,0,0.35);border-radius:14px;overflow:hidden;border:1px solid #102B78;">

<!-- TOP BAR CON LOGOTIPO Y BADGE DORADO -->
<tr>
<td class="header-cell" style="background-color:#011447;padding:32px 36px 24px;border-bottom:1px solid #102B78;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
<tr>
<td align="left" style="vertical-align:middle;">
  <img src="https://distribuidoravarsan.com.mx/dvs-logo-transparent.png" alt="Distribuidora Var San" width="145" style="display:block;border:0;outline:none;text-decoration:none;max-width:145px;height:auto;" />
</td>
<td align="right" style="vertical-align:middle;">
  <span style="background-color:#011855;color:#C9A84C;border:1px solid #C9A84C;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:6px 14px;border-radius:20px;display:inline-block;white-space:nowrap;">
    DISTRIBUIDORA VAR SAN
  </span>
</td>
</tr>
</table>
</td>
</tr>

<!-- LÍNEA DECORATIVA DORADA -->
<tr>
<td height="2" style="background-color:#C9A84C;font-size:0;line-height:0;">&nbsp;</td>
</tr>

<!-- CUERPO PRINCIPAL DEL MENSAJE -->
<tr>
<td class="body-cell" style="background-color:#011855;padding:36px 36px 30px;color:#E2E8F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.75;">

<!-- KICKER & TÍTULO PROTAGONISTA -->
<p style="margin:0 0 8px;color:#C9A84C;font-size:11px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;">
  DISTRIBUIDORA VAR SAN
</p>
<h1 class="h1-title" style="margin:0 0 14px;color:#FFFFFF;font-size:28px;font-weight:800;letter-spacing:-0.5px;line-height:1.22;">
  ¡Bienvenido a la familia Var San!
</h1>

<p style="margin:0 0 24px;color:#E3CC8A;font-size:16px;font-weight:700;line-height:1.5;">
  Nos alegra mucho darte la bienvenida.
</p>

<!-- PÁRRAFO 1 -->
<p style="margin:0 0 20px;color:#CBD5E1;font-size:15px;line-height:1.75;">
  Hoy no solamente comenzamos a compartir información contigo; comenzamos también a construir una relación que esperamos que crezca con el tiempo.
</p>

<!-- PÁRRAFO 2 -->
<p style="margin:0 0 20px;color:#CBD5E1;font-size:15px;line-height:1.75;">
  En <strong style="color:#FFFFFF;">Distribuidora Var San</strong> creemos que detrás de cada producto, cada pedido y cada servicio existe algo mucho más importante: las personas. Por eso, para nosotros, tenerte aquí significa mucho más que contar con un nuevo contacto. Significa abrirte las puertas de nuestra familia.
</p>

<!-- PÁRRAFO 3 -->
<p style="margin:0 0 20px;color:#CBD5E1;font-size:15px;line-height:1.75;">
  Queremos que encuentres en Var San una empresa cercana, responsable y comprometida contigo. Un lugar donde puedas conocer nuevas opciones, descubrir productos, encontrar oportunidades y, sobre todo, sentir que siempre hay alguien dispuesto a escucharte y ayudarte.
</p>

<!-- PÁRRAFO 4 -->
<p style="margin:0 0 28px;color:#CBD5E1;font-size:15px;line-height:1.75;">
  A través de nuestros mensajes podrás conocer nuestras novedades, nuevos productos, promociones y todo aquello que vayamos construyendo para seguir creciendo junto a quienes confían en nosotros.
</p>

<!-- CITA EDITORIAL DESTACADA EN DORADO Y NAVY OSCURO -->
<table role="presentation" class="quote-box" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#01123F;border:1px solid #102B78;border-left:4px solid #C9A84C;border-radius:10px;margin:28px 0;">
<tr>
<td style="padding:22px 24px;">
  <p style="margin:0;color:#E3CC8A;font-size:16px;font-style:italic;font-weight:700;line-height:1.65;">
    “Porque una empresa puede ofrecer productos, pero una familia construye vínculos.”
  </p>
</td>
</tr>
</table>

<!-- PÁRRAFO 5 -->
<p style="margin:0 0 20px;color:#CBD5E1;font-size:15px;line-height:1.75;">
  Pero esta relación no queremos que se quede solamente en un correo.
</p>

<!-- PÁRRAFO 6 -->
<p style="margin:0 0 20px;color:#CBD5E1;font-size:15px;line-height:1.75;">
  Queremos que Var San trascienda más allá de una compra. Que cada experiencia, cada atención y cada contacto deje algo positivo y nos permita construir una relación basada en la confianza.
</p>

<!-- FRASE DE ÉNFASIS -->
<p style="margin:0 0 20px;color:#C9A84C;font-size:15px;font-weight:700;line-height:1.75;">
  Y nosotros queremos construirlos contigo.
</p>

<!-- PÁRRAFO 7 -->
<p style="margin:0 0 28px;color:#CBD5E1;font-size:15px;line-height:1.75;">
  Gracias por confiar en <strong style="color:#FFFFFF;">Distribuidora Var San</strong> y por permitirnos darte la bienvenida a este espacio que, desde hoy, también es tuyo.
</p>

<!-- CIERRE EDITORIAL PROTAGONISTA -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#011447;border:1px solid #102B78;border-radius:10px;margin:24px 0 28px;">
<tr>
<td style="padding:20px 22px;text-align:center;">
  <p style="margin:0 0 6px;color:#C9A84C;font-size:17px;font-weight:800;letter-spacing:0.3px;">
    Bienvenido a la familia Var San.
  </p>
  <p style="margin:0;color:#FFFFFF;font-size:14px;font-weight:600;">
    Nos alegra tenerte aquí.
  </p>
</td>
</tr>
</table>

<!-- CTA BUTTON EN DORADO DE ALTO IMPACTO -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0 16px;">
<tr>
<td align="center" style="border-radius:8px;background-color:#C9A84C;">
  <a href="${escapeHtml(portalUrl)}" class="button-cta" style="display:inline-block;padding:15px 36px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;font-weight:800;color:#011855;text-decoration:none;border-radius:8px;letter-spacing:0.5px;">
    ENTRAR AL PORTAL →
  </a>
</td>
</tr>
</table>

<!-- SECCIÓN DE SOPORTE COMPACTA -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:32px;padding-top:20px;border-top:1px solid #102B78;">
<tr>
<td style="color:#8C9BAE;font-size:13px;line-height:1.5;">
  ¿Necesitas ayuda? <a href="mailto:distribuidora.varsan@outlook.com" style="color:#C9A84C;font-weight:700;text-decoration:underline;">distribuidora.varsan@outlook.com</a>
</td>
</tr>
</table>

</td>
</tr>

<!-- FOOTER CORPORATIVO OSCURO -->
<tr>
<td class="footer-cell" style="background-color:#01123F;padding:26px 36px;border-top:1px solid #102B78;text-align:center;">
<p style="margin:0 0 4px;color:#FFFFFF;font-size:13px;font-weight:700;letter-spacing:0.3px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  Distribuidora Var San
</p>
<p style="margin:0 0 6px;color:#8C9BAE;font-size:12px;line-height:1.4;">
  Soluciones en limpieza y protección para tu empresa.
</p>
<p style="margin:0 0 6px;color:#8C9BAE;font-size:12px;">
  distribuidora.varsan@outlook.com
</p>
<p style="margin:0;color:#64748B;font-size:11px;">
  © 2026 Distribuidora Var San
</p>
</td>
</tr>

</table>

</td>
</tr>
</table>
</body>
</html>`;

  const text = `DISTRIBUIDORA VAR SAN

¡Bienvenido a la familia Var San!

Nos alegra mucho darte la bienvenida.

Hoy no solamente comenzamos a compartir información contigo; comenzamos también a construir una relación que esperamos que crezca con el tiempo.

En Distribuidora Var San creemos que detrás de cada producto, cada pedido y cada servicio existe algo mucho más importante: las personas. Por eso, para nosotros, tenerte aquí significa mucho más que contar con un nuevo contacto. Significa abrirte las puertas de nuestra familia.

Queremos que encuentres en Var San una empresa cercana, responsable y comprometida contigo. Un lugar donde puedas conocer nuevas opciones, descubrir productos, encontrar oportunidades y, sobre todo, sentir que siempre hay alguien dispuesto a escucharte y ayudarte.

A través de nuestros mensajes podrás conocer nuestras novedades, nuevos productos, promociones y todo aquello que vayamos construyendo para seguir creciendo junto a quienes confían en nosotros.

Porque una empresa puede ofrecer productos, pero una familia construye vínculos.

Pero esta relación no queremos que se quede solamente en un correo.

Queremos que Var San trascienda más allá de una compra. Que cada experiencia, cada atención y cada contacto deje algo positivo y nos permita construir una relación basada en la confianza.

Y nosotros queremos construirlos contigo.

Gracias por confiar en Distribuidora Var San y por permitirnos darte la bienvenida a este espacio que, desde hoy, también es tuyo.

Bienvenido a la familia Var San.

Nos alegra tenerte aquí.

ENTRAR AL PORTAL: ${portalUrl}

¿Necesitas ayuda? distribuidora.varsan@outlook.com

Distribuidora Var San
Soluciones en limpieza y protección para tu empresa.
distribuidora.varsan@outlook.com
© 2026 Distribuidora Var San`;

  return { subject, html, text };
}

/**
 * 2. Código de Verificación OTP
 */
export function buildVerificationCodeEmail(
  language: EmailLanguage = "es",
  params: VerificationCodeEmailParams,
): EmailContent {
  const tr = AUTH_TRANSLATIONS[language]?.verification || AUTH_TRANSLATIONS.es.verification;
  const expiry = (params.expiresInMinutes || 15).toString();
  const greeting = params.recipientName ? `${tr.greeting} ${escapeHtml(params.recipientName)}:` : tr.greeting;
  const safeCode = escapeHtml(params.code);

  const bodyHtml = `
<p style="margin:0 0 6px;color:#C9A84C;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
  ${tr.kicker}
</p>
<h1 class="h1-title" style="margin:0 0 16px;color:#071D3A;font-size:24px;font-weight:800;letter-spacing:-0.4px;">
  ${tr.heading}
</h1>
<p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.65;">
  ${tr.intro}
</p>

<!-- BLOQUE HERO DEL CÓDIGO -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0;">
<tr>
<td align="center" style="background-color:#F8FAFC;border:2px dashed #071D3A;border-radius:12px;padding:32px 20px;">
  <p style="margin:0 0 10px;color:#667085;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
    ${tr.codeLabel}
  </p>
  <div class="hero-code" style="font-family:Consolas,'Courier New',monospace;font-size:42px;font-weight:800;letter-spacing:10px;color:#071D3A;user-select:all;-webkit-user-select:all;">
    ${safeCode}
  </div>
  <p style="margin:12px 0 0;color:#667085;font-size:12px;font-weight:600;">
    ${tr.expiryNotice.replace("{min}", expiry)}
  </p>
</td>
</tr>
</table>

<!-- AVISO DE SEGURIDAD -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;margin:20px 0;">
<tr>
<td style="padding:14px 18px;">
  <p style="margin:0;color:#92400E;font-size:13px;line-height:1.5;font-weight:600;">
    🛡️ ${tr.securityWarning}
  </p>
</td>
</tr>
</table>`;

  const textBody = `${greeting}

${tr.intro}

CÓDIGO DE VERIFICACIÓN:
${params.code}

${tr.expiryNotice.replace("{min}", expiry)}
${tr.securityWarning}`;

  return renderEditorialEmail({
    language,
    badgeText: tr.kicker,
    heading: tr.heading,
    bodyHtml,
    textBody,
    subject: tr.subject,
  });
}

/**
 * 3. Recuperación de Contraseña
 */
export function buildPasswordResetEmail(
  language: EmailLanguage = "es",
  params: PasswordResetEmailParams,
): EmailContent {
  const tr = AUTH_TRANSLATIONS[language]?.passwordReset || AUTH_TRANSLATIONS.es.passwordReset;
  const expiry = (params.expiresInMinutes || 15).toString();
  const greeting = params.recipientName ? `${tr.greeting} ${escapeHtml(params.recipientName)}:` : tr.greeting;
  const safeCode = params.resetCode ? escapeHtml(params.resetCode) : "";
  const resetUrl = params.resetUrl || "https://distribuidoravarsan.com.mx/portal/security";

  const bodyHtml = `
<p style="margin:0 0 6px;color:#C9A84C;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
  ${tr.kicker}
</p>
<h1 class="h1-title" style="margin:0 0 16px;color:#071D3A;font-size:24px;font-weight:800;letter-spacing:-0.4px;">
  ${tr.heading}
</h1>
<p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.65;">
  ${tr.intro}
</p>

${safeCode ? `
<!-- BLOQUE DEL CÓDIGO -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;">
<tr>
<td align="center" style="background-color:#F8FAFC;border:2px dashed #071D3A;border-radius:12px;padding:28px 20px;">
  <p style="margin:0 0 8px;color:#667085;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
    ${tr.codeLabel}
  </p>
  <div class="hero-code" style="font-family:Consolas,'Courier New',monospace;font-size:38px;font-weight:800;letter-spacing:8px;color:#071D3A;user-select:all;-webkit-user-select:all;">
    ${safeCode}
  </div>
  <p style="margin:10px 0 0;color:#667085;font-size:12px;">
    ${tr.expiryNotice.replace("{min}", expiry)}
  </p>
</td>
</tr>
</table>
` : ""}

<!-- BOTÓN CTA -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:26px 0 18px;">
<tr>
<td align="center" style="border-radius:8px;background-color:#071D3A;">
  <a href="${escapeHtml(resetUrl)}" class="button-cta" style="display:inline-block;padding:15px 36px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:8px;letter-spacing:0.5px;">
    ${tr.buttonLabel} →
  </a>
</td>
</tr>
</table>

<p style="margin:20px 0 0;color:#8C9BAE;font-size:13px;line-height:1.6;">
  ${tr.ignoreWarning}
</p>`;

  const textBody = `${greeting}

${tr.intro}

${params.resetCode ? `CÓDIGO DE VERIFICACIÓN:\n${params.resetCode}\n` : ""}
${tr.expiryNotice.replace("{min}", expiry)}

Restablece tu contraseña en: ${resetUrl}

${tr.ignoreWarning}`;

  return renderEditorialEmail({
    language,
    badgeText: tr.kicker,
    heading: tr.heading,
    bodyHtml,
    textBody,
    subject: tr.subject,
  });
}

/**
 * 4. Contraseña Actualizada
 */
export function buildPasswordChangedEmail(
  language: EmailLanguage = "es",
  params: PasswordChangedEmailParams,
): EmailContent {
  const tr = AUTH_TRANSLATIONS[language]?.passwordChanged || AUTH_TRANSLATIONS.es.passwordChanged;
  const greeting = params.recipientName ? `${tr.greeting} ${escapeHtml(params.recipientName)}:` : tr.greeting;
  const rawTime = params.changedAt || new Date().toLocaleString(language === "en-GB" ? "en-GB" : "es-MX");
  const safeTime = escapeHtml(rawTime);

  const bodyHtml = `
<p style="margin:0 0 6px;color:#C9A84C;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
  ${tr.kicker}
</p>
<h1 class="h1-title" style="margin:0 0 16px;color:#071D3A;font-size:24px;font-weight:800;letter-spacing:-0.4px;">
  ${tr.heading}
</h1>
<p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.65;">
  ${tr.message}
</p>

<!-- FICHA DE ACTIVIDAD -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;margin:20px 0;">
<tr>
<td style="padding:18px 20px;">
  <p style="margin:0 0 4px;color:#667085;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${tr.timeLabel}</p>
  <p style="margin:0;color:#071D3A;font-size:14px;font-weight:700;">${safeTime}</p>
</td>
</tr>
</table>

<!-- AVISO DE SEGURIDAD -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#FFF7ED;border:1px solid #FFEDD5;border-radius:8px;margin:20px 0;">
<tr>
<td style="padding:16px 18px;">
  <p style="margin:0 0 6px;color:#9A3412;font-size:13px;font-weight:700;">
    ⚠️ ${tr.alertWarning}
  </p>
  <p style="margin:0;color:#9A3412;font-size:13px;">
    Si no realizaste este cambio, protege tu cuenta inmediatamente desde el Portal de Clientes.
  </p>
</td>
</tr>
</table>`;

  const textBody = `${greeting}

${tr.message}

${tr.timeLabel}: ${rawTime}

${tr.alertWarning}`;

  return renderEditorialEmail({
    language,
    badgeText: tr.kicker,
    heading: tr.heading,
    bodyHtml,
    textBody,
    subject: tr.subject,
  });
}

/**
 * 5. Nuevo Inicio de Sesión Detectado
 */
export function buildNewDeviceLoginEmail(
  language: EmailLanguage = "es",
  params: NewDeviceLoginEmailParams,
): EmailContent {
  const tr = AUTH_TRANSLATIONS[language]?.newDevice || AUTH_TRANSLATIONS.es.newDevice;
  const greeting = params.recipientName ? `${tr.greeting} ${escapeHtml(params.recipientName)}:` : tr.greeting;
  const rawTime = params.loginTime || new Date().toLocaleString(language === "en-GB" ? "en-GB" : "es-MX");
  const revokeUrl = params.revokeUrl || "https://distribuidoravarsan.com.mx/portal/sessions";

  const safeDevice = escapeHtml(params.deviceType || "Computadora de escritorio");
  const safeBrowser = escapeHtml(params.browser || "Navegador web");
  const safeIp = escapeHtml(params.ip || "No disponible");
  const safeLocation = [params.region, params.country].filter(Boolean).map(escapeHtml).join(", ") || "No disponible";

  const bodyHtml = `
<p style="margin:0 0 6px;color:#C9A84C;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
  ${tr.kicker}
</p>
<h1 class="h1-title" style="margin:0 0 16px;color:#071D3A;font-size:24px;font-weight:800;letter-spacing:-0.4px;">
  ${tr.heading}
</h1>
<p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.65;">
  ${tr.intro}
</p>

<!-- TARJETA DE DETALLES DE ACCESO -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;margin:20px 0;">
<tr>
<td style="padding:22px 24px;">
  <p style="margin:0 0 14px;color:#071D3A;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;border-bottom:1px solid #E2E8F0;padding-bottom:8px;">
    ${tr.detailsHeader}
  </p>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td style="padding:5px 0;width:35%;color:#667085;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${tr.deviceLabel}</td>
      <td style="padding:5px 0;color:#071D3A;font-size:14px;font-weight:700;">${safeDevice}</td>
    </tr>
    <tr>
      <td style="padding:5px 0;color:#667085;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${tr.browserLabel}</td>
      <td style="padding:5px 0;color:#071D3A;font-size:14px;font-weight:600;">${safeBrowser}</td>
    </tr>
    <tr>
      <td style="padding:5px 0;color:#667085;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${tr.locationLabel}</td>
      <td style="padding:5px 0;color:#071D3A;font-size:14px;font-weight:600;">${safeLocation}</td>
    </tr>
    <tr>
      <td style="padding:5px 0;color:#667085;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${tr.ipLabel}</td>
      <td style="padding:5px 0;color:#071D3A;font-size:13px;font-family:monospace;font-weight:600;">${safeIp}</td>
    </tr>
    <tr>
      <td style="padding:5px 0;color:#667085;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${tr.timeLabel}</td>
      <td style="padding:5px 0;color:#071D3A;font-size:14px;font-weight:600;">${escapeHtml(rawTime)}</td>
    </tr>
  </table>
</td>
</tr>
</table>

<!-- CTA BUTTON -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:26px 0 16px;">
<tr>
<td align="center" style="border-radius:8px;background-color:#071D3A;">
  <a href="${escapeHtml(revokeUrl)}" class="button-cta" style="display:inline-block;padding:15px 36px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:8px;letter-spacing:0.5px;">
    ${tr.revokeButton} →
  </a>
</td>
</tr>
</table>

<p style="margin:16px 0 0;color:#8C9BAE;font-size:13px;">
  ${tr.allGoodNotice}
</p>`;

  const textBody = `${greeting}

${tr.intro}

DETALLES DE LA ACTIVIDAD:
- ${tr.deviceLabel}: ${params.deviceType || "Computadora"}
- ${tr.browserLabel}: ${params.browser || "Navegador"}
- ${tr.locationLabel}: ${safeLocation}
- ${tr.ipLabel}: ${params.ip || "No disponible"}
- ${tr.timeLabel}: ${rawTime}

${tr.revokePrompt}
Revisar seguridad: ${revokeUrl}`;

  return renderEditorialEmail({
    language,
    badgeText: tr.kicker,
    heading: tr.heading,
    bodyHtml,
    textBody,
    subject: tr.subject,
  });
}

/**
 * 6. Códigos de Respaldo 2FA (Diseño Especial)
 */
export function buildBackupCodesEmail(
  language: EmailLanguage = "es",
  params: BackupCodesEmailParams,
): EmailContent {
  const greeting = params.recipientName ? `Hola, ${escapeHtml(params.recipientName)}:` : "Hola:";
  const codes = params.backupCodes || [];

  // Agrupar en pares para 2 columnas
  const codePairs: string[][] = [];
  for (let i = 0; i < codes.length; i += 2) {
    codePairs.push(codes.slice(i, i + 2));
  }

  const codesGridHtml = codePairs
    .map(
      (pair) => `
      <tr>
        <td class="grid-col" style="padding:6px;width:50%;">
          <div style="background-color:#FFFFFF;border:1px solid #CBD5E1;border-radius:8px;padding:14px 12px;text-align:center;font-family:Consolas,'Courier New',monospace;font-size:16px;font-weight:800;letter-spacing:2px;color:#071D3A;user-select:all;-webkit-user-select:all;">
            ${escapeHtml(pair[0] || "")}
          </div>
        </td>
        ${pair[1] ? `
        <td class="grid-col" style="padding:6px;width:50%;">
          <div style="background-color:#FFFFFF;border:1px solid #CBD5E1;border-radius:8px;padding:14px 12px;text-align:center;font-family:Consolas,'Courier New',monospace;font-size:16px;font-weight:800;letter-spacing:2px;color:#071D3A;user-select:all;-webkit-user-select:all;">
            ${escapeHtml(pair[1])}
          </div>
        </td>
        ` : `<td class="grid-col" style="padding:6px;width:50%;">&nbsp;</td>`}
      </tr>`
    )
    .join("");

  const bodyHtml = `
<p style="margin:0 0 6px;color:#C9A84C;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
  SEGURIDAD 2FA
</p>
<h1 class="h1-title" style="margin:0 0 16px;color:#071D3A;font-size:24px;font-weight:800;letter-spacing:-0.4px;">
  Tus códigos de respaldo
</h1>
<p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.65;">
  Guarda estos códigos en un lugar seguro. Podrás utilizarlos para acceder a tu cuenta si no tienes disponible tu método de autenticación.
</p>

<!-- CUADRÍCULA ELEGANTE DE CÓDIGOS -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:16px;margin:24px 0;">
<tr>
<td>
  <p style="margin:0 0 12px;color:#071D3A;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;font-weight:800;text-align:center;">
    CÓDIGOS DE UN SOLO USO
  </p>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    ${codesGridHtml}
  </table>
</td>
</tr>
</table>

<!-- ADVERTENCIA DE UN SOLO USO -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;margin:20px 0;">
<tr>
<td style="padding:14px 18px;">
  <p style="margin:0 0 4px;color:#92400E;font-size:13px;font-weight:700;">
    🛡️ Recomendaciones de seguridad:
  </p>
  <p style="margin:0;color:#92400E;font-size:12px;line-height:1.5;">
    Cada código puede utilizarse una sola vez. No compartas estos códigos con nadie; nuestro personal jamás te los solicitará.
  </p>
</td>
</tr>
</table>`;

  const codesText = codes.map((c, i) => `  ${i + 1}. ${c}`).join("\n");
  const textBody = `${greeting}

La autenticación en dos fases (2FA) está activa en tu cuenta.

Tus códigos de respaldo de un solo uso son:
${codesText}

ADVERTENCIAS:
- Cada código puede utilizarse una sola vez.
- Guarda estos códigos en un lugar seguro.
- Distribuidora Var San nunca te solicitará tus códigos de respaldo.`;

  return renderEditorialEmail({
    language,
    badgeText: "AUTENTICACIÓN EN DOS PASOS",
    heading: "Tus códigos de respaldo",
    bodyHtml,
    textBody,
    subject: "Mis códigos de respaldo — Distribuidora Var San",
  });
}

/**
 * 7. Notificación de Estado de Autenticación en Dos Pasos (2FA)
 */
export function buildTwoFactorStatusEmail(
  language: EmailLanguage = "es",
  params: TwoFactorStatusEmailParams,
): EmailContent {
  const tr = AUTH_TRANSLATIONS[language]?.twoFactor || AUTH_TRANSLATIONS.es.twoFactor;
  const greeting = params.recipientName ? `${tr.greeting} ${escapeHtml(params.recipientName)}:` : tr.greeting;
  const isEnabled = params.enabled;
  const rawTime = params.timestamp || new Date().toLocaleString(language === "en-GB" ? "en-GB" : "es-MX");
  const safeTime = escapeHtml(rawTime);

  const heading = isEnabled ? tr.enabledHeading : tr.disabledHeading;
  const message = isEnabled ? tr.enabledMessage : tr.disabledMessage;
  const subject = isEnabled ? tr.enabledSubject : tr.disabledSubject;

  const bodyHtml = `
<p style="margin:0 0 6px;color:#C9A84C;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
  ${tr.kicker}
</p>
<h1 class="h1-title" style="margin:0 0 16px;color:#071D3A;font-size:24px;font-weight:800;letter-spacing:-0.4px;">
  ${heading}
</h1>
<p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.65;">
  ${message}
</p>

<!-- FICHA DE ESTADO -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;margin:20px 0;">
<tr>
<td style="padding:18px 20px;">
  <p style="margin:0 0 4px;color:#667085;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">MÉTODO DE SEGURIDAD</p>
  <p style="margin:0 0 8px;color:#071D3A;font-size:14px;font-weight:700;">
    ${isEnabled ? "SMS / Códigos de respaldo (Activo)" : "Desactivado"}
  </p>
  <p style="margin:0 0 4px;color:#667085;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">FECHA DE ACTUALIZACIÓN</p>
  <p style="margin:0;color:#071D3A;font-size:14px;font-weight:600;">${safeTime}</p>
</td>
</tr>
</table>

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#FFF7ED;border:1px solid #FFEDD5;border-radius:8px;margin:20px 0;">
<tr>
<td style="padding:14px 18px;">
  <p style="margin:0;color:#9A3412;font-size:13px;line-height:1.55;">
    ${tr.warning}
  </p>
</td>
</tr>
</table>

<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:26px 0 16px;">
<tr>
<td align="center" style="border-radius:8px;background-color:#071D3A;">
  <a href="https://distribuidoravarsan.com.mx/portal/security" class="button-cta" style="display:inline-block;padding:15px 36px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:8px;letter-spacing:0.5px;">
    REVISAR SEGURIDAD →
  </a>
</td>
</tr>
</table>`;

  const textBody = `${greeting}

${message}

Estado: ${isEnabled ? "Activado" : "Desactivado"}
Fecha: ${rawTime}

${tr.warning}`;

  return renderEditorialEmail({
    language,
    badgeText: tr.kicker,
    heading,
    bodyHtml,
    textBody,
    subject,
  });
}

/**
 * 8. Código de Verificación para Descarga de Datos
 */
export function buildDataExportCodeEmail(
  language: EmailLanguage = "es",
  params: DataExportCodeEmailParams,
): EmailContent {
  const greeting = params.recipientName ? `Hola, ${escapeHtml(params.recipientName)}:` : "Hola:";
  const safeCode = escapeHtml(params.code);
  const minutes = params.expiresInMinutes || 15;

  const bodyHtml = `
<p style="margin:0 0 6px;color:#C9A84C;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
  DATOS DE TU CUENTA
</p>
<h1 class="h1-title" style="margin:0 0 16px;color:#071D3A;font-size:24px;font-weight:800;letter-spacing:-0.4px;">
  Verificación de identidad
</h1>
<p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.65;">
  Para proteger tu información, necesitamos confirmar que eres tú antes de preparar la descarga de tus datos.
</p>

<!-- BLOQUE DEL CÓDIGO -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0;">
<tr>
<td align="center" style="background-color:#F8FAFC;border:2px dashed #071D3A;border-radius:12px;padding:30px 20px;">
  <p style="margin:0 0 8px;color:#667085;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
    CÓDIGO DE VERIFICACIÓN
  </p>
  <div class="hero-code" style="font-family:Consolas,'Courier New',monospace;font-size:40px;font-weight:800;letter-spacing:10px;color:#071D3A;user-select:all;-webkit-user-select:all;">
    ${safeCode}
  </div>
  <p style="margin:10px 0 0;color:#667085;font-size:12px;">
    Este código es válido durante <strong>${minutes} minutos</strong>.
  </p>
</td>
</tr>
</table>

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#FFF7ED;border:1px solid #FFEDD5;border-radius:8px;margin:20px 0;">
<tr>
<td style="padding:14px 18px;">
  <p style="margin:0;color:#9A3412;font-size:13px;line-height:1.55;">
    🛡️ NO compartas este código con nadie. Si no solicitaste este archivo, protege tu cuenta de inmediato.
  </p>
</td>
</tr>
</table>`;

  const textBody = `${greeting}

Para proteger tu información, necesitamos confirmar tu identidad para la descarga de datos.

Código de verificación:
${params.code}

Válido durante ${minutes} minutos. No compartas este código.`;

  return renderEditorialEmail({
    language,
    badgeText: "DATOS DE TU CUENTA",
    heading: "Verificación de identidad",
    bodyHtml,
    textBody,
    subject: "Código de verificación para descarga de datos — Distribuidora Var San",
  });
}

/**
 * 9. Descarga de Información Lista
 */
export function buildDataExportReadyEmail(
  language: EmailLanguage = "es",
  params: DataExportReadyEmailParams,
): EmailContent {
  const greeting = params.recipientName ? `Hola, ${escapeHtml(params.recipientName)}:` : "Hola:";
  const safeDownloadUrl = params.downloadUrl ? escapeHtml(params.downloadUrl) : "https://distribuidoravarsan.com.mx";
  const hours = params.expiresInHours || 24;

  const bodyHtml = `
<p style="margin:0 0 6px;color:#C9A84C;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
  DATOS DE TU CUENTA
</p>
<h1 class="h1-title" style="margin:0 0 16px;color:#071D3A;font-size:24px;font-weight:800;letter-spacing:-0.4px;">
  Tu información está lista
</h1>
<p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.65;">
  El archivo con la información de tu cuenta está preparado para su descarga.
</p>

<!-- PAQUETE DE INFORMACIÓN CARD -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;margin:20px 0;">
<tr>
<td style="padding:22px 24px;">
  <p style="margin:0 0 12px;color:#071D3A;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid #E2E8F0;padding-bottom:8px;">
    PAQUETE DE INFORMACIÓN INCLUIDO
  </p>
  <ul style="margin:0;padding-left:18px;color:#475569;font-size:13px;line-height:1.8;">
    <li><strong>Información personal</strong> (Nombre, perfil, datos de contacto)</li>
    <li><strong>Información de cuenta</strong> (Estado, roles, preferencias)</li>
    <li><strong>Registro de seguridad</strong> (Sesiones activas y registro de eventos)</li>
  </ul>
</td>
</tr>
</table>

<!-- CTA BUTTON -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0 16px;">
<tr>
<td align="center" style="border-radius:8px;background-color:#071D3A;">
  <a href="${safeDownloadUrl}" class="button-cta" style="display:inline-block;padding:15px 36px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:8px;letter-spacing:0.5px;">
    DESCARGAR INFORMACIÓN →
  </a>
</td>
</tr>
</table>

<p style="margin:16px 0 0;color:#8C9BAE;font-size:13px;">
  Por seguridad, no compartas este enlace. Estará disponible durante las próximas <strong>${hours} horas</strong>.
</p>`;

  const textBody = `${greeting}

El archivo con la información de tu cuenta está preparado.

Enlace de descarga (válido por ${hours} horas):
${params.downloadUrl || "https://distribuidoravarsan.com.mx"}

Por seguridad, no compartas este enlace con nadie.`;

  return renderEditorialEmail({
    language,
    badgeText: "DATOS DE TU CUENTA",
    heading: "Tu información está lista",
    bodyHtml,
    textBody,
    subject: "Tu descarga de información está lista — Distribuidora Var San",
  });
}

/**
 * 10. Notificación de Cambio de Correo
 */
export function buildEmailChangedEmail(
  language: EmailLanguage = "es",
  params: EmailChangeNotificationParams,
): EmailContent {
  const tr = AUTH_TRANSLATIONS[language]?.emailChange || AUTH_TRANSLATIONS.es.emailChange;
  const greeting = params.recipientName ? `${tr.greeting} ${escapeHtml(params.recipientName)}:` : tr.greeting;
  const safeOldEmail = escapeHtml(params.oldEmail);
  const safeNewEmail = escapeHtml(params.newEmail);

  const bodyHtml = `
<p style="margin:0 0 6px;color:#C9A84C;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
  ${tr.kicker}
</p>
<h1 class="h1-title" style="margin:0 0 16px;color:#071D3A;font-size:24px;font-weight:800;letter-spacing:-0.4px;">
  ${tr.heading}
</h1>
<p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.65;">
  ${tr.intro}
</p>

<!-- BLOQUE VISUAL DE TRANSICIÓN -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;margin:24px 0;text-align:center;">
<tr>
<td style="padding:24px 20px;">
  <p style="margin:0 0 4px;color:#667085;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">${tr.oldEmailLabel}</p>
  <p style="margin:0 0 12px;color:#64748B;font-size:15px;text-decoration:line-through;">${safeOldEmail}</p>

  <p style="margin:0 0 12px;color:#C9A84C;font-size:20px;font-weight:800;">↓</p>

  <p style="margin:0 0 4px;color:#071D3A;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;">${tr.newEmailLabel}</p>
  <p style="margin:0;color:#071D3A;font-size:16px;font-weight:700;">${safeNewEmail}</p>
</td>
</tr>
</table>

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#FFF7ED;border:1px solid #FFEDD5;border-radius:8px;margin:20px 0;">
<tr>
<td style="padding:14px 18px;">
  <p style="margin:0;color:#9A3412;font-size:13px;line-height:1.55;">
    ⚠️ ${tr.warning}
  </p>
</td>
</tr>
</table>`;

  const textBody = `${greeting}

${tr.intro}

- ${tr.oldEmailLabel}: ${params.oldEmail}
- ${tr.newEmailLabel}: ${params.newEmail}

${tr.warning}`;

  return renderEditorialEmail({
    language,
    badgeText: tr.kicker,
    heading: tr.heading,
    bodyHtml,
    textBody,
    subject: tr.subject,
  });
}

/**
 * 11. Cuenta Desactivada
 */
export function buildAccountDeactivatedEmail(
  language: EmailLanguage = "es",
  params: AccountDeactivationEmailParams,
): EmailContent {
  const tr = AUTH_TRANSLATIONS[language]?.accountStatus || AUTH_TRANSLATIONS.es.accountStatus;
  const greeting = params.recipientName ? `Hola, ${escapeHtml(params.recipientName)}:` : "Hola:";
  const rawDate = params.deactivationDate || new Date().toLocaleString(language === "en-GB" ? "en-GB" : "es-MX");

  const bodyHtml = `
<p style="margin:0 0 6px;color:#C9A84C;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
  ESTADO DE CUENTA
</p>
<h1 class="h1-title" style="margin:0 0 16px;color:#071D3A;font-size:24px;font-weight:800;letter-spacing:-0.4px;">
  ${tr.deactivatedHeading}
</h1>
<p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.65;">
  ${tr.deactivatedMessage}
</p>

<!-- FICHA SOBRIA -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;margin:20px 0;">
<tr>
<td style="padding:18px 20px;">
  <p style="margin:0 0 4px;color:#667085;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${tr.timeLabel}</p>
  <p style="margin:0;color:#071D3A;font-size:14px;font-weight:700;">${escapeHtml(rawDate)}</p>
</td>
</tr>
</table>

<p style="margin:20px 0 0;color:#64748B;font-size:13px;line-height:1.6;">
  ${tr.supportNote}
</p>`;

  const textBody = `${greeting}

${tr.deactivatedMessage}

${tr.timeLabel}: ${rawDate}

${tr.supportNote}`;

  return renderEditorialEmail({
    language,
    badgeText: "ESTADO DE CUENTA",
    heading: tr.deactivatedHeading,
    bodyHtml,
    textBody,
    subject: tr.deactivatedSubject,
  });
}

/**
 * 12. Cuenta Eliminada
 */
export function buildAccountDeletedEmail(
  language: EmailLanguage = "es",
  params: AccountDeletionEmailParams,
): EmailContent {
  const tr = AUTH_TRANSLATIONS[language]?.accountStatus || AUTH_TRANSLATIONS.es.accountStatus;
  const greeting = params.recipientName ? `Hola, ${escapeHtml(params.recipientName)}:` : "Hola:";
  const rawDate = params.deletionDate || new Date().toLocaleString(language === "en-GB" ? "en-GB" : "es-MX");

  const bodyHtml = `
<p style="margin:0 0 6px;color:#C9A84C;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
  ESTADO DE CUENTA
</p>
<h1 class="h1-title" style="margin:0 0 16px;color:#071D3A;font-size:24px;font-weight:800;letter-spacing:-0.4px;">
  ${tr.deletedHeading}
</h1>
<p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.65;">
  ${tr.deletedMessage}
</p>

<!-- FICHA SOBRIA -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;margin:20px 0;">
<tr>
<td style="padding:18px 20px;">
  <p style="margin:0 0 4px;color:#667085;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${tr.timeLabel}</p>
  <p style="margin:0;color:#071D3A;font-size:14px;font-weight:700;">${escapeHtml(rawDate)}</p>
</td>
</tr>
</table>

<p style="margin:20px 0 0;color:#64748B;font-size:13px;line-height:1.6;">
  Agradecemos el tiempo que formaste parte de Distribuidora Var San. Si deseas volver en el futuro, las puertas de nuestro portal estarán siempre abiertas.
</p>`;

  const textBody = `${greeting}

${tr.deletedMessage}

${tr.timeLabel}: ${rawDate}`;

  return renderEditorialEmail({
    language,
    badgeText: "ESTADO DE CUENTA",
    heading: tr.deletedHeading,
    bodyHtml,
    textBody,
    subject: tr.deletedSubject,
  });
}

/**
 * 13. Alerta de Seguridad
 */
export function buildSecurityAlertEmail(
  language: EmailLanguage = "es",
  params: SecurityAlertEmailParams,
): EmailContent {
  const tr = AUTH_TRANSLATIONS[language]?.securityAlert || AUTH_TRANSLATIONS.es.securityAlert;
  const greeting = params.recipientName ? `${tr.greeting} ${escapeHtml(params.recipientName)}:` : tr.greeting;
  const rawTime = params.timestamp || new Date().toLocaleString(language === "en-GB" ? "en-GB" : "es-MX");
  const actionUrl = params.actionUrl || "https://distribuidoravarsan.com.mx/portal/security";

  const safeTitle = escapeHtml(params.alertTitle);
  const safeDetails = escapeHtml(params.alertDetails);

  const bodyHtml = `
<p style="margin:0 0 6px;color:#C9A84C;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
  ${tr.kicker}
</p>
<h1 class="h1-title" style="margin:0 0 16px;color:#071D3A;font-size:24px;font-weight:800;letter-spacing:-0.4px;">
  ${tr.heading}
</h1>
<p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.65;">
  Detectamos una actividad relevante en tu cuenta: <strong>${safeTitle}</strong>.
</p>

<!-- TARJETA DEL EVENTO -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;margin:20px 0;">
<tr>
<td style="padding:22px 24px;">
  <p style="margin:0 0 6px;color:#667085;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">${tr.detailsLabel}</p>
  <p style="margin:0 0 12px;color:#071D3A;font-size:14px;line-height:1.6;">${safeDetails}</p>

  <p style="margin:0 0 4px;color:#667085;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">${tr.timeLabel}</p>
  <p style="margin:0;color:#071D3A;font-size:14px;font-weight:600;">${escapeHtml(rawTime)}</p>
</td>
</tr>
</table>

<!-- CTA BUTTON -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:26px 0 16px;">
<tr>
<td align="center" style="border-radius:8px;background-color:#071D3A;">
  <a href="${escapeHtml(actionUrl)}" class="button-cta" style="display:inline-block;padding:15px 36px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:8px;letter-spacing:0.5px;">
    ${tr.actionButton} →
  </a>
</td>
</tr>
</table>

<p style="margin:16px 0 0;color:#8C9BAE;font-size:13px;">
  ${tr.actionPrompt}
</p>`;

  const textBody = `${greeting}

${tr.heading}: ${params.alertTitle}

${params.alertDetails}
${tr.timeLabel}: ${rawTime}

${tr.actionPrompt}
Revisar seguridad: ${actionUrl}`;

  return renderEditorialEmail({
    language,
    badgeText: tr.kicker,
    heading: tr.heading,
    bodyHtml,
    textBody,
    subject: tr.subject,
  });
}
