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