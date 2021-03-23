const { aql } = require("arangojs");

module.exports.list = (context) => {
    return context.db.query(aql`FOR v,e IN 1 INBOUND 'Nodes/Entidade' GRAPH 'Graph'
                            FILTER e.rel == 'type'
                            RETURN v`)
        .then(resp => resp.all()).then((list) => list)
        .catch(err => console.log(err))
}

module.exports.find = (context,id) => {
    return context.db.query(aql`FOR v,e IN 1 INBOUND 'Nodes/Entidade' GRAPH 'Graph'
                            FILTER e.rel == 'type' && v._key == ${id}
                            RETURN v`)
        .then(resp => resp.all()).then((list) => list[0])
        .catch(err => console.log(err))
}

module.exports.add = async (context, entidade) => {
    //ADDING TYPE EDGE
    let edge = { _from: "Nodes/" + entidade._key, _to: "Nodes/Entidade", rel: 'type' }
    await context.db.query(aql`INSERT ${edge} INTO edges`)

    //ADDING ENTIDADE
    return context.db.query(aql`INSERT ${entidade} INTO Nodes
                        LET inserted = NEW RETURN inserted`)
        .then(resp => resp.all()).then((list) => list[0])
        .catch(err => console.log(err))
}

module.exports.countEnt = (context) => {
    return context.db.query(aql`Let n = (FOR v,e IN 1 INBOUND 'Nodes/Entidade' GRAPH 'Graph'
                                        FILTER e.rel == 'type'
                                        RETURN v)
                                return {l: LENGTH(n)}`)
        .then(resp => resp.all()).then((list) => list[0].l)
        .catch(err => console.log(err))
}

module.exports.countEntEstado = (context) => {
    return context.db.query(aql`Let n1 = (FOR v,e IN 1 INBOUND 'Nodes/Entidade' GRAPH 'Graph'
                                          FILTER e.rel == 'type' && v.entEstado == 'Ativa'
                                          RETURN v)
                                Let n2 = (FOR v,e IN 1 INBOUND 'Nodes/Entidade' GRAPH 'Graph'
                                          FILTER e.rel == 'type' && v.entEstado == 'Inativa'
                                          RETURN v)
                                Let n3 =  (FOR v,e IN 1 INBOUND 'Nodes/Entidade' GRAPH 'Graph'
                                          FILTER e.rel == 'type' && v.entEstado == 'Em harmonização'
                                          RETURN v)                           
                                return {ativas: LENGTH(n1), inativas: LENGTH(n2), emHarmonizacao: LENGTH(n3)}`)
        .then(resp => resp.all()).then((list) => list[0])
        .catch(err => console.log(err))
}
