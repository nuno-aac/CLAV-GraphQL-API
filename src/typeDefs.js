const { gql } = require('apollo-server-express');

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
    
    """Entidades são entidades no sistema"""
    type Entidade {
        _key: String!,
        entEstado: String!,
        entSIOE: String!,
        entSigla: String!,
        entDataCriacao: String,
        entDataExtincao: String,
        entDesignacao: String!,
        entInternacional: String!
    }
`;

module.exports = typeDefs