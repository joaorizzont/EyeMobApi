const express = require('express')

const router = express.Router();
const jwt = require('jsonwebtoken')
const secret = require('../config/auth.json')



//Regex para validação dos horarios inseridos
dataValidator = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/



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

        if (user.type != "Terminal")
            return res.status(401).send({ erro: "Você não tem autorização para realizar essa ação" })


        req.userId = decoded.id;

        return next();
    })





})


//Funçao para calcular a data que o saldo ficara disponivel
const payCalc = (horario, modalidade) => {

    var disponivel = new Date(horario.getUTCFullYear(), horario.getUTCMonth(), horario.getUTCDate())

    if (modalidade == "debito") {
        do {
            disponivel = new Date(disponivel.getTime() + (24 * 60 * 60 * 1000))

        } while (!(disponivel.getDay() != 0 && disponivel.getDay() != 6))
    } else {
        disponivel = new Date(disponivel.getTime() + (30 * 24 * 60 * 60 * 1000))

        while (!(disponivel.getDay() != 0 && disponivel.getDay() != 6))
            disponivel = new Date(disponivel.getTime() + (24 * 60 * 60 * 1000))

    }



    return disponivel


}


//Rota de pagamento
router.post("/payment", async (req, res) => {

    try {

        const infos = {
            nsu,
            valor,
            bandeira,
            modalidade,
            horario
        } = req.body

        // Validando Dados -------------------------------------------------------------------------------------------

        if (typeof valor != "number")
            return res.status(400).send({ erro: "Valor inserido é invalido" });

        if (valor < 0)
            return res.status(400).send({ erro: "Não são permitidos vaoroes negativos." });

        if (!dataValidator.test(horario))
            return res.status(400).send({ erro: "O horario inserido é invalido" });

        if (modalidade != "debito" && modalidade != "credito")
            return res.status(400).send({ erro: "A modalidade inserida é invalida" });

        if (bandeira != "VISA" && bandeira != "MASTERCARD" && bandeira != "ELO" && bandeira != "AMEX")
            return res.status(400).send({ erro: "A bandeira inserida é invalida" });

        //------------------------------------------------------------------------------------------------------------


        //Caldulando data que o saldo ficara disponivel
        const disponivel = payCalc(new Date(horario), modalidade)

        //Descontando valor da taxa
        const liquido = (valor * (modalidade == "debito" ? 0.98 : 0.97)).toFixed(2)

        await Payment.create({ ...infos, disponivel, liquido })

        return res.send({ msg: "Pagamento realizado com sucesso!" });

    } catch (err) {
        console.log(err);
        res.status(400).send({ erro: "Houve um erro ao realizar o pagamento", desc: err.toString() })

    }

})


module.exports = app => app.use('/terminal', router)
