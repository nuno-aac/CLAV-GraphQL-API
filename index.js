const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const arangojs = require("arangojs")
const { aql, Database } = require("arangojs");
const { buildASTSchema } = require('graphql');

const db = new Database({
    url: "http://localhost:8529",
    databaseName: "Test",
    auth: { username: "root", password: "coficofi1" },
});


db.query(aql`FOR v,e IN 1 INBOUND 'Nodes/Entidade' GRAPH 'Graph'
    FILTER e.rel == 'type'
    RETURN v._key`)
    .then(resp => {
        resp.forEach((currentValue) => {
            console.log(currentValue);
        });
    })
    .catch(err => console.log(err))
                

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    hello: Int
    xau: String
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
    Query: {
        hello: () => 10,
        xau: () => 'Stip'
    },
};

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();
server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);