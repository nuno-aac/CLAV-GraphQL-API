const { aql } = require("arangojs");

module.exports.list = (db) => {
    return db.query(aql`FOR v,e IN 1 INBOUND 'Nodes/Entidade' GRAPH 'Graph'
                            FILTER e.rel == 'type'
                            RETURN v`)
        .then(resp => resp.all()).then((list) => list)
        .catch(err => console.log(err))
}

module.exports.find = (db,id) => {
    return db.query(aql`FOR v,e IN 1 INBOUND 'Nodes/Entidade' GRAPH 'Graph'
                            FILTER e.rel == 'type' && v._key == ${id}
                            RETURN v`)
        .then(resp => resp.all()).then((list) => list[0])
        .catch(err => console.log(err))
}

module.exports.add = async (db, entidade) => {
    //ADDING TYPE EDGE
    let edge = { _from: "Nodes/" + entidade._key, _to: "Nodes/Entidade", rel: 'type' }
    await db.query(aql`INSERT ${edge} INTO edges`)

    //ADDING ENTIDADE
    return db.query(aql`INSERT ${entidade} INTO Nodes
                        LET inserted = NEW RETURN inserted`)
        .then(resp => resp.all()).then((list) => list[0])
        .catch(err => console.log(err))
}