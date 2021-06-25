const { aql } = require("arangojs");

module.exports.list = (context) => { 
    return context.db.query(aql`FOR v,e IN 1 INBOUND 'Nodes/Legislacao' GRAPH 'Graph'
                            FILTER e.rel == 'type'
                            RETURN v`)
        .then(resp => resp.all()).then((list) => list)
        .catch(err => console.log(err))
}

module.exports.find = (context,id) => {
    return context.db.query(aql`FOR v,e IN 1 INBOUND 'Nodes/Legislacao' GRAPH 'Graph'
                            FILTER e.rel == 'type' && v._key == ${id}
                            RETURN v`)
        .then(resp => resp.all()).then((list) => list[0])
        .catch(err => console.log(err))
}

module.exports.add = async (context, legislacao) => {
    //ADDING TYPE EDGE
    let edge = { _from: "Nodes/" + legislacao._key, _to: "Nodes/Legislacao", rel: 'type' }
    await context.db.query(aql`INSERT ${edge} INTO edges`)

    //ADDING Legislacao
    return context.db.query(aql`INSERT ${legislacao} INTO Nodes
                        LET inserted = NEW RETURN inserted`)
        .then(resp => resp.all()).then((list) => list[0])
        .catch(err => console.log(err))
}

module.exports.countLeg = (context) => {
    return context.db.query(aql`Let n = (FOR v,e IN 1 INBOUND 'Nodes/Legislacao' GRAPH 'Graph'
                                        FILTER e.rel == 'type'
                                        RETURN v)
                                return {l: LENGTH(n)}`)
        .then(resp => resp.all()).then((list) => list[0].l)
        .catch(err => console.log(err))
}

module.exports.countLegVigor = (context) => {
    return context.db.query(aql`Let n1 = (FOR v,e IN 1 INBOUND 'Nodes/Legislacao' GRAPH 'Graph'
                                         FILTER e.rel == 'type' && v.diplomaEstado == 'Ativo'
                                         RETURN v)
                                Let n2 = (FOR v,e IN 1 INBOUND 'Nodes/Legislacao' GRAPH 'Graph'
                                         FILTER e.rel == 'type' && v.diplomaEstado == 'Revogada'
                                         RETURN v)
                                Let n3 =  (FOR v,e IN 1 INBOUND 'Nodes/Legislacao' GRAPH 'Graph'
                                         FILTER e.rel == 'type' && v.diplomaEstado == 'Revogado'
                                         RETURN v)                           
                                return {ativo: LENGTH(n1), revogada: LENGTH(n2), revogado: LENGTH(n3)}`)
        .then(resp => resp.all()).then((list) => list[0])
        .catch(err => console.log(err))
}


