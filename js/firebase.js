
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
initializeAppCheck,
ReCaptchaEnterpriseProvider
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app-check.js";

import {
getAI,
getGenerativeModel,
GoogleAIBackend
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-ai.js";

  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-analytics.js";
import {
getAuth,
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
signOut,
onAuthStateChanged,
GoogleAuthProvider,
signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyATf3RVsdICF5fofg5r7sQiFodywn2O3sQ",
    authDomain: "distribuidora-var-san.firebaseapp.com",
    projectId: "distribuidora-var-san",
    storageBucket: "distribuidora-var-san.firebasestorage.app",
    messagingSenderId: "413139004866",
    appId: "1:413139004866:web:8d4ef20982bdfd278dfa5b",
    measurementId: "G-KEQXE5DMCP"
  };

  // Initialize Firebase
self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  const app = initializeApp(firebaseConfig);
// App Check - modo de desarrollo local

const appCheck = initializeAppCheck(app, {
provider: new ReCaptchaEnterpriseProvider("6LeWf3ctAAAAANEe3p1VYDWJNFUqb1pbKl4FaF7b"),
isTokenAutoRefreshEnabled: true
});

// Firebase AI Logic
const ai = getAI(app, {
backend: new GoogleAIBackend()
});

const model = getGenerativeModel(ai, {
model: "gemini-3.6-flash"
});


const analytics = getAnalytics(app);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);



// =========================================================
// PRUEBA DE CONEXIÓN CON GEMINI
// =========================================================

async function probarGemini() {

try {

const result = await model.generateContent(
"Responde únicamente: Asistente Var San conectado correctamente."
);

const response = result.response;
const text = response.text();

console.log("RESPUESTA GEMINI:", text);

} catch (error) {

console.error("ERROR DE GEMINI:", error);

}

}

probarGemini();

async function preguntarAsistente(mensaje) {
try {

const result = await model.generateContent(`
Eres el Asistente Virtual oficial de Distribuidora Var San.

Tu función es atender a los clientes de manera profesional, amable, clara y natural.

========================
INFORMACIÓN DE CONTACTO
========================

Teléfono y WhatsApp:
+52 833 102 2331

Correo electrónico:
distribuidora.varsan@outlook.com

Cuando un cliente solicite el teléfono, WhatsApp o correo electrónico,
proporciona directamente estos datos.

No digas que no cuentas con esta información porque sí está disponible.

========================
PRODUCTOS Y CATÁLOGO
========================

Distribuidora Var San comercializa soluciones e insumos para empresas.

Las principales categorías que maneja son:

- Guantes de seguridad
- Protección respiratoria
- Protección ocular
- Protección auditiva
- Cascos y protección para la cabeza
- Protección contra caídas y trabajo en alturas
- Ropa industrial
- Ropa y artículos desechables
- Impermeables
- Calzado industrial
- Equipo ergonómico
- Chalecos y seguridad vial
- Conos, trafitambos, postes, cintas, cadenas y señalización
- Bloqueo y etiquetado de seguridad
- Insumos de limpieza e higiene
- Productos de protección personal
- Insumos médicos
- Recolectores para residuos
- Bolsas para RPBI y productos relacionados con manejo de residuos biológico-infecciosos

Dentro de estas categorías existen diferentes modelos, materiales,
presentaciones y especificaciones.

Ejemplos de familias disponibles en el catálogo:

Guantes:
anticorte, recubiertos, nitrilo, látex, PVC, desechables,
para químicos, textiles, carnaza y piel.

Protección respiratoria:
mascarillas, respiradores, filtros, cartuchos,
válvulas y accesorios.

Protección ocular:
lentes de seguridad, goggles, caretas,
micas y protección para soldadura.

Protección auditiva:
orejeras y tapones auditivos.

Protección para cabeza:
cascos de seguridad, suspensiones,
barbiquejos y accesorios.

Trabajo en alturas:
arneses, líneas de vida, dispositivos retráctiles,
eslingas, absorbedores y sistemas de anclaje.

Ropa y protección industrial:
ropa de mezclilla para trabajo, prendas desechables,
overoles, batas, cofias, cubrezapatos, impermeables,
calzado industrial y elementos ergonómicos.

Seguridad vial:
chalecos reflejantes, conos, cintas delimitadoras,
cadenas, postes, trafitambos, mallas, torretas,
vialetas, triángulos y otros elementos de señalización.

Bloqueo y etiquetado:
candados y dispositivos de bloqueo y etiquetado
para seguridad industrial.

Área médica:
insumos médicos, recolectores, bolsas para RPBI
y productos relacionados.

IMPORTANTE:
Esta información describe las familias y tipos de productos
que maneja Distribuidora Var San.

No significa que todos los modelos tengan existencia inmediata.

Si el cliente pregunta si venden un TIPO de producto incluido
en estas categorías, puedes confirmar que Distribuidora Var San
maneja esa clase de producto.

Si pregunta por un modelo, medida, talla, color, cantidad,
precio o existencia específica y esa información no aparece aquí,
indica que es necesario consultar disponibilidad.

========================
REGLAS DE RESPUESTA
========================

1. Responde en español, salvo que el cliente escriba en otro idioma.

2. Sé profesional, amable y conciso.

3. No inventes precios.

4. No inventes existencias.

5. No inventes promociones.

6. No inventes horarios, direcciones, cobertura de entrega
ni condiciones comerciales que no estén indicadas aquí.

7. No digas:
"un asesor se pondrá en contacto contigo"
porque este chat no tiene capacidad para contactar automáticamente
a una persona.

8. Tampoco digas:
"puedo canalizarte con un asesor"
si realmente no existe una función en el chat para hacerlo.

9. Cuando sea necesario recibir atención humana, proporciona
los medios reales de contacto:

WhatsApp/teléfono: +52 833 102 2331
Correo: distribuidora.varsan@outlook.com

10. Si preguntan "¿qué venden?", "¿qué productos manejan?"
o algo similar, responde primero con las categorías principales.
No enumeres cientos de productos.

11. Si preguntan por una categoría concreta, por ejemplo
"¿manejan cascos?", "¿tienen guantes?" o "¿venden protección respiratoria?",
explica brevemente los tipos de productos que se manejan
dentro de esa categoría.

12. Si preguntan por un producto específico que no aparece
en la información proporcionada, no inventes. Indica que no puedes
confirmarlo y proporciona los datos de contacto si necesitan verificarlo.

13. Evita respuestas robóticas o excesivamente largas.

14. No utilices Markdown innecesario. Evita mostrar símbolos como
** alrededor de las palabras. Escribe texto limpio para un chat web.

========================
MENSAJE DEL CLIENTE
========================

${mensaje}
`);

return result.response.text();

} catch (error) {

console.error("ERROR DEL ASISTENTE:", error);

return "Lo sentimos, no pude procesar tu consulta en este momento. Puedes comunicarte con Distribuidora Var San al +52 833 102 2331 o escribir a distribuidora.varsan@outlook.com.";
}
}

window.preguntarAsistente = preguntarAsistente;


// =========================================================
// =========================================================
// MI CUENTA / PANEL DE USUARIO
// =========================================================

const accountOverlay = document.getElementById("accountOverlay");
const accountMenu = document.getElementById("accountMenu");

const openAccount = document.getElementById("openAccount");
const closeAccount = document.getElementById("closeAccount");

let userLogged = false;

if (openAccount) {

    openAccount.addEventListener("click", () => {

        if (userLogged) {

            accountMenu.classList.toggle("show");

        } else {

            accountOverlay.classList.add("open");
            document.body.style.overflow = "hidden";

        }

    });

}


if (closeAccount && accountOverlay) {
    closeAccount.addEventListener("click", () => {
        accountOverlay.classList.remove("open");
        document.body.style.overflow = "";
    });
}


// CERRAR TOCANDO FUERA DE LA VENTANA

if (accountOverlay) {
    accountOverlay.addEventListener("click", (e) => {

        if (e.target === accountOverlay) {
            accountOverlay.classList.remove("open");
            document.body.style.overflow = "";
        }

    });
}


// CERRAR CON ESC

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape" && accountOverlay) {
        accountOverlay.classList.remove("open");
        document.body.style.overflow = "";
    }

});


// =========================================================
// CAMBIAR ENTRE INICIAR SESIÓN / CREAR CUENTA
// =========================================================

const accountTabs = document.querySelectorAll(".account-tab");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const accountTitle = document.getElementById("accountTitle");
const accountSubtitle = document.getElementById("accountSubtitle");

accountTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const selectedTab = tab.dataset.accountTab;

    // Quitar estado activo de las dos pestañas
    accountTabs.forEach((item) => {
      item.classList.remove("active");
    });

    // Activar la pestaña seleccionada
    tab.classList.add("active");

    // INICIAR SESIÓN
    if (selectedTab === "login") {
      loginForm.classList.remove("account-form--hidden");
      registerForm.classList.add("account-form--hidden");

      accountTitle.textContent = "Inicia sesión";
      accountSubtitle.textContent =
        "Accede a tu cuenta de Distribuidora Var San.";
    }

    // CREAR CUENTA
    if (selectedTab === "register") {
      loginForm.classList.add("account-form--hidden");
      registerForm.classList.remove("account-form--hidden");

      accountTitle.textContent = "Crea tu cuenta";
      accountSubtitle.textContent =
        "Regístrate para acceder al portal de clientes Var San.";
    }
  });
});

// =========================================================
// CREAR CUENTA EN FIREBASE
// =========================================================

if (registerForm) {

    registerForm.addEventListener("submit", async (event) => {

        event.preventDefault();

       const name =
    document.getElementById("registerName").value.trim();

const company =
    document.getElementById("registerCompany").value.trim();

const email =
    document.getElementById("registerEmail").value.trim();

const password =
    document.getElementById("registerPassword").value;
        try {

            const userCredential =
    await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );

const user = userCredential.user;

await setDoc(doc(db, "users", user.uid), {

    name: name,

    company: company,

    email: email,

    createdAt: serverTimestamp()

});

console.log("Documento guardado en Firestore:", user.uid);

console.log("Usuario creado:", user);

alert("Cuenta creada correctamente.");

accountOverlay.classList.remove("open");
document.body.style.overflow = "";

        } catch (error) {

            console.error(error);

            if (error.code === "auth/email-already-in-use") {
                alert("Este correo electrónico ya tiene una cuenta.");
            }

            else if (error.code === "auth/weak-password") {
                alert("La contraseña es demasiado débil.");
            }

            else if (error.code === "auth/invalid-email") {
                alert("El correo electrónico no es válido.");
            }

            else {
                alert("No se pudo crear la cuenta: " + error.message);
            }

        }

    });

}


// =========================================================
// INICIAR SESIÓN
// =========================================================

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;

        try {

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            console.log(
                "Sesión iniciada:",
                userCredential.user
            );

            accountOverlay.classList.remove("open");
            document.body.style.overflow = "";

            alert("Sesión iniciada correctamente.");

        } catch (error) {

            console.error(error);

            if (
                error.code === "auth/invalid-credential" ||
                error.code === "auth/wrong-password" ||
                error.code === "auth/user-not-found"
            ) {
                alert("Correo o contraseña incorrectos.");
            }

            else if (error.code === "auth/invalid-email") {
                alert("El correo electrónico no es válido.");
            }

            else {
                alert("No se pudo iniciar sesión: " + error.message);
            }

        }

    });

// ============================================
// INICIAR SESIÓN CON GOOGLE
// ============================================

const googleLoginBtn = document.getElementById("googleLoginBtn");

if (googleLoginBtn) {
googleLoginBtn.addEventListener("click", async () => {
try {
const provider = new GoogleAuthProvider();

const result = await signInWithPopup(auth, provider);

console.log(
"Sesión iniciada con Google:",
result.user
);

accountOverlay.classList.remove("open");
document.body.style.overflow = "";

alert("Sesión iniciada con Google correctamente.");

} catch (error) {
console.error("Error al iniciar con Google:", error);

if (error.code === "auth/popup-closed-by-user") {
console.log("El usuario cerró la ventana de Google.");
return;
}

alert("No se pudo iniciar sesión con Google: " + error.message);
}
});
}


}


// =========================================================
// DETECTAR SESIÓN
// =========================================================

const clientPortal = document.getElementById("clientPortal");
const profilePage = document.getElementById("profilePage");
const closeProfile = document.getElementById("closeProfile");

const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileCompany = document.getElementById("profileCompany");
const closeClientPortal = document.getElementById("closeClientPortal");

let currentUser = null;

onAuthStateChanged(auth, async (user) => {

    currentUser = user;
    userLogged = !!user;

    if (user) {

        console.log("Usuario conectado:", user.email);

        // =====================================================
        // SALUDO SEGÚN LA HORA
        // =====================================================

        const hour = new Date().getHours();

        let greeting = "Buenas noches";

        if (hour >= 6 && hour < 12) {
            greeting = "Buenos días";
        } else if (hour >= 12 && hour < 19) {
            greeting = "Buenas tardes";
        }

        const clientGreeting =
            document.getElementById("clientGreeting");

        if (clientGreeting) {
            clientGreeting.textContent = greeting;
        }


        // =====================================================
        // CARGAR INFORMACIÓN DESDE FIRESTORE
        // =====================================================

        try {

            const userDoc =
                await getDoc(doc(db, "users", user.uid));

            if (userDoc.exists()) {

                const data = userDoc.data();

                const name =
                    data.name || "Cliente Var San";

                const email =
                    data.email || user.email || "";

                const company =
                    data.company || "No especificada";


                document.getElementById("clientName").textContent =
                    name;

                document.getElementById("clientEmail").textContent =
                    email;

                document.getElementById("clientCompany").textContent =
                    company;

                document.getElementById("clientWelcomeName").textContent =
                    name;

                

                const clientWelcome =
                    document.getElementById("clientWelcome");

                if (clientWelcome) {

                    clientWelcome.textContent =
                        "Bienvenido nuevamente a Distribuidora Var San.";

                }

            } else {

                console.warn(
                    "El usuario existe en Authentication, pero no tiene perfil en Firestore."
                );

            }

        } catch (error) {

            console.error(
                "Error al cargar el perfil desde Firestore:",
                error
            );

        }


        // =====================================================
        // BOTÓN CUANDO HAY SESIÓN
        // =====================================================

        openAccount.innerHTML = `
            <i class="fas fa-user-check"></i>
            Mi cuenta
        `;


    } else {

        console.log("No hay sesión iniciada.");

        openAccount.innerHTML = `
            <i class="fas fa-user"></i>
            Mi cuenta
        `;

    }

});

// =========================================================
// BOTÓN MI CUENTA
// =========================================================

openAccount.addEventListener("click", () => {

    if (currentUser) {

        clientPortal.classList.add("open");

    } else {

        accountOverlay.classList.add("open");

    }

});


// =========================================================
// CERRAR PORTAL
// =========================================================

closeClientPortal.addEventListener("click", () => {

    clientPortal.classList.remove("open");

});

// =========================================================
// BOTONES DEL PORTAL
// =========================================================

// Mi Perfil
document.getElementById("profileBtn").addEventListener("click", () => {

    clientPortal.classList.remove("open");

    profilePage.classList.add("open");

    profileName.value =
        document.getElementById("clientName").textContent;

    profileEmail.value =
        document.getElementById("clientEmail").textContent;

    profileCompany.value =
        document.getElementById("clientCompany").textContent;

});

closeProfile.addEventListener("click", () => {

    profilePage.classList.remove("open");

    clientPortal.classList.add("open");

});


// Configuración
document.getElementById("settingsBtn").addEventListener("click", () => {

    alert("Configuración disponible próximamente.");

});


// Cerrar sesión
document.getElementById("logoutBtn").addEventListener("click", async () => {

    try {

        await signOut(auth);

        clientPortal.classList.remove("open");

        alert("Has cerrado sesión correctamente.");

    }

    catch(error){

        console.error(error);

    }

});
