import {
  type EmailContent,
  type EmailLanguage,
  type WelcomeEmailParams,
  escapeHtml,
} from "./types";

interface EmiliaTranslations {
  subject: string;
  badge: string;
  heroHeading: string;
  introParagraph: string;
  editorialHeading: string;
  editorialQuote: string;
  editorialAuthor: string;
  benefit1Title: string;
  benefit1Desc: string;
  benefit2Title: string;
  benefit2Desc: string;
  benefit3Title: string;
  benefit3Desc: string;
  buttonLabel: string;
  tagline: string;
  footerNotice: string;
  supportPrompt: string;
}

export const EMILIA_TRANSLATIONS: Record<EmailLanguage, EmiliaTranslations> = {
  es: {
    subject: "Bienvenido a Emilia — Boletín Oficial de Distribuidora Var San",
    badge: "BOLETÍN EDITORIAL",
    heroHeading: "Limpieza, Protección y Vanguardia",
    introParagraph: "Nos emociona darte la bienvenida a <strong>Emilia</strong>, el espacio de divulgación, asesoría técnica y novedades de <strong>Distribuidora Var San</strong>. A partir de ahora recibirás contenido curado con los mejores estándares de la industria.",
    editorialHeading: "Nuestra Visión",
    editorialQuote: "La excelencia operativa y la bioseguridad no son un gasto, sino el pilar fundamental que resguarda la reputación de tu empresa.",
    editorialAuthor: "— Consejo Editorial de Distribuidora Var San",
    benefit1Title: "Protocolos Técnicos",
    benefit1Desc: "Guías prácticas y dosificaciones exactas para optimizar tus procesos de desinfección.",
    benefit2Title: "Novedades y Lanzamientos",
    benefit2Desc: "Acceso preferente a nuevas fórmulas químicas, equipos y soluciones de protección.",
    benefit3Title: "Asesoría Directa",
    benefit3Desc: "Acompañamiento especializado de nuestro equipo técnico para resolver requerimientos específicos.",
    buttonLabel: "EXPLORAR PRODUCTOS Y SOLUCIONES",
    tagline: "Soluciones en limpieza y protección para tu empresa.",
    footerNotice: "Recibes este correo porque te suscribiste a Emilia en distribuidoravarsan.com.mx.",
    supportPrompt: "¿Necesitas ayuda?",
  },
  "en-GB": {
    subject: "Welcome to Emilia — Distribuidora Var San's Official Newsletter",
    badge: "EDITORIAL NEWSLETTER",
    heroHeading: "Cleaning, Protection & Innovation",
    introParagraph: "We are thrilled to welcome you to <strong>Emilia</strong>, the technical newsletter from <strong>Distribuidora Var San</strong>. You will receive curated insights and industry standards directly to your inbox.",
    editorialHeading: "Our Vision",
    editorialQuote: "Operational excellence and biosafety are not mere expenses; they are the foundation guarding your corporate reputation.",
    editorialAuthor: "— Editorial Board, Distribuidora Var San",
    benefit1Title: "Technical Protocols",
    benefit1Desc: "Practical disinfection guides and precise chemical dosages.",
    benefit2Title: "Product Launches",
    benefit2Desc: "Early access to novel formulations and safety equipment.",
    benefit3Title: "Expert Consultation",
    benefit3Desc: "Direct technical guidance tailored to your specific organizational needs.",
    buttonLabel: "EXPLORE PRODUCTS & SOLUTIONS",
    tagline: "Cleaning and protective solutions for your business.",
    footerNotice: "You received this email because you subscribed to Emilia at distribuidoravarsan.com.mx.",
    supportPrompt: "Need help?",
  },
  fr: {
    subject: "Bienvenue sur Emilia — Bulletin Officiel Distribuidora Var San",
    badge: "BULLETIN ÉDITORIAL",
    heroHeading: "Propreté, Protection & Innovation",
    introParagraph: "Nous sommes ravis de vous accueillir sur <strong>Emilia</strong>, le bulletin technique de <strong>Distribuidora Var San</strong>.",
    editorialHeading: "Notre Vision",
    editorialQuote: "L'excellence opérationnelle et la biosécurité sont le fondement de la réputation de votre entreprise.",
    editorialAuthor: "— Conseil Éditorial, Distribuidora Var San",
    benefit1Title: "Protocoles Techniques",
    benefit1Desc: "Guides de désinfection et dosages précis pour vos installations.",
    benefit2Title: "Nouveautés Produits",
    benefit2Desc: "Accès privilégié à nos dernières formulations chimiques et équipements.",
    benefit3Title: "Conseil Expert",
    benefit3Desc: "Accompagnement personnalisé pour vos exigences techniques.",
    buttonLabel: "DÉCOUVRIR NOS SOLUTIONS",
    tagline: "Solutions de nettoyage et de protection pour votre entreprise.",
    footerNotice: "Vous recevez cet e-mail car vous êtes inscrit à Emilia sur distribuidoravarsan.com.mx.",
    supportPrompt: "Besoin d'aide ?",
  },
  pt: {
    subject: "Bem-vindo à Emilia — Boletim Oficial da Distribuidora Var San",
    badge: "BOLETIM EDITORIAL",
    heroHeading: "Limpeza, Proteção e Inovação",
    introParagraph: "É com grande satisfação que lhe damos as boas-vindas à <strong>Emilia</strong>, o boletim técnico da <strong>Distribuidora Var San</strong>.",
    editorialHeading: "Nossa Visão",
    editorialQuote: "A excelência operacional e a biossegurança são os pilares que protegem a reputação da sua empresa.",
    editorialAuthor: "— Conselho Editorial, Distribuidora Var San",
    benefit1Title: "Protocolos Técnicos",
    benefit1Desc: "Guias práticos de desinfecção e dosagens precisas para seus processos.",
    benefit2Title: "Lançamentos e Produtos",
    benefit2Desc: "Acesso antecipado a novas soluções e equipamentos de proteção.",
    benefit3Title: "Consultoria Especializada",
    benefit3Desc: "Suporte direto da nossa equipe técnica para suas necessidades.",
    buttonLabel: "CONHECER SOLUÇÕES",
    tagline: "Soluções em limpeza e proteção para sua empresa.",
    footerNotice: "Você está recebendo este e-mail porque se inscreveu na Emilia em distribuidoravarsan.com.mx.",
    supportPrompt: "Precisa de ajuda?",
  },
  it: {
    subject: "Benvenuto su Emilia — Bollettino Ufficiale Distribuidora Var San",
    badge: "BOLLETTINO EDITORIALE",
    heroHeading: "Pulizia, Protezione e Innovazione",
    introParagraph: "Siamo lieti di darti il benvenuto su <strong>Emilia</strong>, la newsletter tecnica di <strong>Distribuidora Var San</strong>.",
    editorialHeading: "La Nostra Visione",
    editorialQuote: "L'eccellenza operativa e la biosicurezza sono il fondamento che tutela la reputazione della tua azienda.",
    editorialAuthor: "— Comitato Editoriale, Distribuidora Var San",
    benefit1Title: "Protocolli Tecnici",
    benefit1Desc: "Guide pratiche di sanificazione e dosaggi precisi.",
    benefit2Title: "Nuovi Prodotti",
    benefit2Desc: "Accesso privilegiato alle più recenti formulazioni chimiche.",
    benefit3Title: "Consulenza Tecnica",
    benefit3Desc: "Supporto dedicato per le esigenze specifiche della tua impresa.",
    buttonLabel: "SCOPRI LE SOLUZIONI",
    tagline: "Soluzioni per la pulizia e la protezione della tua azienda.",
    footerNotice: "Ricevi questa email perché ti sei iscritto a Emilia su distribuidoravarsan.com.mx.",
    supportPrompt: "Hai bisogno di aiuto?",
  },
  "zh-CN": {
    subject: "欢迎订阅 Emilia — Distribuidora Var San 官方精选",
    badge: "官方专刊",
    heroHeading: "专业清洁 · 安全防护 · 行业创新",
    introParagraph: "很高兴您加入 <strong>Emilia</strong> — <strong>Distribuidora Var San</strong> 的技术专栏与行业资讯平台。",
    editorialHeading: "核心理念",
    editorialQuote: "卓越的运营标准与生物安全保障，是守护企业声誉不可或缺的坚实基石。",
    editorialAuthor: "— Distribuidora Var San 专家团队",
    benefit1Title: "技术操作规程",
    benefit1Desc: "专业的消毒杀菌指南与精确的化学配比方案。",
    benefit2Title: "新品与前沿动态",
    benefit2Desc: "优先了解高品质化学制剂与专业防护设备。",
    benefit3Title: "专属技术支持",
    benefit3Desc: "专业团队为您提供量身定制的清洁与防护咨询。",
    buttonLabel: "查看产品与解决方案",
    tagline: "企业专业清洁与防护解决方案。",
    footerNotice: "您收到此邮件是因为在 distribuidoravarsan.com.mx 订阅了 Emilia。",
    supportPrompt: "需要帮助？",
  },
  "zh-TW": {
    subject: "歡迎訂閱 Emilia — Distribuidora Var San 官方精選",
    badge: "官方專刊",
    heroHeading: "專業清潔 · 安全防護 · 行業創新",
    introParagraph: "非常榮幸您加入 <strong>Emilia</strong> — <strong>Distribuidora Var San</strong> 的技術專欄與行業資訊平台。",
    editorialHeading: "核心理念",
    editorialQuote: "卓越的營運標準與生物安全保障，是守護企業商譽不可或缺的基石。",
    editorialAuthor: "— Distribuidora Var San 專家團隊",
    benefit1Title: "技術操作規程",
    benefit1Desc: "專業的消毒殺菌指南與精確的化學配比方案。",
    benefit2Title: "新品與前沿動態",
    benefit2Desc: "優先了解高品質化學製劑與專業防護設備。",
    benefit3Title: "專屬技術支援",
    benefit3Desc: "專業團隊為您提供量身定制的清潔與防護諮詢。",
    buttonLabel: "探索產品與解決方案",
    tagline: "企業專業清潔與防護解決方案。",
    footerNotice: "您收到此郵件是因為在 distribuidoravarsan.com.mx 訂閱了 Emilia。",
    supportPrompt: "需要協助？",
  },
  ko: {
    subject: "Emilia 구독을 환영합니다 — Distribuidora Var San 공식 뉴스레터",
    badge: "공식 뉴스레터",
    heroHeading: "전문 위생 · 안전 보호 · 기술 혁신",
    introParagraph: "<strong>Distribuidora Var San</strong>의 전문 기술 및 솔루션 뉴스레터인 <strong>Emilia</strong>에 오신 것을 진심으로 환영합니다.",
    editorialHeading: "우리의 가치",
    editorialQuote: "철저한 위생 관리와 안전은 단순한 비용이 아닌, 기업의 신뢰를 지키는 가장 견고한 기반입니다.",
    editorialAuthor: "— Distribuidora Var San 편집위원회",
    benefit1Title: "전문 위생 지침",
    benefit1Desc: "정확한 배합과 최적의 소독 프로토콜 가이드.",
    benefit2Title: "신제품 및 소식",
    benefit2Desc: "최신 화학 제제 및 안전 보호 장비 정보 우선 제공.",
    benefit3Title: "전문 기술 지원",
    benefit3Desc: "고객사의 환경에 맞춘 전문 컨설팅 서비스.",
    buttonLabel: "제품 및 솔루션 확인하기",
    tagline: "기업을 위한 전문 청소 및 위생 솔루션.",
    footerNotice: "distribuidoravarsan.com.mx에서 Emilia를 구독하셨기에 본 메일이 발송되었습니다.",
    supportPrompt: "도움이 필요하신가요?",
  },
};

export function buildEmiliaWelcomeEmail(
  language: EmailLanguage = "es",
  params: WelcomeEmailParams,
): EmailContent {
  const tr = EMILIA_TRANSLATIONS[language] || EMILIA_TRANSLATIONS.es;
  const safeUnsubscribe = escapeHtml(params.unsubscribeUrl || "https://distribuidoravarsan.com.mx/portal");
  const greeting = params.recipientName ? `Hola, ${escapeHtml(params.recipientName)}:` : "Hola:";

  const html = `<!doctype html>
<html lang="${language === "en-GB" ? "en" : language}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<title>${tr.subject}</title>
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
  .button-cta { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; }
}
</style>
</head>
<body style="margin:0;padding:0;background-color:#F4F6F8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#172033;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0;padding:0;background-color:#F4F6F8;">
<tr>
<td align="center" style="padding:36px 12px;">

<table role="presentation" class="email-container" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background-color:#FFFFFF;margin:0 auto;box-shadow:0 4px 24px rgba(7,29,58,0.05);border-radius:14px;overflow:hidden;border:1px solid #E5E9F0;">

<!-- TOP BAR -->
<tr>
<td class="header-cell" style="background-color:#FFFFFF;padding:32px 36px 20px;border-bottom:1px solid #EEF2F6;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
<tr>
<td align="left" style="vertical-align:middle;">
  <img src="https://distribuidoravarsan.com.mx/dvs-logo-transparent.png" alt="Distribuidora Var San" width="140" style="display:block;border:0;outline:none;text-decoration:none;max-width:140px;height:auto;" />
</td>
<td align="right" style="vertical-align:middle;">
  <span style="background-color:#071D3A;color:#C9A84C;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:6px 14px;border-radius:20px;display:inline-block;white-space:nowrap;">
    ${tr.badge}
  </span>
</td>
</tr>
</table>
</td>
</tr>

<!-- BODY -->
<tr>
<td class="body-cell" style="background-color:#FFFFFF;padding:36px 36px 28px;color:#172033;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;">

<p style="margin:0 0 6px;color:#C9A84C;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
  BOLETÍN EMILIA
</p>
<h1 class="h1-title" style="margin:0 0 16px;color:#071D3A;font-size:24px;font-weight:800;letter-spacing:-0.4px;">
  ${tr.heroHeading}
</h1>
<p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.65;">
  ${tr.introParagraph}
</p>

<!-- CITA EDITORIAL -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-left:4px solid #C9A84C;border-radius:8px;margin:24px 0;">
<tr>
<td style="padding:20px 22px;">
  <p style="margin:0 0 8px;color:#071D3A;font-size:14px;font-style:italic;line-height:1.6;">
    "${tr.editorialQuote}"
  </p>
  <p style="margin:0;color:#667085;font-size:12px;font-weight:700;">
    ${tr.editorialAuthor}
  </p>
</td>
</tr>
</table>

<!-- BENEFICIOS -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;">
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #F1F5F9;">
      <p style="margin:0 0 2px;color:#071D3A;font-size:14px;font-weight:700;">• ${tr.benefit1Title}</p>
      <p style="margin:0;color:#64748B;font-size:13px;">${tr.benefit1Desc}</p>
    </td>
  </tr>
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #F1F5F9;">
      <p style="margin:0 0 2px;color:#071D3A;font-size:14px;font-weight:700;">• ${tr.benefit2Title}</p>
      <p style="margin:0;color:#64748B;font-size:13px;">${tr.benefit2Desc}</p>
    </td>
  </tr>
  <tr>
    <td style="padding:10px 0;">
      <p style="margin:0 0 2px;color:#071D3A;font-size:14px;font-weight:700;">• ${tr.benefit3Title}</p>
      <p style="margin:0;color:#64748B;font-size:13px;">${tr.benefit3Desc}</p>
    </td>
  </tr>
</table>

<!-- CTA BUTTON -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0 16px;">
<tr>
<td align="center" style="border-radius:8px;background-color:#071D3A;">
  <a href="https://distribuidoravarsan.com.mx" class="button-cta" style="display:inline-block;padding:15px 36px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:8px;letter-spacing:0.5px;">
    ${tr.buttonLabel} →
  </a>
</td>
</tr>
</table>

<!-- SECCIÓN DE SOPORTE COMPACTA -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:32px;padding-top:20px;border-top:1px solid #EEF2F6;">
<tr>
<td style="color:#667085;font-size:13px;line-height:1.5;">
  ${tr.supportPrompt} <a href="mailto:distribuidora.varsan@outlook.com" style="color:#071D3A;font-weight:700;text-decoration:underline;">distribuidora.varsan@outlook.com</a>
</td>
</tr>
</table>

</td>
</tr>

<!-- FOOTER -->
<tr>
<td class="footer-cell" style="background-color:#F8FAFC;padding:24px 36px;border-top:1px solid #EEF2F6;text-align:center;">
<p style="margin:0 0 4px;color:#071D3A;font-size:13px;font-weight:700;letter-spacing:0.3px;">Distribuidora Var San</p>
<p style="margin:0 0 6px;color:#667085;font-size:12px;">${tr.tagline}</p>
<p style="margin:0 0 8px;color:#8C9BAE;font-size:11px;">${tr.footerNotice}</p>
<p style="margin:0;color:#8C9BAE;font-size:11px;">© 2026 Distribuidora Var San | <a href="${safeUnsubscribe}" style="color:#64748B;text-decoration:underline;">Gestionar suscripción</a></p>
</td>
</tr>

</table>

</td>
</tr>
</table>
</body>
</html>`;

  const text = `${tr.heroHeading}
[${tr.badge}]

${greeting}

${tr.introParagraph.replace(/<[^>]+>/g, '')}

${tr.editorialHeading}:
"${tr.editorialQuote}"
${tr.editorialAuthor}

Beneficios:
- ${tr.benefit1Title}: ${tr.benefit1Desc}
- ${tr.benefit2Title}: ${tr.benefit2Desc}
- ${tr.benefit3Title}: ${tr.benefit3Desc}

Visita: https://distribuidoravarsan.com.mx
Cancelar suscripción: ${params.unsubscribeUrl || "https://distribuidoravarsan.com.mx"}`;

  return { subject: tr.subject, html, text };
}
