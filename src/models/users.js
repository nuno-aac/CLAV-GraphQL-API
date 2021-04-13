const { gql } = require('apollo-server-express');

const outputs = gql`
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

    type Login {
        token: String!
        user: User!
    }
` 

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
`

module.exports.outputs = outputs;
module.exports.inputs = inputs;