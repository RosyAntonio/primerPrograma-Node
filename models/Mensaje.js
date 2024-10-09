const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MensajeSchema = new Schema({
    usuario: { type: String, required: true },
    mensaje: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Mensaje', MensajeSchema);
