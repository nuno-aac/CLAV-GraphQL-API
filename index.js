const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { Database } = require("arangojs");;
const typeDefs = require('./src/typeDefs')
const resolvers = require('./src/resolvers')

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