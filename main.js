
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

