const { aql } = require("arangojs");
const { AuthenticationError, ApolloError } = require('apollo-server-express');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const salt = 14

module.exports.list = (context) => {
    return context.db.query(aql`for n in users return n`)
        .then(resp => resp.all()).then((list) => list) // Parsing ArrayCursor from arango to user list
        .catch(err => console.log(err))
}

module.exports.find = (context,id) => {
    return context.db.query(aql`for n in users
                    filter n._key == ${id}
                    return n`)
        .then(resp => resp.all()).then((list) => list[0]) // Parsing ArrayCursor from arango to single user
        .catch(err => console.log(err))
}

module.exports.add = async (context, user) => {
    user.local.password = await bcrypt.hash(user.local.password, salt) 
    return context.db.query(aql`INSERT ${user} INTO users LET inserted = NEW RETURN inserted`)
        .then(resp => resp.all()).then((list) => list[0]) // Parsing ArrayCursor from arango to single user
        .catch(err => console.log(err))
}

module.exports.login = (context,email,password) => {
    return context.db.query(aql`for n in users
                    filter n.email == ${email}
                    return n`)
        .then(resp => resp.all()).then((list) => list[0]) // Parsing ArrayCursor from arango to single user
        .then(user => {
            if(!user)
                throw new AuthenticationError('Utilizador desconhecido');
            if(user.local.password != password)
                throw new AuthenticationError('Password Errada');
            
            let token = jwt.sign(user, 'CLAVapisecret', { expiresIn: '3h' })
            context.res.cookie('token', token, {//not working
                expires: new Date(Date.now() + '3h'),
                secure: false, // set to true if your using https
                httpOnly: true
            });
            return { token: token, user: user }
        })
        .catch(err => {
            if (err.extensions != null && err.extensions.code === 'UNAUTHENTICATED')
                throw err
            else 
                throw new ApolloError('Erro no acesso à DB' + err.toString())
        })
}