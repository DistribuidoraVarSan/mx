
        // Splash Screen
        setTimeout(() => {
            document.getElementById('splash-screen').classList.add('hidden');
        }, 3000);

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Mobile menu toggle
        document.getElementById('navToggle').addEventListener('click', () => {
            document.getElementById('navLinks').classList.toggle('active');
        });

        // Close mobile menu on link click
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                document.getElementById('navLinks').classList.remove('active');
            });
        });

        // Scroll reveal animation
        const revealElements = document.querySelectorAll('.reveal');
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        revealElements.forEach(el => revealObserver.observe(el));

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
function enviarWhatsApp(e){

e.preventDefault();

let nombre = document.querySelector('.form-group input[type="text"]').value;
let correo = document.querySelector('.form-group input[type="email"]').value;
let telefono = document.querySelector('.form-group input[type="tel"]').value;
let comentarios = document.querySelector('.form-group textarea').value;


let mensaje =
`Hola, Distribuidora Var San. Me gustaría solicitar información.

Nombre: ${nombre}

Correo: ${correo}

Teléfono: ${telefono}

Comentarios:
${comentarios}`;


let numero = "528332189032";

let url = "https://wa.me/" + numero + "?text=" + encodeURIComponent(mensaje);

window.open(url, "_blank");

}

/*==================================================
FAMILIA VAR SAN - SLIDER
==================================================*/

const familySlides = [
{
title: "CONFIANZA",
text: "Hoy atendemos desde pequeños negocios hasta empresas que buscan un proveedor confiable para crecer."
},
{
title: "RESPALDO",
text: "Estamos presentes desde la primera cotización hasta la entrega de cada pedido."
},
{
title: "RELACIÓN",
text: "No buscamos una sola venta. Buscamos construir relaciones duraderas con cada cliente."
},
{
title: "CRECER",
text: "Cuando nuestros clientes crecen, sabemos que estamos haciendo bien nuestro trabajo."
},
{
title: "BIENVENIDO",
text: "Gracias por considerar a Distribuidora Var San como parte de tu empresa."
}
];

const familyTitle = document.getElementById("familyTitle");
const familyText = document.getElementById("familyText");

const familyPrev = document.getElementById("familyPrev");
const familyNext = document.getElementById("familyNext");

const familyDots = document.querySelectorAll(".family-dots span");

let familyIndex = 0;

function updateFamilySlide(){

familyTitle.style.opacity="0";
familyText.style.opacity="0";

setTimeout(()=>{

familyTitle.textContent=familySlides[familyIndex].title;
familyText.textContent=familySlides[familyIndex].text;

familyTitle.style.opacity="1";
familyText.style.opacity="1";

familyDots.forEach(dot=>dot.classList.remove("active"));
familyDots[familyIndex].classList.add("active");

},180);

}

familyNext.addEventListener("click",()=>{

familyIndex++;

if(familyIndex>=familySlides.length){

familyIndex=0;

}

updateFamilySlide();

});

familyPrev.addEventListener("click",()=>{

familyIndex--;

if(familyIndex<0){

familyIndex=familySlides.length-1;

}

updateFamilySlide();

});


/*==================================================
WHY VAR SAN - GSAP
==================================================*/

const whySlides = [
{
icon:"🛡️",
title:"Amplio inventario",
text:"Miles de productos disponibles para responder con rapidez a las necesidades de distintos sectores."
},
{
icon:"🏆",
title:"Marcas reconocidas",
text:"Trabajamos con fabricantes de prestigio para ofrecer soluciones confiables y de alto desempeño."
},
{
icon:"🤝",
title:"Atención personalizada",
text:"Escuchamos las necesidades de cada cliente para brindar asesoría y soluciones a la medida."
},
{
icon:"🚚",
title:"Entregas confiables",
text:"Coordinamos cada pedido con compromiso para que recibas tus productos en tiempo y forma."
},
{
icon:"📦",
title:"Soluciones integrales",
text:"Desde seguridad industrial hasta línea médica, reunimos todo lo que tu empresa necesita en un solo lugar."
},
{
icon:"💙",
title:"Compromiso a largo plazo",
text:"Buscamos construir relaciones duraderas basadas en confianza, servicio y resultados."
}
];

let currentWhy = 0;

const card = document.querySelector(".why-card");
const icon = document.getElementById("whyIcon");
const title = document.getElementById("whyTitle");
const text = document.getElementById("whyText");

const prev = document.querySelector(".why-arrow.prev");
const next = document.querySelector(".why-arrow.next");

const dots = document.querySelectorAll(".why-dots .dot");

function updateWhy(index){

gsap.to(card,{
duration:.35,
scale:.92,
opacity:0,
y:30,
filter:"blur(10px)",
ease:"power2.in",

onComplete:()=>{

icon.textContent=whySlides[index].icon;
title.textContent=whySlides[index].title;
text.textContent=whySlides[index].text;

dots.forEach(dot=>dot.classList.remove("active"));
dots[index].classList.add("active");

gsap.fromTo(card,
{
scale:.92,
opacity:0,
y:-30,
filter:"blur(10px)"
},
{
duration:.55,
scale:1,
opacity:1,
y:0,
filter:"blur(0px)",
ease:"power3.out"
});

gsap.from(icon,{
duration:.6,
rotation:-20,
scale:.7,
ease:"back.out(2)"
});

}

});

}

next.addEventListener("click",()=>{

currentWhy++;

if(currentWhy>=whySlides.length){

currentWhy=0;

}

updateWhy(currentWhy);

});

prev.addEventListener("click",()=>{

currentWhy--;

if(currentWhy<0){

currentWhy=whySlides.length-1;

}

updateWhy(currentWhy);

});
