const socket = io();
let nom;
let turno = false;
window.onload = () => {
    boton.addEventListener("click", sendMessage);
    msg.addEventListener("keydown", function(event) {if (event.key === "Enter") sendMessage();});
    enviarNombre.addEventListener("click", guardarNombre);
};

/*          SOCKETS         */
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
    if (cont_cartas.classList.contains("ocultar") && cont_triunfo.classList.contains("ocultar")) {
        cont_triunfo.classList.remove("ocultar");
        cont_cartas.classList.remove("ocultar");
    }
    if (Array.isArray(cartas)) {
        cartas.forEach(carta => {
            crearCarta(carta);
        });
    } else {
        crearCarta(cartas);
    }
});

/*          CHAT             */
function guardarNombre() {
    nom = nombre.value;
    pedirNombre.classList.toggle('ocultar');
    protector.classList.toggle('ocultar');
    socket.emit("nuevoUsuario", nom);
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

/*          CARTAS         */
function crearCarta(cartaString) {
    let img = document.createElement("img");
    img.src = crearImagen(cartaString);
    img.alt = cartaString;
    img.addEventListener("click", jugarCarta);
    cartas.appendChild(img);
}
function jugarCarta(e) {
    if (turno) {
        let carta = e.target.alt;
        socket.emit("jugarCarta", carta);
        e.target.remove();
    }
}
function crearImagen(cartaString) {
    return "./img/" + cartaString.replace(" de ", "_") + ".png";
}
function pedirCarta() {
    if (turno) {
        socket.emit("pedirCarta", nom);
    }
}
function addTriunfo(nomCarta, carta) {
    let newTriunfo = document.createElement("img");
    newTriunfo.src = carta;
    newTriunfo.alt = nomCarta;

    triunfo.appendChild(newTriunfo);
}
