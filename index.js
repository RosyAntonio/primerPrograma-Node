const express = require('express');
const socket = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Usuario = require('./models/Usuario'); // Modelo de Usuario
const Mensaje = require('./models/Mensaje'); // Modelo de Mensaje

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json()); // Para manejar JSON

const server = app.listen(5000, function() {
    console.log("Servidor escuchando en el puerto 5000");
});

const io = socket(server);

// Conexión a MongoDB
const uri = "mongodb+srv://melizandra:Melyrom_10@proyecto.0umwm.mongodb.net/chatAppDB";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado a MongoDB Atlas'))
    .catch(err => console.log('Error al conectar a MongoDB', err));

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Mostrar todos los usuarios en la base de datos para depuración
        const allUsers = await Usuario.find();
        console.log("Usuarios en la base de datos:", allUsers);

        console.log(`Buscando usuario: '${username}' con contraseña: '${password}'`);

        // Busca el usuario por nombre de usuario
        const user = await Usuario.findOne({ username });

        // Verificar si el usuario fue encontrado
        if (!user) {
            console.log('Usuario no encontrado.'); // Para saber si se encuentra el usuario
            return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
        }

        // Comparar la contraseña
        if (user.password !== password) {
            console.log('Contraseña incorrecta.');
            return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
        }

        // Si todo está bien
        res.json({ success: true, message: 'Autenticado correctamente' });
    } catch (err) {
        console.error('Error en el servidor:', err);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

app.get('/historial', async (req, res) => {
    try {
        // Obtener los últimos 50 mensajes del historial, ordenados por fecha
        const mensajes = await Mensaje.find().sort({ timestamp: 1 }).limit(50);
        res.json(mensajes);
    } catch (err) {
        console.error('Error al obtener el historial de mensajes:', err);
        res.status(500).json({ success: false, message: 'Error al obtener el historial de mensajes' });
    }
});

// Manejo de conexiones de Socket.io
let usuariosConectados = [];

io.on('connection', function(socket) {
    console.log('Nueva conexión: ', socket.id);

    socket.on('usuario_conectado', function(username) {
        socket.username = username; // Asigna el nombre de usuario al socket
        if (!usuariosConectados.includes(username)) {
            usuariosConectados.push(username);
        }
        io.sockets.emit('usuarios_actualizados', usuariosConectados);
    });

    socket.on('disconnect', function() {
        if (socket.username) {
            usuariosConectados = usuariosConectados.filter(user => user !== socket.username);
            console.log(socket.username + " se ha desconectado."); // Para depuración
            io.sockets.emit('usuarios_actualizados', usuariosConectados);
        }
    });

    socket.on('chat', function(data) {
        io.sockets.emit('chat', data);
        guardarMensajeEnBaseDeDatos(data); // Guardar el mensaje en la base de datos
    });

    socket.on('typing', function(data) {
        socket.broadcast.emit('typing', data);
    });
});

// Guardar el historial de mensajes en la base de datos
function guardarMensajeEnBaseDeDatos(data) {
    const nuevoMensaje = new Mensaje({
        usuario: data.usuario,
        mensaje: data.mensaje,
        timestamp: new Date()
    });
    nuevoMensaje.save().then(() => console.log("Mensaje guardado en la base de datos"))
    .catch(err => console.error('Error al guardar el mensaje:', err));
}

// Endpoint para obtener los últimos 50 mensajes
app.get('/api/mensajes', async (req, res) => {
    try {
        const mensajes = await Mensaje.find().sort({ timestamp: -1 }).limit(50);
        res.json(mensajes);
    } catch (err) {
        console.error('Error al obtener los mensajes:', err);
        res.status(500).json({ success: false, message: 'Error al obtener los mensajes' });
    }
});
