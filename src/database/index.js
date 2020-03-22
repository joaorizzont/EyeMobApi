
const mongoose = require('mongoose')

mongoose.connect('mongodb://zer0__1:123456abc@ds161322.mlab.com:61322/eye_api', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Conectado ao banco de dados com sucesso!");
    })
    .catch((err) => {
        console.log("Erro ao conectar ao banco de dados !", err)
    })

mongoose.Promise = global.Promise


module.exports = mongoose

