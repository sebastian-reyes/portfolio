const htmlElement = document.documentElement;
let themeToggle;

function updateThemeIcon() {
    const icon = themeToggle.querySelector('i');
    if (htmlElement.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon-o');
        icon.classList.add('fa-sun-o');
    } else {
        icon.classList.remove('fa-sun-o');
        icon.classList.add('fa-moon-o');
    }
}

function initScrollReveal() {
    if (typeof ScrollReveal !== 'undefined') {
        window.sr = ScrollReveal();

        sr.reveal('#datos', {
            duration: 700,
            origin: 'top',
            distance: '300px',
            reset: true
        });
    } else {
        setTimeout(initScrollReveal, 100);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    themeToggle = document.getElementById('theme-toggle');

    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        htmlElement.classList.add('dark-mode');
        updateThemeIcon();
    }

    themeToggle.addEventListener('click', () => {
        htmlElement.classList.toggle('dark-mode');
        updateThemeIcon();
        const currentTheme = htmlElement.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', currentTheme);
    });

    const boton = document.getElementById('boton-principal');
    if (boton) {
        boton.addEventListener('click', function (e) {
            let x = e.clientX - e.target.offsetLeft;
            let y = e.clientY - e.target.offsetTop;

            let efecto = document.createElement('span');
            efecto.className = 'efecto-boton';
            efecto.style.left = x + 'px';
            efecto.style.top = y + 'px;'
            this.appendChild(efecto);

            setTimeout(() => {
                efecto.remove()
            }, 1000);
        });
    }

    let progressbar = document.getElementById('progressbar');
    let totalAltura = document.body.scrollHeight - window.innerHeight;
    window.onscroll = function () {
        let progressAltura = (window.pageYOffset / totalAltura) * 100;
        progressbar.style.height = progressAltura + '%';
    }
    const paneles = [
        'proyectos-general',
        'proyectos-api',
        'proyectos-webapp',
        'proyectos-extras',
        'proyectos-landing-pages'
    ];
    window.mostrarPanel = function (panelId) {
        paneles.forEach(panel => {
            if (panel == panelId) {
                document.getElementById(panelId).style.display = 'block';
                const panelesFiltrados = paneles.filter(p => p != panel)
                for (let i = 0; i < panelesFiltrados.length; i++) {
                    const panelFiltrado = panelesFiltrados[i];
                    document.getElementById(panelFiltrado).style.display = 'none';
                }
            }
        });
    }
    const yearElement = document.getElementById("current-year");
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    const ageElement = document.getElementById("age");
    if (ageElement) {
        ageElement.textContent = new Date().getFullYear() - 2002;
    }
    initScrollReveal();
});