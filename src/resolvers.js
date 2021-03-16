const entidades = require('./controllers/entidades')
const legislacoes = require('./controllers/legislacoes')
const classes = require('./controllers/classes')
const users = require('./controllers/users')

// Provide resolver functions for your schema fields
const resolvers = {
    Query: {
        users: (obj, args, context) => {
            return users.list(context.db)
        },
        user: (obj, args, context) => {
            return users.find(context.db,args.id)
        },
        entidades: (obj, args, context) => {
            return entidades.list(context.db)
        },
        entidade: (obj, args, context) => {
            return entidades.find(context.db,args._key)
        },
        legislacoes: (obj, args, context) => {
            return legislacoes.list(context.db)
        },
        legislacao: (obj, args, context)  => {
            return legislacoes.find(context.db, args._key)
        },
        classes: (obj, args, context) => {
            return classes.list(context.db,args)
        },
    },
    Mutation: {
        registerUser: (obj, args, context) => {
            return users.add(context.db, args.u)
        },
        login: (obj, args, context) => {
            return users.login(context.db,args.email,args.password, context)
        },
        addlegislacao: (obj, args, context) => {
            return legislacoes.add(context.db, args.leg)
        },
        addEntidade: (obj,args,context) => {
            return entidades.add(context.db,args.ent)
        }
    }
};

module.exports = resolvers