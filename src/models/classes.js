const { gql } = require('apollo-server-express');

const outputs = gql`
    """Classes representam classes no sistema"""
    type Classe {
        _key: String!
        pai: PaiClasse!
        nivel: Int!
        codigo: String!
        titulo: String!
        classeStatus: String
        termosInd: [TermosIndiceClasse!]!
        tipoProc: String
        processoTransversal: String
        donos: [DonoClasse!]!
        participantes: [ParticipanteClasse!]!
        filhos: [FilhoClasse!]!
        notasAp: [NotaApClasse!]!
        exemplosNotasAp: [ExemplosNotaApClasse!]!
        notasEx: [NotaExClasse!]!
        temSubclasses4Nivel: Boolean!
        temSubclasses4NivelDF: Boolean!
        temSubclasses4NivelPCA: Boolean!
        processosRelacionados: [ProcRelClasse!]!
        legislacao: [LegislacaoClasse!]!
        df: DfClasse
        pca: PcaClasse
    }

    type ClasseTree {
        _key: String!
        codigo: String!
        titulo: String!
        classeStatus: String
        filhos: [ClasseTree]
    }

    type PaiClasse {
        codigo: String
        titulo: String
    }

    type TermosIndiceClasse {
        _key: String!
        termo: String!
    }

    type DonoClasse {
        _key: String!
        tipo: String!
        sigla: String!
        designacao: String!
    }

    type ParticipanteClasse {
        _key: String!
        participLabel: String!
        sigla: String!
        designacao: String!
        idTipo: String!
    }

    type FilhoClasse {
        codigo: String!
        titulo: String!
        _key: String!
        status: String!
    }

    type NotaApClasse {
        _key: String!
        nota: String!
    }

    type ExemplosNotaApClasse {
        _key: String!
        nota: String!
    }

    type NotaExClasse {
        _key: String!
        nota: String!
    }

    type ProcRelClasse {
        codigo: String!
        tipoRel: String!
        titulo: String!
        _key: String!
        status: String!
    }

    type LegislacaoClasse {
        tipo: String!
        sumario: String!
        numero: String!
        _key: String!
    }

    type DfClasse {
        idJust: String
        valor: String!
        _key: String!
        nota: String
        justificacao: [CritJustClasse!]!
    }

    type PcaClasse {
        formaContagem: String
        _key: String!
        idJust: String
        notas: [String!]
        valores: [String!]
        justificacao: [CritJustClasse!]!
    }

    type CritJustClasse {
        tipoId: String!
        conteudo: String!
        criterio: String!
        processos: [ProcID!]!
        legislacao: [LegID!]!
    }

    type ProcID {
        procId: String!
    }

    type LegID {
        legId: String!
    }
`

const inputs = gql`
    
    input ClasseInput {
        _key: String!
        nivel: Int!
        pai: String
        codigo: String!
        titulo: String!
        classeStatus: String
    }
`
module.exports.outputs = outputs;
module.exports.inputs = inputs;