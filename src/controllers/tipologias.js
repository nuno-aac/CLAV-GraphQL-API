const { aql } = require("arangojs");

module.exports.countTip = (context) => {
    return context.db.query(aql`Let n = (FOR v,e IN 1 INBOUND 'Nodes/TipologiaEntidade' GRAPH 'Graph'
                                        FILTER e.rel == 'type'
                                        RETURN v)
                                return {l: LENGTH(n)}`)
        .then(resp => resp.all()).then((list) => list[0].l)
        .catch(err => console.log(err))
}