// constantes del servidor
const e = require("express");
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;
server.listen(PORT, () => {
    console.log("Servidor corriendo en el puerto " + PORT);
})

// Enviar los archivos de idioma al cliente
app.get("/lang-es", (req, res) => {
    res.sendFile(__dirname + "/idiomas/es.json");
});
app.get("/lang-en", (req, res) => {
    res.sendFile(__dirname + "/idiomas/en.json");
});
app.get("/lang-cat", (req, res) => {
    res.sendFile(__dirname + "/idiomas/cat.json");
});

let salas = [];
let jugadores = [];
const CARTAS = [
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
app.use(express.static('public'));
//TODO crear baraja para cada room
io.on("connection", (socket) => {
    socket.on("crearSala", (sala) => {
        if (salas.indexOf(sala) == -1) {
            socket.join(sala);
            salas.push([sala, CARTAS.slice()]);
            console.log(socket.rooms);
            socket.emit("exito", sala);
        } else {
            socket.emit("error", "La sala ya existe");
        }
    });
    socket.on("unirSala", (sala) => {
        console.log(getSalaIndex(sala));
        if (getSalaIndex(sala) != -1) {
            socket.join(sala);
            socket.emit("exito", sala);
            console.log(socket.rooms);
        } else {
            socket.emit("error", "La sala no existe");
        }
    });
    let partidaTerminada = false;
    socket.on("nuevoUsuario", (nom, sala) => {
        //TODO comprobar los jugadores solo de la sala
        if (jugadores.length < 2) {
            jugadores[jugadores.length] = socket.id;
            socket.emit("mensaje", "Bienvenido a la mesa " + nom);
            if (jugadores.length == 2) {
                let cartas = getBaraja(sala);
                triunfo(cartas);
                repartirCartas(cartas);
                io.to(Array.from(socket.rooms)[0]).emit("mensaje", "La partida comienza");
                let nuevoTurno = jugadores[Math.floor(Math.random() * 2)];
                setTimeout(() =>  io.to(nuevoTurno).emit("turno"), 2000);
            }
        } else {
            socket.emit("mensaje", "Lo siento, ya hay dos jugadores en la mesa. Visualiza la partida como espectador");
        }
    })
    socket.on("pedirCarta", (letra, paloTriunfo, sala) => {
        if (!partidaTerminada) {
            let carta = "";
            if (letra == "s") {
                carta = "7 de " + paloTriunfo;
            } else if (letra == "d") {
                carta = "2 de " + paloTriunfo;
            } else if (letra == "b") { 
                carta = [];
                carta[0] = "1 de " + paloTriunfo;
                carta[1] = "3 de " + paloTriunfo;
                carta[2] = "12 de " + paloTriunfo;
            } else {
                let baraja = getBaraja(sala);
                carta = nuevaCarta(baraja);
            }
            socket.to(socket.rooms[0]).emit("carta", carta);   
        } else {
            socket.emit("mensaje", "La partida ha terminado, no puedes pedir más cartas");
        }
    })
    socket.on("chat", (msg) => {
        socket.to(Array.from(socket.rooms)[0]).emit("chat", msg);
    });
    socket.on("jugarCarta", (carta) => {
        socket.to(Array.from(socket.rooms)[0]).emit("juegaCarta", carta);
    });
    socket.on("mostrarDeliberando",() => {
        socket.to(Array.from(socket.rooms)[0]).emit("deliberando");
    });
    socket.on("borrarDeliberando",() => {
        socket.to(Array.from(socket.rooms)[0]).emit("deliberado");
    });
    socket.on("detGanador", (ganador, puntos) => {
        socket.to(Array.from(socket.rooms)[0]).emit("terminarTurno", ganador, puntos);
    });
    socket.on("cantarTriunfo", (carta) => {
        socket.to(Array.from(socket.rooms)[0]).emit("cantarTriunfo", carta);
        socket.to(Array.from(socket.rooms)[0]).emit("mensaje", "Se ha cambiado el triunfo a " + carta);
    });
    socket.on("cartaBrisca", () => {
        socket.to(Array.from(socket.rooms)[0]).emit("cartaBrisca");
    });
    socket.on("terminarPartida", (nom) => {
        partidaTerminada = true;
        socket.to(Array.from(socket.rooms)[0]).emit("mensaje", nom + " ha ganado la partida");
        jugadores = [];
    });
    socket.on("disconnect", () => {
        if (jugadores.indexOf(socket.id) != -1) {
            let indice = jugadores.indexOf(socket.id);
            jugadores.splice(indice, 1);
            io.to(Array.from(socket.rooms)[0]).emit("mensaje", `Un jugador ha abandonado la partida`);
            io.to(Array.from(socket.rooms)[0]).emit("mensaje", `Has ganado la partida`);
            jugadores = [];
        }
    })
})
function repartirCartas(baraja) {
    jugadores.forEach(jugador => {
        let cartas = [];
        for (let i = 0; i < 3; i++) {
            let carta = nuevaCarta(baraja);
            cartas[i] =  carta;
        }
        io.to(jugador).emit("carta", cartas);
    })
}
function nuevaCarta(baraja) {
    let carta = baraja[Math.floor(Math.random() * baraja.length)];
    baraja.splice(baraja.indexOf(carta), 1);
    console.log("num cartas: " + baraja.length);
    return carta;
}
function triunfo(baraja) {
    let triunfo = nuevaCarta(baraja);
    io.emit("triunfo", triunfo);
}
function getBaraja(sala) {
    return salas[getSalaIndex(sala)][1];
}
function getSalaIndex(sala) {
    return salas.findIndex(fila => fila.includes(sala))
}
function comprobarSalas() {
    
}