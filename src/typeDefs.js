const { gql } = require('apollo-server-express');

const outputs = gql`
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

    input ClasseInput {
        _key: String!
        nivel: Int!
        pai: String
        codigo: String!
        titulo: String!
        classeStatus: String
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
        idJust: String!
        valor: String!
        _key: String!
        justificacao: [CritJustClasse!]!
    }

    type PcaClasse {
        formaContagem: String!
        _key: String!
        idJust: String!
        notas: String!
        valores: String!
        justificacao: [CritJustClasse!]!
    }

    type CritJustClasse {
        tipoId: String!
        conteudo: String!
        criterio: String!
        processos: String!
        legislacao: String!
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
        classeStatus: String
        filhos: [ClasseTree]
    }

    type Login {
        token: String!
        user: User!
    }

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

    ${outputs}

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
    }

    ${types}

    ${inputs}

    
`;

module.exports = typeDefs