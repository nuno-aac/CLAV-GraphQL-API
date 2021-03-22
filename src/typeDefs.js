const { gql } = require('apollo-server-express');

const inputs = gql`
    input UserInput {
        _key: String
        username: String!
        level: Int!
        permissions: PermissionsInput!
        internal: Boolean!
        email: String!
        local: LocalInput!
        entidade: String!
        notificacoes: [String!]!
    }

    input PermissionsInput {
        LC: Boolean!
        AE: Boolean!
        ES: Boolean!
    }

    input LocalInput {
        password: String!
    }

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
        _key: String
        username: String!
        level: Int!
        permissions: Permissions!
        internal: Boolean!
        email: String!
        local: Local!
        entidade: String!
        notificacoes: [String!]!
    }

    type Permissions {
        LC: Boolean!
        AE: Boolean!
        ES: Boolean!
    }

    type Local {
        password: String!
    }

    """Classes representam classes no sistema"""
    type Classe {
        _key: String!
        codigo: String!
        titulo: String!
        id: String!
        status: String
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

    type ClasseTree {
        _key: String!
        codigo: String!
        titulo: String!
        id: String!
        status: String
        filhos: [ClasseTree]
    }

    type Login {
        token: String!
        user: User!
    }

    type Indicadores {
        classes: Int!
        classesN1: Int!
        classesN2: Int!
        classesN3: Int!
        classesN4: Int!
        relTemRelProc: Int!
        relEAntecessorDe: Int!
        relEComplementarDe: Int!
        relECruzadoCom: Int!
        relESinteseDe: Int!
        relESintetizadoPor: Int!
        relESuplementoDe: Int!
        relESuplementoPara: Int!
        relTemDono: Int!
        relTemParticipante: Int!
        relTemParticipanteApreciador: Int!
        relTemParticipanteComunicador: Int!
        relTemParticipanteDecisor: Int!
        relTemParticipanteAssessor: Int!
        relTemParticipanteIniciador: Int!
        relTemParticipanteExecutor: Int!
        relTemLegislacao: Int!
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
        classes(tipo: String, nivel: Int, ents: [String!], tips: [String!]): [Classe!]!
        classesTree: [ClasseTree]
        indicadores: Indicadores!
    }

    type Mutation {
        registerUser(u: UserInput!): User
        login(email: String!, password: String!): Login
        addlegislacao(leg: LegislacaoInput!): Legislacao
        addEntidade(ent: EntidadeInput!): Entidade
    }

    ${types}

    ${inputs}
`;

module.exports = typeDefs