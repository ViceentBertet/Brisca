const socket = io();
let nom;
let turno = false;
window.onload = () => {
    boton.addEventListener("click", sendMessage);
    enviarNombre.addEventListener("click", guardarNombre);
};
socket.on("chat", function(msg) {
    addMessage(msg, false);
});
socket.on("mensaje", function(msg) {
    mostrarMensaje(msg);
});
socket.on("triunfo", function(triunfo) {
    let triunfoSrc = crearImagen(triunfo);
    addTriunfo(triunfo, triunfoSrc);
});
socket.on("carta", function(cartas) {
    cartas.forEach(carta => {
        let img = document.createElement("img");
        img.src = crearImagen(carta);
        img.alt = carta;
        document.getElementById("cartas").appendChild(img);
    });
});
function crearImagen(cartaString) {
    return "./img/" + cartaString.replace(" de ", "_") + ".png";
}
function pedirCarta() {
    if (turno) {
        socket.emit("pedirCarta", nom);
    }
}
function guardarNombre() {
    nom = nombre.value;
    pedirNombre.classList.toggle('ocultar');
    protector.classList.toggle('ocultar');

}
function sendMessage() {
    if (!msg.value) return false;
    const message = [msg.value, nom];
    
    socket.emit("chat", message);

    addMessage(message, true);
    msg.value = "";
}
function addMessage(message, eresTu) {
    let div = document.createElement("div");
    let user = document.createElement("div");
    let comment = document.createElement("div");
    let msj = message[0];
    let nom = message[1];

    comment.innerText = msj;
    
    user.classList.add("username");
    comment.classList.add("msj");
    if (eresTu) {
        user.innerText = "tú";
        user.classList.add("der");
        comment.classList.add("deTi");
    } else {
        user.innerText = nom.toString().toLowerCase();
        comment.classList.add("deEl")
    };
    
    div.classList.add("cont-msj");
    div.appendChild(user);
    div.appendChild(comment);
    document.getElementById("chat").appendChild(div);
    chat.scrollTo(0, chat.scrollHeight);
}
function mostrarMensaje(msg) {
    let div = document.createElement("div");
    div.classList.add("centrar");
    div.classList.add("contenedor");

    div.innerText = msg;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}
function addTriunfo(nomCarta, carta) {
    let newTriunfo = document.createElement("img");
    newTriunfo.src = carta;
    newTriunfo.alt = nomCarta;

    triunfo.appendChild(newTriunfo);
}