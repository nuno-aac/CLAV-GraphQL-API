const { UserInputError } = require("apollo-server-errors");
const { aql } = require("arangojs");
const { buildSemanticFilter } = require('../controllers/relacoes')

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
    if (args.nivel != null)
        if (args.nivel >= 1 && args.nivel <= 4)
            nivel = aql.literal(args.nivel)
        else
            throw new UserInputError('Nivel de processo invalido')

    let filter = buildFilter(args);

    let query = aql`FOR v,e IN ${nivel} INBOUND 'Nodes/Classe_N1' GRAPH 'Graph'
                            FILTER e.rel == 'type' || e.rel == 'temPai'
                            ${filter}
                            return distinct v`

    return context.db.query(aql`${query}`)
        .then(resp => resp.all()).then((list) => list)
        .catch(err => console.log(err))
}


//Add class to tree
let addClasse = (classe,tree,codigo) => {
    if(tree == null) tree = []
    
    if(codigo.length == 1){
        tree.push(classe)
        return tree
    }
    
    tree.forEach(clTree => {
        let codigoTree = clTree.codigo.split('.')
        if(codigoTree[codigoTree.length-1] == codigo[0]){
            codigo.shift()
            clTree.filhos = addClasse(classe, clTree.filhos,codigo)
        }
    })

    return tree;
}

//Convert retrieved list to tree format
let listToTree = (list) => {
    let tree;
    let classesPorNivel = [[],[],[],[]] //Used to sert classes by level to build tree

    //Sort das classes por nível
    list.forEach(cl => {
        let classArray = cl.codigo.split('.')
        classesPorNivel[classArray.length-1].push(cl)
    })

    //Build tree
    tree = classesPorNivel[0]
    for (let i = 1; i < classesPorNivel.length; i++) { // Percoreer classes por nivel ignorando o primeiro nivel
        classesPorNivel[i].forEach(classe => {
            tree = addClasse(classe, tree,classe.codigo.split('.'))
        })
    }
    
    return tree
}

module.exports.tree = (context, args) => {

    let filter = buildFilter(args);

    let query = aql`FOR v,e IN 1..4 INBOUND 'Nodes/Classe_N1' GRAPH 'Graph'
                            FILTER e.rel == 'type' || e.rel == 'temPai'
                            ${filter}
                            return distinct v`


    return context.db.query(aql`${query}`)
        .then(resp => resp.all()).then((list) => listToTree(list))
        .catch(err => console.log(err))
}

module.exports.count = (context) => {
    let query = aql`LET n1  = (
                        FOR v1,e1 IN 1..4 INBOUND 'Nodes/Classe_N1' GRAPH 'Graph'
                        FILTER e1.rel == 'type' || e1.rel=='temPai'
                        return 1
                    )
                    return LENGTH(n1)`

    return context.db.query(aql`${query}`)
        .then(resp => resp.all()).then((list) => list[0])
        .catch(err => console.log(err))
}

module.exports.countNivel = (context,nivel) => {
    let aqlNivel = aql.literal(nivel)
    let query = aql`LET n1  = (
                        FOR v1,e1 IN 1 INBOUND 'Nodes/Classe_N${aqlNivel}' GRAPH 'Graph'
                        FILTER e1.rel == 'type' || e1.rel=='temPai'
                        return 1
                    )
                    return LENGTH(n1)`

    return context.db.query(aql`${query}`)
        .then(resp => resp.all()).then((list) => list[0])
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
*/

module.exports.getPai = (context,id) => {
    let node = "Nodes/" + id
    node = aql.literal(node)
    return context.db.query(aql`FOR v,e IN 1 OUTBOUND '${node}' GRAPH 'Graph'
                                FILTER e.rel == 'temPai'
                                RETURN v`)
        .then(resp => resp.all()).then((list) => list[0])
        .catch(err => console.log(err))
}

module.exports.getTermosIndice = (context,id) => {
    let node = "Nodes/" + id
    node = aql.literal(node)
    return context.db.query(aql`FOR v,e IN 1 INBOUND '${node}' GRAPH 'Graph'
                                FILTER e.rel == 'estaAssocClasse'
                                RETURN v`)
        .then(resp => resp.all()).then((list) => list)
        .catch(err => console.log(err))
}

module.exports.getProcessoTipoVC = (context, id) => {
    let node = "Nodes/" + id
    node = aql.literal(node)
    return context.db.query(aql`FOR v,e IN 1 OUTBOUND '${node}' GRAPH 'Graph'
                                    FILTER e.rel == 'processoTipoVC'
                                    return v.prefLabel`)
        .then(resp => resp.all()).then((list) => list[0])
        .catch(err => console.log(err))
}

module.exports.getDonos = (context, id) => {
    let node = "Nodes/" + id
    node = aql.literal(node)
    return context.db.query(aql`FOR v,e IN 1 OUTBOUND '${node}' GRAPH 'Graph'
                                FILTER e.rel == 'temDono'
                                RETURN v`)
        .then(resp => resp.all()).then((list) => {
            let retList = []
            list.forEach((dono) =>{
                if (dono._key.substring(0, 3) == 'tip') {
                    dono.tipo = "Tipologia"
                    dono.designacao = dono.tipDesignacao
                    dono.sigla = dono.tipSigla
                    retList.push(dono)
                } else if (dono._key.substring(0, 3) == 'ent') {
                    dono.tipo = "Entidade"
                    dono.designacao = dono.entDesignacao
                    dono.sigla = dono.entSigla
                    retList.push(dono)
                }
            })
            return retList
        })
        .catch(err => console.log(err))
}

module.exports.getParticipantes = async (context, id) => {
    let node = "Nodes/" + id
    let filter = await buildSemanticFilter(context,"temParticipante")
    filter = aql.literal(filter)
    node = aql.literal(node)
    return context.db.query(aql`FOR v,rel IN 1 OUTBOUND '${node}' GRAPH 'Graph'
                                ${filter}
                                RETURN {participante:v,tipo:rel.rel}`)
        .then(resp => resp.all()).then((list) => {
            let retList = []
            list.forEach((el) => {
                let part = el.participante
                if (part._key.substring(0, 3) == 'tip') {
                    part.idTipo = "Tipologia"
                    part.designacao = part.tipDesignacao
                    part.sigla = part.tipSigla
                    part.participLabel = el.tipo.substring(15,el.tipo.length)
                    retList.push(part)
                } else if (part._key.substring(0, 3) == 'ent') {
                    part.idTipo = "Entidade"
                    part.designacao = part.entDesignacao
                    part.sigla = part.entSigla
                    part.participLabel = el.tipo.substring(15, el.tipo.length)
                    retList.push(part)
                }
            })
            return retList
        })
        .catch(err => console.log(err))
}

module.exports.getFilhos = (context, id) => {
    let node = "Nodes/" + id
    node = aql.literal(node)
    return context.db.query(aql`FOR v,e IN 1 INBOUND '${node}' GRAPH 'Graph'
                                    FILTER e.rel == 'temPai'
                                    return {_key: v._key, status: v.classeStatus, codigo: v.codigo, titulo: v.titulo}`)
        .then(resp => resp.all()).then((list) => list)
        .catch(err => console.log(err))
}

module.exports.getNotasAp = (context, id) => {
    let node = "Nodes/" + id
    node = aql.literal(node)
    return context.db.query(aql`FOR v,e IN 1 OUTBOUND '${node}' GRAPH 'Graph'
                                    FILTER e.rel == 'temNotaAplicacao'
                                    return {_key: v._key, nota: v.conteudo}`)
        .then(resp => resp.all()).then((list) => list)
        .catch(err => console.log(err))
}

module.exports.getExemplosNotasAp = (context, id) => {
    let node = "Nodes/" + id
    node = aql.literal(node)
    return context.db.query(aql`FOR v,e IN 1 OUTBOUND '${node}' GRAPH 'Graph'
                                    FILTER e.rel == 'temExemploNA'
                                    return {_key: v._key, nota: v.conteudo}`)
        .then(resp => resp.all()).then((list) => list)
        .catch(err => console.log(err))
}

module.exports.getNotasEx = (context, id) => {
    let node = "Nodes/" + id
    node = aql.literal(node)
    return context.db.query(aql`FOR v,e IN 1 OUTBOUND '${node}' GRAPH 'Graph'
                                    FILTER e.rel == 'temNotaExclusao'
                                    return {_key: v._key, nota: v.conteudo}`)
        .then(resp => resp.all()).then((list) => list)
        .catch(err => console.log(err))
}

module.exports.has4Nivel = (context, id) => {
    let node = "Nodes/" + id
    node = aql.literal(node)
    if(id.split('.').length != 3)
        return false

    return context.db.query(aql`FOR v,e IN 1 INBOUND '${node}' GRAPH 'Graph'
                                    FILTER e.rel == 'temPai'
                                    return v._key`)
        .then(resp => resp.all()).then((list) => { return list.length > 0 })
        .catch(err => console.log(err))
}

module.exports.has4NivelDF = (context, id) => {
    let node = "Nodes/" + id
    node = aql.literal(node)
    if (id.split('.').length != 3)
        return false

    return context.db.query(aql`let n1 = (FOR v,e IN 1 INBOUND '${node}' GRAPH 'Graph'
                                    FILTER e.rel == 'temPai'
                                    return v._id)

                                let dfs = (FOR node IN n1
                                    FOR v,e IN 1 OUTBOUND node GRAPH 'Graph'
                                        FILTER e.rel == 'temDF'
                                        return v)

                                return LENGTH(dfs) > 0`)
        .then(resp => resp.all()).then((list) => list[0])
        .catch(err => console.log(err))
}

module.exports.has4NivelPCA = (context, id) => {
    let node = "Nodes/" + id
    node = aql.literal(node)
    if (id.split('.').length != 3)
        return false

    return context.db.query(aql`let n1 = (FOR v,e IN 1 INBOUND '${node}' GRAPH 'Graph'
                                    FILTER e.rel == 'temPai'
                                    return v._id)

                                let pcas = (FOR node IN n1
                                    FOR v,e IN 1 OUTBOUND node GRAPH 'Graph'
                                        FILTER e.rel == 'temPCA'
                                        return v)

                                return LENGTH(pcas) > 0`)
        .then(resp => resp.all()).then((list) => list[0])
        .catch(err => console.log(err))
}

module.exports.getProcRel = async (context, id) => {
    let node = "Nodes/" + id
    let filter = await buildSemanticFilter(context, "temRelProc")
    filter = aql.literal(filter)
    node = aql.literal(node)
    return context.db.query(aql`let outbounds = (FOR v,rel IN 1 OUTBOUND '${node}' GRAPH 'Graph'
                                    ${filter}
                                    return {proc:v, rel:rel.rel})

                                let inbounds = (FOR v,rel IN 1 INBOUND '${node}' GRAPH 'Graph'
                                    ${filter}
                                    return {proc:v, rel:concat('Nodes/',rel.rel)})

                                let inboundsInverse = (FOR inb IN inbounds
                                    FOR v,e IN 1 ANY inb.rel GRAPH 'Graph'
                                        FILTER e.rel == 'inverseOf'
                                        return {proc:inb.proc, rel:v._key})

                                let inboundsSymmetric = (FOR inb IN inbounds
                                    FOR v,e IN 1 ANY inb.rel GRAPH 'Graph'
                                        FILTER e.rel == 'type' && e._to == 'Nodes/SymmetricProperty'
                                        return {proc:inb.proc, rel:SUBSTRING(inb.rel, 6)})

                                FOR v IN UNIQUE(APPEND(APPEND(inboundsInverse,outbounds),inboundsSymmetric))
                                    RETURN v`)
        .then(resp => resp.all()).then((list) => {
            list = list.map(elem => {
                let processo = elem.proc
                if(!processo) return null;
                processo.tipoRel = elem.rel
                return processo;
            })
            list = list.filter(elem => elem != null)
            return list
        })
        .catch(err => console.log(err))
}

module.exports.getLegislacao = (context, id) => {
    let node = "Nodes/" + id
    node = aql.literal(node)
    return context.db.query(aql`FOR v,e IN 1 OUTBOUND '${node}' GRAPH 'Graph'
                                    FILTER e.rel == 'temLegislacao'
                                    RETURN {tipo: v.diplomaTipo, numero: v.diplomaNumero, _key: v._key, sumario: v.diplomaSumario}`)
        .then(resp => resp.all()).then((list) => list)
        .catch(err => console.log(err))
}

//c100.10.002 tem 2 justificações (teste)
module.exports.getDF = (context, id) => {
    let node = "Nodes/" + id
    node = aql.literal(node)
    return context.db.query(aql`let df = (FOR v,e IN 1 OUTBOUND 'Nodes/c100.10.002' GRAPH 'Graph'
    FILTER e.rel == 'temDF'
    RETURN {_key: v._key, valor: v.dfValor, rel: concat('Nodes/',v._key)})
    
    let just = (FOR cdf IN df
        FOR v,e IN 1 OUTBOUND cdf.rel GRAPH 'Graph'
        FILTER e.rel == 'temJustificacao'
        RETURN {_key: v._key, rel: concat('Nodes/',v._key)})
        
    let critJust = (FOR crt IN just
        FOR v,e IN 1 OUTBOUND crt.rel GRAPH 'Graph'
        FILTER e.rel == 'temCriterio'
        RETURN {_key: v._key, conteudo: v.conteudo, rel: concat('Nodes/',v._key)})

    let procRel = (FOR c IN critJust
        FOR v,e IN 1 OUTBOUND c.rel GRAPH 'Graph'
        FILTER e.rel == 'critTemProcRel'
        RETURN {procId: v._key})

    let legAssoc = (FOR c IN critJust
        FOR v,e IN 1 OUTBOUND c.rel GRAPH 'Graph'
        FILTER e.rel == 'critTemLegAssoc'
        RETURN {legId: v._key})
        
    let tipoID = (for c in critJust
        FOR v,e IN 1 OUTBOUND c.rel GRAPH 'Graph'
        FILTER e.rel == 'type' && v!= null
        RETURN v._key)

    let buildList = (
        let justificacao = []
            for ct in critJust
                return PUSH(justificacao, {tipoId: tipoID, conteudo: ct.conteudo, criterio: ct._key, processos: procRel, legislacao: legAssoc}))
        
    for d in df
        for j in just
            return {idJust: j._key, valor: d.valor, _key: d._key, justificacao: buildList}
    
    
    
    



`)
        .then(resp => resp.all()).then((list) => list)
        .catch(err => console.log(err))
}

module.exports.getPCA = (context, id) => {
    let node = "Nodes/" + id
    node = aql.literal(node)
    return context.db.query(aql`FOR v,e IN 1 OUTBOUND '${node}' GRAPH 'Graph'
                                    FILTER e.rel == 'temLegislacao'
                                    RETURN {tipo: v.diplomaTipo, numero: v.diplomaNumero, _key: v._key, sumario: v.diplomaSumario}`)
        .then(resp => resp.all()).then((list) => list)
        .catch(err => console.log(err))
}


module.exports.add = async (context, classe) => {
    if(!(classe.nivel >= 1 && classe.nivel <= 4))
        throw new UserInputError('Nivel de processo invalido')

    //ADDING TYPE EDGE
    let edge = { _from: "Nodes/" + classe._key, _to: "Nodes/ClasseN"+classe.nivel, rel: 'type' }
    await context.db.query(aql`INSERT ${edge} INTO edges`)


    //ADDING PARENT EDGE
    if(classe.pai){
        let parentedge = { _from: "Nodes/" + classe._key, _to: "Nodes/" + classe.pai, rel: 'temPai' }
        await context.db.query(aql`INSERT ${parentedge} INTO edges`)
    }
    else if(classe.nivel != 1)
        throw new UserInputError('Insere processo pai para classes de nivel >= 1')
    
    delete classe.nivel
    delete classe.pai

    //ADDING ENTIDADE
    return context.db.query(aql`INSERT ${classe} INTO Nodes
                        LET inserted = NEW RETURN inserted`)
        .then(resp => resp.all()).then((list) => list[0])
        .catch(err => console.log(err))
}
