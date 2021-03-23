const classes = require('../controllers/classes')
const relacoes = require('../controllers/relacoes')
const entidades = require('../controllers/entidades')
const legislacoes = require('../controllers/legislacoes')
const tipologias = require('../controllers/tipologias')
const critJust = require('../controllers/critJust')

const indicadores = {
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
    relTemRelProc: (obj, args, context) => {
        return relacoes.countRel(context, 'temRelProc')
    },
    relEAntecessorDe: (obj, args, context) => {
        return relacoes.countRel(context, 'eAntecessorDe')
    },
    relEComplementarDe: (obj, args, context) => {
        return relacoes.countRel(context, 'eComplementarDe')
    },
    relECruzadoCom: (obj, args, context) => {
        return relacoes.countRel(context, 'eCruzadoCom')
    },
    relESinteseDe: (obj, args, context) => {
        return relacoes.countRel(context, 'eSinteseDe')
    },
    relESintetizadoPor: (obj, args, context) => {
        return relacoes.countRel(context, 'eSintetizadoPor')
    },
    relESuplementoDe: (obj, args, context) => {
        return relacoes.countRel(context, 'eSuplementoDe')
    },
    relESuplementoPara: (obj, args, context) => {
        return relacoes.countRel(context, 'eSuplementoPara')
    },
    relTemDono: (obj, args, context) => {
        return relacoes.countRel(context, 'temDono')
    },
    relTemParticipante: (obj, args, context) => {
        return relacoes.countRel(context, 'temParticipante')
    },
    relTemParticipanteApreciador: (obj, args, context) => {
        return relacoes.countRel(context, 'temParticipanteApreciador')
    },
    relTemParticipanteComunicador: (obj, args, context) => {
        return relacoes.countRel(context, 'temParticipanteComunicador')
    },
    relTemParticipanteDecisor: (obj, args, context) => {
        return relacoes.countRel(context, 'temParticipanteDecisor')
    },
    relTemParticipanteAssessor: (obj, args, context) => {
        return relacoes.countRel(context, 'temParticipanteAssessor')
    },
    relTemParticipanteIniciador: (obj, args, context) => {
        return relacoes.countRel(context, 'temParticipanteIniciador')
    },
    relTemParticipanteExecutor: (obj, args, context) => {
        return relacoes.countRel(context, 'temParticipanteExecutor')
    },
    relTemLegislacao: (obj, args, context) => {
        return relacoes.countRel(context, 'temLegislacao')
    },
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
    }

}

module.exports = indicadores;