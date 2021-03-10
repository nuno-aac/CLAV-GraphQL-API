const { aql } = require("arangojs");

let userExample = [{
    id: "0",
    email: "email@email.com",
    password: "sporting1906"
}, {
    id: "1",
    email: "email@email.com",
    password: "sporting1906"
}, {
    id: "2",
    email: "email@email.com",
    password: "sporting1906"
}
]

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
            return context.db.query(aql`FOR v,e IN 1 INBOUND 'Nodes/Entidade' GRAPH 'Graph'
                            FILTER e.rel == 'type'
                            RETURN v`)
                .then(resp => resp.all()).then((list) => list)
                .catch(err => console.log(err))
        },
        entidade: (obj, args, context) => {
            return context.db.query(aql`FOR v,e IN 1 INBOUND 'Nodes/Entidade' GRAPH 'Graph'
                            FILTER e.rel == 'type' && v._key == ${args._key}
                            RETURN v`)
                .then(resp => resp.all()).then((list) => list[0])
                .catch(err => console.log(err))
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
        } 
    }
};

module.exports = resolvers