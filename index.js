const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { Database } = require("arangojs");
const typeDefs = require('./src/typeDefs')
const resolvers = require('./src/resolvers/resolvers')
var jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser")
const NodeCache = require('node-cache')

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req, res}) => {
        let user;
        // COOKIE PARSE TO GET TOKEN
        try{
            user = jwt.verify(req.cookies.token, 'CLAVapisecret')
        } catch{
            user = null;
        }
        const cache = new NodeCache();

        return {
            db: new Database({
                url: "http://localhost:8529",
                databaseName: "Test",
                auth: { username: "root", password: "coficofi1" }
            }),
            user: user, //ADD USER INSIDE TOKEN
            res,
            req,
            cache
        }
    },
    playground: {
        settings: {
            'request.credentials': 'include',
        },
    }
});

const app = express();
app.use(cookieParser());
server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);
