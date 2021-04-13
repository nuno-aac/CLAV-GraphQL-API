const { gql } = require('apollo-server-express');

const outputs = gql`
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

const inputs = gql`
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

module.exports.outputs = outputs;
module.exports.inputs = inputs;