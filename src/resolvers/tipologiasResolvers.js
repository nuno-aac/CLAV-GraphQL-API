const tipologias = require('../controllers/tipologias')

const tips = {
    dono: (obj, args, context) => {
        return tipologias.getDonos(context, obj._key)
    },
    participante: (obj, args, context) => {
        return tipologias.getParticipantes(context, obj._key)
    },
    entidade: (obj, args, context) => {
        return tipologias.getEntidades(context, obj._key)
    },
}

module.exports = tips;
