const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { Database } = require("arangojs");
const typeDefs = require('./src/typeDefs')
const resolvers = require('./src/resolvers')
const cookieParser = require("cookie-parser")

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req, res}) => {
        // COOKIE PARSE TO GET TOKEN
        console.log(req.cookies.token)//doesnt work
        
        // VERIFY TOKEN

        return {
            db: new Database({
                url: "http://localhost:8529",
                databaseName: "Test",
                auth: { username: "root", password: "coficofi1" }
            }),
            user: null, //ADD USER INSIDE TOKEN
            res: res,
            req: req
        }
    }
});

const app = express();
app.use(cookieParser());
server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);