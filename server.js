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
    "./img/uno_oros", "./img/dos_oros", "./img/tres_oros", "./img/cuatro_oros",
    "./img/cinco_oros", "./img/seis_oros", "./img/siete_oros", "./img/diez_oros",
    "./img/once_oros", "./img/doce_oros",
  
    "./img/uno_copas", "./img/dos_copas", "./img/tres_copas", "./img/cuatro_copas",
    "./img/cinco_copas", "./img/seis_copas", "./img/siete_copas", "./img/diez_copas",
    "./img/once_copas", "./img/doce_copas",
  
    "./img/uno_bastos", "./img/dos_bastos", "./img/tres_bastos", "./img/cuatro_bastos",
    "./img/cinco_bastos", "./img/seis_bastos", "./img/siete_bastos", "./img/diez_bastos",
    "./img/once_bastos", "./img/doce_bastos",
  
    "./img/uno_espadas", "./img/dos_espadas", "./img/tres_espadas", "./img/cuatro_espadas",
    "./img/cinco_espadas", "./img/seis_espadas", "./img/siete_espadas", "./img/diez_espadas",
    "./img/once_espadas", "./img/doce_espadas"
  ];
// Para que al conectarse al puerto 3000  salga nuestro index.html
app.use(express.static('public'));

io.on("connection", (socket) => {
    console.log("Nuevo usuario conectado " + socket.id);
    if (jugadores.length > 2) {
        jugadores[jugadores.length] = socket.id
        repartir();
    }
    socket.on("chat", (msg) => {
        socket.broadcast.emit("chat", msg);
    })
    socket.on("disconnect", () => {
        console.log("Usuario desconectado");
    })
})

const PORT = 3000;
server.listen(PORT, () => {
    console.log("Servidor corriendo en el puerto " + PORT);
})