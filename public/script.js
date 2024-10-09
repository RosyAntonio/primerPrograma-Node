const socket = io.connect();

// Al conectar, pide el nombre de usuario
const username = prompt("Ingresa tu nombre de usuario:");
socket.emit('usuario_conectado', username);

// Recibe la lista actualizada de usuarios conectados y la muestra
socket.on('usuarios_actualizados', function(usuariosConectados) {
    const listaUsuarios = document.getElementById('usuariosEnLinea');
    listaUsuarios.innerHTML = ''; // Limpia la lista
    usuariosConectados.forEach(function(usuario) {
        const li = document.createElement('li');
        li.textContent = usuario;
        listaUsuarios.appendChild(li);
    });
});
