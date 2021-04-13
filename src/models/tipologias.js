const { gql } = require('apollo-server-express');

const outputs = gql`
    type Tipologia {
        _key: String!
        estado: String!
        designacao: String!
        participante: [ParticipanteTipologia!]!
        dono: [DonoTipologia!]!
        entidade: [EntidadeTipologia!]!
    }

    type ParticipanteTipologia {
        _key: String!
        codigo: String!
        tipoPar: String!
        titulo: String!
    }

    type DonoTipologia {
        _key: String!
        codigo: String!
        titulo: String!
    }

    type EntidadeTipologia {
        designacao: String!
        _key: String!
        sigla: String!
    }
`

module.exports.outputs = outputs;