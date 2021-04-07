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
}

module.exports = classesResolvers;
