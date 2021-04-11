const classes = require('../controllers/classes')

const classesResolvers = {
    nivel: (obj, args, context) => {
        return obj.codigo.split('.').length
    },
    pai: (obj, args, context) => {
        return classes.getPai(context, obj._key)
    },
    termosInd: (obj, args, context) => {
        return classes.getTermosIndice(context, obj._key)
    },
    tipoProc: (obj, args, context) => {
        return classes.getProcessoTipoVC(context, obj._key)
    },
    donos: (obj, args, context) => {
        return classes.getDonos(context, obj._key)
    },
    participantes: (obj, args, context) => {
        return classes.getParticipantes(context, obj._key)
    },
    filhos: (obj, args, context) => {
        return classes.getFilhos(context, obj._key)
    },
    notasAp: (obj, args, context) => {
        return classes.getNotasAp(context, obj._key)
    },
    exemplosNotasAp: (obj, args, context) => {
        return classes.getExemplosNotasAp(context, obj._key)
    },
    notasEx: (obj, args, context) => {
        return classes.getNotasEx(context, obj._key)
    },
    temSubclasses4Nivel: (obj, args, context) => {
        return classes.has4Nivel(context, obj._key)
    },
    temSubclasses4NivelDF: (obj, args, context) => {
        return classes.has4NivelDF(context, obj._key)
    },
    temSubclasses4NivelPCA: (obj, args, context) => {
        return classes.has4NivelPCA(context, obj._key)
    },
    processosRelacionados: (obj, args, context) => {
        return classes.getProcRel(context, obj._key)
    },
    legislacao: (obj, args, context) => {
        return classes.getLegislacao(context, obj._key)
    },
    df: (obj, args, context) => {
        return classes.getDF(context, obj._key)
    },
    pca: (obj, args, context) => {
        return classes.getPCA(context, obj._key)
    },
}

module.exports = classesResolvers;
