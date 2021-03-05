const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const arangojs = require("arangojs")
const { aql, Database } = require("arangojs");
const { buildASTSchema } = require('graphql');

let userExample = [{
        id: "0",
        email:"email@email.com",
        password:"sporting1906"
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

/*db.query(aql`FOR v,e IN 1 INBOUND 'Nodes/Entidade' GRAPH 'Graph'
    FILTER e.rel == 'type'
    RETURN v._key`)
    .then(resp => {
        resp.forEach((currentValue) => {
            console.log(currentValue);
        });
    })
    .catch(err => console.log(err))
*/               

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
    type Query {
        hello: String
        users: [User!]!
        user(id: Int!): User
        entidades: [Entidade!]!
        entidade(_key: String!): Entidade
    }

    type User {
        id: String!
        email: String
        password: String
    }

    type Entidade {
        _key: String,
        _id: String,
        _rev: String,
        entEstado: String,
        entSIOE: String,
        entSigla: String,
        entDataCriacao: String,
        entDataExtincao: String,
        entDesignacao: String,
        entInternacional: String
    }
`;

// Provide resolver functions for your schema fields
const resolvers = {
    Query: {
        hello: () => 'Stip',
        users: () => userExample,
        user: (obj,args) => userExample[args.id],
        entidades: (obj, args,context) => {
            return context.db.query(aql`FOR v,e IN 1 INBOUND 'Nodes/Entidade' GRAPH 'Graph'
                            FILTER e.rel == 'type'
                            RETURN v`)
                .then(resp =>  resp.all()).then((list) => list)
                .catch(err => console.log(err))
        },
        entidade: (obj, args, context) => {
            return context.db.query(aql`FOR v,e IN 1 INBOUND 'Nodes/Entidade' GRAPH 'Graph'
                            FILTER e.rel == 'type' && v._key == ${args._key}
                            RETURN v`)
        .then(resp => resp.all()).then((list) => list[0])
        .catch(err => console.log(err))
}
    },
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({
        db: new Database({
            url: "http://localhost:8529",
            databaseName: "Test",
            auth: { username: "root", password: "coficofi1" },
        })
    })
});

const app = express();
server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);