const entidades = require('./controllers/entidades')
const legislacoes = require('./controllers/legislacoes')

// Provide resolver functions for your schema fields
const resolvers = {
    Query: {
        users: (obj, args, context) => {
            return context.db.query(aql`for n in users return n`)
                .then(resp => resp.all()).then((list) => list)
                .catch(err => console.log(err))
        },
        user: (obj, args, context) => {
            return context.db.query(aql`for n in users
                            filter n._id == ${args.id}
                            return n`)
                .then(resp => resp.all()).then((list) => list[0])
                .catch(err => console.log(err))
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
        }
    },
    Mutation: {
        addlegislacao: (obj, args, context) => {
            return legislacoes.add(context.db, args.leg)
        },
        registerUser: (obj, args, context) =>{
            return context.db.query(aql`INSERT { email: ${args.email}, password: ${args.password}} INTO users LET inserted = NEW RETURN inserted`)
                .then(resp => resp.all()).then((list) => list[0])
                .catch(err => console.log(err))
        },
        addEntidade: (obj,args,context) => {
            return entidades.add(context.db,args.ent)
        }
    }
};

module.exports = resolvers