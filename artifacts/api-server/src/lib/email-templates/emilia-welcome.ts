import { type EmailContent, type EmailLanguage, type WelcomeEmailParams, escapeHtml } from "./types";

interface EmiliaTranslation {
  subject: string;
  kicker: string;
  heading: string;
  welcomeIntro: string;
  p1: string;
  p2: string;
  p3: string;
  p4: string;
  quote: string;
  p5: string;
  p6: string;
  p7: string;
  p8: string;
  closingTitle: string;
  closingSubtitle: string;
  companyName: string;
  tagline: string;
  contactPrompt: string;
  footerNotice: string;
  unsubscribeLink: string;
}

const EMILIA_TRANSLATIONS: Record<EmailLanguage, EmiliaTranslation> = {
  es: {
    subject: "¡Bienvenido a la familia Var San!",
    kicker: "DISTRIBUIDORA VAR SAN",
    heading: "¡Bienvenido a la<br />familia Var San!",
    welcomeIntro: "Nos alegra mucho darte la bienvenida.",
    p1: "Hoy no solamente comenzamos a compartir información contigo; comenzamos también a construir una relación que esperamos que crezca con el tiempo.",
    p2: "En <strong style=\"color:#0a1f44;\">Distribuidora Var San</strong> creemos que detrás de cada producto, cada pedido y cada servicio existe algo mucho más importante: las personas. Por eso, para nosotros, tenerte aquí significa mucho más que contar con un nuevo contacto. Significa abrirte las puertas de nuestra familia.",
    p3: "Queremos que encuentres en Var San una empresa cercana, responsable y comprometida contigo. Un lugar donde puedas conocer nuevas opciones, descubrir productos, encontrar oportunidades y, sobre todo, sentir que siempre hay alguien dispuesto a escucharte y ayudarte.",
    p4: "A través de nuestros mensajes podrás conocer nuestras novedades, nuevos productos, promociones y todo aquello que vayamos construyendo para seguir creciendo junto a quienes confían en nosotros.",
    quote: "Porque una empresa puede ofrecer productos, pero una familia construye vínculos.",
    p5: "Pero esta relación no queremos que se quede solamente en un correo.",
    p6: "Queremos que Var San trascienda más allá de una compra. Que cada experiencia, cada atención y cada contacto deje algo positivo y nos permita construir una relación basada en la confianza.",
    p7: "Y nosotros queremos construirlos contigo.",
    p8: "Gracias por confiar en <strong style=\"color:#0a1f44;\">Distribuidora Var San</strong> y por permitirnos darte la bienvenida a este espacio que, desde hoy, también es tuyo.",
    closingTitle: "Bienvenido a la familia Var San.",
    closingSubtitle: "Nos alegra tenerte aquí.",
    companyName: "Distribuidora Var San",
    tagline: "Más que distribución, construimos confianza.",
    contactPrompt: "Para cualquier duda o comentario, puedes comunicarte con nosotros:",
    footerNotice: "Recibiste este correo porque te suscribiste al sitio de Distribuidora Var San.",
    unsubscribeLink: "Cancelar mi suscripción",
  },
  "en-GB": {
    subject: "Welcome to the Var San Family!",
    kicker: "DISTRIBUIDORA VAR SAN",
    heading: "Welcome to the<br />Var San Family!",
    welcomeIntro: "We are delighted to welcome you.",
    p1: "Today we do not merely begin sharing updates with you; we also begin building a relationship that we hope will flourish over time.",
    p2: "At <strong style=\"color:#0a1f44;\">Distribuidora Var San</strong>, we believe that behind every product, order, and service lies something far more essential: people. Having you with us means much more than gaining a new contact. It means opening the doors of our family to you.",
    p3: "We want you to discover in Var San an approachable, responsible, and dedicated partner. A place where you can explore solutions, discover premium products, and always know there is someone ready to assist you.",
    p4: "Through our communications, you will stay informed about our latest solutions, specialised products, and initiatives crafted to grow alongside those who place their trust in us.",
    quote: "Because a company may supply products, but a family builds enduring bonds.",
    p5: "Yet we aspire for this relationship to extend far beyond email correspondence.",
    p6: "We want Var San to transcend beyond transactions. We strive for every interaction and service experience to foster genuine mutual trust.",
    p7: "And we look forward to building those bonds together with you.",
    p8: "Thank you for trusting <strong style=\"color:#0a1f44;\">Distribuidora Var San</strong> and allowing us to welcome you to a community that is now yours as well.",
    closingTitle: "Welcome to the Var San family.",
    closingSubtitle: "We are truly glad to have you here.",
    companyName: "Distribuidora Var San",
    tagline: "More than distribution, we build trust.",
    contactPrompt: "For any questions or feedback, please feel free to reach out to us:",
    footerNotice: "You received this email because you subscribed to Distribuidora Var San.",
    unsubscribeLink: "Unsubscribe from newsletter",
  },
  fr: {
    subject: "Bienvenue dans la famille Var San !",
    kicker: "DISTRIBUIDORA VAR SAN",
    heading: "Bienvenue dans la<br />famille Var San !",
    welcomeIntro: "Nous sommes ravis de vous accueillir.",
    p1: "Aujourd'hui, nous ne commençons pas seulement à partager des informations avec vous ; nous commençons également à tisser une relation que nous espérons voir grandir avec le temps.",
    p2: "Chez <strong style=\"color:#0a1f44;\">Distribuidora Var San</strong>, nous sommes convaincus que derrière chaque produit, chaque commande et chaque service se trouve l'essentiel : les personnes. Vous compter parmi nous signifie vous ouvrir grand les portes de notre famille.",
    p3: "Nous souhaitons que vous trouviez en Var San une entreprise proche, responsable et dévouée. Un lieu où vous découvrirez des solutions fiables et où une équipe attentive sera toujours prête à vous accompagner.",
    p4: "À travers nos messages, vous découvrirez nos nouveautés, produits spécialisés et offres conçues pour évoluer ensemble.",
    quote: "Parce qu'une entreprise peut fournir des produits, mais une famille bâtit des liens.",
    p5: "Et nous souhaitons que cette relation aille bien au-delà d'un simple échange de courriels.",
    p6: "Nous voulons que chaque échange et chaque attention renforcent une relation solide et durable, fondée sur la confiance mutuelle.",
    p7: "Et nous désirons la construire chaque jour à vos côtés.",
    p8: "Merci pour votre confiance en <strong style=\"color:#0a1f44;\">Distribuidora Var San</strong> et de nous permettre de vous accueillir dans cet espace qui est désormais aussi le vôtre.",
    closingTitle: "Bienvenue dans la famille Var San.",
    closingSubtitle: "Nous sommes très heureux de vous compter parmi nous.",
    companyName: "Distribuidora Var San",
    tagline: "Bien plus que de la distribution, nous bâtissons la confiance.",
    contactPrompt: "Pour toute question ou demande, n'hésitez pas à nous contacter :",
    footerNotice: "Vous avez reçu cet e-mail car vous vous êtes inscrit sur le site de Distribuidora Var San.",
    unsubscribeLink: "Se désabonner",
  },
  pt: {
    subject: "Bem-vindo à família Var San!",
    kicker: "DISTRIBUIDORA VAR SAN",
    heading: "Bem-vindo à<br />família Var San!",
    welcomeIntro: "Estamos muito felizes em dar-lhe as boas-vindas.",
    p1: "Hoje não apenas começamos a compartilhar novidades com você; começamos também a construir um relacionamento que esperamos que cresça com o tempo.",
    p2: "Na <strong style=\"color:#0a1f44;\">Distribuidora Var San</strong>, acreditamos que por trás de cada produto, pedido e serviço está o que há de mais valioso: as pessoas. Ter você conosco significa abrir-lhe as portas da nossa família.",
    p3: "Queremos que encontre na Var San uma empresa próxima, responsável e comprometida. Um espaço onde possa conhecer novas soluções, produtos especializados e contar com atendimento dedicado.",
    p4: "Através de nossas mensagens, você acompanhará lançamentos, linhas institucionais e tudo o que preparamos para crescer junto com quem confia em nós.",
    quote: "Porque uma empresa pode fornecer produtos, mas uma família constrói vínculos.",
    p5: "E não queremos que este relacionamento fique restrito apenas a um e-mail.",
    p6: "Queremos que a Var San vá além das compras, proporcionando experiências positivas e alicerçadas na confiança mútua.",
    p7: "E queremos construir esses laços junto com você.",
    p8: "Obrigado por confiar na <strong style=\"color:#0a1f44;\">Distribuidora Var San</strong> e por nos permitir recebê-lo neste espaço que agora também é seu.",
    closingTitle: "Bem-vindo à família Var San.",
    closingSubtitle: "É uma grande satisfação ter você aqui.",
    companyName: "Distribuidora Var San",
    tagline: "Mais do que distribuição, construímos confiança.",
    contactPrompt: "Para qualquer dúvida ou comentário, entre em contato conosco:",
    footerNotice: "Você recebeu este e-mail porque se cadastrou no site da Distribuidora Var San.",
    unsubscribeLink: "Cancelar minha inscrição",
  },
  it: {
    subject: "Benvenuto nella famiglia Var San!",
    kicker: "DISTRIBUIDORA VAR SAN",
    heading: "Benvenuto nella<br />famiglia Var San!",
    welcomeIntro: "Siamo felici di darti il benvenuto.",
    p1: "Oggi non iniziamo soltanto a condividere informazioni con te; iniziamo anche a costruire una relazione destinata a crescere nel tempo.",
    p2: "In <strong style=\"color:#0a1f44;\">Distribuidora Var San</strong> crediamo che dietro ogni prodotto, ordine e servizio ci siano le persone. Averti qui con noi significa aprirti le porte della nostra famiglia.",
    p3: "Vogliamo che tu trovi in Var San un partner vicino, trasparente e dedicato. Un luogo dove scoprire nuove soluzioni e contare sempre su persone pronte ad ascoltarti.",
    p4: "Attraverso le nostre comunicazioni scoprirai novità, prodotti selezionati e opportunità per crescere insieme.",
    quote: "Perché un'azienda può offrire prodotti, ma una famiglia costruisce legami.",
    p5: "Ma non desideriamo che questo rapporto si limiti a un semplice scambio di e-mail.",
    p6: "Vogliamo che ogni contatto ed esperienza crei valore positivo e consolidi una fiducia reciproca e duratura.",
    p7: "E desideriamo costruirla insieme a te.",
    p8: "Grazie per la fiducia in <strong style=\"color:#0a1f44;\">Distribuidora Var San</strong> e per permetterci di darti il benvenuto in questo spazio che da oggi è anche tuo.",
    closingTitle: "Benvenuto nella famiglia Var San.",
    closingSubtitle: "Siamo lieti di averti con noi.",
    companyName: "Distribuidora Var San",
    tagline: "Più che distribuzione, costruiamo fiducia.",
    contactPrompt: "Per qualsiasi dubbio o informazione, puoi contattarci qui:",
    footerNotice: "Hai ricevuto questa e-mail perché ti sei iscritto al sito di Distribuidora Var San.",
    unsubscribeLink: "Annulla iscrizione",
  },
  "zh-CN": {
    subject: "欢迎加入 Var San 大家庭！",
    kicker: "DISTRIBUIDORA VAR SAN",
    heading: "欢迎加入<br />Var San 大家庭！",
    welcomeIntro: "我们非常荣幸能向您致以最诚挚的欢迎。",
    p1: "今天，我们不仅开始与您分享最新资讯，更开启了一段我们希望随着时间不断深化的长远伙伴关系。",
    p2: "在 <strong style=\"color:#0a1f44;\">Distribuidora Var San</strong>，我们深信在每一款产品、每一笔订单与每一项服务背后，最核心的始终是人。您的加入对我们而言意义非凡，这代表着我们向您敞开了家族的大门。",
    p3: "我们希望您在 Var San 找到一家亲近、负责且值得信赖的企业。在这里，您可以探索优质解决方案，并随时感受到专业团队真诚的支持与协助。",
    p4: "通过我们的消息，您将及时了解最新产品、优惠活动以及我们与信赖我们的客户共同成长的各项成果。",
    quote: "因为企业可以提供产品，而家族能够筑起温暖与信任的纽带。",
    p5: "我们希望这段关系绝不仅止于往来的电子邮件。",
    p6: "我们致力于让每一次合作与服务体验都能带来长久的价值，建立在坚如磐石的互信之上。",
    p7: "我们期待与您携手共建长远未来。",
    p8: "衷心感谢您对 <strong style=\"color:#0a1f44;\">Distribuidora Var San</strong> 的信任，欢迎来到属于您的新家园。",
    closingTitle: "欢迎加入 Var San 大家庭。",
    closingSubtitle: "很高兴有您的陪伴。",
    companyName: "Distribuidora Var San",
    tagline: "不仅是专业分销，更是信赖的基石。",
    contactPrompt: "如有任何疑问或建议，欢迎随时与我们联系：",
    footerNotice: "您收到此邮件是因为您订阅了 Distribuidora Var San 官网资讯。",
    unsubscribeLink: "取消订阅",
  },
  "zh-TW": {
    subject: "歡迎加入 Var San 大家庭！",
    kicker: "DISTRIBUIDORA VAR SAN",
    heading: "歡迎加入<br />Var San 大家庭！",
    welcomeIntro: "我們非常榮幸向您致以最誠摯的歡迎。",
    p1: "今天，我們不僅開始與您分享最新資訊，更開啟了一段我們期盼隨著時間持續深化的長遠夥伴關係。",
    p2: "在 <strong style=\"color:#0a1f44;\">Distribuidora Var San</strong>，我們深信在每一款產品、每一筆訂單與每一項服務背後，最核心的始終是人。您的加入對我們意義非凡，象徵著我們向您敞開了家族的大門。",
    p3: "我們期盼您在 Var San 找到一間值得信賴、溫暖且負責的企業。在這裡，您可以探索專業解決方案，隨時享有專業團隊的貼心協助。",
    p4: "透過我們的訊息，您將掌握最新產品動態、專屬優惠以及我們與夥伴共同成長的精彩歷程。",
    quote: "因為企業可以供應產品，而家族能締造溫暖與信賴的緊密連結。",
    p5: "我們期盼這段關係不僅僅是一封封往來的電子郵件。",
    p6: "我們致力於讓每一次的合作與服務體驗都能留下深厚價值，建立起以信任為基石的永續夥伴關係。",
    p7: "我們衷心期待與您攜手同行。",
    p8: "感謝您對 <strong style=\"color:#0a1f44;\">Distribuidora Var San</strong> 的信賴，歡迎來到這個自今日起也屬於您的空間。",
    closingTitle: "歡迎加入 Var San 大家庭。",
    closingSubtitle: "非常高興能與您同行。",
    companyName: "Distribuidora Var San",
    tagline: "不僅是專業經銷，更是信賴的堅實基石。",
    contactPrompt: "如有任何疑問或建議，歡迎隨時與我們聯繫：",
    footerNotice: "您收到此信件是因為您訂閱了 Distribuidora Var San 官方資訊。",
    unsubscribeLink: "取消訂閱",
  },
  ko: {
    subject: "Var San 가족이 되신 것을 진심으로 환영합니다!",
    kicker: "DISTRIBUIDORA VAR SAN",
    heading: "Var San 가족이 되신 것을<br />진심으로 환영합니다!",
    welcomeIntro: "고객님을 맞이하게 되어 매우 기쁩니다.",
    p1: "오늘 우리는 유용한 정보를 공유할 뿐만 아니라, 시간이 지날수록 더욱 깊어질 소중한 신뢰 관계를 함께 만들어 나갑니다.",
    p2: "<strong style=\"color:#0a1f44;\">Distribuidora Var San</strong>은 모든 제품과 주문, 서비스 뒤에 가장 중요한 ‘사람’이 있다고 굳게 믿습니다. 고객님과 함께한다는 것은 단순한 연락처 추가가 아닌, 우리 가족의 문을 활짝 열어드리는 의미입니다.",
    p3: "고객님께서 언제나 곁에서 신뢰할 수 있는 책임감 있는 파트너를 발견하시길 바랍니다. 차별화된 솔루션을 확인하시고, 언제든 귀 기울여 도와드릴 준비가 되어 있는 든든한 팀을 만나보세요.",
    p4: "정기 소식을 통해 최신 제품 정보와 프로모션, 신뢰 속에 함께 성장하는 Var San의 다양한 소식을 가장 먼저 받아보실 수 있습니다.",
    quote: "기업은 제품을 공급하지만, 가족은 진정한 유대와 신뢰를 만듭니다.",
    p5: "우리의 만남이 단순한 이메일에만 머무르지 않기를 희망합니다.",
    p6: "모든 소통과 서비스 경험이 긍정적인 가치를 남기고 굳건한 신뢰로 이어지도록 최선을 다하겠습니다.",
    p7: "고객님과 함께 그 소중한 가치를 만들어 가고자 합니다.",
    p8: "<strong style=\"color:#0a1f44;\">Distribuidora Var San</strong>을 신뢰해 주셔서 감사드리며, 오늘부터 고객님의 공간이 될 이곳에 오신 것을 진심으로 환영합니다.",
    closingTitle: "Var San 가족이 되신 것을 환영합니다.",
    closingSubtitle: "고객님과 함께하게 되어 대단히 기쁩니다.",
    companyName: "Distribuidora Var San",
    tagline: "단순한 유통을 넘어, 신뢰를 만들어갑니다.",
    contactPrompt: "궁금한 점이나 의견이 있으시면 언제든지 문의해 주세요:",
    footerNotice: "본 이메일은 Distribuidora Var San 공식 사이트에서 구독을 신청하셨기에 발송되었습니다.",
    unsubscribeLink: "구독 취소",
  },
};

/**
 * Genera el correo de bienvenida oficial de Emilia en el idioma seleccionado.
 */
export function buildEmiliaWelcomeEmail(
  language: EmailLanguage = "es",
  params: WelcomeEmailParams,
): EmailContent {
  const tr = EMILIA_TRANSLATIONS[language] || EMILIA_TRANSLATIONS.es;
  const htmlLang = language === "en-GB" ? "en" : language;

  const html = `<!doctype html>
<html lang="${htmlLang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${tr.subject}</title>
</head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:Arial,Helvetica,sans-serif;color:#2c3e50;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0;padding:0;background:#f5f7fa;">
<tr>
<td align="center" style="padding:32px 16px;">

<!-- CONTENEDOR PRINCIPAL -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:720px;background:#ffffff;margin:0 auto;box-shadow:0 4px 20px rgba(10,31,68,0.06);border-radius:6px;overflow:hidden;">

<!-- ENCABEZADO INSTITUCIONAL -->
<tr>
<td style="background:#0a1f44;padding:48px 44px 42px;border-bottom:4px solid #c9a84c;">
<p style="margin:0 0 18px;color:#c9a84c;font-family:Consolas,'Courier New',monospace;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">
${tr.kicker}
</p>
<h1 style="margin:0;color:#ffffff;font-size:34px;line-height:1.2;font-weight:800;letter-spacing:-0.5px;">
${tr.heading}
</h1>
</td>
</tr>

<!-- CUERPO DE EMILIA -->
<tr>
<td style="padding:46px 44px 42px;">

<p style="margin:0 0 24px;color:#2c3e50;font-size:17px;line-height:1.75;">
<strong>${tr.welcomeIntro}</strong>
</p>

<p style="margin:0 0 24px;color:#526274;font-size:16px;line-height:1.8;">
${tr.p1}
</p>

<p style="margin:0 0 24px;color:#526274;font-size:16px;line-height:1.8;">
${tr.p2}
</p>

<p style="margin:0 0 24px;color:#526274;font-size:16px;line-height:1.8;">
${tr.p3}
</p>

<p style="margin:0 0 24px;color:#526274;font-size:16px;line-height:1.8;">
${tr.p4}
</p>

<!-- FRASE DESTACADA INSTITUCIONAL -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:34px 0;">
<tr>
<td style="border-left:4px solid #c9a84c;background:#f8fafc;padding:24px 26px;border-radius:0 4px 4px 0;">
<p style="margin:0;color:#0a1f44;font-size:17px;line-height:1.6;font-weight:700;font-style:italic;">
“${tr.quote}”
</p>
</td>
</tr>
</table>

<p style="margin:0 0 24px;color:#526274;font-size:16px;line-height:1.8;">
${tr.p5}
</p>

<p style="margin:0 0 24px;color:#526274;font-size:16px;line-height:1.8;">
${tr.p6}
</p>

<p style="margin:0 0 24px;color:#526274;font-size:16px;line-height:1.8;">
<strong style="color:#0a1f44;">
${tr.p7}
</strong>
</p>

<p style="margin:0 0 28px;color:#526274;font-size:16px;line-height:1.8;">
${tr.p8}
</p>

<!-- CIERRE -->
<p style="margin:0 0 8px;color:#0a1f44;font-size:22px;line-height:1.4;font-weight:800;">
${tr.closingTitle}
</p>

<p style="margin:0 0 34px;color:#66758a;font-size:16px;line-height:1.7;">
${tr.closingSubtitle}
</p>

<!-- FIRMA -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:1px solid #dce3eb;padding-top:24px;">
<tr>
<td>
<p style="margin:0 0 5px;color:#0a1f44;font-size:16px;font-weight:800;">
${tr.companyName}
</p>
<p style="margin:0 0 22px;color:#a88a3a;font-size:13px;font-weight:700;letter-spacing:.3px;">
${tr.tagline}
</p>
<p style="margin:0 0 8px;color:#66758a;font-size:13px;line-height:1.6;">
${tr.contactPrompt}
</p>
<p style="margin:0;">
<a href="mailto:distribuidora.varsan@outlook.com" style="color:#0a1f44;font-size:14px;font-weight:700;text-decoration:underline;">
distribuidora.varsan@outlook.com
</a>
</p>
</td>
</tr>
</table>

</td>
</tr>

<!-- PIE DE CORREO -->
<tr>
<td style="background:#0a1f44;padding:28px 44px;">
<p style="margin:0 0 10px;color:#ffffff;font-size:12px;line-height:1.6;">
${tr.footerNotice}
</p>
<p style="margin:0;">
<a href="${escapeHtml(params.unsubscribeUrl)}" style="color:#c9a84c;font-size:12px;text-decoration:underline;">
${tr.unsubscribeLink}
</a>
</p>
</td>
</tr>

</table>

</td>
</tr>
</table>
</body>
</html>`;

  const text = `${tr.subject}

${tr.kicker}

${tr.welcomeIntro}

${tr.p1}

${tr.p2.replace(/<[^>]+>/g, "")}

${tr.p3}

${tr.p4}

"${tr.quote}"

${tr.p5}

${tr.p6}

${tr.p7}

${tr.p8.replace(/<[^>]+>/g, "")}

${tr.closingTitle}
${tr.closingSubtitle}

${tr.companyName}
${tr.tagline}

${tr.contactPrompt}
distribuidora.varsan@outlook.com

${tr.unsubscribeLink}:
${params.unsubscribeUrl}`;

  return { subject: tr.subject, html, text };
}
