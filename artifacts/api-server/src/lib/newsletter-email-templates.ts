interface WelcomeEmailParams {
unsubscribeUrl: string;
}

interface EmailContent {
subject: string;
html: string;
text: string;
}

/**
* Correo de bienvenida enviado automáticamente al confirmarse una nueva
* suscripción.
*/
export function buildWelcomeEmail({
unsubscribeUrl,
}: WelcomeEmailParams): EmailContent {
const subject = "¡Bienvenido a la familia Var San!";

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>¡Bienvenido a la familia Var San!</title>
</head>

<body style="margin:0;padding:0;background:#f5f7fa;font-family:Arial,Helvetica,sans-serif;color:#2c3e50;">

<table
role="presentation"
width="100%"
cellspacing="0"
cellpadding="0"
border="0"
style="margin:0;padding:0;background:#f5f7fa;"
>
<tr>
<td align="center" style="padding:32px 16px;">

<!-- CONTENEDOR PRINCIPAL -->
<table
role="presentation"
width="100%"
cellspacing="0"
cellpadding="0"
border="0"
style="max-width:720px;background:#ffffff;margin:0 auto;"
>

<!-- ENCABEZADO -->
<tr>
<td
style="
background:#0a1f44;
padding:48px 44px 42px;
border-bottom:4px solid #c9a84c;
"
>
<p
style="
margin:0 0 18px;
color:#c9a84c;
font-family:Consolas,'Courier New',monospace;
font-size:12px;
font-weight:700;
letter-spacing:3px;
text-transform:uppercase;
"
>
DISTRIBUIDORA VAR SAN
</p>

<h1
style="
margin:0;
color:#ffffff;
font-size:36px;
line-height:1.15;
font-weight:800;
letter-spacing:-1px;
"
>
¡Bienvenido a la<br />
familia Var San!
</h1>
</td>
</tr>

<!-- CONTENIDO -->
<tr>
<td style="padding:46px 44px 42px;">

<p
style="
margin:0 0 24px;
color:#2c3e50;
font-size:17px;
line-height:1.75;
"
>
<strong>Nos alegra mucho darte la bienvenida.</strong>
</p>

<p
style="
margin:0 0 24px;
color:#526274;
font-size:16px;
line-height:1.8;
"
>
Hoy no solamente comenzamos a compartir información contigo;
comenzamos también a construir una relación que esperamos que
crezca con el tiempo.
</p>

<p
style="
margin:0 0 24px;
color:#526274;
font-size:16px;
line-height:1.8;
"
>
En <strong style="color:#0a1f44;">Distribuidora Var San</strong>
creemos que detrás de cada producto, cada pedido y cada
servicio existe algo mucho más importante: las personas.
Por eso, para nosotros, tenerte aquí significa mucho más que
contar con un nuevo contacto. Significa abrirte las puertas
de nuestra familia.
</p>

<p
style="
margin:0 0 24px;
color:#526274;
font-size:16px;
line-height:1.8;
"
>
Queremos que encuentres en Var San una empresa cercana,
responsable y comprometida contigo. Un lugar donde puedas
conocer nuevas opciones, descubrir productos, encontrar
oportunidades y, sobre todo, sentir que siempre hay alguien
dispuesto a escucharte y ayudarte.
</p>

<p
style="
margin:0 0 24px;
color:#526274;
font-size:16px;
line-height:1.8;
"
>
A través de nuestros mensajes podrás conocer nuestras
novedades, nuevos productos, promociones y todo aquello que
vayamos construyendo para seguir creciendo junto a quienes
confían en nosotros.
</p>

<!-- FRASE DESTACADA -->
<table
role="presentation"
width="100%"
cellspacing="0"
cellpadding="0"
border="0"
style="margin:34px 0;"
>
<tr>
<td
style="
border-left:4px solid #c9a84c;
background:#f5f7fa;
padding:24px 26px;
"
>
<p
style="
margin:0;
color:#0a1f44;
font-size:18px;
line-height:1.6;
font-weight:700;
"
>
Porque una empresa puede ofrecer productos,
pero una familia construye vínculos.
</p>
</td>
</tr>
</table>

<p
style="
margin:0 0 24px;
color:#526274;
font-size:16px;
line-height:1.8;
"
>
Pero esta relación no queremos que se quede solamente en un
correo.
</p>

<p
style="
margin:0 0 24px;
color:#526274;
font-size:16px;
line-height:1.8;
"
>
Queremos que Var San trascienda más allá de una compra. Que
cada experiencia, cada atención y cada contacto deje algo
positivo y nos permita construir una relación basada en la
confianza.
</p>

<p
style="
margin:0 0 24px;
color:#526274;
font-size:16px;
line-height:1.8;
"
>
<strong style="color:#0a1f44;">
Y nosotros queremos construirlos contigo.
</strong>
</p>

<p
style="
margin:0 0 28px;
color:#526274;
font-size:16px;
line-height:1.8;
"
>
Gracias por confiar en
<strong style="color:#0a1f44;">
Distribuidora Var San
</strong>
y por permitirnos darte la bienvenida a este espacio que,
desde hoy, también es tuyo.
</p>

<!-- CIERRE -->
<p
style="
margin:0 0 8px;
color:#0a1f44;
font-size:22px;
line-height:1.4;
font-weight:800;
"
>
Bienvenido a la familia Var San.
</p>

<p
style="
margin:0 0 34px;
color:#66758a;
font-size:16px;
line-height:1.7;
"
>
Nos alegra tenerte aquí.
</p>

<!-- FIRMA -->
<table
role="presentation"
width="100%"
cellspacing="0"
cellpadding="0"
border="0"
style="border-top:1px solid #dce3eb;padding-top:24px;"
>
<tr>
<td>
<p
style="
margin:0 0 5px;
color:#0a1f44;
font-size:16px;
font-weight:800;
"
>
Distribuidora Var San
</p>

<p
style="
margin:0 0 22px;
color:#a88a3a;
font-size:13px;
font-weight:700;
letter-spacing:.3px;
"
>
Más que distribución, construimos confianza.
</p>

<p
style="
margin:0 0 8px;
color:#66758a;
font-size:13px;
line-height:1.6;
"
>
Para cualquier duda o comentario, puedes comunicarte
con nosotros:
</p>

<p style="margin:0;">
<a
href="mailto:distribuidora.varsan@outlook.com"
style="
color:#0a1f44;
font-size:14px;
font-weight:700;
text-decoration:underline;
"
>
distribuidora.varsan@outlook.com
</a>
</p>
</td>
</tr>
</table>

</td>
</tr>

<!-- PIE -->
<tr>
<td
style="
background:#0a1f44;
padding:28px 44px;
"
>
<p
style="
margin:0 0 10px;
color:#ffffff;
font-size:12px;
line-height:1.6;
"
>
Recibiste este correo porque te suscribiste al sitio de
Distribuidora Var San.
</p>

<p style="margin:0;">
<a
href="${unsubscribeUrl}"
style="
color:#c9a84c;
font-size:12px;
text-decoration:underline;
"
>
Cancelar mi suscripción
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

const text = `¡Bienvenido a la familia Var San!

DISTRIBUIDORA VAR SAN

Nos alegra mucho darte la bienvenida.

Hoy no solamente comenzamos a compartir información contigo; comenzamos también a construir una relación que esperamos que crezca con el tiempo.

En Distribuidora Var San creemos que detrás de cada producto, cada pedido y cada servicio existe algo mucho más importante: las personas. Por eso, para nosotros, tenerte aquí significa mucho más que contar con un nuevo contacto. Significa abrirte las puertas de nuestra familia.

Queremos que encuentres en Var San una empresa cercana, responsable y comprometida contigo. Un lugar donde puedas conocer nuevas opciones, descubrir productos, encontrar oportunidades y, sobre todo, sentir que siempre hay alguien dispuesto a escucharte y ayudarte.

A través de nuestros mensajes podrás conocer nuestras novedades, nuevos productos, promociones y todo aquello que vayamos construyendo para seguir creciendo junto a quienes confían en nosotros.

Pero esta relación no queremos que se quede solamente en un correo.

Queremos que Var San trascienda más allá de una compra. Que cada experiencia, cada atención y cada contacto deje algo positivo y nos permita construir una relación basada en la confianza.

Porque una empresa puede ofrecer productos, pero una familia construye vínculos.

Y nosotros queremos construirlos contigo.

Gracias por confiar en Distribuidora Var San y por permitirnos darte la bienvenida a este espacio que, desde hoy, también es tuyo.

Bienvenido a la familia Var San.

Nos alegra tenerte aquí.

Distribuidora Var San
Más que distribución, construimos confianza.

Para cualquier duda o comentario, puedes comunicarte con nosotros:

distribuidora.varsan@outlook.com

Cancelar mi suscripción:
${unsubscribeUrl}`;

return { subject, html, text };
}