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
    cantarBrisca.addEventListener("click", brisca);
    cambiarTriunfo.addEventListener("click", cantarTriunfo);
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
            comprobarSiete(carta);
            let img = crearCarta(carta);
            div.appendChild(img);
        });
    } else {
        comprobarSiete(cartas);
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
socket.on("deliberando", mostrarDeliberando);
socket.on("deliberado", borrarDeliberando);
socket.on("terminarTurno", terminarJugada);
socket.on("cantarTriunfo", function(carta) {
    triunfo.querySelector('img').remove();
    let imgTriunfo = document.createElement("img");
    imgTriunfo.src = crearImagen(carta);
    imgTriunfo.alt = carta;
    triunfo.appendChild(imgTriunfo);
});
function comprobarSiete(carta) {
    const COMPROBAR = "7 de " + paloTriunfo;
    console.log("carta: " + carta + " COMPROBAR: " + COMPROBAR);
    if (carta == COMPROBAR){
        cambiarTriunfo.disabled = false;
        console.log("cambiarTriunfo habilitado");
    }

}
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
function mostrarDeliberando() {
    let div = document.createElement("div");
    div.id = "cont_deliberando";
    div.classList.add("contenedor");
    let img = document.createElement("img");
    img.src = "./img/deliberando.gif";
    div.appendChild(img);
    document.querySelector('main').appendChild(div);
    protector.classList.remove('ocultar');
}
function borrarDeliberando() {
    cont_deliberando.remove();
    protector.classList.add('ocultar');
}
function deliberando() {
    socket.emit("mostrarDeliberando");
    mostrarDeliberando();
    setTimeout(deliberado, 1000);
}
function deliberado() {
    socket.emit("borrarDeliberando");
    borrarDeliberando();
    setTimeout(determinarGanador, 1000);
}
function determinarGanador() {
    let cartaUno = cartaUnoImg.alt;
    let cartaDos = cartaDosImg.alt;
    
    ganador = getResultado(cartaUno, cartaDos);
    let puntosTotales = sacarPuntos(cartaUno) + sacarPuntos(cartaDos);
    terminarJugada(ganador, puntosTotales);
    socket.emit("detGanador", !ganador, puntosTotales);
    ganador = false;
}
/**
 * Devuelve true si el jugador ha ganado, false si el contrincante ha ganado
*/
function getResultado(cartaUno, cartaDos) {
    let indiceUno = NUMEROS_CARTAS.indexOf(sacarNumero(cartaUno));
    let indiceDos = NUMEROS_CARTAS.indexOf(sacarNumero(cartaDos));
    if (sacarPalo(cartaUno) == sacarPalo(cartaDos) && indiceUno > indiceDos) {
        return true;
    } 
    if (sacarPalo(cartaUno) != sacarPalo(cartaDos) && sacarPalo(cartaDos) != paloTriunfo) {
        return true
    }
    return false;
}
function sacarNumero(cartaString) {
    let num = cartaString.split(' de ')[0];
    return parseInt(num);
}
function sacarPalo(cartaString) {
    let palo = cartaString.split(' de ')[1];
    return palo;
}
function sacarPuntos(cartaString) {
    let num = sacarNumero(cartaString);
    let puntos;
    switch (num) {
        case 10: puntos = 2; break;
        case 11: puntos = 3; break;
        case 12: puntos = 4; break;
        case 3: puntos = 10; break;
        case 1: puntos = 11; break;
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
function cantarTriunfo() {
    if (turno) {
        let imgTriunfo = triunfo.querySelector('img');
        let cartaNueva = imgTriunfo.alt;
        imgTriunfo.remove();
        cont_cartas.querySelectorAll('img').forEach(function(imagen) {
            if (imagen.alt == "7 de " + paloTriunfo) {
                imagen.remove();
            }
        });
        socket.emit("cantarTriunfo", "7 de " + paloTriunfo);
        let nuevoTriunfo = crearCarta("7 de " + paloTriunfo);
        triunfo.appendChild(nuevoTriunfo);
        let imgCartaNueva = crearCarta(cartaNueva);
        cartas.appendChild(imgCartaNueva);
        cambiarTriunfo.disabled = true;
    }
}
function brisca() {
    if (turno) {

    }
}
