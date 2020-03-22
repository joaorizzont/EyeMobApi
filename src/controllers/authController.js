const express = require('express');

const router = express.Router();

const secret = require('../config/auth.json')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")


//DataBase ---------------------------------------------

const Users = require('../database/user/user')

//-----------------------------------------------------





async function tokenGen(params = {}) {
    const token = jwt.sign(params, secret.secret, {
        expiresIn: 2592000,
    });

    return token;
}

router.post('/singin', async (req, res) => {

    const infos = {
        login,
        pass
    } = req.body


    try {


        if (await Users.findOne({ login }))
            return res.status(401).send({ erro: "Login ja cadastrado no sistema!" })


        const user = await Users.create(infos)

        user.pass = null

        return res.send({ user, token: await tokenGen({ id: user._id }) })
    } catch (err) {
        console.log(err)
        return res.status(400).send({ erro: "Falha ao tentar se cadastrar!", err: err })
    }
})


router.post('/login', async (req, res) => {


    const { login, pass } = req.body

    try {
        const user = await Users.findOne({ login }).select('+pass');

        if (!user)
            return res.status(404).send({ erro: "Usuario não encontrado!" });

        if (!await bcrypt.compare(pass, user.pass))
            return res.status(400).send({ erro: "Senha incorreta!" });

        user.pass = undefined;

        return res.send({ user, token: await tokenGen({ id: user.id, tipo: user.tipo }) });


    } catch (err) {
        console.log(err)
        return res.status(400).send({ erro: "Um erro aconteceu ao tentar logar", err });
    }





})













module.exports = app => app.use('/auth', router)
