const { gql } = require('apollo-server-express');

const inputs = gql`
    """Entidades são entidades no sistema"""
    input EntidadeInput {
        _key: String!,
        entEstado: String!,
        entSIOE: String!,
        entSigla: String!,
        entDataCriacao: String,
        entDataExtincao: String,
        entDesignacao: String!,
        entInternacional: String!
    }

    input LegislacaoInput {
        _key: String!,
        diplomaData: String!,
        diplomaEstado: String!,
        diplomaLink: String!,
        diplomaNumero: String!,
        diplomaSumario: String!,
        diplomaTipo: String!
    }

`

const types = gql`
    type User {
        _id: String!
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

`

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
    type Query {
        users: [User!]!
        user(id: String!): User
        entidades: [Entidade!]!
        entidade(_key: String!): Entidade
        legislacoes: [Legislacao!]!
        legislacao(_key: String!): Legislacao
    }

    type Mutation {
        addlegislacao(leg: LegislacaoInput): Legislacao
        registerUser(email:String!, password:String!): User
        addEntidade(ent: EntidadeInput!): Entidade
    }

    ${types}

    ${inputs}
`;

module.exports = typeDefs