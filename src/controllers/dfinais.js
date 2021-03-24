const { aql } = require("arangojs");

module.exports.countdfs = (context) => {
    return context.db.query(aql`Let s = (FOR v,e IN 1 INBOUND 'Nodes/DestinoFinal' GRAPH 'Graph'
                        FILTER e.rel == 'type'
                        RETURN v)

                        return s`)
        .then(resp => resp.all()).then((list) => {
            let ret = [{
                indicador: "C",
                valor:0
            },{
                indicador: "E",
                valor:0
            },{
                indicador: "CP",
                valor:0
            },{
                indicador: "NE",
                valor:0
            },]
            
            list[0].forEach(d => {
                for(var i = 0; i < ret.length; i++) {
                    if (ret[i].indicador == d.dfValor) {
                        ret[i].valor++
                    }
                }
            })
            return ret
        })
        .catch(err => console.log(err))
}

module.exports.countdfsEsp = (context, arg) => {
    return context.db.query(aql`Let s = (FOR v,e IN 1 INBOUND 'Nodes/DestinoFinal' GRAPH 'Graph'
                        FILTER e.rel == 'type' && v.dfValor == ${arg}
                        RETURN v)

                        return {
                            indicador: ${arg},
                            valor: LENGTH(s)
                        }`)
        .then(resp => resp.all()).then((list) => list[0])
        .catch(err => console.log(err))
}