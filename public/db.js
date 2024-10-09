const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://melizandra:Melyrom_10@proyecto.0umwm.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const chatSchema = new mongoose.Schema({
    usuario: String,
    mensaje: String,
    fecha: { type: Date, default: Date.now }
});

const Chat = mongoose.model('Chat', chatSchema);

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    online: Boolean
});

const User = mongoose.model('User', userSchema);

module.exports = { Chat, User };
