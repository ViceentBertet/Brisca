const NUMEROS_CARTAS = [2, 4, 5, 6, 7, 10, 11, 12, 3, 1];
const socket = io();
let nom;
let paloTriunfo;
let turno = false;
let ganador = false;
let cartaUnoImg;
let cartaDosImg;
window.onload = () => {
    boton.addEventListener("click", sendMessage);
    msg.addEventListener("keydown", function(event) {if (event.key === "Enter") sendMessage();});
    enviarNombre.addEventListener("click", guardarNombre);
};

/*          CHAT             */
socket.on("chat", function(msg) {
    addMessage(msg, false);
});
socket.on("mensaje", function(msg) {
    mostrarMensaje(msg);
});
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
    cartaUnoImg = jugador.querySelector("img");
    cartaDosImg = contrincante.querySelector("img");

    if (!cartaUnoImg || !cartaDosImg) {
        // Si no hay dos cartas, no se puede deliberar
        return;
    } 

    setTimeout(deliberando, 1000);
});
socket.on("terminarTurno", terminarJugada);
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
        juegaCarta.alt = carta;
        juegaCarta.src = crearImagen(carta);
        jugador.appendChild(juegaCarta);
        cambiarTurno();
        this.remove();
    }
}
function crearImagen(cartaString) {
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
    document.body.appendChild(div);
    setTimeout(deliberado, 2000);
}
function deliberado() {
    cont_deliberando.remove();
    setTimeout(determinarGanador, 1000);
}
function determinarGanador() {
    let cartaUno = cartaUnoImg.alt;
    let cartaDos = cartaDosImg.alt;

    let indiceUno = NUMEROS_CARTAS.indexOf(sacarNumero(cartaUno));
    let indiceDos = NUMEROS_CARTAS.indexOf(sacarNumero(cartaDos));
    
    if (sacarPalo(cartaUno) == paloTriunfo && sacarPalo(cartaDos) == paloTriunfo) {
        if (indiceUno > indiceDos) {
            console.log("if 1");
            ganador = true;
        }
        // Si no, gana el contrincante
    } else if (sacarPalo(cartaUno) == paloTriunfo) {
        ganador = true;
    } else {
        if (sacarPalo(cartaUno) == sacarPalo(cartaDos)) {
            if (indiceUno > indiceDos) {
                ganador = true;
            }
            // Si no, gana el contrincante
        } else if (sacarPalo(cartaDos) == paloTriunfo) {
            ganador = false;
            // Si el contrincante tiene triunfo y nosotros no, gana él
        } else {
            ganador = true;
        }
    }
    let puntosTotales = sacarPuntos(cartaUno) + sacarPuntos(cartaDos);
    terminarJugada(ganador, puntosTotales);
    socket.emit("detGanador", !ganador, puntosTotales);
    ganador = false;
}
function sacarNumero(cartaString) {
    let num = cartaString.split(' de ')[0];
    return num;
}
function sacarPalo(cartaString) {
    let palo = cartaString.split(' de ')[1];
    return palo;
}
function sacarPuntos(cartaString) {
    let num = sacarNumero(cartaString);
    let puntos = 0;
    switch (num) {
        case '10': puntos += 2; break;
        case '11': puntos += 3; break;
        case '12': puntos += 4; break;
        case '3': puntos += 10; break;
        case '1': puntos += 11; break;
        default: puntos = 0;
    }
    return puntos;
}
function terminarJugada(ganado, newPuntos) {
    turno = false;
    if (ganado) {
        puntos.innerText = parseInt(puntos.innerText) + newPuntos;
        mostrarMensaje("¡Ganaste! Has sumado " + newPuntos + " puntos");
        setTimeout(cambiarTurno, 1000);
    } else {
        mostrarMensaje("¡Perdiste! Tu contrincante ha sumado " + newPuntos + " puntos");
    }
    limpiarMesa();
    socket.emit("pedirCarta");
}
function limpiarMesa() {
    let imagenes = mesa.querySelectorAll('img');
    imagenes.forEach(imagen => imagen.remove());
}