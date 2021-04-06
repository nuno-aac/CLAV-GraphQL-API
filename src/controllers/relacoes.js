const { aql } = require("arangojs");

let buildSemanticFilter = (context,rel) => {
    //FIND Semantic value stored in database
    let aqlrel = aql.literal(rel)
    return context.db.query(aql`LET subproperties = (FOR v,e IN 1 INBOUND 'Nodes/${aqlrel}' GRAPH 'Graph'
                                                        FILTER e.rel == 'subPropertyOf'
                                                     RETURN v)

                                LET inverses = (FOR node IN subproperties
                                                    FOR v,e IN 1 INBOUND node._id GRAPH 'Graph'
                                                    FILTER e.rel == 'inverseOf'
                                                RETURN v)

                                return APPEND(subproperties,inverses)`)
        .then(resp => resp.all()).then((list) => {
            let query = `FILTER rel.rel == '${rel}'`
            list[0].forEach(element => {
                query += ` || rel.rel == '${element._key}'`
            });

            return query
        })
        .catch(err => console.log(err))
}

module.exports.buildSemanticFilter = buildSemanticFilter

module.exports.countRel = async (context,rel) => {
    let filter;
    if (rel == 'temRelProc' || rel == 'temParticipante'){
        let sub = await buildSemanticFilter(context,rel)
        filter = aql.literal(sub)
    } else {
        filter = aql.literal(`FILTER rel.rel == '${rel}'`)
    }

    return context.db.query(aql`LET n = (FOR rel IN edges
                                    ${filter}
                                    RETURN 1)
                                RETURN LENGTH(n)`)
        .then(resp => resp.all()).then((list) => list[0])
        .catch(err => console.log(err))
}
