const express = require('express');
const bodyParser = require('body-parser');



const PORT = process.env.PORT || 3000
const app = express();


//Para o express entender informaçoes em json
app.use(bodyParser.json());

//Para entender URL por parametros
app.use(bodyParser.urlencoded({ extended: false }));


//Importando todos os controllers
require('./controllers/index.js')(app);


app.get("/", async(req,res)=>{
})


//Iniciando o servidor
app.listen(PORT, () => {
    console.log("Servidor rodando!");
});

