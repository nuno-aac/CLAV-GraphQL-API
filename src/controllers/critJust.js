const { aql } = require("arangojs");

module.exports.countCritJust = (context) => {
    return context.db.query(aql`Let s1 = (FOR v,e IN 1 INBOUND 'Nodes/CriterioJustificacaoDensidadeInfo' GRAPH 'Graph'
                        FILTER e.rel == 'type'
                        RETURN v)

                    Let s2 = (FOR v,e IN 1 INBOUND 'Nodes/CriterioJustificacaoLegal' GRAPH 'Graph'
                        FILTER e.rel == 'type'
                        RETURN v)

                    Let s3 = (FOR v,e IN 1 INBOUND 'Nodes/CriterioJustificacaoComplementaridadeInfo' GRAPH 'Graph'
                        FILTER e.rel == 'type'
                        RETURN v)
                        
                    Let s4 = (FOR v,e IN 1 INBOUND 'Nodes/CriterioJustificacaoGestionario' GRAPH 'Graph'
                        FILTER e.rel == 'type'
                        RETURN v)
                                                                
                    Let s5 = (FOR v,e IN 1 INBOUND 'Nodes/CriterioJustificacaoUtilidadeAdministrativa' GRAPH 'Graph'
                        FILTER e.rel == 'type'
                        RETURN v)

                    return [
                        {
                            indicador: "CriterioJustificacaoGestionario",
                            valor: LENGTH(s1)
                        },
                        {
                            indicador: "CriterioJustificacaoDensidadeInfo",
                            valor: LENGTH(s2)
                        },
                        {
                            indicador: "CriterioJustificacaoLegal",
                            valor: LENGTH(s3)
                        },
                        {
                            indicador: "CriterioJustificacaoUtilidadeAdministrativa",
                            valor: LENGTH(s4)
                        },
                        {
                            indicador: "CriterioJustificacaoComplementaridadeInfo",
                            valor: LENGTH(s5)
                        },
                        {
                            indicador: "CriterioJustificacao",
                            valor: LENGTH(s1) + LENGTH(s2) + LENGTH(s3) + LENGTH(s4) + LENGTH(s5)
                        }
                    ]`)
        .then(resp => resp.all()).then((list) => list[0])
        .catch(err => console.log(err))
}

module.exports.countCritJustTotal = (context) => {
    return context.db.query(aql`Let s1 = (FOR v,e IN 1 INBOUND 'Nodes/CriterioJustificacaoDensidadeInfo' GRAPH 'Graph'
                        FILTER e.rel == 'type'
                        RETURN v)

                    Let s2 = (FOR v,e IN 1 INBOUND 'Nodes/CriterioJustificacaoLegal' GRAPH 'Graph'
                        FILTER e.rel == 'type'
                        RETURN v)

                    Let s3 = (FOR v,e IN 1 INBOUND 'Nodes/CriterioJustificacaoComplementaridadeInfo' GRAPH 'Graph'
                        FILTER e.rel == 'type'
                        RETURN v)
                        
                    Let s4 = (FOR v,e IN 1 INBOUND 'Nodes/CriterioJustificacaoGestionario' GRAPH 'Graph'
                        FILTER e.rel == 'type'
                        RETURN v)
                                                                
                    Let s5 = (FOR v,e IN 1 INBOUND 'Nodes/CriterioJustificacaoUtilidadeAdministrativa' GRAPH 'Graph'
                        FILTER e.rel == 'type'
                        RETURN v)

                    return 
                        {
                            indicador: "CriterioJustificacao",
                            valor: LENGTH(s1) + LENGTH(s2) + LENGTH(s3) + LENGTH(s4) + LENGTH(s5)
                        }`)
        .then(resp => resp.all()).then((list) => list[0])
        .catch(err => console.log(err))
}

module.exports.countCritJustEsp = (context,arg) => {
    let aqlCrit = aql.literal(arg)
    return context.db.query(aql`Let s = (FOR v,e IN 1 INBOUND 'Nodes/CriterioJustificacao${aqlCrit}' GRAPH 'Graph'
                        FILTER e.rel == 'type'
                        RETURN v)

                    return 
                        {
                            indicador: "CriterioJustificacao${aqlCrit}",
                            valor: LENGTH(s)
                        }`)
        .then(resp => resp.all()).then((list) => list[0])
        .catch(err => console.log(err))
}