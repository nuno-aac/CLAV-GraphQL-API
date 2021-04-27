const { aql } = require("arangojs");
const { buildSemanticFilter } = require('../controllers/relacoes')

module.exports.list = (context) => {
        return context.db.query(aql`FOR v,e IN 1 INBOUND 'Nodes/TipologiaEntidade' GRAPH 'Graph'
                                FILTER e.rel == 'type'
                                RETURN v`)
            .then(resp => resp.all()).then((list) => list)
            .catch(err => console.log(err))
}
    
module.exports.find = (context, id) => {
    return context.db.query(aql`FOR v,e IN 1 INBOUND 'Nodes/TipologiaEntidade' GRAPH 'Graph'
                            FILTER e.rel == 'type' && v._key == ${id}
                            RETURN v`)
        .then(resp => resp.all()).then((list) => list[0])
        .catch(err => console.log(err))
}

module.exports.getDonos = (context, id) => {
    let node = "Nodes/" + id
    node = aql.literal(node)
    return context.db.query(aql`FOR v,e IN 1 INBOUND '${node}' GRAPH 'Graph'
                                FILTER e.rel == 'temDono'
                                RETURN {_key: v._key,titulo: v.titulo,codigo: v.codigo}`)
        .then(resp => resp.all()).then((list) => list)
        .catch(err => console.log(err))
}

module.exports.getParticipantes = async (context, id) => {
    let node = "Nodes/" + id
    let filter = await buildSemanticFilter(context, 'temParticipante')
    node = aql.literal(node)
    filter = aql.literal(filter)
    return context.db.query(aql`FOR v,rel IN 1 INBOUND '${node}' GRAPH 'Graph'
                                    ${filter}
                                    RETURN {_key: v._key,titulo: v.titulo,codigo: v.codigo, tipoPar: rel.rel}`)
        .then(resp => resp.all()).then((list) => list)
        .catch(err => console.log(err))
}

module.exports.getEntidades = (context, id) => {
    let node = "Nodes/" + id
    node = aql.literal(node)
    return context.db.query(aql`FOR v,e IN 1 INBOUND '${node}' GRAPH 'Graph'
                                FILTER e.rel == 'pertenceTipologiaEnt'
                                RETURN {_key: v._key,designacao: v.entDesignacao,sigla: v.entSigla}`)
        .then(resp => resp.all()).then((list) => list)
        .catch(err => console.log(err))
}


module.exports.countTip = (context) => {
    return context.db.query(aql`Let n = (FOR v,e IN 1 INBOUND 'Nodes/TipologiaEntidade' GRAPH 'Graph'
                                        FILTER e.rel == 'type'
                                        RETURN v)
                                return {l: LENGTH(n)}`)
        .then(resp => resp.all()).then((list) => list[0].l)
        .catch(err => console.log(err))
}