const socket = io();

window.onload = function() {
    unir.addEventListener('click', unirSala);
    crear.addEventListener('click', crearSala);
}
function unirSala() {
    let div = padre.querySelector('div');

    let input = div.querySelector('input');
    input.placeholder = 'ID de la sala';
    let boton = document.createElement('button');
    boton.innerText = 'Unirse';
    boton.addEventListener('click', function() {
        let sala = input.value;
        socket.emit('unirSala', sala);
    });
    div.appendChild(input);
}
function crearSala() {
    let codigo = generarCodigoSala();
    socket.emit('crearSala', codigo);
}
function generarCodigoSala() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
socket.on('exito', function(msj, sala) {
    window.location.href = '/jugar.html?sala=' + sala;
});
socket.on('error', function(msj) {
    let input = padre.querySelector('input');
    input.placeholder = msj;
    input.value = '';
});
