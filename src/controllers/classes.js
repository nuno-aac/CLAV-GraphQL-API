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