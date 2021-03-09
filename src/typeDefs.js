const { gql } = require('apollo-server-express');

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
    type Query {
        hello: String
        users: [User!]!
        user(id: Int!): User
        entidades: [Entidade!]!
        entidade(_key: String!): Entidade
        legislacoes: [Legislacao!]!
        legislacao(_key: String!): Legislacao
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

    type Legislacao {
        _key: String!,
        diplomaData: String!,
        diplomaEstado: String!,
        diplomaLink: String!,
        diplomaNumero: String!,
        diplomaSumario: String!,
        diplomaTipo: String!
    }

`;

module.exports = typeDefs