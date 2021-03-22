const { aql } = require("arangojs");

module.exports.countRel = (context,rel) => {
    let aqlrel = aql.literal(rel)
    return context.db.query(aql`LET n = (FOR rel IN edges
                                    FILTER rel.rel == '${aqlrel}'
                                    RETURN rel)
                                RETURN LENGTH(n)`)
        .then(resp => resp.all()).then((list) => list[0])
        .catch(err => console.log(err))
}
