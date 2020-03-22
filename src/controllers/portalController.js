const express = require('express')

const router = express.Router();
const jwt = require('jsonwebtoken')
const secret = require('../config/auth.json')

//DataBase ---------------------------------------------

const Payment = require('../database/payment/payment')
const User = require('../database/user/user')
//-----------------------------------------------------




//Middleware de verificaçao de  permissao
router.use((req, res, next) => {

    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).send({ "erro": "Token de verificação não enviado!" });

    const parts = authHeader.split(' ');

    if (parts.length !== 2)
        return res.status(401).send({ "erro": "Token de verificação em formato invalido" });


    const [scheme, token] = parts

    if (!/^Bearer$/i.test(scheme))
        return res.status(401).send({ erro: "Bearer não encontrado!" });




    jwt.verify(token, secret.secret, async (err, decoded) => {

        if (err)
            return res.status(401).send({ erro: "Token invalido!", err });

        const user = await User.findOne({ _id: decoded.id })

        if (!user)
            return res.status(401).send({ erro: "Usuario não encontrado" })

        if (user.type != "Portal")
            return res.status(401).send({ erro: "Você não tem autorização para realizar essa ação" })


        req.userId = decoded.id;

        return next();
    })

})



router.get('/extract', async (req, res) => {

    try {
        var payments = JSON.parse(JSON.stringify(await Payment.find().select(["-_id", "-__v"])))

        //Colocando a data disponivel no formato pedido no documento do desafio, sem perder o tipo Date no banco de dados
        for (let i = 0; i < payments.length; i++)
            payments[i].disponivel = new Date(payments[i].disponivel).toLocaleDateString('ko-KR').replace(/. /g, '-').replace('.', '')

        return res.send(payments)
    } catch (err) {
        console.log(err)
        return res.status(400).send({ erro: "Houve um erro ao consultar o extrato", desc: err.toString() })
    }

})


router.get('/balance', async (req, res) => {

    try {

        var disponivel = 0.0
        var receber = 0.0

        const hoje = new Date();

        (await Payment.find())
            .forEach(p => p.disponivel <= hoje ? disponivel += p.liquido : receber += p.liquido)

        return res.send({ disponivel, receber })

    } catch (err) {
        console.log(err)
        return res.status(400).send({ erro: "Houve um erro ao consultar o saldo.", desc: err.toString() })
    }

})
module.exports = app => app.use('/portal', router)
