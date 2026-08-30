const htmlElement = document.documentElement;

function aplicarTema(oscuro) {
    htmlElement.classList.toggle('dark-mode', oscuro);
}

function actualizarIconoTema(boton) {
    const oscuro = htmlElement.classList.contains('dark-mode');
    boton.setAttribute('aria-label', oscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
    boton.setAttribute('aria-pressed', String(oscuro));
}

function iniciarTema() {
    const boton = document.getElementById('theme-toggle');
    if (!boton) return;

    actualizarIconoTema(boton);
    boton.addEventListener('click', () => {
        const oscuro = !htmlElement.classList.contains('dark-mode');
        aplicarTema(oscuro);
        actualizarIconoTema(boton);
        try {
            localStorage.setItem('theme', oscuro ? 'dark' : 'light');
        } catch (e) { }
    });
}

function iniciarBarraProgreso() {
    const barra = document.getElementById('progressbar');
    if (!barra) return;

    let pendiente = false;
    let total = 0;

    const pintar = () => {
        pendiente = false;
        const avance = total > 0 ? (window.scrollY / total) * 100 : 0;
        barra.style.height = Math.min(100, Math.max(0, avance)) + '%';
    };
    const medir = () => {
        total = htmlElement.scrollHeight - window.innerHeight;
        pintar();
    };
    const programar = () => {
        if (!pendiente) {
            pendiente = true;
            window.requestAnimationFrame(pintar);
        }
    };

    window.addEventListener('scroll', programar, { passive: true });
    window.addEventListener('resize', medir);
    document.addEventListener('portfolio:layout', medir);
    if ('ResizeObserver' in window) {
        new ResizeObserver(medir).observe(document.body);
    }
    medir();
}

function iniciarEfectoBoton() {
    const boton = document.getElementById('boton-principal');
    if (!boton) return;

    boton.addEventListener('click', function (e) {
        const caja = this.getBoundingClientRect();
        const efecto = document.createElement('span');
        efecto.className = 'efecto-boton';
        efecto.style.left = (e.clientX - caja.left) + 'px';
        efecto.style.top = (e.clientY - caja.top) + 'px';
        this.appendChild(efecto);
        setTimeout(() => efecto.remove(), 1000);
    });
}

function iniciarFiltroProyectos() {
    const botones = document.querySelectorAll('.filtro-proyecto');
    const tarjetas = document.querySelectorAll('.proyecto-item');
    const aviso = document.getElementById('sin-proyectos');
    if (!botones.length || !tarjetas.length) return;

    function filtrar(categoria) {
        let visibles = 0;
        tarjetas.forEach(tarjeta => {
            const coincide = categoria === 'todos' || tarjeta.dataset.categoria === categoria;
            tarjeta.hidden = !coincide;
            if (coincide) visibles++;
        });

        botones.forEach(boton => {
            const activo = boton.dataset.filtro === categoria;
            boton.classList.toggle('activo', activo);
            boton.setAttribute('aria-pressed', String(activo));
        });

        if (aviso) aviso.hidden = visibles > 0;
        document.dispatchEvent(new CustomEvent('portfolio:layout'));
    }

    botones.forEach(boton => {
        boton.addEventListener('click', () => filtrar(boton.dataset.filtro));
    });
}

function iniciarCarruseles() {
    const nodos = document.querySelectorAll('.carousel');
    if (!nodos.length) return;

    const carruseles = [];

    const cebar = lamina => {
        const imagen = lamina && lamina.querySelector('img[loading="lazy"]');
        if (imagen) imagen.loading = 'eager';
    };

    nodos.forEach(raiz => {
        const laminas = [...raiz.querySelectorAll('.carousel-item')];
        if (laminas.length < 2) return;

        const activa = laminas.findIndex(lamina => lamina.classList.contains('active'));
        const carrusel = {
            raiz,
            laminas,
            indice: activa < 0 ? 0 : activa,
            visible: false,
            detenido: false
        };

        carrusel.ir = destino => {
            const nuevo = (destino + laminas.length) % laminas.length;
            if (nuevo === carrusel.indice) return;
            cebar(laminas[nuevo]);
            raiz.classList.add('animado');
            laminas[carrusel.indice].classList.remove('active');
            laminas[nuevo].classList.add('active');
            carrusel.indice = nuevo;
            cebar(laminas[(nuevo + 1) % laminas.length]);
        };

        raiz.querySelectorAll('[data-slide]').forEach(boton => {
            boton.addEventListener('click', () => {
                carrusel.ir(carrusel.indice + (boton.dataset.slide === 'prev' ? -1 : 1));
            });
        });

        raiz.addEventListener('mouseenter', () => { carrusel.detenido = true; });
        raiz.addEventListener('mouseleave', () => { carrusel.detenido = false; });
        raiz.addEventListener('focusin', () => { carrusel.detenido = true; });
        raiz.addEventListener('focusout', () => { carrusel.detenido = false; });

        carruseles.push(carrusel);
    });

    if (!carruseles.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let temporizador = null;

    const avanzar = () => {
        carruseles.forEach(carrusel => {
            if (carrusel.visible && !carrusel.detenido) carrusel.ir(carrusel.indice + 1);
        });
    };

    const revisar = () => {
        const activo = !document.hidden && carruseles.some(carrusel => carrusel.visible);
        if (activo && temporizador === null) {
            temporizador = window.setInterval(avanzar, 5000);
        } else if (!activo && temporizador !== null) {
            window.clearInterval(temporizador);
            temporizador = null;
        }
    };

    if ('IntersectionObserver' in window) {
        const porRaiz = new Map(carruseles.map(carrusel => [carrusel.raiz, carrusel]));
        const observador = new IntersectionObserver(entradas => {
            entradas.forEach(entrada => {
                const carrusel = porRaiz.get(entrada.target);
                if (!carrusel) return;
                carrusel.visible = entrada.isIntersecting;
                if (entrada.isIntersecting) {
                    cebar(carrusel.laminas[(carrusel.indice + 1) % carrusel.laminas.length]);
                }
            });
            revisar();
        }, { threshold: 0.25 });
        carruseles.forEach(carrusel => observador.observe(carrusel.raiz));
    } else {
        carruseles.forEach(carrusel => { carrusel.visible = true; });
    }

    document.addEventListener('visibilitychange', revisar);
    revisar();
}

function iniciarValidacionFormulario() {
    document.querySelectorAll('form.needs-validation').forEach(form => {
        form.addEventListener('submit', e => {
            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
                const primerError = form.querySelector(':invalid');
                if (primerError) primerError.focus();
            }
            form.classList.add('was-validated');
        });
    });
}

function iniciarDatosDinamicos() {
    const anio = document.getElementById('current-year');
    if (anio) anio.textContent = new Date().getFullYear();

    const edad = document.getElementById('age');
    if (edad) {
        const hoy = new Date();
        const iso = edad.dataset.nacimiento;
        if (iso) {
            const [a, m, d] = iso.split('-').map(Number);
            let anios = hoy.getFullYear() - a;
            if (hoy.getMonth() + 1 < m || (hoy.getMonth() + 1 === m && hoy.getDate() < d)) {
                anios--;
            }
            edad.textContent = anios;
        } else {
            edad.textContent = hoy.getFullYear() - 2002;
        }
    }
}

function iniciarReveal() {
    const elementos = document.querySelectorAll('.reveal');
    if (!elementos.length) return;

    const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (menosMovimiento || !('IntersectionObserver' in window)) {
        elementos.forEach(el => el.classList.add('visible'));
        return;
    }

    htmlElement.classList.add('js-reveal');

    const observador = new IntersectionObserver((entradas, obs) => {
        entradas.forEach(entrada => {
            if (!entrada.isIntersecting) return;
            entrada.target.classList.add('visible');
            obs.unobserve(entrada.target);
        });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.1 });

    elementos.forEach(el => {
        const hermanos = el.parentElement ? [...el.parentElement.children].filter(n => n.classList.contains('reveal')) : [];
        const posicion = Math.max(0, hermanos.indexOf(el));
        el.style.transitionDelay = Math.min(posicion, 5) * 90 + 'ms';
        observador.observe(el);
    });
}

function iniciarNavActivo() {
    const enlaces = [...document.querySelectorAll('.navbar .nav-link[href^="#"]')];
    if (!enlaces.length) return;

    const porId = new Map();
    enlaces.forEach(a => {
        const seccion = document.querySelector(a.getAttribute('href'));
        if (seccion) porId.set(seccion, a);
    });
    if (!porId.size) return;

    const marcar = seccion => {
        enlaces.forEach(a => {
            a.classList.remove('activo');
            a.removeAttribute('aria-current');
        });
        const activo = porId.get(seccion);
        if (activo) {
            activo.classList.add('activo');
            activo.setAttribute('aria-current', 'true');
        }
    };

    const observador = new IntersectionObserver(entradas => {
        const visibles = entradas.filter(e => e.isIntersecting);
        if (!visibles.length) return;
        visibles.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        marcar(visibles[0].target);
    }, { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] });

    porId.forEach((_, seccion) => observador.observe(seccion));
}

function iniciarNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const menu = document.getElementById('menu-principal');
    const boton = navbar.querySelector('.navbar-toggler');
    let abierto = false;

    const actualizar = () => {
        navbar.classList.toggle('desplazado', abierto || window.scrollY > 40);
    };

    const plegar = mostrar => {
        abierto = mostrar;
        if (menu) menu.classList.toggle('show', mostrar);
        if (boton) boton.setAttribute('aria-expanded', String(mostrar));
        actualizar();
    };

    window.addEventListener('scroll', actualizar, { passive: true });
    window.addEventListener('resize', () => {
        if (abierto && window.innerWidth >= 992) plegar(false);
        else actualizar();
    });

    if (menu && boton) {
        boton.addEventListener('click', () => plegar(!abierto));
        menu.querySelectorAll('.nav-link').forEach(enlace => {
            enlace.addEventListener('click', () => {
                if (abierto) plegar(false);
            });
        });
    }
    actualizar();
}

document.addEventListener('DOMContentLoaded', () => {
    iniciarTema();
    iniciarNavbar();
    iniciarBarraProgreso();
    iniciarEfectoBoton();
    iniciarFiltroProyectos();
    iniciarCarruseles();
    iniciarValidacionFormulario();
    iniciarDatosDinamicos();
    iniciarReveal();
    iniciarNavActivo();
});
