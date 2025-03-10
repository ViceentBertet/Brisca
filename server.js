// constantes del servidor
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// variables para el juego
let jugadores = [];
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
    console.log("Nuevo usuario conectado " + socket.id);
    if (jugadores.length < 2) {
        jugadores[jugadores.length] = socket.id;
        socket.emit("mensaje", "Bienvenido a la mesa");
        if (jugadores.length == 2) {
            triunfo();
            repartirCartas();
            socket.broadcast.emit("mensaje", "La partida comienza");
            let nuevoTurno = jugadores[Math.floor(Math.random() * jugadores.length)];
            console.log("Turno de " + nuevoTurno);
            io.to(nuevoTurno).emit("mensaje", "Es tu turno");
        }
    } else {
        socket.emit("mensaje", "Lo siento, ya hay dos jugadores en la mesa. Visualiza la partida como espectador");
    }
    socket.on("pedirCarta", (nom) => {
        let carta = cartas[Math.floor(Math.random() * cartas.length)];
        socket.emit("carta", carta);
    })
    socket.on("chat", (msg) => {
        socket.broadcast.emit("chat", msg);
    })
    socket.on("disconnect", () => {
        console.log("Usuario desconectado");
    })
})
function repartirCartas() {
    jugadores.forEach(jugador => {
        let cartas = [];
        for (let i = 0; i < 3; i++) {
            let carta = nuevaCarta();
            cartas[i] =  carta;
        }
        io.to(jugador).emit("carta", cartas);
    })
}
function nuevaCarta() {
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