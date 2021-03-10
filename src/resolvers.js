const entidades = require('./controllers/entidades')

// Provide resolver functions for your schema fields
const resolvers = {
    Query: {
        hello: () => 'Stip',
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
            return entidades.list(context.db);
        },
        entidade: (obj, args, context) => {
            return entidades.find(context.db,args._key)
        },
        legislacoes: (obj, args, context) => {
            return context.db.query(aql`FOR v,e IN 1 INBOUND 'Nodes/Legislacao' GRAPH 'Graph'
                            FILTER e.rel == 'type'
                            RETURN v`)
                .then(resp => resp.all()).then((list) => list)
                .catch(err => console.log(err))
        },
        legislacao: (obj, args, context)  => {
            return context.db.query(aql`FOR v,e IN 1 INBOUND 'Nodes/Legislacao' GRAPH 'Graph'
                            FILTER e.rel == 'type' && v._key == ${args._key}
                            RETURN v`)
                .then(resp => resp.all()).then((list) => list[0])
                .catch(err => console.log(err))
        }
    },
    Mutation: {
        legislacao: (obj, args, context) =>{
            return context.db.query(aql`UPSERT { _key:${args._key} } 
                                        INSERT { _key:${args._key}, diplomaData: ${args.diplomaData} }
                                        UPDATE { diplomaData: ${args.diplomaData} } IN Nodes OPTIONS { exclusive: true }`)
                .then(resp => resp.all()).then((list) => list[0])
                .catch(err => console.log(err))
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