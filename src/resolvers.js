const entidades = require('./controllers/entidades')
const legislacoes = require('./controllers/legislacoes')
const classes = require('./controllers/classes')
const users = require('./controllers/users')

// Provide resolver functions for your schema fields
const resolvers = {
    Query: {
        users: (obj, args, context) => {
            return users.list(context)
        },
        user: (obj, args, context) => {
            return users.find(context,args.id)
        },
        entidades: (obj, args, context) => {
            return entidades.list(context)
        },
        entidade: (obj, args, context) => {
            return entidades.find(context,args._key)
        },
        legislacoes: (obj, args, context) => {
            return legislacoes.list(context.db)
        },
        legislacao: (obj, args, context)  => {
            return legislacoes.find(context, args._key)
        },
        classes: (obj, args, context) => {
            return classes.list(context,args)
        },
        classesTree: (obj, args, context) => {
            return classes.tree(context, args)
        },
    },
    Mutation: {
        registerUser: (obj, args, context) => {
            return users.add(context, args.u)
        },
        login: (obj, args, context) => {
            return users.login(context,args.email,args.password)
        },
        addlegislacao: (obj, args, context) => {
            return legislacoes.add(context, args.leg)
        },
        addEntidade: (obj,args,context) => {
            return entidades.add(context,args.ent)
        }
    }
};

module.exports = resolvers