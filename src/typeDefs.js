const { gql } = require('apollo-server-express');
const classesModel = require('./models/classes')
const legislacoesModel = require('./models/legislacoes')
const entidadesModel = require('./models/entidades')
const indicadoresModel = require('./models/indicadores')
const usersModel = require('./models/users')
const tipologiasModel = require('./models/tipologias')

const outputs = gql`
    ${classesModel.outputs}

    ${legislacoesModel.outputs}

    ${entidadesModel.outputs}

    ${indicadoresModel.outputs}

    ${usersModel.outputs}

    ${tipologiasModel.outputs}
`

const inputs = gql`
    ${classesModel.inputs}

    ${legislacoesModel.inputs}

    ${entidadesModel.inputs}

    ${usersModel.inputs}
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
        tipologias: [Tipologia!]!
        tipologia(_key: String!): Tipologia
        classes(tipo: String, nivel: Int, ents: [String!], tips: [String!]): [Classe!]!
        classesTree: [ClasseTree]
        indicadores: Indicadores!
    }

    type Mutation {
        registerUser(u: UserInput!): User
        login(email: String!, password: String!): Login
        addlegislacao(leg: LegislacaoInput!): Legislacao
        addEntidade(ent: EntidadeInput!): Entidade
        addClasse(classe: ClasseInput!): Classe
        importClasses(file: Upload!): Boolean!
    }
    
    scalar Upload

    ${outputs}

    ${inputs}

    
`;

module.exports = typeDefs