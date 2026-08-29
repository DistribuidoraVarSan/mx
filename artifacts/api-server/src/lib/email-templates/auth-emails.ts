import {
  type AccountDeletionEmailParams,
  type EmailChangeNotificationParams,
  type EmailContent,
  type EmailLanguage,
  type NewDeviceLoginEmailParams,
  type PasswordChangedEmailParams,
  type PasswordResetEmailParams,
  type SecurityAlertEmailParams,
  type TwoFactorStatusEmailParams,
  type VerificationCodeEmailParams,
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
  accountDeletion: {
    subject: string;
    kicker: string;
    heading: string;
    greeting: string;
    intro: string;
    p1: string;
    p2: string;
    p3: string;
    whatNextTitle: string;
    point1: string;
    point2: string;
    point3: string;
    point4: string;
    point5: string;
    dateLabel: string;
    supportNotice: string;
    footerNotice: string;
  };
  common: {
    companyName: string;
    tagline: string;
    automatedFooter: string;
    supportEmail: string;
  };
}

const AUTH_TRANSLATIONS: Record<EmailLanguage, AuthTranslations> = {
  es: {
    verification: {
      subject: "Tu código de verificación — Distribuidora Var San",
      kicker: "SEGURIDAD VAR SAN",
      heading: "Código de verificación",
      greeting: "Hola,",
      intro: "Utiliza el siguiente código para verificar tu correo electrónico en Distribuidora Var San:",
      codeLabel: "Tu código de verificación:",
      expiryNotice: "Este código expira en {min} minutos.",
      securityWarning: "Si tú no solicitaste este código, puedes ignorar este mensaje de forma segura.",
    },
    passwordReset: {
      subject: "Recuperación de contraseña — Distribuidora Var San",
      kicker: "SEGURIDAD VAR SAN",
      heading: "Restablece tu contraseña",
      greeting: "Hola,",
      intro: "Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Distribuidora Var San.",
      codeLabel: "Tu código de recuperación:",
      buttonLabel: "Restablecer contraseña",
      expiryNotice: "Este código es válido por {min} minutos.",
      ignoreWarning: "Si no solicitaste este cambio, tu cuenta sigue estando protegida y no necesitas realizar ninguna acción.",
    },
    passwordChanged: {
      subject: "Contraseña actualizada — Distribuidora Var San",
      kicker: "NOTIFICACIÓN DE SEGURIDAD",
      heading: "Tu contraseña ha sido actualizada",
      greeting: "Hola,",
      message: "Te confirmamos que la contraseña de tu cuenta en Distribuidora Var San ha sido cambiada correctamente.",
      timeLabel: "Fecha y hora:",
      alertWarning: "¿No realizaste este cambio? Si no reconoces esta acción, comunícate con nosotros inmediatamente para asegurar tu cuenta.",
      contactAction: "Contactar a soporte de seguridad",
    },
    newDevice: {
      subject: "Nuevo inicio de sesión detectado — Distribuidora Var San",
      kicker: "ALERTA DE SEGURIDAD",
      heading: "Nuevo dispositivo registrado",
      greeting: "Hola,",
      intro: "Hemos detectado un nuevo inicio de sesión en tu cuenta de Distribuidora Var San con los siguientes datos:",
      detailsHeader: "Detalles del dispositivo",
      deviceLabel: "Tipo de dispositivo:",
      osLabel: "Sistema operativo:",
      browserLabel: "Navegador:",
      ipLabel: "Dirección IP:",
      locationLabel: "Ubicación aproximada:",
      timeLabel: "Fecha y hora:",
      revokePrompt: "¿No fuiste tú? Puedes revocar esta sesión de inmediato desde tu Portal de Clientes:",
      revokeButton: "Gestionar sesiones activas",
      allGoodNotice: "Si fuiste tú, no es necesario realizar ninguna acción adicional.",
    },
    twoFactor: {
      enabledSubject: "Autenticación en dos pasos activada — Distribuidora Var San",
      disabledSubject: "Autenticación en dos pasos desactivada — Distribuidora Var San",
      kicker: "SEGURIDAD DE CUENTA",
      enabledHeading: "2FA Activado correctamente",
      disabledHeading: "2FA Desactivado",
      greeting: "Hola,",
      enabledMessage: "La autenticación en dos pasos (2FA) ha sido activada en tu cuenta, añadiendo un nivel extra de protección a tus accesos.",
      disabledMessage: "La autenticación en dos pasos (2FA) ha sido desactivada en tu cuenta.",
      warning: "Si no realizaste este cambio, revisa la seguridad de tu cuenta de inmediato.",
    },
    securityAlert: {
      subject: "Alerta de seguridad importante — Distribuidora Var San",
      kicker: "ALERTA CRÍTICA",
      heading: "Actividad importante en tu cuenta",
      greeting: "Hola,",
      detailsLabel: "Detalle de la actividad:",
      timeLabel: "Fecha del evento:",
      actionPrompt: "Si no reconoces esta actividad, por favor protege tu cuenta:",
      actionButton: "Revisar seguridad",
    },
    emailChange: {
      subject: "Notificación de cambio de correo — Distribuidora Var San",
      kicker: "GESTIÓN DE CUENTA",
      heading: "Cambio de correo electrónico",
      greeting: "Hola,",
      intro: "Se ha solicitado una actualización de la dirección de correo asociada a tu cuenta.",
      oldEmailLabel: "Correo anterior:",
      newEmailLabel: "Correo nuevo:",
      timeLabel: "Fecha de solicitud:",
      warning: "Si no solicitaste este cambio, comunícate de inmediato con nuestro equipo.",
    },
    accountDeletion: {
      subject: "Tu cuenta ha sido eliminada — Distribuidora Var San",
      kicker: "GESTIÓN DE CUENTA",
      heading: "Tu cuenta ha sido eliminada",
      greeting: "Hola,",
      intro: "Te confirmamos que la eliminación de tu cuenta de cliente en Distribuidora Var San se ha completado correctamente conforme a tu solicitud.",
      p1: "Como parte de este proceso, la cuenta asociada a tus datos ha sido eliminada y las sesiones de acceso relacionadas han sido revocadas.",
      p2: "También hemos cancelado la suscripción al newsletter asociada a esta cuenta, por lo que ya no recibirás nuevas comunicaciones de newsletter vinculadas a ella.",
      p3: "La eliminación de la cuenta es definitiva y no puede deshacerse desde el Portal de Cliente. Si en el futuro deseas utilizar nuevamente nuestros servicios, será necesario crear una nueva cuenta, de acuerdo con las condiciones vigentes en ese momento.",
      whatNextTitle: "¿Qué sucede ahora?",
      point1: "Tu cuenta de cliente ya no está disponible.",
      point2: "Las sesiones asociadas han sido cerradas.",
      point3: "La suscripción al newsletter ha sido cancelada.",
      point4: "Los datos sujetos al proceso de eliminación han sido tratados conforme a las políticas aplicables de Distribuidora Var San.",
      point5: "No necesitas realizar ninguna acción adicional.",
      dateLabel: "Fecha de procesamiento:",
      supportNotice: "Si consideras que esta eliminación se realizó por error o necesitas asistencia relacionada con tu cuenta, puedes comunicarte mediante nuestros canales oficiales de soporte.",
      footerNotice: "Este es un mensaje transaccional automático relacionado con la gestión de tu cuenta. No respondas a este correo.",
    },
    common: {
      companyName: "Distribuidora Var San",
      tagline: "CALIDAD Y CONFIANZA EN CADA SUMINISTRO.",
      automatedFooter: "Este es un correo transaccional automático para proteger tu cuenta en Distribuidora Var San.",
      supportEmail: "distribuidora.varsan@outlook.com",
    },
  },
  "en-GB": {
    verification: {
      subject: "Your verification code — Distribuidora Var San",
      kicker: "VAR SAN SECURITY",
      heading: "Verification Code",
      greeting: "Hello,",
      intro: "Please use the following verification code to verify your email address on Distribuidora Var San:",
      codeLabel: "Your verification code:",
      expiryNotice: "This code expires in {min} minutes.",
      securityWarning: "If you did not request this code, you can safely ignore this message.",
    },
    passwordReset: {
      subject: "Password Reset Request — Distribuidora Var San",
      kicker: "VAR SAN SECURITY",
      heading: "Reset your password",
      greeting: "Hello,",
      intro: "We received a request to reset the password for your Distribuidora Var San account.",
      codeLabel: "Your recovery code:",
      buttonLabel: "Reset Password",
      expiryNotice: "This code is valid for {min} minutes.",
      ignoreWarning: "If you did not make this request, your account remains secure and no action is required.",
    },
    passwordChanged: {
      subject: "Password Updated — Distribuidora Var San",
      kicker: "SECURITY NOTIFICATION",
      heading: "Your password has been updated",
      greeting: "Hello,",
      message: "We confirm that the password for your Distribuidora Var San account has been changed successfully.",
      timeLabel: "Date & Time:",
      alertWarning: "Didn't make this change? If you do not recognise this action, please contact us immediately to protect your account.",
      contactAction: "Contact Security Support",
    },
    newDevice: {
      subject: "New login detected — Distribuidora Var San",
      kicker: "SECURITY ALERT",
      heading: "New device registered",
      greeting: "Hello,",
      intro: "A new sign-in was detected on your Distribuidora Var San account with the following details:",
      detailsHeader: "Device Details",
      deviceLabel: "Device Type:",
      osLabel: "Operating System:",
      browserLabel: "Browser:",
      ipLabel: "IP Address:",
      locationLabel: "Approximate Location:",
      timeLabel: "Date & Time:",
      revokePrompt: "Wasn't you? You can revoke this session immediately from your Customer Portal:",
      revokeButton: "Manage Active Sessions",
      allGoodNotice: "If this was you, no further action is required.",
    },
    twoFactor: {
      enabledSubject: "Two-Factor Authentication Enabled — Distribuidora Var San",
      disabledSubject: "Two-Factor Authentication Disabled — Distribuidora Var San",
      kicker: "ACCOUNT SECURITY",
      enabledHeading: "2FA Enabled Successfully",
      disabledHeading: "2FA Disabled",
      greeting: "Hello,",
      enabledMessage: "Two-factor authentication (2FA) has been enabled on your account, adding an extra layer of security.",
      disabledMessage: "Two-factor authentication (2FA) has been disabled on your account.",
      warning: "If you did not perform this change, please inspect your account security immediately.",
    },
    securityAlert: {
      subject: "Important Security Alert — Distribuidora Var San",
      kicker: "CRITICAL ALERT",
      heading: "Important account activity",
      greeting: "Hello,",
      detailsLabel: "Activity details:",
      timeLabel: "Event timestamp:",
      actionPrompt: "If you do not recognise this activity, please protect your account:",
      actionButton: "Review Security",
    },
    emailChange: {
      subject: "Email Address Change Notification — Distribuidora Var San",
      kicker: "ACCOUNT MANAGEMENT",
      heading: "Email address change",
      greeting: "Hello,",
      intro: "An update to your account email address has been requested.",
      oldEmailLabel: "Previous email:",
      newEmailLabel: "New email:",
      timeLabel: "Requested at:",
      warning: "If you did not request this update, contact our support team immediately.",
    },
    accountDeletion: {
      subject: "Your account has been deleted — Distribuidora Var San",
      kicker: "ACCOUNT MANAGEMENT",
      heading: "Your account has been deleted",
      greeting: "Hello,",
      intro: "We confirm that the deletion of your customer account at Distribuidora Var San has been successfully completed in accordance with your request.",
      p1: "As part of this process, the account associated with your details has been deleted and all related active sessions have been revoked.",
      p2: "We have also cancelled the newsletter subscription associated with this account, so you will no longer receive newsletter communications linked to it.",
      p3: "Account deletion is permanent and cannot be undone from the Customer Portal. If you wish to use our services again in the future, you will need to create a new account in accordance with the terms applicable at that time.",
      whatNextTitle: "What happens now?",
      point1: "Your customer account is no longer accessible.",
      point2: "Associated sessions have been closed.",
      point3: "Your newsletter subscription has been cancelled.",
      point4: "Data subject to the deletion process has been handled in compliance with applicable Distribuidora Var San policies.",
      point5: "No further action is required on your part.",
      dateLabel: "Processing date:",
      supportNotice: "If you believe this deletion occurred in error or need assistance regarding your account, you may contact our official support channels.",
      footerNotice: "This is an automated transactional message regarding your account management. Please do not reply to this email.",
    },
    common: {
      companyName: "Distribuidora Var San",
      tagline: "QUALITY AND TRUST IN EVERY SUPPLY.",
      automatedFooter: "This is an automated transactional message sent to safeguard your Distribuidora Var San account.",
      supportEmail: "distribuidora.varsan@outlook.com",
    },
  },
  fr: {
    verification: {
      subject: "Votre code de vérification — Distribuidora Var San",
      kicker: "SÉCURITÉ VAR SAN",
      heading: "Code de vérification",
      greeting: "Bonjour,",
      intro: "Veuillez utiliser le code suivant pour vérifier votre adresse e-mail sur Distribuidora Var San :",
      codeLabel: "Votre code de vérification :",
      expiryNotice: "Ce code expire dans {min} minutes.",
      securityWarning: "Si vous n'avez pas demandé ce code, vous pouvez ignorer cet e-mail en toute sécurité.",
    },
    passwordReset: {
      subject: "Réinitialisation de mot de passe — Distribuidora Var San",
      kicker: "SÉCURITÉ VAR SAN",
      heading: "Réinitialisez votre mot de passe",
      greeting: "Bonjour,",
      intro: "Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Distribuidora Var San.",
      codeLabel: "Votre code de récupération :",
      buttonLabel: "Réinitialiser le mot de passe",
      expiryNotice: "Ce code est valide pendant {min} minutes.",
      ignoreWarning: "Si vous n'avez pas fait cette demande, votre compte reste sécurisé et aucune action n'est requise.",
    },
    passwordChanged: {
      subject: "Mot de passe mis à jour — Distribuidora Var San",
      kicker: "NOTIFICATION DE SÉCURITÉ",
      heading: "Votre mot de passe a été mis à jour",
      greeting: "Bonjour,",
      message: "Nous vous confirmons que le mot de passe de votre compte Distribuidora Var San a été modifié avec succès.",
      timeLabel: "Date et heure :",
      alertWarning: "Vous n'êtes pas à l'origine de cette modification ? Contactez immédiatement notre support pour sécuriser votre compte.",
      contactAction: "Contacter le support sécurité",
    },
    newDevice: {
      subject: "Nouvelle connexion détectée — Distribuidora Var San",
      kicker: "ALERTE DE SÉCURITÉ",
      heading: "Nouvel appareil enregistré",
      greeting: "Bonjour,",
      intro: "Une nouvelle connexion à votre compte Distribuidora Var San a été détectée avec les détails suivants :",
      detailsHeader: "Détails de l'appareil",
      deviceLabel: "Type d'appareil :",
      osLabel: "Système d'exploitation :",
      browserLabel: "Navigateur :",
      ipLabel: "Adresse IP :",
      locationLabel: "Localisation approximative :",
      timeLabel: "Date et heure :",
      revokePrompt: "Ce n'était pas vous ? Vous pouvez révoquer cette session immédiatement depuis votre Portail Client :",
      revokeButton: "Gérer les sessions actives",
      allGoodNotice: "S'il s'agissait bien de vous, aucune action supplémentaire n'est requise.",
    },
    twoFactor: {
      enabledSubject: "Authentification à deux facteurs activée — Distribuidora Var San",
      disabledSubject: "Authentification à deux facteurs désactivée — Distribuidora Var San",
      kicker: "SÉCURITÉ DU COMPTE",
      enabledHeading: "2FA Activé avec succès",
      disabledHeading: "2FA Désactivé",
      greeting: "Bonjour,",
      enabledMessage: "L'authentification à deux facteurs (2FA) a été activée sur votre compte pour une protection renforcée.",
      disabledMessage: "L'authentification à deux facteurs (2FA) a été désactivée sur votre compte.",
      warning: "Si vous n'êtes pas à l'origine de ce changement, vérifiez la sécurité de votre compte sans tarder.",
    },
    securityAlert: {
      subject: "Alerte de sécurité importante — Distribuidora Var San",
      kicker: "ALERTE CRITIQUE",
      heading: "Activité importante sur votre compte",
      greeting: "Bonjour,",
      detailsLabel: "Détails de l'activité :",
      timeLabel: "Date de l'événement :",
      actionPrompt: "Si vous ne reconnaissez pas cette activité, veuillez protéger votre compte :",
      actionButton: "Vérifier la sécurité",
    },
    emailChange: {
      subject: "Changement d'adresse e-mail — Distribuidora Var San",
      kicker: "GESTION DU COMPTE",
      heading: "Modification de votre adresse e-mail",
      greeting: "Bonjour,",
      intro: "Une mise à jour de l'adresse e-mail associée à votre compte a été demandée.",
      oldEmailLabel: "Ancienne adresse :",
      newEmailLabel: "Nouvelle adresse :",
      timeLabel: "Date de demande :",
      warning: "Si vous n'avez pas demandé ce changement, veuillez contacter notre équipe immédiatement.",
    },
    accountDeletion: {
      subject: "Votre compte a été supprimé — Distribuidora Var San",
      kicker: "GESTION DU COMPTE",
      heading: "Votre compte a été supprimé",
      greeting: "Bonjour,",
      intro: "Nous vous confirmons que la suppression de votre compte client chez Distribuidora Var San a été effectuée avec succès conformément à votre demande.",
      p1: "Dans le cadre de cette démarche, le compte associé à vos données a été supprimé et l'ensemble des sessions associées a été révoqué.",
      p2: "Nous avons également résilié l'abonnement à la newsletter associé à ce compte, vous ne recevrez donc plus de communications liées à celle-ci.",
      p3: "La suppression du compte est irréversible et ne peut être annulée depuis le Portail Client. Si vous souhaitez réutiliser nos services à l'avenir, il sera nécessaire de créer un nouveau compte selon les conditions en vigueur.",
      whatNextTitle: "Que se passe-t-il maintenant ?",
      point1: "Votre compte client n'est plus accessible.",
      point2: "Les sessions associées ont été clôturées.",
      point3: "Votre abonnement à la newsletter a été résilié.",
      point4: "Les données concernées par la suppression ont été traitées conformément aux politiques applicables de Distribuidora Var San.",
      point5: "Aucune action supplémentaire n'est requise de votre part.",
      dateLabel: "Date de traitement :",
      supportNotice: "Si vous estimez que cette suppression a été effectuée par erreur ou si vous avez besoin d'aide concernant votre compte, vous pouvez contacter notre assistance officielle.",
      footerNotice: "Ceci est un message transactionnel automatique relatif à la gestion de votre compte. Merci de ne pas répondre à cet e-mail.",
    },
    common: {
      companyName: "Distribuidora Var San",
      tagline: "QUALITÉ ET CONFIANCE DANS CHAQUE APPROVISIONNEMENT.",
      automatedFooter: "Ceci est un message transactionnel automatique pour protéger votre compte Distribuidora Var San.",
      supportEmail: "distribuidora.varsan@outlook.com",
    },
  },
  pt: {
    verification: {
      subject: "Seu código de verificação — Distribuidora Var San",
      kicker: "SEGURANÇA VAR SAN",
      heading: "Código de verificação",
      greeting: "Olá,",
      intro: "Use o código a seguir para verificar seu e-mail na Distribuidora Var San:",
      codeLabel: "Seu código de verificação:",
      expiryNotice: "Este código expira em {min} minutos.",
      securityWarning: "Se você não solicitou este código, pode ignorar este e-mail com segurança.",
    },
    passwordReset: {
      subject: "Recuperação de senha — Distribuidora Var San",
      kicker: "SEGURANÇA VAR SAN",
      heading: "Redefinir sua senha",
      greeting: "Olá,",
      intro: "Recebemos uma solicitação para redefinir a senha da sua conta na Distribuidora Var San.",
      codeLabel: "Seu código de recuperação:",
      buttonLabel: "Redefinir senha",
      expiryNotice: "Este código é válido por {min} minutos.",
      ignoreWarning: "Se você não solicitou esta alteração, sua conta permanece protegida.",
    },
    passwordChanged: {
      subject: "Senha atualizada — Distribuidora Var San",
      kicker: "NOTIFICAÇÃO DE SEGURANÇA",
      heading: "Sua senha foi atualizada",
      greeting: "Olá,",
      message: "Confirmamos que a senha da sua conta na Distribuidora Var San foi alterada com sucesso.",
      timeLabel: "Data e hora:",
      alertWarning: "Não realizou esta alteração? Se não reconhece esta ação, entre em contato imediatamente para proteger sua conta.",
      contactAction: "Contatar suporte de segurança",
    },
    newDevice: {
      subject: "Novo login detectado — Distribuidora Var San",
      kicker: "ALERTA DE SEGURANÇA",
      heading: "Novo dispositivo registrado",
      greeting: "Olá,",
      intro: "Detectamos um novo início de sessão na sua conta da Distribuidora Var San com os seguintes detalhes:",
      detailsHeader: "Detalhes do dispositivo",
      deviceLabel: "Tipo de dispositivo:",
      osLabel: "Sistema operacional:",
      browserLabel: "Navegador:",
      ipLabel: "Endereço IP:",
      locationLabel: "Localização aproximada:",
      timeLabel: "Data e hora:",
      revokePrompt: "Não foi você? Você pode revogar esta sessão imediatamente no seu Portal do Cliente:",
      revokeButton: "Gerenciar sessões ativas",
      allGoodNotice: "Se foi você, nenhuma ação adicional é necessária.",
    },
    twoFactor: {
      enabledSubject: "Autenticação em duas etapas ativada — Distribuidora Var San",
      disabledSubject: "Autenticação em duas etapas desativada — Distribuidora Var San",
      kicker: "SEGURANÇA DA CONTA",
      enabledHeading: "2FA Ativado com sucesso",
      disabledHeading: "2FA Desativado",
      greeting: "Olá,",
      enabledMessage: "A autenticação em duas etapas (2FA) foi ativada na sua conta, proporcionando proteção adicional.",
      disabledMessage: "A autenticação em duas etapas (2FA) foi desativada na sua conta.",
      warning: "Se você não realizou esta alteração, revise a segurança da sua conta imediatamente.",
    },
    securityAlert: {
      subject: "Alerta importante de segurança — Distribuidora Var San",
      kicker: "ALERTA CRÍTICO",
      heading: "Atividade importante na sua conta",
      greeting: "Olá,",
      detailsLabel: "Detalhes da atividade:",
      timeLabel: "Data do evento:",
      actionPrompt: "Se não reconhece esta atividade, por favor proteja sua conta:",
      actionButton: "Revisar segurança",
    },
    emailChange: {
      subject: "Notificação de alteração de e-mail — Distribuidora Var San",
      kicker: "GESTÃO DA CONTA",
      heading: "Alteração de e-mail solicitada",
      greeting: "Olá,",
      intro: "Uma atualização do endereço de e-mail associado à sua conta foi solicitada.",
      oldEmailLabel: "E-mail anterior:",
      newEmailLabel: "Novo e-mail:",
      timeLabel: "Data da solicitação:",
      warning: "Se você não solicitou esta alteração, entre em contato imediatamente com nossa equipe.",
    },
    accountDeletion: {
      subject: "Sua conta foi excluída — Distribuidora Var San",
      kicker: "GESTÃO DE CONTA",
      heading: "Sua conta foi excluída",
      greeting: "Olá,",
      intro: "Confirmamos que a exclusão da sua conta de cliente na Distribuidora Var San foi concluída com sucesso conforme a sua solicitação.",
      p1: "Como parte deste processo, a conta associada aos seus dados foi excluída e todas as sessões ativas foram revogadas.",
      p2: "Também cancelamos a assinatura da newsletter vinculada a esta conta, portanto você não receberá novas comunicações de newsletter associadas a ela.",
      p3: "A exclusão da conta é definitiva e não pode ser revertida pelo Portal do Cliente. Caso deseje utilizar nossos serviços no futuro, será necessário criar uma nova conta de acordo com as condições vigentes na ocasião.",
      whatNextTitle: "O que acontece agora?",
      point1: "Sua conta de cliente não está mais disponível.",
      point2: "As sessões associadas foram encerradas.",
      point3: "A assinatura da newsletter foi cancelada.",
      point4: "Os dados sujeitos ao processo de exclusão foram tratados conforme as políticas aplicáveis da Distribuidora Var San.",
      point5: "Nenhuma ação adicional é necessária de sua parte.",
      dateLabel: "Data de processamento:",
      supportNotice: "Caso considere que esta exclusão foi realizada por engano ou precise de assistência relacionada à sua conta, entre em contato pelos nossos canais oficiais de suporte.",
      footerNotice: "Esta é uma mensagem transacional automática referente à gestão da sua conta. Por favor, não responda a este e-mail.",
    },
    common: {
      companyName: "Distribuidora Var San",
      tagline: "QUALIDADE E CONFIANÇA EM CADA FORNECIMENTO.",
      automatedFooter: "Esta é uma mensagem transacional automática enviada para proteger sua conta na Distribuidora Var San.",
      supportEmail: "distribuidora.varsan@outlook.com",
    },
  },
  it: {
    verification: {
      subject: "Il tuo codice di verifica — Distribuidora Var San",
      kicker: "SICUREZZA VAR SAN",
      heading: "Codice di verifica",
      greeting: "Ciao,",
      intro: "Usa il seguente codice per verificare il tuo indirizzo email su Distribuidora Var San:",
      codeLabel: "Il tuo codice di verifica:",
      expiryNotice: "Questo codice scade tra {min} minuti.",
      securityWarning: "Se non hai richiesto questo codice, puoi ignorare questo messaggio in tutta sicurezza.",
    },
    passwordReset: {
      subject: "Reimpostazione password — Distribuidora Var San",
      kicker: "SICUREZZA VAR SAN",
      heading: "Reimposta la tua password",
      greeting: "Ciao,",
      intro: "Abbiamo ricevuto una richiesta di reimpostazione della password per il tuo account Distribuidora Var San.",
      codeLabel: "Il tuo codice di recupero:",
      buttonLabel: "Reimposta password",
      expiryNotice: "Questo codice è valido per {min} minuti.",
      ignoreWarning: "Se non hai effettuato questa richiesta, il tuo account rimane protetto.",
    },
    passwordChanged: {
      subject: "Password aggiornata — Distribuidora Var San",
      kicker: "NOTIFICA DI SICUREZZA",
      heading: "La tua password è stata aggiornata",
      greeting: "Ciao,",
      message: "Ti confermiamo che la password del tuo account Distribuidora Var San è stata modificata con successo.",
      timeLabel: "Data e ora:",
      alertWarning: "Non hai effettuato questa modifica? Contatta immediatamente la nostra assistenza per mettere in sicurezza il tuo account.",
      contactAction: "Contatta il supporto sicurezza",
    },
    newDevice: {
      subject: "Nuovo accesso rilevato — Distribuidora Var San",
      kicker: "AVVISO DI SICUREZZA",
      heading: "Nuovo dispositivo registrato",
      greeting: "Ciao,",
      intro: "È stato rilevato un nuovo accesso al tuo account Distribuidora Var San con i seguenti dettagli:",
      detailsHeader: "Dettagli del dispositivo",
      deviceLabel: "Tipo di dispositivo:",
      osLabel: "Sistema operativo:",
      browserLabel: "Browser:",
      ipLabel: "Indirizzo IP:",
      locationLabel: "Posizione approssimativa:",
      timeLabel: "Data e ora:",
      revokePrompt: "Non sei stato tu? Puoi revocare questa sessione immediatamente dal tuo Portale Clienti:",
      revokeButton: "Gestisci sessioni attive",
      allGoodNotice: "Se sei stato tu, non è richiesta alcuna azione aggiuntiva.",
    },
    twoFactor: {
      enabledSubject: "Autenticazione a due fattori attivata — Distribuidora Var San",
      disabledSubject: "Autenticazione a due fattori disattivata — Distribuidora Var San",
      kicker: "SICUREZZA DELL'ACCOUNT",
      enabledHeading: "2FA Attivato con successo",
      disabledHeading: "2FA Disattivato",
      greeting: "Ciao,",
      enabledMessage: "L'autenticazione a due fattori (2FA) è stata attivata sul tuo account per garantirti una protezione superiore.",
      disabledMessage: "L'autenticazione a due fattori (2FA) è stata disattivata sul tuo account.",
      warning: "Se non hai effettuato questa modifica, verifica subito la sicurezza del tuo account.",
    },
    securityAlert: {
      subject: "Avviso di sicurezza importante — Distribuidora Var San",
      kicker: "AVVISO CRITICO",
      heading: "Attività importante sull'account",
      greeting: "Ciao,",
      detailsLabel: "Dettagli attività:",
      timeLabel: "Data evento:",
      actionPrompt: "Se non riconosci questa attività, proteggi il tuo account:",
      actionButton: "Verifica sicurezza",
    },
    emailChange: {
      subject: "Notifica cambio email — Distribuidora Var San",
      kicker: "GESTIONE ACCOUNT",
      heading: "Modifica indirizzo email",
      greeting: "Ciao,",
      intro: "È stata richiesta la modifica dell'indirizzo email associato al tuo account.",
      oldEmailLabel: "Email precedente:",
      newEmailLabel: "Nuova email:",
      timeLabel: "Data richiesta:",
      warning: "Se non hai richiesto questa modifica, contatta subito il nostro team.",
    },
    accountDeletion: {
      subject: "Il tuo account è stato eliminato — Distribuidora Var San",
      kicker: "GESTIONE ACCOUNT",
      heading: "Il tuo account è stato eliminato",
      greeting: "Gentile cliente,",
      intro: "Ti confermiamo che l'eliminazione del tuo account cliente su Distribuidora Var San è stata completata con successo come da tua richiesta.",
      p1: "Come parte di questo processo, l'account associato ai tuoi dati è stato eliminato e tutte le sessioni di accesso attive sono state revocate.",
      p2: "Abbiamo inoltre annullato l'iscrizione alla newsletter associata a questo account, pertanto non riceverai ulteriori comunicazioni collegate.",
      p3: "L'eliminazione dell'account è definitiva e non può essere annullata dal Portale Clienti. Se in futuro desideri utilizzare nuovamente i nostri servizi, sarà necessario creare un nuovo account secondo le condizioni vigenti.",
      whatNextTitle: "Cosa succede adesso?",
      point1: "Il tuo account cliente non è più accessibile.",
      point2: "Le sessioni associate sono state chiuse.",
      point3: "L'iscrizione alla newsletter è stata annullata.",
      point4: "I dati soggetti alla cancellazione sono stati trattati in conformità con le policy di Distribuidora Var San.",
      point5: "Non è richiesta alcuna azione aggiuntiva da parte tua.",
      dateLabel: "Data di elaborazione:",
      supportNotice: "Se ritieni che questa eliminazione sia avvenuta per errore o necessiti di supporto relativo al tuo account, puoi contattare i nostri canali ufficiali di assistenza.",
      footerNotice: "Questo è un messaggio transazionale automatico relativo alla gestione del tuo account. Si prega di non rispondere a questa e-mail.",
    },
    common: {
      companyName: "Distribuidora Var San",
      tagline: "QUALITÀ E FIDUCIA IN OGNI FORNITURA.",
      automatedFooter: "Questo è un messaggio transazionale automatico inviato per tutelare il tuo account su Distribuidora Var San.",
      supportEmail: "distribuidora.varsan@outlook.com",
    },
  },
  "zh-CN": {
    verification: {
      subject: "您的验证码 — Distribuidora Var San",
      kicker: "VAR SAN 安全中心",
      heading: "电子邮箱验证码",
      greeting: "您好，",
      intro: "请使用以下验证码来验证您在 Distribuidora Var San 的电子邮箱地址：",
      codeLabel: "您的验证码：",
      expiryNotice: "此验证码将在 {min} 分钟后失效。",
      securityWarning: "如果您未曾发起此请求，可安全忽略本邮件。",
    },
    passwordReset: {
      subject: "密码重置请求 — Distribuidora Var San",
      kicker: "VAR SAN 安全中心",
      heading: "重置您的账户密码",
      greeting: "您好，",
      intro: "我们收到了重置您 Distribuidora Var San 账户密码的请求。",
      codeLabel: "您的重置码：",
      buttonLabel: "重置密码",
      expiryNotice: "此代码在 {min} 分钟内有效。",
      ignoreWarning: "若非您本人操作，您的账户依然安全，无需采取任何措施。",
    },
    passwordChanged: {
      subject: "密码更新成功 — Distribuidora Var San",
      kicker: "安全通知",
      heading: "您的密码已成功更新",
      greeting: "您好，",
      message: "我们确认您在 Distribuidora Var San 的账户密码已成功完成更改。",
      timeLabel: "操作时间：",
      alertWarning: "非您本人操作？如果您未曾执行此更改，请立即联系我们的安全支持团队以保护您的账户。",
      contactAction: "联系安全支持团队",
    },
    newDevice: {
      subject: "检测到新设备登录 — Distribuidora Var San",
      kicker: "安全提醒",
      heading: "新登录设备已登记",
      greeting: "您好，",
      intro: "系统检测到您的 Distribuidora Var San 账户有新的登录活动，详细信息如下：",
      detailsHeader: "设备详细信息",
      deviceLabel: "设备类型：",
      osLabel: "操作系统：",
      browserLabel: "浏览器：",
      ipLabel: "IP 地址：",
      locationLabel: "参考位置：",
      timeLabel: "登录时间：",
      revokePrompt: "非您本人操作？您可以立即在客户门户中注销该活动会话：",
      revokeButton: "管理活动会话",
      allGoodNotice: "如果是您本人的操作，无需采取任何额外措施。",
    },
    twoFactor: {
      enabledSubject: "双重认证已启用 — Distribuidora Var San",
      disabledSubject: "双重认证已停用 — Distribuidora Var San",
      kicker: "账户安全",
      enabledHeading: "2FA 双重认证已启用",
      disabledHeading: "2FA 双重认证已停用",
      greeting: "您好，",
      enabledMessage: "您的账户已成功启用双重认证（2FA），为您提供更高等级的安全防护。",
      disabledMessage: "您的账户已停用双重认证（2FA）。",
      warning: "如果非您本人操作，请立即检查您的账户安全设置。",
    },
    securityAlert: {
      subject: "重要安全提醒 — Distribuidora Var San",
      kicker: "重要安全警告",
      heading: "您的账户有重要动态",
      greeting: "您好，",
      detailsLabel: "动态详情：",
      timeLabel: "发生时间：",
      actionPrompt: "若您不认可此操作，请立即保护您的账户：",
      actionButton: "检查安全设置",
    },
    emailChange: {
      subject: "邮箱更改通知 — Distribuidora Var San",
      kicker: "账户管理",
      heading: "电子邮箱地址更改",
      greeting: "您好，",
      intro: "系统收到了更改您账户关联电子邮箱地址的请求。",
      oldEmailLabel: "原邮箱地址：",
      newEmailLabel: "新邮箱地址：",
      timeLabel: "申请时间：",
      warning: "若非您本人操作，请立即联系我们的团队。",
    },
    accountDeletion: {
      subject: "您的账户已成功注销 — Distribuidora Var San",
      kicker: "账户管理",
      heading: "您的账户已成功注销",
      greeting: "尊敬的客户，您好：",
      intro: "我们确认，已按照您的申请成功完成您在 Distribuidora Var San 的客户账户注销流程。",
      p1: "作为此流程的一部分，与您的信息关联的账户已被彻底删除，所有相关的活动会话均已被撤销。",
      p2: "我们同时已取消与此账户关联的资讯邮件（Newsletter）订阅，您将不会再收到与此账户相关的资讯邮件。",
      p3: "账户注销为永久操作，无法在客户门户中撤销。如您未来希望再次使用我们的服务，届时需根据当时有效的条款重新注册新账户。",
      whatNextTitle: "接下来的情况：",
      point1: "您的客户账户已无法再访问。",
      point2: "所有关联登录会话均已关闭。",
      point3: "资讯邮件订阅已同步取消。",
      point4: "注销范围内的数据已严格按照 Distribuidora Var San 适用政策完成处理。",
      point5: "您无需执行任何额外操作。",
      dateLabel: "处理日期：",
      supportNotice: "如您认为此注销操作系误操作或需要账户相关支持，欢迎通过官方支持渠道与我们联系。",
      footerNotice: "这是一封关于您账户管理的自动交易通知邮件，请勿直接回复本邮件。",
    },
    common: {
      companyName: "Distribuidora Var San",
      tagline: "每次供应，品质与信赖相随。",
      automatedFooter: "本邮件为系统自动发送的事务性通知，旨在保护您的 Distribuidora Var San 账户安全。",
      supportEmail: "distribuidora.varsan@outlook.com",
    },
  },
  "zh-TW": {
    verification: {
      subject: "您的驗證碼 — Distribuidora Var San",
      kicker: "VAR SAN 安全中心",
      heading: "電子郵件驗證碼",
      greeting: "您好，",
      intro: "請使用以下驗證碼來驗證您在 Distribuidora Var San 的電子郵件地址：",
      codeLabel: "您的驗證碼：",
      expiryNotice: "此驗證碼將在 {min} 分鐘後失效。",
      securityWarning: "若您未曾發起此請求，可安心忽略本郵件。",
    },
    passwordReset: {
      subject: "密碼重設請求 — Distribuidora Var San",
      kicker: "VAR SAN 安全中心",
      heading: "重設您的帳戶密碼",
      greeting: "您好，",
      intro: "我們收到了重設您 Distribuidora Var San 帳戶密碼的請求。",
      codeLabel: "您的重設碼：",
      buttonLabel: "重設密碼",
      expiryNotice: "此代碼在 {min} 分鐘內有效。",
      ignoreWarning: "若非您本人發起，您的帳戶依然安全，無需採取任何行動。",
    },
    passwordChanged: {
      subject: "密碼更新成功 — Distribuidora Var San",
      kicker: "安全通知",
      heading: "您的密碼已成功更新",
      greeting: "您好，",
      message: "我們確認您在 Distribuidora Var San 的帳戶密碼已順利完成變更。",
      timeLabel: "操作時間：",
      alertWarning: "非您本人操作？如果您未曾執行此變更，請立即聯繫我們的安全支援團隊以保護您的帳戶。",
      contactAction: "聯繫安全支援團隊",
    },
    newDevice: {
      subject: "偵測到新裝置登入 — Distribuidora Var San",
      kicker: "安全提醒",
      heading: "新登入裝置已登記",
      greeting: "您好，",
      intro: "系統偵測到您的 Distribuidora Var San 帳戶有新的登入活動，詳細資訊如下：",
      detailsHeader: "裝置詳細資訊",
      deviceLabel: "裝置類型：",
      osLabel: "作業系統：",
      browserLabel: "瀏覽器：",
      ipLabel: "IP 位址：",
      locationLabel: "參考位置：",
      timeLabel: "登入時間：",
      revokePrompt: "非您本人操作？您可以立即在客戶門戶中撤銷該活動連線：",
      revokeButton: "管理活動連線",
      allGoodNotice: "如果是您本人的操作，無需進行任何額外動作。",
    },
    twoFactor: {
      enabledSubject: "雙重認證已啟用 — Distribuidora Var San",
      disabledSubject: "雙重認證已停用 — Distribuidora Var San",
      kicker: "帳戶安全",
      enabledHeading: "2FA 雙重認證已啟用",
      disabledHeading: "2FA 雙重認證已停用",
      greeting: "您好，",
      enabledMessage: "您的帳戶已成功啟用雙重認證（2FA），為您提供更嚴密的安全防護。",
      disabledMessage: "您的帳戶已停用雙重認證（2FA）。",
      warning: "如果非您本人操作，請立即檢查您的帳戶安全設定。",
    },
    securityAlert: {
      subject: "重要安全提醒 — Distribuidora Var San",
      kicker: "重要安全警報",
      heading: "您的帳戶有重要動態",
      greeting: "您好，",
      detailsLabel: "動態詳情：",
      timeLabel: "發生時間：",
      actionPrompt: "若您不認可此操作，請立即保護您的帳戶：",
      actionButton: "檢查安全設定",
    },
    emailChange: {
      subject: "信箱變更通知 — Distribuidora Var San",
      kicker: "帳戶管理",
      heading: "電子郵件地址變更",
      greeting: "您好，",
      intro: "系統收到了變更您帳戶關聯電子郵件地址的請求。",
      oldEmailLabel: "原信箱地址：",
      newEmailLabel: "新信箱地址：",
      timeLabel: "申請時間：",
      warning: "若非您本人操作，請立即聯繫我們的團隊。",
    },
    accountDeletion: {
      subject: "您的帳戶已成功刪除 — Distribuidora Var San",
      kicker: "帳戶管理",
      heading: "您的帳戶已成功刪除",
      greeting: "親愛的客戶，您好：",
      intro: "我們確認，已依據您的申請成功完成您在 Distribuidora Var San 的客戶帳戶刪除程序。",
      p1: "作為此程序的一環，與您的資料關聯之帳戶已被永久刪除，所有相關的登入連線階段均已撤銷。",
      p2: "我們同時已取消與此帳戶關聯的電子報（Newsletter）訂閱，您將不再收到與此帳戶相關的電子報訊息。",
      p3: "帳戶刪除為永久性操作，無法在客戶門戶中復原。若您未來期盼再次使用我們的服務，屆時需依據當時適用的條款重新註冊新帳戶。",
      whatNextTitle: "後續說明：",
      point1: "您的客戶帳戶已無法再使用。",
      point2: "所有關聯登入連線均已關閉。",
      point3: "電子報訂閱已同步取消。",
      point4: "刪除範圍內之資料已嚴格依照 Distribuidora Var San 相關規範完成處理。",
      point5: "您無需進行任何額外操作。",
      dateLabel: "處理日期：",
      supportNotice: "若您認為此刪除操作係屬誤觸或需要帳戶相關協助，歡迎透過官方支援管道與我們聯繫。",
      footerNotice: "這是一封關於您帳戶管理的自動交易通知信件，請勿直接回覆本信件。",
    },
    common: {
      companyName: "Distribuidora Var San",
      tagline: "每次供應，品質與信賴相隨。",
      automatedFooter: "本信件為系統自動發送的交易通知，旨在保護您的 Distribuidora Var San 帳戶安全。",
      supportEmail: "distribuidora.varsan@outlook.com",
    },
  },
  ko: {
    verification: {
      subject: "인증 코드 안내 — Distribuidora Var San",
      kicker: "VAR SAN 보안",
      heading: "이메일 인증 코드",
      greeting: "안녕하세요,",
      intro: "Distribuidora Var San 이메일 주소 확인을 위해 아래 인증 코드를 입력해 주세요:",
      codeLabel: "인증 코드:",
      expiryNotice: "이 코드는 {min}분 후에 만료됩니다.",
      securityWarning: "본인이 요청하지 않은 경우 이 메일을 안전하게 무시하셔도 됩니다.",
    },
    passwordReset: {
      subject: "비밀번호 재설정 안내 — Distribuidora Var San",
      kicker: "VAR SAN 보안",
      heading: "비밀번호 재설정",
      greeting: "안녕하세요,",
      intro: "Distribuidora Var San 계정의 비밀번호 재설정 요청이 접수되었습니다.",
      codeLabel: "재설정 코드:",
      buttonLabel: "비밀번호 재설정",
      expiryNotice: "이 코드는 {min}분 동안 유효합니다.",
      ignoreWarning: "직접 요청하지 않으셨다면 계정은 안전하게 유지되므로 아무 조치도 필요하지 않습니다.",
    },
    passwordChanged: {
      subject: "비밀번호 변경 완료 — Distribuidora Var San",
      kicker: "보안 알림",
      heading: "비밀번호가 변경되었습니다",
      greeting: "안녕하세요,",
      message: "Distribuidora Var San 계정의 비밀번호가 성공적으로 변경되었음을 알려드립니다.",
      timeLabel: "변경 일시:",
      alertWarning: "직접 변경하지 않으셨나요? 본인 활동이 아니라면 즉시 보안 지원팀에 문의하여 계정을 보호하세요.",
      contactAction: "보안 지원팀 문의",
    },
    newDevice: {
      subject: "새로운 기기 로그인 감지 — Distribuidora Var San",
      kicker: "보안 알림",
      heading: "새로운 기기 등록",
      greeting: "안녕하세요,",
      intro: "고객님의 Distribuidora Var San 계정에 새로운 로그인이 감지되었습니다:",
      detailsHeader: "기기 세부 정보",
      deviceLabel: "기기 유형:",
      osLabel: "운영 체제:",
      browserLabel: "브라우저:",
      ipLabel: "IP 주소:",
      locationLabel: "대략적 위치:",
      timeLabel: "로그인 일시:",
      revokePrompt: "본인 활동이 아니신가요? 고객 포털에서 즉시 해당 세션을 해제하실 수 있습니다:",
      revokeButton: "활성 세션 관리",
      allGoodNotice: "직접 로그인하신 경우 추가 조치가 필요하지 않습니다.",
    },
    twoFactor: {
      enabledSubject: "2단계 인증 활성화 — Distribuidora Var San",
      disabledSubject: "2단계 인증 비활성화 — Distribuidora Var San",
      kicker: "계정 보안",
      enabledHeading: "2FA 활성화 완료",
      disabledHeading: "2FA 비활성화",
      greeting: "안녕하세요,",
      enabledMessage: "계정에 2단계 인증(2FA)이 활성화되어 한층 강화된 보안이 적용되었습니다.",
      disabledMessage: "계정의 2단계 인증(2FA)이 비활성화되었습니다.",
      warning: "직접 변경하지 않으셨다면 즉시 계정 보안 상태를 확인해 주세요.",
    },
    securityAlert: {
      subject: "중요 보안 알림 — Distribuidora Var San",
      kicker: "중요 보안 경고",
      heading: "계정 보안 활동 감지",
      greeting: "안녕하세요,",
      detailsLabel: "활동 세부 정보:",
      timeLabel: "발생 일시:",
      actionPrompt: "본인 활동이 아니신 경우 계정을 즉시 보호해 주세요:",
      actionButton: "보안 설정 확인",
    },
    emailChange: {
      subject: "이메일 주소 변경 알림 — Distribuidora Var San",
      kicker: "계정 관리",
      heading: "이메일 주소 변경",
      greeting: "안녕하세요,",
      intro: "계정에 연결된 이메일 주소 변경 요청이 접수되었습니다.",
      oldEmailLabel: "이전 이메일:",
      newEmailLabel: "새 이메일:",
      timeLabel: "요청 일시:",
      warning: "직접 요청하지 않으셨다면 지원팀으로 즉시 문의해 주세요.",
    },
    accountDeletion: {
      subject: "고객님의 계정이 삭제되었습니다 — Distribuidora Var San",
      kicker: "계정 관리",
      heading: "고객님의 계정이 삭제되었습니다",
      greeting: "안녕하세요,",
      intro: "고객님의 요청에 따라 Distribuidora Var San 고객 계정 삭제가 성공적으로 완료되었음을 확인해 드립니다.",
      p1: "본 절차의 일환으로 고객님의 정보와 연결된 계정이 영구 삭제되었으며, 모든 활성 로그인 세션이 즉시 취소되었습니다.",
      p2: "또한 본 계정과 연결된 뉴스레터 구독도 함께 취소되어, 더 이상 관련 뉴스레터가 발송되지 않습니다.",
      p3: "계정 삭제는 영구적이며 고객 포털에서 복구할 수 없습니다. 향후 당사 서비스를 다시 이용하고자 하실 경우 당시 적용되는 조건에 따라 새 계정을 등록하셔야 합니다.",
      whatNextTitle: "이후 진행 사항 안내",
      point1: "고객님의 계정은 더 이상 이용하실 수 없습니다.",
      point2: "모든 연결된 세션이 안전하게 종료되었습니다.",
      point3: "뉴스레터 구독이 성공적으로 취소되었습니다.",
      point4: "삭제 대상 데이터는 Distribuidora Var San 규정에 따라 적법하게 처리되었습니다.",
      point5: "고객님께서 추가로 취하셔야 할 조치는 없습니다.",
      dateLabel: "처리 일시:",
      supportNotice: "본 계정 삭제가 오류로 진행되었거나 계정 관련 도움이 필요하신 경우 공식 고객 지원 채널로 문의해 주시기 바랍니다.",
      footerNotice: "본 메일은 계정 관리와 관련된 자동 거래 통지 이메일입니다. 본 메일로 회신하지 마십시오.",
    },
    common: {
      companyName: "Distribuidora Var San",
      tagline: "모든 공급에 품질과 신뢰를 담습니다.",
      automatedFooter: "본 메일은 Distribuidora Var San 계정 보호를 위해 발송되는 자동 트랜잭션 알림입니다.",
      supportEmail: "distribuidora.varsan@outlook.com",
    },
  },
};

function renderBaseEmail({
  language,
  kicker,
  heading,
  bodyHtml,
  textBody,
  subject,
}: {
  language: EmailLanguage;
  kicker: string;
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
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:Arial,Helvetica,sans-serif;color:#2c3e50;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0;padding:0;background:#f5f7fa;">
<tr>
<td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:#ffffff;margin:0 auto;box-shadow:0 4px 20px rgba(10,31,68,0.06);border-radius:6px;overflow:hidden;">

<!-- ENCABEZADO -->
<tr>
<td style="background:#0a1f44;padding:36px 36px 32px;border-bottom:4px solid #c9a84c;">
<div style="margin-bottom:20px;">
  <img src="https://distribuidoravarsan.com.mx/dvs-logo-transparent.png" alt="Distribuidora Var San" width="150" style="display:block;border:0;outline:none;text-decoration:none;max-width:150px;height:auto;" />
</div>
<p style="margin:0 0 12px;color:#c9a84c;font-family:Consolas,'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;">
${kicker}
</p>
<h1 style="margin:0;color:#ffffff;font-size:26px;line-height:1.25;font-weight:800;">
${heading}
</h1>
</td>
</tr>

<!-- CUERPO -->
<tr>
<td style="padding:36px 36px 32px;">
${bodyHtml}

<!-- FIRMA INSTITUCIONAL -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:1px solid #e2e8f0;margin-top:32px;padding-top:20px;">
<tr>
<td>
<p style="margin:0 0 4px;color:#0a1f44;font-size:15px;font-weight:800;">
${tr.common.companyName}
</p>
<p style="margin:0;color:#a88a3a;font-size:12px;font-weight:700;">
${tr.common.tagline}
</p>
</td>
</tr>
</table>

</td>
</tr>

<!-- PIE -->
<tr>
<td style="background:#0a1f44;padding:20px 36px;">
<p style="margin:0 0 4px;color:#cbd5e1;font-size:11px;line-height:1.5;">
${tr.common.automatedFooter}
</p>
<p style="margin:0;color:#c9a84c;font-size:11px;">
${tr.common.supportEmail}
</p>
</td>
</tr>

</table>
</td>
</tr>
</table>
</body>
</html>`;

  const text = `${heading}
${kicker}

${textBody}

${tr.common.companyName}
${tr.common.tagline}
${tr.common.supportEmail}`;

  return { subject, html, text };
}

/**
 * 1. Correo con Código de Verificación
 */
export function buildVerificationCodeEmail(
  language: EmailLanguage = "es",
  params: VerificationCodeEmailParams,
): EmailContent {
  const tr = AUTH_TRANSLATIONS[language]?.verification || AUTH_TRANSLATIONS.es.verification;
  const expiry = (params.expiresInMinutes || 10).toString();
  const greeting = params.recipientName ? `${tr.greeting} ${escapeHtml(params.recipientName)}:` : tr.greeting;
  const safeCode = escapeHtml(params.code);

  const bodyHtml = `
<p style="margin:0 0 16px;color:#2c3e50;font-size:16px;line-height:1.6;">
<strong>${greeting}</strong>
</p>
<p style="margin:0 0 24px;color:#526274;font-size:15px;line-height:1.6;">
${tr.intro}
</p>

<!-- CAJA DEL CÓDIGO -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;">
<tr>
<td align="center" style="background:#f1f5f9;border:2px dashed #0a1f44;border-radius:8px;padding:22px;">
<p style="margin:0 0 8px;color:#64748b;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
${tr.codeLabel}
</p>
<div style="font-family:Consolas,'Courier New',monospace;font-size:32px;font-weight:800;letter-spacing:8px;color:#0a1f44;">
${safeCode}
</div>
<p style="margin:8px 0 0;color:#94a3b8;font-size:12px;">
${tr.expiryNotice.replace("{min}", expiry)}
</p>
</td>
</tr>
</table>

<p style="margin:20px 0 0;color:#64748b;font-size:13px;line-height:1.5;">
${tr.securityWarning}
</p>`;

  const textBody = `${greeting}

${tr.intro}

========================
${params.code}
========================
(${tr.expiryNotice.replace("{min}", expiry)})

${tr.securityWarning}`;

  return renderBaseEmail({
    language,
    kicker: tr.kicker,
    heading: tr.heading,
    bodyHtml,
    textBody,
    subject: tr.subject,
  });
}

/**
 * 2. Correo de Recuperación de Contraseña
 */
export function buildPasswordResetEmail(
  language: EmailLanguage = "es",
  params: PasswordResetEmailParams,
): EmailContent {
  const tr = AUTH_TRANSLATIONS[language]?.passwordReset || AUTH_TRANSLATIONS.es.passwordReset;
  const expiry = (params.expiresInMinutes || 15).toString();
  const greeting = params.recipientName ? `${tr.greeting} ${escapeHtml(params.recipientName)}:` : tr.greeting;
  const safeResetCode = escapeHtml(params.resetCode);
  const safeResetUrl = escapeHtml(params.resetUrl);

  let codeBlock = "";
  if (params.resetCode) {
    codeBlock = `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0;">
<tr>
<td align="center" style="background:#f1f5f9;border:2px dashed #0a1f44;border-radius:8px;padding:18px;">
<p style="margin:0 0 6px;color:#64748b;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
${tr.codeLabel}
</p>
<div style="font-family:Consolas,'Courier New',monospace;font-size:28px;font-weight:800;letter-spacing:6px;color:#0a1f44;">
${safeResetCode}
</div>
</td>
</tr>
</table>`;
  }

  let buttonBlock = "";
  if (params.resetUrl) {
    buttonBlock = `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:22px 0;">
<tr>
<td align="center">
<a href="${safeResetUrl}" style="background:#0a1f44;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 28px;border-radius:6px;display:inline-block;border-bottom:3px solid #c9a84c;">
${tr.buttonLabel}
</a>
</td>
</tr>
</table>`;
  }

  const bodyHtml = `
<p style="margin:0 0 16px;color:#2c3e50;font-size:16px;line-height:1.6;">
<strong>${greeting}</strong>
</p>
<p style="margin:0 0 20px;color:#526274;font-size:15px;line-height:1.6;">
${tr.intro}
</p>
${codeBlock}
${buttonBlock}
<p style="margin:16px 0 0;color:#64748b;font-size:13px;line-height:1.5;">
${tr.expiryNotice.replace("{min}", expiry)}
</p>
<p style="margin:8px 0 0;color:#94a3b8;font-size:12px;line-height:1.5;">
${tr.ignoreWarning}
</p>`;

  const textBody = `${greeting}

${tr.intro}

${params.resetCode ? `Código: ${params.resetCode}` : ""}
${params.resetUrl ? `Enlace: ${params.resetUrl}` : ""}

${tr.expiryNotice.replace("{min}", expiry)}
${tr.ignoreWarning}`;

  return renderBaseEmail({
    language,
    kicker: tr.kicker,
    heading: tr.heading,
    bodyHtml,
    textBody,
    subject: tr.subject,
  });
}

/**
 * 3. Confirmación de Contraseña Actualizada
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
<p style="margin:0 0 16px;color:#2c3e50;font-size:16px;line-height:1.6;">
<strong>${greeting}</strong>
</p>
<p style="margin:0 0 20px;color:#526274;font-size:15px;line-height:1.6;">
${tr.message}
</p>
<p style="margin:0 0 24px;color:#64748b;font-size:13px;">
<strong>${tr.timeLabel}</strong> ${safeTime}
</p>
<div style="background:#fff7ed;border-left:4px solid #f97316;padding:16px 18px;border-radius:0 4px 4px 0;margin:20px 0;">
<p style="margin:0;color:#9a3412;font-size:13px;line-height:1.5;font-weight:600;">
${tr.alertWarning}
</p>
</div>`;

  const textBody = `${greeting}

${tr.message}

${tr.timeLabel} ${rawTime}

${tr.alertWarning}`;

  return renderBaseEmail({
    language,
    kicker: tr.kicker,
    heading: tr.heading,
    bodyHtml,
    textBody,
    subject: tr.subject,
  });
}

/**
 * 4. Alerta de Nuevo Dispositivo / Nuevo Inicio de Sesión
 */
export function buildNewDeviceLoginEmail(
  language: EmailLanguage = "es",
  params: NewDeviceLoginEmailParams,
): EmailContent {
  const tr = AUTH_TRANSLATIONS[language]?.newDevice || AUTH_TRANSLATIONS.es.newDevice;
  const greeting = params.recipientName ? `${tr.greeting} ${escapeHtml(params.recipientName)}:` : tr.greeting;
  const rawTime = params.loginTime || new Date().toLocaleString(language === "en-GB" ? "en-GB" : "es-MX");
  const safeTime = escapeHtml(rawTime);
  const location = [params.region, params.country].filter(Boolean).join(", ") || "No disponible";
  const safeLocation = escapeHtml(location);
  const safeDevice = escapeHtml(params.deviceType || "Desktop");
  const safeOs = escapeHtml(params.os || "Desconocido");
  const safeBrowser = escapeHtml(params.browser || "Desconocido");
  const safeIp = escapeHtml(params.ip || "No registrada");
  const safeRevokeUrl = escapeHtml(params.revokeUrl);

  const bodyHtml = `
<p style="margin:0 0 16px;color:#2c3e50;font-size:16px;line-height:1.6;">
<strong>${greeting}</strong>
</p>
<p style="margin:0 0 20px;color:#526274;font-size:15px;line-height:1.6;">
${tr.intro}
</p>

<!-- FICHA TÉCNICA DEL DISPOSITIVO -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:16px;margin:20px 0;">
<tr>
<td>
<p style="margin:0 0 10px;color:#0a1f44;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;">
${tr.detailsHeader}
</p>
<table width="100%" style="font-size:13px;color:#475569;line-height:1.7;">
<tr><td style="width:40%;font-weight:600;color:#64748b;">${tr.deviceLabel}</td><td>${safeDevice}</td></tr>
<tr><td style="font-weight:600;color:#64748b;">${tr.osLabel}</td><td>${safeOs}</td></tr>
<tr><td style="font-weight:600;color:#64748b;">${tr.browserLabel}</td><td>${safeBrowser}</td></tr>
<tr><td style="font-weight:600;color:#64748b;">${tr.ipLabel}</td><td>${safeIp}</td></tr>
<tr><td style="font-weight:600;color:#64748b;">${tr.locationLabel}</td><td>${safeLocation}</td></tr>
<tr><td style="font-weight:600;color:#64748b;">${tr.timeLabel}</td><td>${safeTime}</td></tr>
</table>
</td>
</tr>
</table>

${params.revokeUrl ? `
<p style="margin:24px 0 12px;color:#b91c1c;font-size:13px;font-weight:600;">
${tr.revokePrompt}
</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
<tr>
<td>
<a href="${safeRevokeUrl}" style="background:#dc2626;color:#ffffff;text-decoration:none;font-weight:700;font-size:13px;padding:12px 24px;border-radius:6px;display:inline-block;">
${tr.revokeButton}
</a>
</td>
</tr>
</table>
` : ""}

<p style="margin:20px 0 0;color:#64748b;font-size:12px;line-height:1.5;">
${tr.allGoodNotice}
</p>`;

  const textBody = `${greeting}

${tr.intro}

--- ${tr.detailsHeader} ---
${tr.deviceLabel} ${params.deviceType || "Desktop"}
${tr.osLabel} ${params.os || "Desconocido"}
${tr.browserLabel} ${params.browser || "Desconocido"}
${tr.ipLabel} ${params.ip || "No registrada"}
${tr.locationLabel} ${location}
${tr.timeLabel} ${rawTime}

${params.revokeUrl ? `${tr.revokePrompt}\n${params.revokeUrl}` : ""}

${tr.allGoodNotice}`;

  return renderBaseEmail({
    language,
    kicker: tr.kicker,
    heading: tr.heading,
    bodyHtml,
    textBody,
    subject: tr.subject,
  });
}

/**
 * 5. Alerta de Seguridad General
 */
export function buildSecurityAlertEmail(
  language: EmailLanguage = "es",
  params: SecurityAlertEmailParams,
): EmailContent {
  const tr = AUTH_TRANSLATIONS[language]?.securityAlert || AUTH_TRANSLATIONS.es.securityAlert;
  const greeting = params.recipientName ? `${tr.greeting} ${escapeHtml(params.recipientName)}:` : tr.greeting;
  const rawTime = params.timestamp || new Date().toLocaleString(language === "en-GB" ? "en-GB" : "es-MX");
  const safeTime = escapeHtml(rawTime);
  const safeTitle = escapeHtml(params.alertTitle);
  const safeDetails = escapeHtml(params.alertDetails);
  const safeActionUrl = escapeHtml(params.actionUrl);

  const bodyHtml = `
<p style="margin:0 0 16px;color:#2c3e50;font-size:16px;line-height:1.6;">
<strong>${greeting}</strong>
</p>
<p style="margin:0 0 16px;color:#0a1f44;font-size:16px;font-weight:700;">
${safeTitle}
</p>
<div style="background:#fef2f2;border-left:4px solid #ef4444;padding:16px 18px;border-radius:0 4px 4px 0;margin:18px 0;">
<p style="margin:0;color:#991b1b;font-size:14px;line-height:1.6;">
${safeDetails}
</p>
</div>
<p style="margin:0 0 20px;color:#64748b;font-size:12px;">
<strong>${tr.timeLabel}</strong> ${safeTime}
</p>
${params.actionUrl ? `
<a href="${safeActionUrl}" style="background:#0a1f44;color:#ffffff;text-decoration:none;font-weight:700;font-size:13px;padding:12px 24px;border-radius:6px;display:inline-block;border-bottom:3px solid #c9a84c;">
${tr.actionButton}
</a>
` : ""}`;

  const textBody = `${greeting}

${params.alertTitle}

${params.alertDetails}

${tr.timeLabel} ${rawTime}
${params.actionUrl ? `${tr.actionButton}: ${params.actionUrl}` : ""}`;

  return renderBaseEmail({
    language,
    kicker: tr.kicker,
    heading: tr.heading,
    bodyHtml,
    textBody,
    subject: tr.subject,
  });
}

/**
 * 6. Notificación de Cambio de Correo Electrónico
 */
export function buildEmailChangedEmail(
  language: EmailLanguage = "es",
  params: EmailChangeNotificationParams,
): EmailContent {
  const tr = AUTH_TRANSLATIONS[language]?.emailChange || AUTH_TRANSLATIONS.es.emailChange;
  const greeting = params.recipientName ? `${tr.greeting} ${escapeHtml(params.recipientName)}:` : tr.greeting;
  const rawTime = params.timestamp || new Date().toLocaleString(language === "en-GB" ? "en-GB" : "es-MX");
  const safeTime = escapeHtml(rawTime);
  const safeOldEmail = escapeHtml(params.oldEmail);
  const safeNewEmail = escapeHtml(params.newEmail);

  const bodyHtml = `
<p style="margin:0 0 16px;color:#2c3e50;font-size:16px;line-height:1.6;">
<strong>${greeting}</strong>
</p>
<p style="margin:0 0 20px;color:#526274;font-size:15px;line-height:1.6;">
${tr.intro}
</p>
<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:18px;margin:20px 0;">
  <p style="margin:0 0 8px;color:#64748b;font-size:13px;"><strong>${tr.oldEmailLabel}</strong> ${safeOldEmail}</p>
  <p style="margin:0 0 8px;color:#0a1f44;font-size:13px;font-weight:700;"><strong>${tr.newEmailLabel}</strong> ${safeNewEmail}</p>
  <p style="margin:0;color:#64748b;font-size:12px;"><strong>${tr.timeLabel}</strong> ${safeTime}</p>
</div>
<div style="background:#fff7ed;border-left:4px solid #f97316;padding:14px 16px;border-radius:0 4px 4px 0;margin:18px 0;">
  <p style="margin:0;color:#9a3412;font-size:13px;line-height:1.5;">${tr.warning}</p>
</div>`;

  const textBody = `${greeting}

${tr.intro}

${tr.oldEmailLabel} ${params.oldEmail}
${tr.newEmailLabel} ${params.newEmail}
${tr.timeLabel} ${rawTime}

${tr.warning}`;

  return renderBaseEmail({
    language,
    kicker: tr.kicker,
    heading: tr.heading,
    bodyHtml,
    textBody,
    subject: tr.subject,
  });
}

/**
 * 7. Notificación / Confirmación de Cuenta Desactivada
 */
export function buildAccountDeactivatedEmail(
  language: EmailLanguage = "es",
  params: { recipientName?: string; deactivationDate?: string },
): EmailContent {
  const tr = AUTH_TRANSLATIONS[language]?.accountDeletion || AUTH_TRANSLATIONS.es.accountDeletion;
  const greeting = params.recipientName ? `${tr.greeting} ${escapeHtml(params.recipientName)}:` : tr.greeting;
  const rawTime = params.deactivationDate || new Date().toLocaleString(language === "en-GB" ? "en-GB" : "es-MX");
  const safeTime = escapeHtml(rawTime);

  const deactivationSubject = language === "en-GB"
    ? "Account deactivated — Distribuidora Var San"
    : "Cuenta desactivada — Distribuidora Var San";
  const deactivationHeading = language === "en-GB"
    ? "Your account has been deactivated"
    : "Tu cuenta ha sido desactivada";
  const deactivationMessage = language === "en-GB"
    ? "Your client account at Distribuidora Var San has been successfully deactivated upon your request. All active sessions have been revoked. If you wish to reactivate your account in the future, please contact our support team."
    : "Tu cuenta de cliente en Distribuidora Var San ha sido desactivada exitosamente conforme a tu solicitud. Todas tus sesiones activas han sido cerradas. Si deseas reactivar tu cuenta en el futuro, por favor contáctanos.";

  const bodyHtml = `
<p style="margin:0 0 16px;color:#2c3e50;font-size:16px;line-height:1.6;">
<strong>${greeting}</strong>
</p>
<p style="margin:0 0 20px;color:#526274;font-size:15px;line-height:1.6;">
${deactivationMessage}
</p>
<p style="margin:0 0 20px;color:#64748b;font-size:13px;">
<strong>Fecha / Date:</strong> ${safeTime}
</p>`;

  const textBody = `${greeting}

${deactivationMessage}

Fecha / Date: ${rawTime}`;

  return renderBaseEmail({
    language,
    kicker: tr.kicker,
    heading: deactivationHeading,
    bodyHtml,
    textBody,
    subject: deactivationSubject,
  });
}

/**
 * 8. Notificación / Confirmación de Cuenta Eliminada
 */
export function buildAccountDeletedEmail(
  language: EmailLanguage = "es",
  params: { recipientName?: string; deletionDate?: string },
): EmailContent {
  const tr = AUTH_TRANSLATIONS[language]?.accountDeletion || AUTH_TRANSLATIONS.es.accountDeletion;
  const greeting = params.recipientName ? `${tr.greeting} ${escapeHtml(params.recipientName)}:` : tr.greeting;
  const rawTime = params.deletionDate || new Date().toLocaleString(language === "en-GB" ? "en-GB" : "es-MX");
  const safeTime = escapeHtml(rawTime);

  const bodyHtml = `
<p style="margin:0 0 16px;color:#2c3e50;font-size:16px;line-height:1.6;">
<strong>${greeting}</strong>
</p>
<p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.65;">
${tr.intro}
</p>
<p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.65;">
${tr.p1}
</p>
<p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.65;">
${tr.p2}
</p>
<p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.65;">
${tr.p3}
</p>

<!-- BLOQUE QUÉ SUCEDE AHORA -->
<div style="background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #0a1f44;border-radius:4px;padding:20px;margin:24px 0;">
<h3 style="margin:0 0 12px;color:#0a1f44;font-size:15px;font-weight:700;">
${tr.whatNextTitle}
</h3>
<ul style="margin:0;padding-left:20px;color:#475569;font-size:14px;line-height:1.75;">
<li>${tr.point1}</li>
<li>${tr.point2}</li>
<li>${tr.point3}</li>
<li>${tr.point4}</li>
<li>${tr.point5}</li>
</ul>
</div>

<p style="margin:20px 0 12px;color:#64748b;font-size:13px;line-height:1.6;">
<strong>${tr.dateLabel}</strong> ${safeTime}
</p>
<p style="margin:12px 0 0;color:#64748b;font-size:13px;line-height:1.6;">
${tr.supportNotice}
</p>`;

  const textBody = `${greeting}

${tr.intro}

${tr.p1}

${tr.p2}

${tr.p3}

${tr.whatNextTitle}
- ${tr.point1}
- ${tr.point2}
- ${tr.point3}
- ${tr.point4}
- ${tr.point5}

${tr.dateLabel} ${rawTime}

${tr.supportNotice}`;

  return renderBaseEmail({
    language,
    kicker: tr.kicker,
    heading: tr.heading,
    bodyHtml,
    textBody,
    subject: tr.subject,
  });
}

/**
 * 8. Bienvenida a Nuevo Cliente Registrado en el Portal
 */
export function buildClientWelcomeEmail(
  language: EmailLanguage = "es",
  params: { recipientName?: string; email?: string; company?: string; portalUrl?: string } = {},
): EmailContent {
  const greeting = params.recipientName ? `Hola, ${escapeHtml(params.recipientName)}:` : "Hola:";
  const safeCompany = params.company ? escapeHtml(params.company) : "";
  const portalUrl = params.portalUrl || "https://distribuidoravarsan.com.mx";

  const bodyHtml = `
<p style="margin:0 0 16px;color:#2c3e50;font-size:16px;line-height:1.6;">
<strong>${greeting}</strong>
</p>
<p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.65;">
Te damos la más cordial bienvenida al <strong>Portal de Cliente de Distribuidora Var San</strong>. Tu cuenta ha sido creada exitosamente.
</p>
${safeCompany ? `
<p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.65;">
Empresa / Institución vinculada: <strong>${safeCompany}</strong>
</p>
` : ""}
<p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.65;">
Desde tu portal podrás consultar información de tu cuenta, gestionar tus sesiones activas, configurar la seguridad en dos pasos (2FA), descargar tus datos y acceder a todos nuestros catálogos de soluciones industriales y médicas.
</p>
<div style="margin:26px 0;text-align:center;">
<a href="${escapeHtml(portalUrl)}" style="background:#0a1f44;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 28px;border-radius:6px;display:inline-block;border-bottom:3px solid #c9a84c;">
Acceder al Portal de Cliente
</a>
</div>
<p style="margin:20px 0 0;color:#64748b;font-size:13px;line-height:1.6;">
Si tienes dudas o necesitas atención personalizada, nuestro equipo de soporte está siempre listo para ayudarte.
</p>`;

  const textBody = `${greeting}

Te damos la más cordial bienvenida al Portal de Cliente de Distribuidora Var San. Tu cuenta ha sido creada exitosamente.

${params.company ? `Empresa / Institución: ${params.company}\n\n` : ""}Accede a tu portal en: ${portalUrl}

CALIDAD Y CONFIANZA EN CADA SUMINISTRO.
Distribuidora Var San`;

  return renderBaseEmail({
    language,
    kicker: "PORTAL DE CLIENTES",
    heading: "¡Bienvenido a Distribuidora Var San!",
    bodyHtml,
    textBody,
    subject: "Bienvenido a Distribuidora Var San — Tu cuenta está lista",
  });
}

/**
 * 9. Código de Verificación para Descarga de Datos
 */
export function buildDataExportCodeEmail(
  language: EmailLanguage = "es",
  params: { code: string; recipientName?: string; expiresInMinutes?: number },
): EmailContent {
  const greeting = params.recipientName ? `Hola, ${escapeHtml(params.recipientName)}:` : "Hola:";
  const safeCode = escapeHtml(params.code);
  const minutes = params.expiresInMinutes || 15;

  const bodyHtml = `
<p style="margin:0 0 16px;color:#2c3e50;font-size:16px;line-height:1.6;">
<strong>${greeting}</strong>
</p>
<p style="margin:0 0 20px;color:#526274;font-size:15px;line-height:1.6;">
Hemos recibido una solicitud para descargar una copia de tus datos almacenados en Distribuidora Var San. Para verificar tu identidad, utiliza el siguiente código de seguridad:
</p>
<div style="background:#f8fafc;border:2px dashed #0a1f44;border-radius:8px;padding:24px;text-align:center;margin:24px 0;">
  <p style="margin:0 0 6px;color:#64748b;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Código de verificación</p>
  <span style="color:#0a1f44;font-family:Consolas,'Courier New',monospace;font-size:34px;font-weight:800;letter-spacing:8px;">${safeCode}</span>
</div>
<p style="margin:0 0 12px;color:#64748b;font-size:13px;">
Este código expirará en <strong>${minutes} minutos</strong> y es de un solo uso.
</p>
<div style="background:#fff7ed;border-left:4px solid #f97316;padding:12px 16px;border-radius:0 4px 4px 0;margin:18px 0;">
  <p style="margin:0;color:#9a3412;font-size:13px;line-height:1.5;">
    Si tú no solicitaste este archivo con tus datos, te recomendamos cambiar tu contraseña y revisar tus sesiones de inmediato.
  </p>
</div>`;

  const textBody = `${greeting}

Hemos recibido una solicitud para descargar tus datos. Código de verificación:

${params.code}

Expira en ${minutes} minutos.
Si tú no solicitaste este código, por favor protege tu cuenta de inmediato.`;

  return renderBaseEmail({
    language,
    kicker: "VERIFICACIÓN DE IDENTIDAD",
    heading: "Verifica tu identidad para descargar tus datos",
    bodyHtml,
    textBody,
    subject: "Código de verificación para descarga de datos — Distribuidora Var San",
  });
}
