/* =========================================================
DISTRIBUIDORA VAR SAN
MAIN JAVASCRIPT
========================================================= */

"use strict";


/* =========================================================
ELEMENTOS
========================================================= */

const preloader = document.getElementById("preloader");
const navbar = document.getElementById("navbar");

const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

const contactForm = document.getElementById("contactForm");

const cookieBanner = document.getElementById("cookieBanner");
const acceptCookies = document.getElementById("acceptCookies");
const rejectCookies = document.getElementById("rejectCookies");


/* =========================================================
PRELOADER
========================================================= */

window.addEventListener("load", () => {

document.body.classList.add("loaded");

if (!preloader) return;

setTimeout(() => {

preloader.classList.add("preloader--hide");

setTimeout(() => {
preloader.style.display = "none";
}, 900);

}, 1300);

});


/* =========================================================
NAVBAR
========================================================= */

function updateNavbar() {

if (!navbar) return;

if (window.scrollY > 40) {

navbar.classList.add("navbar--scrolled");

} else {

navbar.classList.remove("navbar--scrolled");

}

}

updateNavbar();

window.addEventListener(
"scroll",
updateNavbar,
{ passive: true }
);


/* =========================================================
MENÚ MÓVIL
========================================================= */

function openMenu() {

if (!mobileMenu || !menuToggle) return;

mobileMenu.classList.add("mobile-menu--active");

menuToggle.classList.add("menu-toggle--active");

menuToggle.setAttribute(
"aria-expanded",
"true"
);

document.body.classList.add("menu-open");

}


function closeMenu() {

if (!mobileMenu || !menuToggle) return;

mobileMenu.classList.remove("mobile-menu--active");

menuToggle.classList.remove("menu-toggle--active");

menuToggle.setAttribute(
"aria-expanded",
"false"
);

document.body.classList.remove("menu-open");

}


function toggleMenu() {

if (!mobileMenu) return;

const menuIsOpen =
mobileMenu.classList.contains(
"mobile-menu--active"
);

if (menuIsOpen) {

closeMenu();

} else {

openMenu();

}

}


if (menuToggle) {

menuToggle.addEventListener(
"click",
toggleMenu
);

}


/* =========================================================
CERRAR MENÚ AL HACER CLICK EN LINK
========================================================= */

document
.querySelectorAll(".mobile-menu a")
.forEach(link => {

link.addEventListener(
"click",
closeMenu
);

});


/* =========================================================
CERRAR MENÚ CON ESC
========================================================= */

document.addEventListener(
"keydown",
event => {

if (event.key === "Escape") {

closeMenu();

}

}
);


/* =========================================================
CERRAR MENÚ SI CAMBIA A DESKTOP
========================================================= */

window.addEventListener(
"resize",
() => {

if (window.innerWidth > 900) {

closeMenu();

}

}
);


/* =========================================================
SMOOTH SCROLL
========================================================= */

document
.querySelectorAll('a[href^="#"]')
.forEach(anchor => {

anchor.addEventListener(
"click",
function(event) {

const href =
this.getAttribute("href");

if (
!href ||
href === "#"
) {
return;
}

const destination =
document.querySelector(href);

if (!destination) return;

event.preventDefault();

const navbarHeight =
navbar
? navbar.offsetHeight
: 0;

const destinationPosition =
destination
.getBoundingClientRect()
.top
+
window.scrollY
-
navbarHeight;

window.scrollTo({

top:
destinationPosition,

behavior:
"smooth"

});

}
);

});


/* =========================================================
REVEAL BÁSICO
FALLBACK SI GSAP NO CARGA
========================================================= */

function initBasicReveal() {

const elements =
document.querySelectorAll(
".reveal"
);

if (!elements.length) return;


const observer =
new IntersectionObserver(

entries => {

entries.forEach(
entry => {

if (
entry.isIntersecting
) {

entry.target
.classList
.add(
"reveal--visible"
);

observer.unobserve(
entry.target
);

}

}
);

},

{
threshold: 0.12,
rootMargin:
"0px 0px -40px 0px"
}

);


elements.forEach(
element => {

observer.observe(element);

}
);

}


/* =========================================================
GSAP
========================================================= */

function initGSAP() {

if (
typeof gsap === "undefined" ||
typeof ScrollTrigger === "undefined"
) {

initBasicReveal();

return;

}


gsap.registerPlugin(
ScrollTrigger
);


/* =====================================================
HERO ENTRANCE
===================================================== */

const heroTimeline =
gsap.timeline({

defaults: {
ease: "power3.out"
},

delay: 0.15

});


heroTimeline

.from(
".hero__eyebrow",
{
opacity: 0,
y: 20,
duration: 0.7
}
)

.from(
".hero__title",
{
opacity: 0,
y: 70,
duration: 1.1
},
"-=0.35"
)

.from(
".hero__bottom",
{
opacity: 0,
y: 35,
duration: 0.8
},
"-=0.6"
)

.from(
".hero__visual",
{
opacity: 0,
x: 70,
scale: 0.97,
duration: 1.2
},
"-=1"
)

.from(
".hero__floating",
{
opacity: 0,
y: 20,
stagger: 0.12,
duration: 0.6
},
"-=0.5"
)

.from(
".hero__scroll",
{
opacity: 0,
duration: 0.6
},
"-=0.3"
);


/* =====================================================
REVEAL GENERAL
===================================================== */

const revealElements =
gsap.utils.toArray(
".reveal"
);


revealElements.forEach(
element => {

gsap.fromTo(

element,

{
opacity: 0,
y: 55
},

{
opacity: 1,
y: 0,

duration: 1,

ease:
"power3.out",

scrollTrigger: {

trigger:
element,

start:
"top 88%",

once:
true

}

}

);

}
);


/* =====================================================
IMÁGENES — EFECTO PARALLAX
===================================================== */

gsap.utils
.toArray(
".intro__image img, .product-card__media img"
)
.forEach(image => {

gsap.fromTo(

image,

{
scale: 1.08
},

{
scale: 1,

ease: "none",

scrollTrigger: {

trigger:
image,

start:
"top bottom",

end:
"bottom top",

scrub:
1.2

}

}

);

});


/* =====================================================
MANIFESTO
===================================================== */

gsap.fromTo(

".manifesto__background-word",

{
xPercent: -4
},

{
xPercent: 4,

ease: "none",

scrollTrigger: {

trigger:
".manifesto",

start:
"top bottom",

end:
"bottom top",

scrub:
1

}

}

);


/* =====================================================
SECTORES
===================================================== */

const sectorRows =
gsap.utils.toArray(
".sector-row"
);


sectorRows.forEach(
(row, index) => {

gsap.fromTo(

row,

{
opacity: 0,
x: -35
},

{
opacity: 1,
x: 0,

duration: 0.8,

delay:
index * 0.04,

ease:
"power3.out",

scrollTrigger: {

trigger:
row,

start:
"top 90%",

once:
true

}

}

);

}
);


/* =====================================================
PROCESO
===================================================== */

gsap.utils
.toArray(
".process-step"
)
.forEach(
(step, index) => {

gsap.fromTo(

step,

{
opacity: 0,
y: 35
},

{
opacity: 1,
y: 0,

duration:
0.8,

delay:
index * 0.08,

ease:
"power3.out",

scrollTrigger: {

trigger:
step,

start:
"top 90%",

once:
true

}

}

);

}
);


/* =====================================================
REFRESH
===================================================== */

window.addEventListener(
"load",
() => {

ScrollTrigger.refresh();

}
);

}


/* =========================================================
INICIAR ANIMACIONES
========================================================= */

document.addEventListener(
"DOMContentLoaded",
initGSAP
);


/* =========================================================
FORMULARIO → WHATSAPP
========================================================= */

if (contactForm) {

contactForm.addEventListener(
"submit",
event => {

event.preventDefault();


const nombre =
document
.getElementById("nombre")
?.value
.trim();


const telefono =
document
.getElementById("telefono")
?.value
.trim();


const correo =
document
.getElementById("correo")
?.value
.trim();


const mensaje =
document
.getElementById("mensaje")
?.value
.trim();


if (
!nombre ||
!telefono ||
!mensaje
) {

alert(
"Por favor completa los campos requeridos."
);

return;

}


const whatsappMessage =
`Hola, Distribuidora Var San.

Me gustaría solicitar una cotización.

Nombre: ${nombre}
Teléfono: ${telefono}
Correo: ${correo || "No proporcionado"}

Productos / solicitud:
${mensaje}`;


const whatsappNumber =
"528332189032";


const whatsappURL =
`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;


window.open(
whatsappURL,
"_blank",
"noopener,noreferrer"
);

}
);

}


/* =========================================================
COOKIE BANNER
========================================================= */

const COOKIE_KEY =
"varsan_cookie_preference";


function hideCookieBanner() {

if (!cookieBanner) return;

cookieBanner.classList.add(
"cookie-banner--hide"
);


setTimeout(
() => {

cookieBanner.style.display =
"none";

},
500
);

}


function showCookieBanner() {

if (!cookieBanner) return;

cookieBanner.style.display =
"flex";


requestAnimationFrame(
() => {

cookieBanner.classList.add(
"cookie-banner--visible"
);

}
);

}


function initializeCookies() {

if (!cookieBanner) return;


const preference =
localStorage.getItem(
COOKIE_KEY
);


if (preference) {

cookieBanner.style.display =
"none";

return;

}


setTimeout(
showCookieBanner,
1700
);

}


if (acceptCookies) {

acceptCookies.addEventListener(
"click",
() => {

localStorage.setItem(
COOKIE_KEY,
"accepted"
);

hideCookieBanner();

}
);

}


if (rejectCookies) {

rejectCookies.addEventListener(
"click",
() => {

localStorage.setItem(
COOKIE_KEY,
"rejected"
);

hideCookieBanner();

}
);

}


document.addEventListener(
"DOMContentLoaded",
initializeCookies
);


/* =========================================================
PRODUCT CARD HOVER
========================================================= */

const productCards =
document.querySelectorAll(
".product-card"
);


productCards.forEach(card => {

const image =
card.querySelector(
".product-card__media img"
);


if (!image) return;


card.addEventListener(
"mouseenter",
() => {

image.style.transform =
"scale(1.045)";

}
);


card.addEventListener(
"mouseleave",
() => {

image.style.transform =
"";

}
);

});


/* =========================================================
SECTOR ROW HOVER
========================================================= */

document
.querySelectorAll(
".sector-row"
)
.forEach(row => {

const arrow =
row.querySelector("i");


if (!arrow) return;


row.addEventListener(
"mouseenter",
() => {

arrow.style.transform =
"translateX(8px)";

}
);


row.addEventListener(
"mouseleave",
() => {

arrow.style.transform =
"translateX(0)";

}
);

});


/* =========================================================
MAGNETIC BUTTONS
SOLO DISPOSITIVOS CON MOUSE
========================================================= */

const canHover =
window.matchMedia(
"(hover: hover) and (pointer: fine)"
).matches;


if (canHover) {

const magneticElements =
document.querySelectorAll(
".button--gold, .round-link, .form-submit"
);


magneticElements.forEach(
element => {

element.addEventListener(
"mousemove",
event => {

const rect =
element
.getBoundingClientRect();


const x =
event.clientX
-
rect.left
-
rect.width / 2;


const y =
event.clientY
-
rect.top
-
rect.height / 2;


element.style.transform =
`translate(${x * 0.08}px, ${y * 0.08}px)`;

}
);


element.addEventListener(
"mouseleave",
() => {

element.style.transform =
"translate(0, 0)";

}
);

}
);

}


/* =========================================================
REDUCED MOTION
========================================================= */

const reducedMotion =
window.matchMedia(
"(prefers-reduced-motion: reduce)"
);


if (reducedMotion.matches) {

document
.documentElement
.classList
.add(
"reduced-motion"
);

}
