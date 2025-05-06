const socket = io();

window.onload = () => {
    unir.addEventListener('click', unirSala);
    crear.addEventListener('click', crearSala);
}
function unirSala() {
    let input = padre.querySelector('input');
    let sala = input.value;
    if (sala.length == 6) {
        socket.emit('unirSala', sala);
    } else {
        input.placeholder = 'El código de la sala debe tener 6 caracteres';
        input.value = '';
    }
}
function crearSala() {
    let codigo = generarCodigoSala();
    socket.emit('crearSala', codigo);
}
function generarCodigoSala() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
socket.on('exito', function(sala) {
    window.location.href = '/jugar.html?sala=' + sala;
});
socket.on('error', function(msj) {
    let input = padre.querySelector('input');
    input.placeholder = msj;
    input.value = '';
});
