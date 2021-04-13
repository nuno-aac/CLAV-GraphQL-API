const { gql } = require('apollo-server-express');

const outputs = gql`
    type Indicadores {
        classes: IndicadoresClasses!
        relacoes: IndicadoresRelacoes!
        entidades: Int!
        entidadesAtivas: EntsEstado!
        leg: Int!
        legVigor: LegsVigor!
        tipologias: Int!
        critJust: [IndValor!]!
        critJustTotal: IndValor!
        critJustEsp(crit: String!): IndValor!
        destFinal: [IndValor!]!
        destFinalEsp(pn: String!): IndValor!
    }

    type EntsEstado {
        ativas: Int!,
        inativas: Int!,
        emHarmonizacao: Int!
    }

    type LegsVigor {
        ativo: Int!,
        revogado: Int!,
        revogada: Int!
    }

    type IndValor {
        indicador: String!
        valor: Int!
    }

    type IndicadoresClasses {
        classes: Int!
        classesN1: Int!
        classesN2: Int!
        classesN3: Int!
        classesN4: Int!
    }

    type IndicadoresRelacoes {
        temRelProc: Int!
        eAntecessorDe: Int!
        eComplementarDe: Int!
        eCruzadoCom: Int!
        eSinteseDe: Int!
        eSintetizadoPor: Int!
        eSuplementoDe: Int!
        eSuplementoPara: Int!
        temDono: Int!
        temParticipante: Int!
        temParticipanteApreciador: Int!
        temParticipanteComunicador: Int!
        temParticipanteDecisor: Int!
        temParticipanteAssessor: Int!
        temParticipanteIniciador: Int!
        temParticipanteExecutor: Int!
        temLegislacao: Int!
    }
`

module.exports.outputs = outputs;