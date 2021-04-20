const classes = require('../controllers/classes')

const classesResolvers = {
    nivel: (obj, args, context) => {
        return obj.codigo.split('.').length
    },
    pai: (obj, args, context) => {
        if(obj.pai != undefined) return obj.pai
        return classes.getPai(context, obj._key)
    },
    termosInd: (obj, args, context) => {
        if(obj.termosInd != undefined) return obj.termosInd
        return classes.getTermosIndice(context, obj._key)
    },
    tipoProc: (obj, args, context) => {
        if(obj.tipoProc != undefined) return obj.tipoProc
        return classes.getProcessoTipoVC(context, obj._key)
    },
    donos: (obj, args, context) => {
        if(obj.donos != undefined) return obj.donos
        return classes.getDonos(context, obj._key)
    },
    participantes: (obj, args, context) => {
        if(obj.participantes != undefined) return obj.participantes
        return classes.getParticipantes(context, obj._key)
    },
    filhos: (obj, args, context) => {
        if(obj.filhos != undefined) return obj.filhos
        return classes.getFilhos(context, obj._key)
    },
    notasAp: (obj, args, context) => {
        if(obj.notasAp != undefined) return obj.notasAp
        return classes.getNotasAp(context, obj._key)
    },
    exemplosNotasAp: (obj, args, context) => {
        if(obj.exemplosNotasAp != undefined) return obj.exemplosNotasAp
        return classes.getExemplosNotasAp(context, obj._key)
    },
    notasEx: (obj, args, context) => {
        if(obj.notasEx != undefined) return obj.notasEx
        return classes.getNotasEx(context, obj._key)
    },
    temSubclasses4Nivel: (obj, args, context) => {
        if(obj.temSubclasses4Nivel != undefined) return obj.temSubclasses4Nivel
        return classes.has4Nivel(context, obj._key)
    },
    temSubclasses4NivelDF: (obj, args, context) => {
        if(obj.temSubclasses4NivelDF != undefined) return obj.temSubclasses4NivelDF
        return classes.has4NivelDF(context, obj._key)
    },
    temSubclasses4NivelPCA: (obj, args, context) => {
        if(obj.temSubclasses4NivelPCA != undefined) return obj.temSubclasses4NivelPCA
        return classes.has4NivelPCA(context, obj._key)
    },
    processosRelacionados: (obj, args, context) => {
        if(obj.processosRelacionados != undefined) return obj.processosRelacionados
        return classes.getProcRel(context, obj._key)
    },
    legislacao: (obj, args, context) => {
        if(obj.legislacao != undefined) return obj.legislacao
        return classes.getLegislacao(context, obj._key)
    },
    df: (obj, args, context) => {
        if(obj.df != undefined) return obj.df
        return classes.getDF(context, obj._key)
    },
    pca: (obj, args, context) => {
        if(obj.pca != undefined) return obj.pca
        return classes.getPCA(context, obj._key)
    },
}

module.exports = classesResolvers;
