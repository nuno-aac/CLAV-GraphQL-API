const classes = require('../controllers/classes')
const relacoes = require('../controllers/relacoes')
const entidades = require('../controllers/entidades')
const legislacoes = require('../controllers/legislacoes')
const tipologias = require('../controllers/tipologias')
const critJust = require('../controllers/critJust')
const dfinais = require('../controllers/dfinais')

const indicadores = {
    entidades: (obj, args, context) => {
        return entidades.countEnt(context)
    },
    entidadesAtivas: (obj, args, context) => {
        return entidades.countEntEstado(context)
    },
    leg: (obj, args, context) => {
        return legislacoes.countLeg(context)
    },
    legVigor:  (obj, args, context) => {
        return legislacoes.countLegVigor(context)
    },
    tipologias:  (obj, args, context) => {
        return tipologias.countTip(context)
    },
    critJust: (obj, args, context) => {
        return critJust.countCritJust(context)
    },
    critJustTotal: (obj, args, context) => {
        return critJust.countCritJustTotal(context)
    },
    critJustEsp: (obj, args, context) => {
        return critJust.countCritJustEsp(context, args.crit)
    },
    destFinal: (obj, args, context) => {
        return dfinais.countdfs(context)
    },
    destFinalEsp: (obj, args, context) => {
        return dfinais.countdfsEsp(context, args.pn)
    }
}

const indicadoresClasses = {
    classes: (obj, args, context) => {
        return classes.count(context)
    },
    classesN1: (obj, args, context) => {
        return classes.countNivel(context, 1)
    },
    classesN2: (obj, args, context) => {
        return classes.countNivel(context, 2)
    },
    classesN3: (obj, args, context) => {
        return classes.countNivel(context, 3)
    },
    classesN4: (obj, args, context) => {
        return classes.countNivel(context, 4)
    },
}

const indicadoresRelacoes = {
    temRelProc: (obj, args, context) => {
        return relacoes.countRel(context, 'temRelProc')
    },
    eAntecessorDe: (obj, args, context) => {
        return relacoes.countRel(context, 'eAntecessorDe')
    },
    eComplementarDe: (obj, args, context) => {
        return relacoes.countRel(context, 'eComplementarDe')
    },
    eCruzadoCom: (obj, args, context) => {
        return relacoes.countRel(context, 'eCruzadoCom')
    },
    eSinteseDe: (obj, args, context) => {
        return relacoes.countRel(context, 'eSinteseDe')
    },
    eSintetizadoPor: (obj, args, context) => {
        return relacoes.countRel(context, 'eSintetizadoPor')
    },
    eSuplementoDe: (obj, args, context) => {
        return relacoes.countRel(context, 'eSuplementoDe')
    },
    eSuplementoPara: (obj, args, context) => {
        return relacoes.countRel(context, 'eSuplementoPara')
    },
    temDono: (obj, args, context) => {
        return relacoes.countRel(context, 'temDono')
    },
    temParticipante: (obj, args, context) => {
        return relacoes.countRel(context, 'temParticipante')
    },
    temParticipanteApreciador: (obj, args, context) => {
        return relacoes.countRel(context, 'temParticipanteApreciador')
    },
    temParticipanteComunicador: (obj, args, context) => {
        return relacoes.countRel(context, 'temParticipanteComunicador')
    },
    temParticipanteDecisor: (obj, args, context) => {
        return relacoes.countRel(context, 'temParticipanteDecisor')
    },
    temParticipanteAssessor: (obj, args, context) => {
        return relacoes.countRel(context, 'temParticipanteAssessor')
    },
    temParticipanteIniciador: (obj, args, context) => {
        return relacoes.countRel(context, 'temParticipanteIniciador')
    },
    temParticipanteExecutor: (obj, args, context) => {
        return relacoes.countRel(context, 'temParticipanteExecutor')
    },
    temLegislacao: (obj, args, context) => {
        return relacoes.countRel(context, 'temLegislacao')
    },
}

module.exports.indicadores = indicadores;

module.exports.classes = indicadoresClasses;

module.exports.relacoes = indicadoresRelacoes;