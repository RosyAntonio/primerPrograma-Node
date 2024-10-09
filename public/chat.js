var socket = io.connect('http://localhost:5000');

var persona = document.getElementById('persona'),
    password = document.getElementById('password'),
    appChat = document.getElementById('app-chat'),
    panelBienvenida = document.getElementById('panel-bienvenida'),
    usuario = document.getElementById('usuario'),
    mensaje = document.getElementById('mensaje'),
    botonEnviar = document.getElementById('enviar'),
    escribiendoMensaje = document.getElementById('escribiendo-mensaje'),
    output = document.getElementById('output'),
    listaUsuarios = document.getElementById('lista-usuarios');

// Almacena el nombre de usuario
function ingresarAlChat() {
    const username = persona.value; 
    const passwordValue = password.value; 

    if (username && passwordValue) {
        fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password: passwordValue })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                panelBienvenida.style.display = "none";
                appChat.style.display = "block";
                usuario.value = username;
                usuario.readOnly = true;

                // Notificar al servidor que el usuario se ha conectado
                socket.emit('usuario_conectado', username);

                // Obtener mensajes almacenados
                obtenerMensajes();
            } else {
                alert(data.message); 
            }
        })
        .catch(error => console.error('Error:', error));
    } else {
        alert("Por favor, ingrese un nombre de usuario y contraseña.");
    }
}

// Obtener mensajes de la base de datos
function obtenerMensajes() {
    fetch('/api/mensajes')
        .then(response => response.json())
        .then(data => {
            output.innerHTML = ''; // Limpia el contenedor de mensajes
            data.reverse().forEach(mensaje => { // Invertir el orden de los mensajes
                agregarMensajeAlChat(mensaje); // Utiliza la función para agregar el mensaje
            });
            // Desplazarse hacia abajo automáticamente después de cargar los mensajes
            output.scrollTop = output.scrollHeight; 
        })
        .catch(err => console.error('Error al obtener los mensajes:', err));
}

// Enviar mensaje de chat

botonEnviar.addEventListener('click', function() {
    if (mensaje.value) {
        const mensajeEnviado = {
            mensaje: mensaje.value,
            usuario: usuario.value
        };

        // Emitir el mensaje al servidor
        socket.emit('chat', mensajeEnviado);

        reproducirSonido(); // Reproducir sonido al enviar
        mensaje.value = ''; // Limpiar el campo de entrada después de enviar
    } else {
        console.log("Mensaje vacío no enviado.");
    }
});


// Función para agregar un mensaje al chat
function agregarMensajeAlChat(data) {
    const nuevoMensaje = document.createElement('p');
    nuevoMensaje.innerHTML = `<strong>${data.usuario}:</strong> ${data.mensaje}`;
    output.prepend(nuevoMensaje); // Insertar el mensaje en la parte superior
    output.scrollTop = output.scrollHeight; // Desplazarse hacia abajo
}

// Mostrar mensajes en el chat
socket.on('chat', function(data) {
    if (data.usuario && data.mensaje) {
        escribiendoMensaje.innerHTML = ''; // Limpia el mensaje de "escribiendo..."
        
        // Agregar el nuevo mensaje al principio del contenedor
        agregarMensajeAlChat(data); // Usar la función para agregar el mensaje
        
        // Reproduce el sonido del mensaje
        reproducirSonido();
    } else {
        console.error("Datos de mensaje inválidos:", data);
    }
});

// Mostrar "escribiendo..."
mensaje.addEventListener('keyup', function() {
    if (mensaje.value) {
        socket.emit('typing', { nombre: usuario.value, texto: mensaje.value });
    }
});

// Ocultar "escribiendo..." cuando no se está escribiendo
mensaje.addEventListener('blur', function() {
    escribiendoMensaje.innerHTML = ''; // Ocultar "escribiendo..." al salir del campo de mensaje
});

// Mostrar "escribiendo..."
socket.on('typing', function(data) {
    escribiendoMensaje.innerHTML = `<p><em>${data.nombre} está escribiendo...</em></p>`;
});

// Función para reproducir el sonido al recibir un mensaje
function reproducirSonido() {
    var audio = new Audio('message.mp3'); // Asegúrate de que la ruta sea correcta
    audio.play().catch(error => {
        console.error('Error al intentar reproducir el sonido:', error);
    });
}

// Actualizar lista de usuarios conectados
socket.on('usuarios_actualizados', function(usuarios) {
    listaUsuarios.innerHTML = ''; // Limpiar la lista actual
    usuarios.forEach(function(usuario) {
        const li = document.createElement('li');
        li.textContent = usuario;
        listaUsuarios.appendChild(li);
    });
});

// Llama a la función al cargar la página
window.onload = obtenerMensajes;
