const mongoose = require('../index');

const PaymentSchema = mongoose.Schema({

    nsu: {
        type: String,
        required: true
    },
    valor: {
        type: Number,
        required: true,
    },
    liquido: {
        type: Number,
        required: true,
    },
    bandeira: {
        type: String,
        required: true,
    },
    modalidade: {
        type: String,
        required: true,
    },
    bandeira: {
        type: String,
        required: true,
    },
    horario: {
        type: Date,
        required: true,
    },
    disponivel: {
        type: Date,
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now(),
        select: false
    }
});

module.exports = mongoose.model('Payment', PaymentSchema);