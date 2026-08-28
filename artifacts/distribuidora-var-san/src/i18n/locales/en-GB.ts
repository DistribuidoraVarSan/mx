import type { Dictionary } from '../types';

const enGB: Dictionary = {
  "nav": {
    "inicio": "Home",
    "esencia": "Our Ethos",
    "familia": "Family",
    "soluciones": "Solutions",
    "eleccion": "Why Choose Us",
    "impulsamos": "What We Drive",
    "marcas": "Brands",
    "atencion": "Support",
    "contacto": "Contact",
    "solicitarCotizacion": "Request a quote",
    "portalClientes": "Customer Portal",
    "iniciarSesion": "Log in",
    "crearCuenta": "Create account",
    "miCuenta": "My account",
    "abrirMenu": "Open menu",
    "cerrarMenu": "Close menu",
    "navegacionPrincipal": "Main navigation"
  },
  "languageSelector": {
    "label": "Select language"
  },
  "common": {
    "close": "Close",
    "closeProfileAria": "Close profile",
    "previous": "Previous",
    "next": "Next",
    "loading": "Loading...",
    "backToHome": "Back to home"
  },
  "cookies": {
    "ariaLabel": "Cookie preferences",
    "text": "Dear visitor, we use cookies to improve your browsing experience. By continuing to use this site, you agree to our use of cookies. You can read our {privacidad} and {cookies}.",
    "privacyLink": "Privacy Notice",
    "cookiesLink": "Cookies Policy",
    "accept": "Accept",
    "reject": "Decline"
  },
  "account": {
    "portalTitle": "Customer Portal",
    "loginTitle": "Log in",
    "registerTitle": "Create your account",
    "loginIntro": "Access your Distribuidora Var San account.",
    "registerIntro": "Register to access the Var San customer portal.",
    "tabLogin": "Log in",
    "tabRegister": "Create account",
    "fieldName": "Name",
    "fieldNamePlaceholder": "Your name",
    "fieldCompany": "Organisation",
    "fieldCompanyPlaceholder": "Name of your organisation",
    "fieldEmail": "Email address",
    "fieldEmailPlaceholder": "email@company.com",
    "fieldPassword": "Password",
    "fieldPasswordPlaceholderLogin": "Your password",
    "fieldPasswordPlaceholderRegister": "Minimum 6 characters",
    "fieldConfirmPassword": "Confirm password",
    "fieldConfirmPasswordPlaceholder": "Repeat your password",
    "submitLogin": "Log in",
    "submitRegister": "Create account",
    "continueWithGoogle": "Continue with Google",
    "secureAccessNote": "Secure access for Var San customers via Firebase Authentication and Firestore.",
    "passwordMismatch": "Passwords do not match.",
    "accountCreated": "Account created successfully.",
    "loginSuccess": "Signed in successfully.",
    "errorEmailInUse": "This email address already has an account.",
    "errorWeakPassword": "Password must be at least 6 characters.",
    "errorInvalidEmail": "The email address is not valid.",
    "errorInvalidCredential": "Email or password is incorrect.",
    "errorTooManyRequests": "Too many attempts. Please wait a moment and try again.",
    "errorGeneric": "Firebase: {code} — {message}",
    "errorGoogleSignIn": "Could not sign in with Google.",
    "errorSaveProfile": "Could not save the profile."
  },
  "portal": {
    "eyebrow": "Customer Portal",
    "welcome": "Welcome{name}.",
    "intro": "Your session is connected to Firebase and your customer data is loaded from Firestore.",
    "fieldNameLabel": "Name",
    "fieldEmailLabel": "Email address",
    "fieldCompanyLabel": "Organisation",
    "defaultClientName": "Var San Customer",
    "notSpecified": "Not specified",
    "notAvailable": "Not available",
    "myProfile": "My profile",
    "logOut": "Log out",
    "closePortal": "Close portal",
    "profileHeading": "Customer details",
    "profileIntro": "Changes are saved to your Firestore profile.",
    "saveChanges": "Save changes",
    "sessionsTitle": "Devices and active sessions",
    "sessionsSubtitle": "Manage devices with access to your account.",
    "currentDeviceBadge": "This device (Current session)",
    "lastActiveLabel": "Last active",
    "locationLabel": "Location / IP",
    "revokeSession": "Log out",
    "revokeAllOthers": "Log out of all other devices",
    "confirmRevokeAll": "Do you want to log out of all other devices?",
    "noActiveSessions": "No other active sessions recorded.",
    "sessionRevokedSuccess": "Remote session logged out successfully.",
    "sessionsRevokedAllSuccess": "All other active sessions have been logged out.",
    "loadingSessions": "Loading active sessions...",
    "refreshSessions": "Refresh sessions",
    "revokeAllTotal": "Log out of all sessions",
    "confirmRevokeAllTotal": "Are you sure you want to log out of ALL registered devices?",
    "sessionsRevokedTotalSuccess": "All sessions have been logged out successfully.",
    "itWasntMe": "It wasn't me",
    "itWasntMeSuccess": "The unrecognized access has been blocked and your account secured.",
    "securityActivityTitle": "Security Activity Log",
    "securityActivitySubtitle": "Chronological history of security events, accesses and account changes.",
    "noSecurityActivity": "No recent security activity recorded.",
    "loadingActivity": "Loading security activity...",
    "reportSuspiciousActivity": "Don't recognise a device or event? Block with 'It wasn't me'",
    "tabAccount": "Profile & Account",
    "tabSecurity": "Security & Sessions",
    "tabStorage": "Storage",
    "tabResources": "Resources & Help",
    "tabLegal": "Legal",
    "changePassword": "Change password",
    "changeEmail": "Change email",
    "deactivateAccount": "Deactivate account",
    "deleteAccount": "Delete account",
    "currentPasswordLabel": "Current password",
    "newPasswordLabel": "New password",
    "confirmNewPasswordLabel": "Confirm new password",
    "newEmailLabel": "New email address",
    "deactivateWarning": "Deactivating your account will terminate all active sessions. You will not be able to log in until support reactivates it.",
    "deleteWarning": "This action is permanent and irreversible. Your profile, session history, and credentials will be deleted permanently.",
    "confirmDeactivate": "Are you sure you want to deactivate your account?",
    "confirmDelete": "Are you sure you want to PERMANENTLY DELETE your account?",
    "passwordChangedSuccess": "Password updated successfully.",
    "emailChangedSuccess": "Email address updated successfully.",
    "accountDeactivatedSuccess": "Your account has been deactivated.",
    "accountDeletedSuccess": "Your account and data have been permanently deleted.",
    "reauthError": "The current password entered is incorrect.",
    "passwordsDoNotMatch": "Passwords do not match.",
    "passwordTooShort": "New password must be at least 8 characters long.",
    "storageTitle": "Local Browser Storage",
    "storageSubtitle": "Diagnostics and storage usage on this device (does not affect your cloud server data).",
    "storageUsage": "Estimated storage usage",
    "storageEstimateNote": "Measured directly via standard browser storage APIs.",
    "storageLocalStorage": "Local storage (localStorage)",
    "storageSessionStorage": "Session storage (sessionStorage)",
    "storageCookies": "Accessible cookies (JavaScript)",
    "storageCookiesNote": "HttpOnly authentication cookies are isolated and protected by the browser.",
    "storageIndexedDb": "Local database (IndexedDB)",
    "storageCacheStorage": "Cache storage (Cache Storage)",
    "storageServiceWorker": "Service Worker",
    "storageAvailable": "Available",
    "storageUnavailable": "Not available",
    "storageClearBtn": "Clear temporary browser data",
    "storageConfirmClear": "Do you want to clear temporary data stored in this browser?",
    "storageClearedSuccess": "Temporary browser data cleared successfully.",
    "resourcesTitle": "Resources & Help",
    "resourcesSubtitle": "Support centre, frequently asked questions, and technical issue reporting.",
    "resourcesVersionLabel": "Portal Version",
    "resourcesVersionValue": "Version 10.01",
    "resourcesHelpCenter": "Help Centre",
    "resourcesFaq": "Frequently Asked Questions",
    "resourcesReportBug": "Report an issue / Bug report",
    "resourcesContactSupport": "Contact Support",
    "resourcesSupportChannels": "Official support channel: distribuidora.varsan@outlook.com and web contact form. (Emails from verificacion@, seguridad@, and cuentas@ are automated).",
    "bugReportTitle": "Submit Bug Report",
    "bugReportIntro": "Describe the issue so our technical team can resolve it. No passwords or sensitive data are transmitted.",
    "bugReportProblemTitle": "Issue title or summary",
    "bugReportProblemDesc": "Detailed description",
    "bugReportSteps": "Steps to reproduce (optional)",
    "bugReportExpected": "Expected behaviour (optional)",
    "bugReportSeverity": "Severity",
    "bugReportSeverityLow": "Low",
    "bugReportSeverityMedium": "Medium",
    "bugReportSeverityHigh": "High",
    "bugReportSeverityCritical": "Critical",
    "bugReportMetadataNotice": "Attached technical details: Version 10.01, Operating System, Browser, and Device Type.",
    "bugReportSubmit": "Submit report",
    "bugReportSubmitted": "Bug report submitted successfully. Ticket ID: {id}",
    "faqQuestion1": "How do I place an order with Distribuidora Var San?",
    "faqAnswer1": "You can request a quotation directly through our contact form or by exploring our catalogue of industrial hygiene supplies.",
    "faqQuestion2": "How do I protect my account with two-factor authentication (2FA)?",
    "faqAnswer2": "Go to the 'Security & Sessions' tab in this portal and click 'Enable 2FA' to scan the QR code with your authenticator app.",
    "faqQuestion3": "What should I do if I notice an unfamiliar device or login?",
    "faqAnswer3": "Immediately click 'It wasn't me' in the security alert or 'Log out' next to the unfamiliar device to revoke its access.",
    "faqQuestion4": "How can I change my email or password?",
    "faqAnswer4": "In the 'Profile & Account' tab, you can update your credentials securely with instant verification."
  },


  "hero": {
    "eyebrow": "Leading brands · Guaranteed quality",
    "titleLead": "Solutions in ",
    "titleHighlight": "cleaning and protection",
    "titleTail": " for your organisation.",
    "textBefore": "Over ",
    "textAfter": " carefully selected for businesses, industries, shops and institutions.",
    "productsHighlight": "1,000 products",
    "extra": "At Distribuidora Var San we believe a good supplier does more than deliver products; it brings trust, quality and solutions for your organisation to grow.",
    "exploreSolutions": "Explore solutions",
    "requestQuote": "Request a quote",
    "imageAlt": "Professional cleaning and safety supplies",
    "captionEyebrow": "Your partner",
    "captionText": "in cleaning, hygiene and safety.",
    "statTitle": "1,000+ Products",
    "statSubtitle": "Everything in one place."
  },
  "essence": {
    "eyebrow": "Our ethos",
    "title": "The values that define us.",
    "lede": "More than distributing products, we build relationships founded on quality, dedication and trust.",
    "values": {
      "quality": {
        "title": "Quality",
        "description": "We carefully curate each product to deliver reliable, high-performance solutions."
      },
      "closeness": {
        "title": "Proximity",
        "description": "We offer attentive, personalised guidance and support with every single order."
      },
      "commitment": {
        "title": "Commitment",
        "description": "We deliver with responsibility, punctuality and service tailored to your enterprise."
      },
      "trust": {
        "title": "Trust",
        "description": "We forge enduring partnerships based on honesty, backing and consistent results."
      }
    }
  },
  "family": {
    "eyebrow": "Join the Var San family",
    "title": "We grow when our customers grow.",
    "subtitle": "The Var San Experience",
    "label": "The Var San Experience",
    "ariaLabel": "View {slide} experience",
    "slides": [
      [
        "TRUST",
        "Today we serve everyone from small enterprises to companies seeking a reliable supplier for growth."
      ],
      [
        "SUPPORT",
        "We stand by your side from the first quote through to the delivery of each order."
      ],
      [
        "RELATIONSHIPS",
        "We do not aim for a one-off sale. We strive to build enduring relationships with every customer."
      ],
      [
        "GROWTH",
        "When our customers flourish, we know we are doing our work well."
      ],
      [
        "WELCOME",
        "Thank you for considering Distribuidora Var San as a trusted partner for your organisation."
      ]
    ]
  },
  "solutions": {
    "eyebrow": "Our solutions",
    "title": "Find the ideal solution for your enterprise",
    "lede": "The \"View full catalogue\" button will open the PDF for the selected line. Each category has its own independent catalogue.",
    "catalogPart1": "The ",
    "catalogStrongPart": "\"View full catalogue\"",
    "catalogPart2": " button will open the PDF for the selected line. Each category (",
    "catalogPart3": ") has its own independent catalogue.",
    "tabListLabel": "Product lines",
    "categoriesLabel": "Categories",
    "categoriesScreenReader": "Product categories",
    "previousCategory": "Previous category",
    "nextCategory": "Next category",
    "fullCatalog": "View full catalogue",
    "lineIndustrial": "INDUSTRIAL SAFETY",
    "lineMedical": "MEDICAL LINE",
    "andConjunction": " & ",
    "industrialProducts": [
      {
        "category": "INDUSTRIAL SAFETY",
        "title": "Safety Gloves",
        "tabTitle": "Gloves",
        "description": "Hand protection solutions engineered for varied risk levels, handling, chemical contact, cut resistance, and industrial activities.",
        "features": [
          "Cut-resistant",
          "Coated",
          "Disposable",
          "Chemical-resistant",
          "Textile",
          "Leather"
        ]
      },
      {
        "category": "RESPIRATORY PROTECTION",
        "title": "Respiratory Protection",
        "tabTitle": "Respiratory",
        "description": "Equipment and components for respiratory defence against particulates, dusts, mists, vapours, gases, and contaminants.",
        "features": [
          "Masks",
          "Respirators",
          "Filters & cartridges",
          "Valves",
          "Accessories",
          "Self-rescuers"
        ]
      },
      {
        "category": "EYE PROTECTION",
        "title": "Eye Protection",
        "tabTitle": "Eye",
        "description": "Equipment designed to safeguard the eyes and face against impacts, flying particles, and chemical splashes during work operations.",
        "features": [
          "Glasses",
          "Goggles",
          "Welding helmets",
          "Shields",
          "Headgear"
        ]
      },
      {
        "category": "HEARING PROTECTION",
        "title": "Hearing Protection",
        "tabTitle": "Hearing",
        "description": "Solutions to reduce noise exposure and provide dependable hearing conservation across various work environments.",
        "features": [
          "Earmuffs",
          "Helmet-mounted earmuffs",
          "Disposable earplugs",
          "Reusable earplugs"
        ]
      },
      {
        "category": "HEAD PROTECTION",
        "title": "Hard Hats & Helmets",
        "tabTitle": "Head",
        "description": "Head protection dedicated to construction, manufacturing, maintenance, work at height, and operational facilities.",
        "features": [
          "Industrial hard hats",
          "Vented helmets",
          "Height safety helmets",
          "Suspensions",
          "Chin straps"
        ]
      },
      {
        "category": "WORK AT HEIGHT",
        "title": "Fall Protection",
        "tabTitle": "Height",
        "description": "Systems and gear designed to prevent and arrest falls, position operatives, and carry out work at height safely.",
        "features": [
          "Harnesses",
          "Lifelines",
          "Retractable blocks",
          "Lanyards",
          "Anchorage points",
          "Shock absorbers"
        ]
      },
      {
        "category": "WORKWEAR & APPAREL",
        "title": "Industrial Workwear",
        "tabTitle": "Apparel",
        "description": "Garments, accessories, and personal protective wear for operational activities across diverse industrial sectors.",
        "features": [
          "Industrial clothing",
          "Disposables",
          "Waterproofs",
          "Safety footwear",
          "Boiler suits",
          "Ergonomics"
        ]
      },
      {
        "category": "SIGNAGE & TRAFFIC",
        "title": "Traffic & Site Safety",
        "tabTitle": "Signage",
        "description": "Signage, demarcation, and high-visibility products to safeguard traffic corridors and hazardous work areas.",
        "features": [
          "Hi-vis vests",
          "Barrier tapes",
          "Chains",
          "Posts",
          "Delineators",
          "Cones",
          "Signs"
        ]
      },
      {
        "category": "ENERGY ISOLATION",
        "title": "Lockout / Tagout (LOTO)",
        "tabTitle": "LOTO",
        "description": "Safety lockout and tagout devices designed for the secure isolation of hazardous energy sources during maintenance.",
        "features": [
          "Safety padlocks",
          "Lockout hasps",
          "Group boxes",
          "Electrical lockouts",
          "Valve lockouts",
          "Safety tags"
        ]
      }
    ],
    "medicalProducts": [
      {
        "category": "MEDICAL LINE · BIOHAZARD WASTE",
        "title": "Sharps & Waste Collectors",
        "tabTitle": "Collectors",
        "description": "Specialised containers for the safe disposal of biological-infectious hazardous waste, including sharps and liquid residues.",
        "features": [
          "Sharps disposal",
          "Liquids",
          "Holders",
          "Wire baskets",
          "Step cans"
        ]
      },
      {
        "category": "MEDICAL LINE · WASTE DISPOSAL",
        "title": "Biohazard Bags",
        "tabTitle": "Biohazard Bags",
        "description": "Bags for the identification, segregation, and management of medical waste, available in multiple sizes and gauges.",
        "features": [
          "Red bags",
          "Yellow bags",
          "Various sizes",
          "Heavy gauge",
          "Standard marking"
        ]
      },
      {
        "category": "MEDICAL LINE · STORAGE",
        "title": "Temporary Storage",
        "tabTitle": "Storage",
        "description": "Solutions to organise and temporarily store waste and clinical supplies in medical and healthcare premises.",
        "features": [
          "Organisation",
          "Safety",
          "Transport",
          "Heavy-duty",
          "Signage"
        ]
      },
      {
        "category": "MEDICAL LINE · CONTAINERS",
        "title": "Medical Waste Bins",
        "tabTitle": "Containers",
        "description": "Heavy-duty pedal bins and accessories for hygienic waste management in hospitals and healthcare institutions.",
        "features": [
          "Containers",
          "Lids",
          "Foot pedal",
          "Waste collection",
          "Hygiene"
        ]
      }
    ]
  },
  "whyChoose": {
    "eyebrow": "Why Choose Us?",
    "title": "Why Choose Distribuidora Var San?",
    "lede": "More than a vendor, we are the dedicated ally powering your enterprise forward.",
    "ariaLabel": "Reasons to choose us",
    "reasonLabel": "View reason {number}",
    "previousReason": "Previous reason",
    "nextReason": "Next reason",
    "reasons": [
      [
        "Extensive inventory",
        "Thousands of products in stock to respond swiftly to the demands of diverse sectors."
      ],
      [
        "Recognised brands",
        "We partner with leading manufacturers to deliver reliable, high-performance solutions."
      ],
      [
        "Tailored guidance",
        "We listen to each client’s unique needs to provide bespoke advice and solutions."
      ],
      [
        "Dependable deliveries",
        "We coordinate every order with precision so you receive supplies punctually and in full."
      ],
      [
        "Comprehensive supply",
        "From industrial PPE to clinical medical lines, we bring together everything your business needs."
      ],
      [
        "Long-term dedication",
        "We aim to foster enduring partnerships built on confidence, service, and tangible results."
      ]
    ]
  },
  "sectors": {
    "eyebrow": "Sectors We Power",
    "title": "Specialised solutions for organisations ",
    "titleEmphasis": "across diverse industries.",
    "names": [
      "Enterprises",
      "Offices",
      "Retail & Commerce",
      "Manufacturing & Industry",
      "Educational Institutions",
      "Hospitals & Clinics",
      "Restaurants & Hospitality",
      "Hotels",
      "Public Institutions",
      "General Businesses"
    ]
  },
  "brands": {
    "eyebrow": "Brands",
    "title": "Brands We Distribute",
    "lede": "We supply genuine products from manufacturers renowned for quality and industrial safety.",
    "distributed": "Authorised brand"
  },
  "process": {
    "eyebrow": "Customer Journey",
    "title": "Working with us is this straightforward",
    "titleEmphasis": "straightforward",
    "steps": [
      [
        "1",
        "Request a quote",
        "Contact us via WhatsApp, phone, or email detailing the products and quantities you require."
      ],
      [
        "2",
        "We tailor your proposal",
        "We evaluate your specifications and prepare a competitive, customised proposal."
      ],
      [
        "3",
        "We dispatch your order",
        "Upon quote acceptance, we coordinate timely delivery or collection on the agreed date."
      ]
    ]
  },
  "contact": {
    "eyebrow": "Contact Us",
    "title": "Request information or a ",
    "titleEmphasis": "quotation",
    "lede": "Share your requirements and our team will get in touch promptly to assist you.",
    "email": "Email address",
    "phone": "Phone & WhatsApp",
    "attention": "Clientele",
    "attentionInfo": "Enterprises, industries, businesses, and public institutions",
    "upcoming": "Coming soon.",
    "submitting": "Sending...",
    "submitSuccess": "Request sent successfully! Our team will contact you shortly.",
    "form": {
      "nameLabel": "Name",
      "emailLabel": "Email address",
      "companyLabel": "Organisation",
      "messageLabel": "Message",
      "submitButton": "Send request"
    }
  },
  "newsletter": {
    "title": "Subscribe!",
    "lede": "Join our newsletter and be the first to receive updates on new products and special offers",
    "placeholder": "Email address",
    "ariaLabelInput": "Email address for newsletter subscription",
    "ariaLabelButton": "Subscribe to newsletter",
    "alreadySubscribed": "This email address is already subscribed to our newsletter.",
    "subscriptionSuccess": "Done! You have successfully subscribed.",
    "subscriptionError": "We were unable to complete your subscription. Please try again.",
    "networkError": "Could not connect to the server. Please try again in a few moments."
  },
  "chatbot": {
    "openButtonLabel": "Open chatbot",
    "closeButtonLabel": "Close chatbot",
    "headerTitle": "Var San Assistant",
    "headerSubtitle": "Product guidance & customer support",
    "greeting": "Hello. I am the Var San Assistant. I can guide you through our product lines, catalogues, delivery coverage, and contact channels. How may we assist you today?",
    "inputPlaceholder": "Type your message (Enter to send, Shift+Enter for new line)",
    "inputAriaLabel": "Message for the virtual assistant",
    "sendButtonLabel": "Send message",
    "quickProducts": "What products do you supply?",
    "quickQuote": "Request a quote",
    "quickSupport": "Customer support",
    "quickContact": "How can I contact you?",
    "loadingMessage": "Typing...",
    "errorMessage": "We could not process your message. Please try again in a few moments."
  },
  "footer": {
    "navigationHeading": "Navigation",
    "contactHeading": "Contact",
    "requestQuote": "Request a quote",
    "rightsReserved": "© {year} Distribuidora Var San. All rights reserved. |",
    "tagline": "Cleaning and safety solutions for your enterprise.",
    "privacyNotice": "Privacy Notice",
    "cookiesPolicy": "Cookies Policy",
    "termsAndConditions": "Terms & Conditions",
    "brandDescription": "Cleaning and protection solutions",
    "footerTagline": "Cleaning and safety solutions for your enterprise. Committed to providing reliable supplies in hygiene, maintenance, and personal safety for corporations, businesses, and institutions.",
    "upcoming": "Telephone (Coming soon)"
  },
  "splash": {
    "ariaLabel": "Loading Distribuidora Var San",
    "tagline": "Quality and trust in every supply."
  },
  "twoFactor": {
    "title": "Two-Factor Authentication (2FA)",
    "subtitle": "Protect your account by requiring an additional security code from your authenticator app when signing in.",
    "enabledBadge": "Enabled",
    "disabledBadge": "Disabled",
    "enableBtn": "Enable 2FA",
    "disableBtn": "Disable 2FA",
    "setupTitle": "Set Up Two-Factor Authentication",
    "setupIntro": "Follow these steps to link your authenticator app (Google Authenticator, Microsoft Authenticator, 1Password, etc.).",
    "step1Title": "1. Scan the QR code or enter the key",
    "step1Scan": "Open your authenticator app and scan the code or enter the following manual setup key:",
    "step1ManualKey": "Manual setup key:",
    "step2Title": "2. Save your backup codes",
    "step2EnterCode": "Enter the 6-digit code shown in your app:",
    "step3Title": "3. Emergency Backup Codes",
    "step3BackupCodes": "Backup Codes",
    "step3BackupIntro": "Store these 8 codes in a safe place. Each code can be used only once if you lose access to your authenticator app.",
    "copyKey": "Copy key",
    "keyCopied": "Key copied!",
    "copyBackupCodes": "Copy codes",
    "backupCodesCopied": "Codes copied!",
    "confirmAndActivate": "Confirm and Enable 2FA",
    "activating": "Verifying and enabling...",
    "deactivating": "Disabling...",
    "disableConfirmTitle": "Disable Two-Factor Authentication?",
    "disableConfirmIntro": "Your account will be less secure. To confirm, enter the 6-digit code from your authenticator app or a backup code.",
    "enterCodeToDisable": "Current verification code:",
    "confirmDisable": "Confirm Deactivation",
    "challengeTitle": "Two-Factor Verification",
    "challengeIntro": "Your account is protected with 2FA. Enter the 6-digit code from your authenticator app to proceed.",
    "inputCodePlaceholder": "000000",
    "verifyButton": "Verify & Sign In",
    "verifying": "Verifying...",
    "useBackupCodeLink": "Use a backup code",
    "useTotpLink": "Use authenticator app",
    "enterBackupCodePlaceholder": "e.g. A7D9-4E2F",
    "rescueEmailLink": "Can't access your app? Send rescue code to my email",
    "rescueEmailSent": "A 6-digit temporary rescue code has been sent to your registered email address.",
    "enterRescueCodePlaceholder": "Rescue code (6 digits)",
    "cancel": "Cancel",
    "errorInvalidCode": "Invalid or expired code. Please try again.",
    "errorLocked": "Too many failed attempts. Temporarily locked for 15 minutes.",
    "remainingBackupCodes": "{count} backup codes remaining"
  },
  "legal": {
    "backToHome": "Back to home",
    "cookies": {
      "title": "COOKIES POLICY",
      "lastUpdated": "Last updated: 8 August 2026",
      "intro": [
        "At Distribuidora Var San we use cookies and similar technologies on our website to ensure proper operation, enhance user experience, and gather technical insight into website performance.",
        "This Cookies Policy outlines what cookies are, how they are utilised, and the choices available to you regarding their management."
      ],
      "sections": [
        {
          "title": "1. WHAT ARE COOKIES?",
          "paragraphs": [
            "Cookies are small text files placed on your device by a website when you visit its pages.",
            "They enable the website to retain specific settings and session information across visits, depending on their type and configuration.",
            "Cookies do not access personal documents stored on your computer or phone, nor do they access confidential financial data."
          ]
        },
        {
          "title": "2. HOW WE USE COOKIES",
          "paragraphs": [
            "Distribuidora Var San may use cookies for the following legitimate purposes:"
          ],
          "subsections": [
            {
              "title": "Strictly Necessary Cookies",
              "paragraphs": [
                "Essential for the secure, fundamental operation of the website. They are utilised to:"
              ],
              "list": [
                "Maintain key website features and security.",
                "Remember technical browsing configurations.",
                "Detect and mitigate technical errors.",
                "Ensure the integrity of user authentication sessions."
              ]
            },
            {
              "title": "Preference Cookies",
              "paragraphs": [
                "Utilised where appropriate to remember user selections, such as language preferences and regional settings."
              ]
            },
            {
              "title": "Analytics & Measurement Cookies",
              "paragraphs": [
                "Allow us to understand visitor engagement by compiling anonymous statistics on page visits, device types, and browsing durations."
              ]
            },
            {
              "title": "Advertising & Marketing Cookies",
              "paragraphs": [
                "We currently do not deploy targeted advertising cookies. Should third-party marketing tools be introduced in future, this policy will be promptly updated."
              ]
            }
          ]
        },
        {
          "title": "3. THIRD-PARTY COOKIES",
          "paragraphs": [
            "Certain website features may integrate third-party infrastructure. Where applicable, these providers process technical data under their own respective privacy terms."
          ]
        },
        {
          "title": "4. DATA COLLECTED VIA COOKIES",
          "paragraphs": [
            "Depending on settings, cookies may record technical parameters including:"
          ],
          "list": [
            "IP address.",
            "Browser type and version.",
            "Operating system and device model.",
            "Access timestamps and page interactions."
          ]
        },
        {
          "title": "5. MANAGING COOKIE PREFERENCES",
          "paragraphs": [
            "You may adjust your browser settings at any time to accept, decline, block, or delete cookies. Please note that disabling essential cookies may impact certain website features."
          ]
        },
        {
          "title": "6. COOKIES AND PERSONAL DATA",
          "paragraphs": [
            "Where technical cookie data is linked with personal information, Distribuidora Var San handles such data strictly in accordance with our Privacy Notice and applicable data protection legislation."
          ]
        },
        {
          "title": "7. POLICY UPDATES",
          "paragraphs": [
            "We may periodically update this policy to reflect technological, operational, or legal developments. The current version will always remain accessible on our website."
          ]
        },
        {
          "title": "8. CONTACT",
          "paragraphs": [
            "If you have enquiries regarding our use of cookies, please reach out via:"
          ]
        }
      ],
      "contactBlock": {
        "brand": "Distribuidora Var San",
        "email": "Email: distribuidora.varsan@outlook.com"
      },
      "signoff": {
        "brand": "Distribuidora Var San",
        "tagline": "Quality and trust in every supply."
      }
    },
    "privacy": {
      "title": "PRIVACY NOTICE",
      "lastUpdated": "Last updated: 8 August 2026",
      "intro": [
        "At Distribuidora Var San we respect and safeguard the personal data of individuals who visit our website, request quotes, place orders, or communicate with us.",
        "This Privacy Notice explains what personal data we collect, how it is processed and protected, and the legal rights available to you under applicable data privacy laws.",
        "Distribuidora Var San acts as the data controller responsible for the processing of personal data provided through our digital channels and customer services.",
        "By accessing our website or submitting personal data, you acknowledge having read and understood this Privacy Notice."
      ],
      "sections": [
        {
          "title": "1. PERSONAL DATA WE COLLECT",
          "paragraphs": [
            "We collect only the personal information strictly necessary to process enquiries, fulfill commercial orders, and deliver our services.",
            "Data collected may include:"
          ],
          "list": [
            "Full name.",
            "Telephone number.",
            "Email address.",
            "Delivery address and municipality.",
            "Product requirements and quotation history.",
            "Payment validation information for bank transfers, where applicable."
          ]
        },
        {
          "title": "2. HOW WE COLLECT YOUR DATA",
          "paragraphs": [
            "Data is obtained directly from you when submitting forms, ordering products, or communicating with us, as well as automatically through technical browsing logs."
          ]
        },
        {
          "title": "3. PURPOSES OF PROCESSING",
          "paragraphs": [
            "Personal data is utilised to respond to enquiries, provide formal proposals, process orders, coordinate logistics, issue invoices, and fulfill statutory legal and tax obligations."
          ]
        },
        {
          "title": "4. DELIVERY COVERAGE",
          "paragraphs": [
            "Distribuidora Var San currently provides direct delivery coverage across:"
          ],
          "list": [
            "Tampico, Tamaulipas.",
            "Ciudad Madero, Tamaulipas.",
            "Altamira, Tamaulipas."
          ]
        },
        {
          "title": "5. PAYMENTS",
          "paragraphs": [
            "Payments may be made via cash or bank transfer. Distribuidora Var San never requests or stores debit/credit card numbers, PINs, or online banking passwords."
          ]
        },
        {
          "title": "6. DATA PROTECTION & SECURITY",
          "paragraphs": [
            "We maintain administrative, physical, and technical safeguards to prevent unauthorised access, loss, alteration, or unlawful processing of your personal data."
          ]
        },
        {
          "title": "7. DATA TRANSFERS & DISCLOSURE",
          "paragraphs": [
            "Distribuidora Var San does not sell your personal data. Disclosures are limited to authorized logistics personnel, essential cloud service providers, and competent authorities when legally mandated."
          ]
        },
        {
          "title": "8. DATA SUBJECT RIGHTS (ARCO)",
          "paragraphs": [
            "You hold the right to Access your personal records, Rectify inaccurate data, Cancel or erase records where lawful, and Oppose specific processing activities."
          ]
        },
        {
          "title": "9. PROCEDURE TO EXERCISE YOUR RIGHTS",
          "paragraphs": [
            "To submit an ARCO request or revoke processing consent, please email a formal application with valid identification to:"
          ],
          "highlight": "distribuidora.varsan@outlook.com"
        },
        {
          "title": "10. CONTACT",
          "paragraphs": [
            "For any questions regarding personal data protection or our privacy practices, please contact us at:"
          ]
        }
      ],
      "contactBlock": {
        "brand": "Distribuidora Var San",
        "email": "Email: distribuidora.varsan@outlook.com"
      },
      "signoff": {
        "brand": "Distribuidora Var San",
        "tagline": "Quality and trust in every supply."
      }
    },
    "terms": {
      "title": "TERMS AND CONDITIONS",
      "lastUpdated": "Last updated: 9 August 2026",
      "intro": [
        "Welcome to the Distribuidora Var San website.",
        "These Terms and Conditions govern the access, browsing, and use of this website, as well as the conditions applicable to quotations, orders, and commercial transactions concluded via our digital channels.",
        "By using this website, you agree to these Terms and Conditions in full. If you disagree with any provision, please refrain from using our services."
      ],
      "sections": [
        {
          "title": "1. IDENTITY OF THE OPERATOR",
          "paragraphs": [
            "This website is operated by Distribuidora Var San, an enterprise dedicated to the distribution and commercialisation of industrial supplies and hygiene solutions."
          ]
        },
        {
          "title": "2. SERVICE COVERAGE",
          "paragraphs": [
            "Direct distribution and delivery services are currently provided in:"
          ],
          "list": [
            "Tampico, Tamaulipas.",
            "Ciudad Madero, Tamaulipas.",
            "Altamira, Tamaulipas."
          ]
        },
        {
          "title": "3. PRODUCT INFORMATION",
          "paragraphs": [
            "Product images and descriptions are provided for informative purposes. Technical specifications may vary according to the respective manufacturer."
          ]
        },
        {
          "title": "4. PRICES & QUOTATIONS",
          "paragraphs": [
            "Commercial prices and terms are subject to product availability. A quotation request does not constitute a binding purchase until formal confirmation."
          ]
        },
        {
          "title": "5. ORDERS & PAYMENT METHODS",
          "paragraphs": [
            "Orders may be placed through enabled channels and paid via cash or bank transfer. We never solicit online banking credentials or payment card PINs."
          ]
        },
        {
          "title": "6. DELIVERIES & AVAILABILITY",
          "paragraphs": [
            "Deliveries are coordinated with clients according to confirmed inventory availability and logistics schedules."
          ]
        },
        {
          "title": "7. INTELLECTUAL PROPERTY & PROPER USE",
          "paragraphs": [
            "All website contents, logos, and materials are protected intellectual property of Distribuidora Var San. Unauthorised or fraudulent use is strictly prohibited."
          ]
        },
        {
          "title": "8. APPLICABLE LAW & CONTACT",
          "paragraphs": [
            "These Terms and Conditions are interpreted in accordance with the laws of the United Mexican States. For enquiries, please contact:"
          ]
        }
      ],
      "contactBlock": {
        "brand": "Distribuidora Var San",
        "email": "Email: distribuidora.varsan@outlook.com"
      },
      "signoff": {
        "brand": "Distribuidora Var San",
        "tagline": "Quality and trust in every supply."
      }
    }
  }
};

export default enGB;
