/* ══════════════════════════════════════════════════════════════════════════
   DÍGNITAS ABOGACÍA — comportamiento compartido de todas las páginas.

   Antes vivía como <script> inline al final de index.html, repetido si el
   sitio se hubiera dividido en varios archivos sin este paso. Se consolidó
   aquí para que cambiar un dato (el ID de GA4, el teléfono) se haga en un
   solo lugar y no en cada página del sitio.

   No se removió ni se reescribió ninguna lógica existente, salvo el código
   de los modales de Aviso Legal / Aviso de Privacidad: esos avisos dejaron
   de ser ventanas emergentes y pasaron a ser páginas propias, así que ese
   código ya no aplica.
   ══════════════════════════════════════════════════════════════════════════ */

/* 1. GOOGLE ANALYTICS 4 — mide cuanta gente visita el sitio. */
var ID_GA4 = 'G-LDHDQ743C3';

/* 2. PIXEL DE META (Facebook e Instagram). */
var ID_META = '1727748691840620';

document.addEventListener('DOMContentLoaded', function () {

  /* ---- Barra de navegación con sombra al hacer scroll ---- */
  var navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', function () {
      navbar.classList.toggle('nav-scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  /* ---- Menú móvil ---- */
  var menuToggle = document.getElementById('menuToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  var menuIconOpen = document.getElementById('menuIconOpen');
  var menuIconClose = document.getElementById('menuIconClose');
  var mobileLinks = document.querySelectorAll('.mobile-link');

  function openMenu() {
    mobileMenu.classList.add('open');
    menuIconOpen.classList.add('hidden');
    menuIconClose.classList.remove('hidden');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Cerrar menú');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileMenu.classList.remove('open');
    menuIconOpen.classList.remove('hidden');
    menuIconClose.classList.add('hidden');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menú');
    document.body.style.overflow = '';
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
    });
    mobileLinks.forEach(function (link) { link.addEventListener('click', closeMenu); });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---- Aparición progresiva al hacer scroll ---- */
  var revealEls = document.querySelectorAll('.reveal');
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(function (el) { revealObserver.observe(el); });

  /* ---- Desplazamiento suave a anclas dentro de la misma página ---- */
  function offsetScrollTo(target) {
    var offset = (navbar ? navbar.offsetHeight : 0) + 10;
    var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: top, behavior: 'smooth' });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetSel = this.getAttribute('href');
      var target = targetSel.length > 1 ? document.querySelector(targetSel) : null;
      if (target) {
        e.preventDefault();
        offsetScrollTo(target);
      }
    });
  });

  /* Si la página carga ya con un ancla en la URL (ej. /empresas#diagnostico-empresarial,
     enlazada desde otra página), se compensa la misma altura del navbar fijo.
     Se corrige con un salto instantáneo (no "smooth"): como html tiene
     scroll-behavior:smooth por CSS, el salto nativo del navegador al ancla
     también se anima, y si esta corrección se animara igual competirían las
     dos animaciones y el aterrizaje final quedaba descolocado. */
  if (window.location.hash.length > 1) {
    var llegada = document.querySelector(window.location.hash);
    if (llegada) {
      var corregir = function () {
        var prevBehavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = 'auto';
        var offset = (navbar ? navbar.offsetHeight : 0) + 10;
        var top = llegada.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo(0, top);
        document.documentElement.style.scrollBehavior = prevBehavior;
      };
      /* Se repite: las fuentes web (Cormorant Garamond, Montserrat) y las
         tarjetas .reveal aún pueden desplazar el layout después del primer
         intento, y eso movería el destino sin que el navegador vuelva a
         corregir el scroll por su cuenta. */
      window.setTimeout(corregir, 120);
      window.setTimeout(corregir, 500);
      window.setTimeout(corregir, 1200);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { window.setTimeout(corregir, 30); });
      }
    }
  }

});

/* ---- Traductor de anclas antiguas de la versión de una sola página ----
   Alguien puede llegar con un enlace viejo compartido en redes o guardado
   en favoritos (dignitasabogacia.com/#servicios). Se traduce a la URL nueva
   antes de que la página termine de pintarse. Vive fuera del DOMContentLoaded
   a propósito: debe correr lo antes posible. */
(function () {
  var MAPA_ANCLAS_VIEJAS = {
    '#inicio': '/',
    '#servicios': '/servicios',
    '#empresas': '/empresas',
    '#diagnostico-empresarial': '/empresas',
    '#capacitacion': '/capacitacion',
    '#equipo': '/equipo',
    '#preguntas': '/preguntas-frecuentes',
    '#nosotros': '/nosotros',
    '#valores': '/nosotros',
    '#independencia': '/nosotros',
    '#contacto': '/contacto',
    '#contacto-directo': '/contacto'
  };
  var destino = MAPA_ANCLAS_VIEJAS[window.location.hash];
  if (destino && window.DIGNITAS_ES_PORTADA) {
    window.location.replace(destino);
  }
})();

/* ---- Registro de conversiones ----------------------------------------
   Sin esto se sabe cuanta gente entro, pero no cuanta contacto, que es
   el unico dato que dice si la inversion en publicidad funciona.
   Solo se dispara si la persona acepto la analitica. */
function registrarContacto(metodo, seccion) {
  try {
    if (window.gtag) window.gtag('event', 'contacto', { metodo: metodo, seccion: seccion || 'general' });
    if (window.fbq)  window.fbq('track', 'Contact', { content_name: metodo, content_category: seccion || 'general' });
  } catch (e) {}
}

/* Escucha global: cualquier enlace a WhatsApp, correo o teléfono queda medido,
   incluidos los que se agreguen en el futuro. No hay que tocar cada botón. */
document.addEventListener('click', function (e) {
  var a = e.target.closest && e.target.closest('a[href]');
  if (!a) return;
  var href = a.getAttribute('href') || '';
  var metodo = null;
  if (href.indexOf('wa.me') > -1)          metodo = 'whatsapp';
  else if (href.indexOf('mailto:') === 0)  metodo = 'correo';
  else if (href.indexOf('tel:') === 0)     metodo = 'teléfono';
  if (!metodo) return;
  /* De dónde salió el contacto. Antes bastaba el id de la sección porque todo
     el sitio era una sola página; ahora, si la sección no tiene id, se usa la
     ruta de la página para que en los reportes se vea qué página generó el
     contacto y no todo caiga en "general". */
  var seccionEl = a.closest('section');
  var pagina = window.location.pathname.replace(/^\/+|\/+$/g, '') || 'portada';
  var seccion = a.getAttribute('data-contacto') ||
                (seccionEl && seccionEl.id ? seccionEl.id : pagina);
  registrarContacto(metodo, seccion);
}, true);

/* ---- Analitica con consentimiento previo -----------------------------
   Google Analytics y el pixel de Meta NO se cargan hasta que la persona
   pulsa "Aceptar". Si pulsa "Rechazar" no se cargan nunca. */
(function () {

  var CLAVE = 'dignitas_consentimiento_cookies';

  function cargarAnalitica() {
    if (!ID_GA4 || ID_GA4 === 'PENDIENTE') return;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID_GA4;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', ID_GA4);
  }

  function cargarMeta() {
    if (!ID_META || ID_META === 'PENDIENTE') return;
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
      }; if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s)
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', ID_META);
    window.fbq('track', 'PageView');
  }

  /* Borra las cookies de medición ya instaladas. Sin esto, "Rechazar" impide que
     se carguen scripts nuevos, pero deja en el navegador las cookies puestas en
     una visita anterior: _ga dura hasta dos años. La revocación quedaba a medias.
     Se prueban todos los dominios posibles (con y sin punto inicial, host y
     dominio raíz) porque cada proveedor fija la suya en un nivel distinto. */
  function borrarCookiesDeMedicion() {
    var PATRON = /^(_ga|_gid|_gcl|_fbp|_fbc)/;
    var partes = window.location.hostname.split('.');
    var dominios = [null];
    while (partes.length >= 2) {
      var d = partes.join('.');
      dominios.push(d, '.' + d);
      partes.shift();
    }
    document.cookie.split(';').forEach(function (trozo) {
      var nombre = trozo.split('=')[0].trim();
      if (!nombre || !PATRON.test(nombre)) return;
      dominios.forEach(function (dom) {
        document.cookie = nombre + '=; Max-Age=0; path=/' + (dom ? '; domain=' + dom : '');
      });
    });
  }

  function iniciar() {
    var aviso = document.getElementById('cookieAviso');
    var decision = null;
    try { decision = localStorage.getItem(CLAVE); } catch (e) {}

    if (decision === 'aceptadas') {
      cargarAnalitica();
      cargarMeta();
    } else if (decision !== 'rechazadas') {
      if (aviso) aviso.classList.remove('hidden');
    }

    function guardar(valor) {
      try { localStorage.setItem(CLAVE, valor); } catch (e) {}
      if (aviso) aviso.classList.add('hidden');
    }

    var bAceptar = document.getElementById('cookieAceptar');
    var bRechazar = document.getElementById('cookieRechazar');
    if (bAceptar)  bAceptar.addEventListener('click', function () { guardar('aceptadas'); cargarAnalitica(); cargarMeta(); });
    if (bRechazar) bRechazar.addEventListener('click', function () {
      /* Si la medición ya venía corriendo en esta misma página (la persona había
         aceptado antes y ahora revoca), Google y Meta siguen vivos en memoria
         aunque se borren sus cookies. Recargar es la única forma de detenerlos
         en el acto y honrar la revocación de verdad. */
      var habiaMedicion = !!(window.gtag || window.fbq);
      guardar('rechazadas');
      borrarCookiesDeMedicion();
      if (habiaMedicion) window.location.reload();
    });

    window.abrirPreferenciasCookies = function () {
      try { localStorage.removeItem(CLAVE); } catch (e) {}
      if (aviso) aviso.classList.remove('hidden');
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }

})();
