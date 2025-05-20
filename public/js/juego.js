const socket = io();
const NUMEROS_CARTAS = [2, 4, 5, 6, 7, 10, 11, 12, 3, 1];

let nom;
let paloTriunfo;
let turno = false;
let ganador = false;
let partidaTerminada = false;
let triunfoEntregado = false;
let cartaUnoImg;
let cartaDosImg;

let COMPROBAR_7;
let COMPROBAR_BRISCA;
let COMPROBAR_2;
let sala;
window.onload = () => {
    partidaTerminada = false;
    let urlParams = new URLSearchParams(window.location.search);
    sala = urlParams.get('sala');
    mostrarMensaje("Bienvenido a la sala " + sala + "\n ¡Comparte el código con tus amigos!");
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
    if (nom != "") {
        pedirNombre.classList.toggle('ocultar');
        protector.classList.toggle('ocultar');
        socket.emit("nuevoUsuario", nom, sala);
    }
}
function sendMessage() {
    if (!msg.value) return false;
    const message = [msg.value, nom];
    socket.emit("chat", message, sala);
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
socket.on("ultimaCarta", function() {
    triunfoEntregado = true;
    triunfo.querySelector('img').remove();
});
socket.on("numBaraja", function(numCartas) {
    cartasRest.innerText = numCartas;
});
socket.on("carta", function(cartas) {
    if (cont_cartas.classList.contains("ocultar") && cont_triunfo.classList.contains("ocultar") && cont_puntos.classList.contains("ocultar")) {
        cont_triunfo.classList.remove("ocultar");
        cont_puntos.classList.remove("ocultar");
        cont_cartas.classList.remove("ocultar");
    }
    let div = document.getElementById("cartas");
    if (Array.isArray(cartas)) { 
        cartas.forEach(carta => {
            comprobarCambio(carta.toString());
            let img = crearCarta(carta);
            div.appendChild(img);
        });
    } else {
        comprobarCambio(cartas);
        let img = crearCarta(cartas);
        div.appendChild(img);
    }
    while (div.querySelectorAll('img').length > 3) {
        div.querySelector('img').remove();
    }
    comprobarBrisca();
});
socket.on("turno", cambiarTurno);
socket.on("juegaCarta", function(carta) {
    cambiarTurno();
    let img = crearCarta(carta);
    contrincante.appendChild(img);
    cartaUnoImg = jugador.querySelector("img");
    cartaDosImg = contrincante.querySelector("img");
    if (!cartaUnoImg || !cartaDosImg) {
        return;
    } 
    setTimeout(deliberando, 1000);
});
socket.on("deliberando", mostrarDeliberando);
socket.on("deliberado", borrarDeliberando);
socket.on("terminarTurno", terminarJugada);
socket.on("cantarTriunfo", function(carta) {
    triunfo.querySelector('img').remove();
    let triunfoSrc = crearImagen(carta);
    addTriunfo(carta, triunfoSrc);
    comprobarDos();
});
function comprobarCambio(carta) {
    let cartaTriunfo = triunfo.querySelector("img").alt;
    if (carta == COMPROBAR_7 || (cartaTriunfo == COMPROBAR_7 && carta == COMPROBAR_2)) 
        cambiarTriunfo.disabled = false;
}
function comprobarDos() {
    let cartaTriunfo = triunfo.querySelector("img").alt;
    if (cartaTriunfo == COMPROBAR_7) {
        let cartasJugador = cartas.querySelectorAll('img');
        cartasJugador.forEach(carta => {
            if (carta.alt == COMPROBAR_2) {
                cambiarTriunfo.disabled = false;
                return;
            }
        });
    }
}
function comprobarBrisca() {
    let cartasJugador = cartas.querySelectorAll('img');
    let brisca = true;
    cartasJugador.forEach(carta => {
        if (!COMPROBAR_BRISCA.includes(carta.alt)) {
            brisca = false;
            return;
        }
    });
    if (brisca) {
        cantarBrisca.disabled = false;
    }
}
function cambiarTurno() {
    turno = !turno;
    if (turno && !partidaTerminada) {
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
        if (this.alt == COMPROBAR_7 || this.alt == COMPROBAR_2) {
            cambiarTriunfo.disabled = true;
        }
        let carta = this.alt;
        socket.emit("jugarCarta", carta, sala);
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
function addTriunfo(nomCarta, carta) {
    let newTriunfo = document.createElement("img");
    newTriunfo.src = carta;
    newTriunfo.alt = nomCarta;
    paloTriunfo = sacarPalo(nomCarta);
    triunfo.appendChild(newTriunfo);
    COMPROBAR_7 = "7 de " + paloTriunfo;
    COMPROBAR_BRISCA = ["1 de " + paloTriunfo, "3 de " + paloTriunfo, "12 de " + paloTriunfo];
    COMPROBAR_2 = "2 de " + paloTriunfo;

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
    socket.emit("mostrarDeliberando", sala);
    mostrarDeliberando();
    setTimeout(deliberado, 1000);
}
function deliberado() {
    socket.emit("borrarDeliberando", sala);
    borrarDeliberando();
    setTimeout(determinarGanador, 1000);
}
function determinarGanador() {
    let cartaUno = cartaUnoImg.alt;
    let cartaDos = cartaDosImg.alt;
    
    ganador = getResultado(cartaUno, cartaDos);
    let puntosTotales = sacarPuntos(cartaUno) + sacarPuntos(cartaDos);
    terminarJugada(ganador, puntosTotales);
    socket.emit("detGanador", !ganador, puntosTotales, sala);
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
        puntosCont.innerText = parseInt(puntosCont.innerText) + newPuntos;
        mostrarMensaje("¡Perdiste! Tu contrincante ha sumado " + newPuntos + " puntos");
        if (cartasRest.innerText == 1 && !triunfoEntregado) {
            let img = triunfo.querySelector('img').alt;
            triunfo.querySelector('img').remove();
            let imgTriunfo = crearCarta(img);
            cartas.appendChild(imgTriunfo);
            socket.emit("ultimaCarta", nom);
        }
    }
    popUpPuntos(newPuntos, ganado);
    limpiarMesa();
    if (puntos.innerText > 60) {
        terminarPartida();
    } else if (ganado) {
        socket.emit("pedirCarta");
    }
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
        let nuevoTriunfo = "";
        cont_cartas.querySelectorAll('img').forEach(function(imagen) {
            if (imagen.alt == COMPROBAR_7 || (imagen.alt == COMPROBAR_2 && cartaNueva == COMPROBAR_7)) {
                nuevoTriunfo = imagen.alt;
                imagen.remove();
            }
        });
        socket.emit("cantarTriunfo", nuevoTriunfo, sala);
        nuevoTriunfo = crearCarta(nuevoTriunfo);
        triunfo.appendChild(nuevoTriunfo);
        let imgCartaNueva = crearCarta(cartaNueva);
        cartas.appendChild(imgCartaNueva);
        cambiarTriunfo.disabled = true;
        comprobarDos();
        comprobarBrisca();
    }
}
function brisca() {
    if (turno) {
        puntos.innerText = parseInt(puntos.innerText) + 61;
        cantarBrisca.disabled = true;
        terminarPartida();
    }
}
function terminarPartida() {
    mostrarMensaje("¡Has ganado la partida!");
    socket.emit("terminarPartida", sala);
    turno = false;
    partidaTerminada = true;
}
function popUpPuntos(puntos, ganador) {
    let msj = "";
    let div = document.createElement("div");
    if (ganador) {
        msj = "¡Ganaste " + puntos + " puntos!";
        div.classList.add("puntos");
        
    } else {
        msj = "¡Tu contrincante ha ganado " + puntos + " puntos!";
        div.classList.add("puntosCont");
    }
    div.innerText = msj;
    div.classList.add("contenedor");
    div.classList.add("centrar");
    div.classList.add("brillar");

    document.querySelector('body').appendChild(div);
    protector.classList.remove('ocultar');
    setTimeout(() => {
        div.remove();
        protector.classList.add('ocultar');
    }, 3000);
}