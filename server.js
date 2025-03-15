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
let cartas = [
    "1 de oros", "2 de oros", "3 de oros", "4 de oros",
    "5 de oros", "6 de oros", "7 de oros", "10 de oros",
    "11 de oros", "12 de oros",

    "1 de copas", "2 de copas", "3 de copas", "4 de copas",
    "5 de copas", "6 de copas", "7 de copas", "10 de copas",
    "11 de copas", "12 de copas",

    "1 de bastos", "2 de bastos", "3 de bastos", "4 de bastos",
    "5 de bastos", "6 de bastos", "7 de bastos", "10 de bastos",
    "11 de bastos", "12 de bastos",

    "1 de espadas", "2 de espadas", "3 de espadas", "4 de espadas",
    "5 de espadas", "6 de espadas", "7 de espadas", "10 de espadas",
    "11 de espadas", "12 de espadas"
];
// Para que al conectarse al puerto 3000  salga nuestro index.html
app.use(express.static('public'));

io.on("connection", (socket) => {
    socket.on("nuevoUsuario", (nom) => {
        if (jugadores.length < 2) {
            jugadores[jugadores.length] = socket.id;
            jugadoresNombre[jugadoresNombre.length] = nom;
            socket.emit("mensaje", "Bienvenido a la mesa " + nom);
            if (jugadores.length == 2) {
                triunfo();
                repartirCartas();
                io.emit("mensaje", "La partida comienza");
                let nuevoTurno = jugadores[Math.floor(Math.random() * jugadores.length)];
                console.log("Turno de " + nuevoTurno);
                setTimeout(() =>  io.to(nuevoTurno).emit("turno"), 4000);
            }
        } else {
            socket.emit("mensaje", "Lo siento, ya hay dos jugadores en la mesa. Visualiza la partida como espectador");
        }
    })
    socket.on("pedirCarta", () => {
        let carta = cartas[Math.floor(Math.random() * cartas.length)];
        socket.emit("carta", carta);
    })
    socket.on("chat", (msg) => {
        socket.broadcast.emit("chat", msg);
    });
    socket.on("jugarCarta", (carta) => {
        socket.broadcast.emit("juegaCarta", carta);
        setTimeout(() =>  io.to(nuevoTurno).emit("turno"), 4000);
    });
    socket.on("disconnect", () => {
        if (jugadores.indexOf(socket.id) != -1) {
            let indice = jugadores.indexOf(socket.id);
            let nomPerdedor = jugadoresNombre[indice];
            jugadores.splice(indice, 1);
            jugadoresNombre.splice(indice, 1);
            let nomGanador = jugadoresNombre[0];

            io.emit("mensaje", `${nomPerdedor} ha abandonado la partida`);
            io.emit("mensaje", `${nomGanador} ha ganado la partida`);
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