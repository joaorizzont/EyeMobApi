const mongoose = require('../index');
const bcrypt = require("bcryptjs")


const UserSchema = mongoose.Schema({

    login: {
        type: String,
        unique: true,
        required: true
    },
    pass: {
        type: String,
        required: true,
        select: false
    },
    type:{
        type: String,
        enum: ['Terminal','Portal'],
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now()
    }
});


UserSchema.pre('save', async function (next) {


    try {
        if (this.pass != undefined || this.pass != null) {
            const hash = await bcrypt.hash(this.pass, 10); // Encriptando senha
            this.pass = hash;
        }

        next();
    } catch (err) {
        console.log(err)
        throw "Erro no pre save do usuario"
    }


});



module.exports = mongoose.model('User', UserSchema);