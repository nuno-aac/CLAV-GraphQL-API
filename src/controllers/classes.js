const { UserInputError } = require("apollo-server-errors");
const { aql } = require("arangojs");

let buildFilter = (args) => {
    if (Object.keys(args).length == 0) return aql``
    let isFirst = true;

    let filters = [];

    filters.push(aql`FOR v1,e1 IN 1 OUTBOUND v._id GRAPH 'Graph'
    `)

    if (args.tipo != null){
        if (args.tipo == 'pc'){
            filters.push(aql`FILTER (e1.rel == 'processoTipoVC' && e1._to == 'Nodes/vc_processoTipo_pc')`)
            isFirst = false
        }
        else if (args.tipo == 'pe'){
            filters.push(aql`FILTER (e1.rel == 'processoTipoVC' && e1._to == 'Nodes/vc_processoTipo_pe')`)
            isFirst = false
        }
        else
            throw new UserInputError('Tipo de processo invalido')
    }

    if (args.ents != null) {
        args.ents.forEach(ent=> {
            if(isFirst){
                filters.push(aql`FILTER v1._key == '${aql.literal(ent)}'`)
                isFirst = false
            } else {
                filters.push(aql`|| v1._key == '${aql.literal(ent)}'`)
            }
        });        
    }

    if (args.tips != null) {
        args.tips.forEach(tip=> {
            if (isFirst) {
                filters.push(aql`FILTER v1._key == '${aql.literal(tip)}'`)
                isFirst = false
            } else {
                filters.push(aql`|| v1._key == '${aql.literal(tip)}'`)
            }
        });
    }


    return aql.join(filters)

}
module.exports.list = (context, args) => {
    let nivel = aql.literal('1..4')
    if(args.nivel != null)
        if(args.nivel >= 1 && args.nivel <= 4)
            nivel = aql.literal(args.nivel)
        else
            throw new UserInputError('Nivel de processo invalido')

    let filter = buildFilter(args);

    let query = aql`FOR v,e IN ${nivel} INBOUND 'Nodes/Classe_N1' GRAPH 'Graph'
                            FILTER e.rel == 'type' || e.rel == 'temPai'
                            ${filter}
                            return distinct v`
    console.log(query.query)
    return context.db.query(aql`${query}`)
        .then(resp => resp.all()).then((list) => list)
        .catch(err => console.log(err))
}

/*
module.exports.find = (db, id) => {
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
*/