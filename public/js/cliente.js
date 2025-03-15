const socket = io();
let nom;
let paloTriunfo;
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
    div.appendChild(user);
    div.appendChild(comment);
    document.getElementById("chat").appendChild(div);
    chat.scrollTo(0, chat.scrollHeight);
}
function mostrarMensaje(msg) {
    let divTodo = document.createElement("div");

    let nom = document.createElement("div");
    nom.innerText = "servidor";
    nom.classList.add("username");
    nom.classList.add("nom_servidor");

    let msj = document.createElement("div");
    msj.classList.add("msj");
    msj.classList.add("msj_servidor");
    msj.innerText = msg;

    divTodo.appendChild(nom);
    divTodo.appendChild(msj);
    chat.appendChild(divTodo);
    chat.scrollTo(0, chat.scrollHeight);
}

/*          CARTAS         */
socket.on("triunfo", function(triunfo) {
    let triunfoSrc = crearImagen(triunfo);
    addTriunfo(triunfo, triunfoSrc);
});
socket.on("carta", function(cartas) {
    if (cont_cartas.classList.contains("ocultar") && cont_triunfo.classList.contains("ocultar") && cont_puntos.classList.contains("ocultar")) {
        cont_triunfo.classList.remove("ocultar");
        cont_puntos.classList.remove("ocultar");
        cont_cartas.classList.remove("ocultar");
    }
    if (Array.isArray(cartas)) {
        let div = document.getElementById("cartas");
        cartas.forEach(carta => {
            let img = crearCarta(carta);
            div.appendChild(img);
        });
    } else {
        let div = document.getElementById("cartas");
        let img = crearCarta(cartas);
        div.appendChild(img);
    }
});
socket.on("turno", cambiarTurno);
socket.on("juegaCarta", function(carta) {
    cambiarTurno();
    let img = crearCarta(carta);
    contrincante.appendChild(img);
    setTimeout(deliberando, 1000);
});
function cambiarTurno() {
    turno = !turno;
    if (turno) {
        mostrarMensaje("¡Corre! Es tu turno");
    }
}
function crearCarta(cartaString) {
    let img = document.createElement("img");
    img.src = crearImagen(cartaString);
    img.alt = cartaString;
    img.addEventListener("click", jugarCarta);
    return img;
}
function jugarCarta() {
    if (turno) {
        let carta = this.alt;
        socket.emit("jugarCarta", carta);
        let juegaCarta = document.createElement("img");
        juegaCarta.src = crearImagen(carta);
        jugador.appendChild(juegaCarta);
        this.remove();
    }
}
function crearImagen(cartaString) {
    console.log(cartaString);
    return "./img/" + cartaString.replace(" de ", "_") + ".png";
}
function pedirCarta() {
    if (turno) {
        socket.emit("pedirCarta");
    }
}
function addTriunfo(nomCarta, carta) {
    let newTriunfo = document.createElement("img");
    newTriunfo.src = carta;
    newTriunfo.alt = nomCarta;
    paloTriunfo = sacarPalo(nomCarta);
    triunfo.appendChild(newTriunfo);
}
function deliberando() {
    let div = document.createElement("div");
    div.id = "cont_deliberando";
    div.classList.add("contenedor");
    let img = document.createElement("img");
    img.src = "./img/deliberando.gif";
    div.appendChild(img);
    setTimeout(deliberado, 2000);
}
function deliberado() {
    cont_deliberando.remove();
    setTimeout(determinarGanador, 1000);
}
function determinarGanador() {
    let cartaUno = jugador.alt;
    let cartaDos = contrincante.alt;

    if () {

    } else {

    }
}
function sacarNumero(cartaString) {
    let num = cartaString.split(' de ')[0];
    return num;
}
function sacarPalo(cartaString) {
    let palo = cartaString.split(' de ')[1];
    return palo;
}