const { aql } = require("arangojs");
const { AuthenticationError, ApolloError } = require('apollo-server-express');
var jwt = require('jsonwebtoken');

module.exports.list = (db) => {
    return db.query(aql`for n in users return n`)
        .then(resp => resp.all()).then((list) => list) // Parsing ArrayCursor from arango to user list
        .catch(err => console.log(err))
}

module.exports.find = (db,id) => {
    return db.query(aql`for n in users
                    filter n._key == ${id}
                    return n`)
        .then(resp => resp.all()).then((list) => list[0]) // Parsing ArrayCursor from arango to single user
        .catch(err => console.log(err))
}

module.exports.add = (db, user) => {
    return db.query(aql`INSERT ${user} INTO users LET inserted = NEW RETURN inserted`)
        .then(resp => resp.all()).then((list) => list[0]) // Parsing ArrayCursor from arango to single user
        .catch(err => console.log(err))
}

module.exports.login =  (db,email,password) => {
    return db.query(aql`for n in users
                    filter n.email == ${email}
                    return n`)
        .then(resp => resp.all()).then((list) => list[0]) // Parsing ArrayCursor from arango to single user
        .then(user => {
            if(!user)
                throw new AuthenticationError('Utilizador desconhecido');
            if(user.password !== password)
                throw new AuthenticationError('Password Errada');
                
            return { token: jwt.sign(user, 'CLAVapisecret', { expiresIn: '3h' }), user: user }
        })
        .catch(err => {
            if (err.extensions.code === 'UNAUTHENTICATED')
                throw err
            else 
                throw new ApolloError('Erro no acesso à DB')
        })
}