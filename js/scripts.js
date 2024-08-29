window.sr = ScrollReveal();

sr.reveal('#datos', {
    duration: 700,
    origin: 'top',
    distance: '300px',
    reset: true
});

const boton = document.getElementById('boton-principal');
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

function mostrarPanel(panelId){
    paneles.forEach(panel =>{
        if(panel == panelId){
            document.getElementById(panelId).style.display = 'block';
            const panelesFiltrados = paneles.filter(p=> p!= panel)
            for (let i = 0; i < panelesFiltrados.length; i++) {
                const panelFiltrado = panelesFiltrados[i];
                document.getElementById(panelFiltrado).style.display = 'none';
            }
        }
    });
}

document.getElementById("current-year").textContent = new Date().getFullYear();