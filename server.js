// constantes del servidor
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// variables para el juego
let jugadores = [];
let jugadoresNombre = [];
const cartas = [
    "uno de oros", "dos de oros", "tres de oros", "cuatro de oros",
    "cinco de oros", "seis de oros", "siete de oros", "diez de oros",
    "once de oros", "doce de oros",

    "uno de copas", "dos de copas", "tres de copas", "cuatro de copas",
    "cinco de copas", "seis de copas", "siete de copas", "diez de copas",
    "once de copas", "doce de copas",

    "uno de bastos", "dos de bastos", "tres de bastos", "cuatro de bastos",
    "cinco de bastos", "seis de bastos", "siete de bastos", "diez de bastos",
    "once de bastos", "doce de bastos",

    "uno de espadas", "dos de espadas", "tres de espadas", "cuatro de espadas",
    "cinco de espadas", "seis de espadas", "siete de espadas", "diez de espadas",
    "once de espadas", "doce de espadas"
];
// Para que al conectarse al puerto 3000  salga nuestro index.html
app.use(express.static('public'));

io.on("connection", (socket) => {
    socket.on("nuevoUsuario", (nom) => {
        if (jugadores.length < 2) {
            jugadores[jugadores.length] = socket.id;
            jugadoresNombre[jugadoresNombre.length] = nom;
            setTimeout(() => socket.emit("mensaje", "Bienvenido a la mesa " + nom),500);
            if (jugadores.length == 2) {
                triunfo();
                repartirCartas();
                socket.broadcast.emit("mensaje", "La partida comienza");
                let nuevoTurno = jugadores[Math.floor(Math.random() * jugadores.length)];
                console.log("Turno de " + nuevoTurno);
                setTimeout(() =>  io.to(nuevoTurno).emit("turno"), 4000);
            }
        } else {
            socket.emit("mensaje", "Lo siento, ya hay dos jugadores en la mesa. Visualiza la partida como espectador");
        }
    })
    socket.on("pedirCarta", (nom) => {
        let carta = cartas[Math.floor(Math.random() * cartas.length)];
        socket.emit("carta", carta);
    })
    socket.on("chat", (msg) => {
        socket.broadcast.emit("chat", msg);
    })
    socket.on("disconnect", () => {
        if (jugadores.indexOf(socket.id) != -1) {
            let indice = jugadores.indexOf(socket.id);
            let nomPerdedor = jugadoresNombre[indice];
            jugadores.splice(indice, 1);
            jugadoresNombre.splice(indice, 1);
            let nomGanador = jugadoresNombre[0];

            io.emit("mensaje", `${nomPerdedor} ha abandonado la partida`);
            io.emit("mensaje", `${nomGanador} ha abandonado la partida`);
            jugadores = [];
            jugadoresNombre = [];
        }
    })
})
function repartirCartas() {
    jugadores.forEach(jugador => {
        let cartas = [];
        for (let i = 0; i < 3; i++) {
            let carta = nuevaCarta();
            cartas[i] =  carta;
        }
        console.log(cartas);
        io.to(jugador).emit("carta", cartas);
    })
}
function nuevaCarta() {
    console.log(cartas.length);
    let carta = cartas[Math.floor(Math.random() * cartas.length)];
    cartas.splice(cartas.indexOf(carta), 1);
    return carta;
}
function triunfo() {
    let triunfo = nuevaCarta();
    io.emit("triunfo", triunfo);
}
const PORT = 3000;
server.listen(PORT, () => {
    console.log("Servidor corriendo en el puerto " + PORT);
})