// constantes del servidor
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
        console.log("Creando sala " + sala);
        if (salas.indexOf(sala) == -1) {
            socket.join(sala);
            salas.push([sala, CARTAS.slice(), new Set()]);
            socket.emit("exito", sala);
        } else {
            socket.emit("error", "La sala ya existe");
        }
    });
    socket.on("unirSala", (sala) => {
        if (getSalaIndex(sala) != -1) {
            socket.join(sala);
            socket.emit("exito", sala);
        } else {
            socket.emit("error", "La sala no existe");
        }
    });
    let partidaTerminada = false;
    socket.on("nuevoUsuario", (nom, sala) => {
        
        salas[getSalaIndex(sala)][2].add(socket.id);
        if (salas[getSalaIndex(sala)][2].size < 3) {
            socket.emit("mensaje", "Bienvenido a la mesa " + nom);
            if (salas[getSalaIndex(sala)][2].size == 2) {
                let cartas = getBaraja(sala);
                triunfo(cartas, sala);
                repartirCartas(cartas, sala);
                enviarMensaje(sala,"La partida comienza");
                let turnoDisponible = Array.from(salas[getSalaIndex(sala)][2]);
                let nuevoTurno = turnoDisponible[Math.floor(Math.random() * 2)];
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
    socket.on("terminarPartida", (nom, sala) => {
        partidaTerminada = true;
        socket.to(Array.from(socket.rooms)[0]).emit("mensaje", nom + " ha ganado la partida");
        salas.splice(getSalaIndex(sala), 1);

    });
    socket.on("disconnect", () => {
        let found = getPosJugador(socket.id);
        if (found.boolean ) {
            let jugadoresSala = Array.from(salas[found.pos[0]][2]);
            console.log("El usuario " + socket.id + " se ha desconectado");
            jugadoresSala.splice(found.pos[1], 1);
            if (jugadoresSala.length < 2) {
                enviarMensaje(salas[found.pos[0]][0], `Un jugador ha abandonado la partida`);
                io.to(salas[found.pos[0]][0]).emit("mensaje", `Has ganado la partida`);
                enviarMensaje(salas[found.pos[0]][0], `La partida ha terminado`);
                console.log("Se ha borrado la sala " + salas[found.pos[0]][0]);
                salas.splice(found.pos[0], 1);
            }
        }
    })
})
function enviarMensaje(sala, mensaje) {
    Array.from(salas[getSalaIndex(sala)][2]).forEach(jugador => {
        io.to(jugador).emit("mensaje", mensaje);
    })
}
function repartirCartas(baraja, sala) {
    Array.from(salas[getSalaIndex(sala)][2]).forEach(jugador => {
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
function triunfo(baraja, sala) {
    let triunfo = nuevaCarta(baraja);
    Array.from(salas[getSalaIndex(sala)][2]).forEach(jugador => io.to(jugador).emit("triunfo", triunfo))
}
function getBaraja(sala) {
    return salas[getSalaIndex(sala)][1];
}
function getSalaIndex(sala) {
    return salas.findIndex(fila => fila.includes(sala))
}
function getPosJugador(id) {
    console.log("id: " + id);
    let found = {boolean: false, pos: []};
    for (let i = 0; i < salas.length; i++) {
        for (let j = 0; j < salas[i][2].size; j++) {
            if (Array.from(salas[i][2])[j] == id) {
                found.boolean = true;
                found.pos.push(i);
                found.pos.push(j);
                console.log("jugador encontrado " + i + " 2 " + j);
                break;
            }
        }
        if (found.boolean) break;
    }
    return found;
}