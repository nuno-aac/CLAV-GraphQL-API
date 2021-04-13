const { gql } = require('apollo-server-express');

const outputs = gql`
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
`

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
`

module.exports.outputs = outputs;
module.exports.inputs = inputs;