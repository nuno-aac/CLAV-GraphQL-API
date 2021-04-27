const { UserInputError, ApolloError } = require("apollo-server-errors");
const { aql } = require("arangojs");
const { buildSemanticFilter, isSubPropertyOfRel } = require('../controllers/relacoes')

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

let listAll = (context, args) => {
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

module.exports.list = listAll

module.exports.listFull = async (context, args) => {
    var lista = await listAll(context,args)
    return Promise.all(lista.map(async elem => {
        elem.pai = await this.getPai(context,elem._key)
        elem.termosInd = await this.getTermosIndice(context, elem._key)
        elem.tipoProc = await this.getProcessoTipoVC(context,elem._key)
        elem.donos = await this.getDonos(context,elem._key)
        elem.participantes = await this.getParticipantes(context,elem._key)
        elem.filhos = await this.getFilhos(context,elem._key)
        elem.notasAp = await this.getNotasAp(context,elem._key)
        elem.exemplosNotasAp = await this.getExemplosNotasAp(context,elem._key)
        elem.notasEx = await this.getNotasEx(context,elem._key)
        elem.temSubclasses4Nivel = await this.has4Nivel(context,elem._key)
        elem.temSubclassesDF = await this.has4NivelDF(context,elem._key)
        elem.temSubclassesPCA = await this.has4NivelPCA(context,elem._key)
        elem.processosRelacionados = await this.getProcRel(context,elem._key)
        elem.legislacao = await this.getLegislacao(context,elem._key)
        elem.df = await this.getDF(context,elem._key)
        elem.pca = await this.getPCA(context,elem._key)

        return elem
    }))
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
                processo.status = elem.proc.classeStatus
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
    return context.db.query(aql`
let df = FIRST(FOR v,e IN 1 OUTBOUND '${node}' GRAPH 'Graph'
    FILTER e.rel == 'temDF'
    RETURN v)

let just = FIRST(FOR v,e IN 1 OUTBOUND df GRAPH 'Graph'
    FILTER e.rel == 'temJustificacao'
    RETURN v)

let critJust = (FOR v,e IN 1 OUTBOUND just GRAPH 'Graph'
                    FILTER e.rel == 'temCriterio'
                    RETURN v)

let critComp =
(FOR c IN critJust
    let procSingle = (FOR v,e IN 1 OUTBOUND c GRAPH 'Graph'
                            FILTER e.rel == 'critTemProcRel'
                            RETURN {procId: v._key})
                      let legSingle = (FOR v,e IN 1 OUTBOUND c GRAPH 'Graph'
                            FILTER e.rel == 'critTemLegAssoc'
                            RETURN {legId: v._key})
                      LET tipoID = FIRST(FOR v,e IN 1 OUTBOUND c GRAPH 'Graph'
                            FILTER e.rel == 'type' && v!= null
                            RETURN v._key)
                      return {tipoId: tipoID, criterio: c._key, conteudo: c.conteudo , processos: procSingle, legislacao: legSingle})


return (df!=null ? {idJust: just._key, valor: df.dfValor, nota:df.dfNota, _key: df._key, justificacao: critComp} : null)`
)
        .then(resp => resp.all()).then((list) => list[0])
        .catch(err => console.log(err))
}

module.exports.getPCA = (context, id) => {
    let node = "Nodes/" + id
    node = aql.literal(node)
    return context.db.query(aql`let pca = FIRST(FOR v,e IN 1 OUTBOUND '${node}' GRAPH 'Graph'
    FILTER e.rel == 'temPCA'
    RETURN v)

let just = FIRST(FOR v,e IN 1 OUTBOUND pca GRAPH 'Graph'
    FILTER e.rel == 'temJustificacao'
    RETURN v)

let formaContagem = FIRST(FOR v,e IN 1 OUTBOUND pca GRAPH 'Graph'
    FILTER e.rel == 'pcaFormaContagemNormalizada'
    RETURN v.prefLabel)

let critJust = (FOR v,e IN 1 OUTBOUND just GRAPH 'Graph'
                    FILTER e.rel == 'temCriterio'
                    RETURN v)

let critComp =
(FOR c IN critJust
    let procSingle = (FOR v,e IN 1 OUTBOUND c GRAPH 'Graph'
                            FILTER e.rel == 'critTemProcRel'
                            RETURN {procId: v._key})
                      let legSingle = (FOR v,e IN 1 OUTBOUND c GRAPH 'Graph'
                            FILTER e.rel == 'critTemLegAssoc'
                            RETURN {legId: v._key})
                      LET tipoID = FIRST(FOR v,e IN 1 OUTBOUND c GRAPH 'Graph'
                            FILTER e.rel == 'type' && v!= null
                            RETURN v._key)
                      return {tipoId: tipoID, criterio: c._key, conteudo: c.conteudo , processos: procSingle, legislacao: legSingle})


return (pca!=null ? {idJust: just._key, formaContagem: formaContagem, valores: pca.pcaValor, notas: pca.pcaNota, _key: pca._key, justificacao: critComp} : null)`
)
        .then(resp => resp.all()).then((list) => list[0])
        .catch(err => console.log(err))
}


// INSERT DE INFO

let addTermosIndice = (context, classe) => {
    let edges = []
    let termos = []
    classe.termosInd.forEach(elem => {
        let ti = { _key: elem._key, termo: elem.termo, label: 'TI: ' + elem.termo, estado: 'Ativo' }
        let tiTypeEdge = { _from: "Nodes/" + elem._key, _to: "Nodes/TermoIndice", rel: 'type' }
        let assocClasse = { _from: "Nodes/" + elem._key, _to: "Nodes/" + classe._key, rel: 'estaAssocClasse' }
        termos.push(ti)
        edges.push(tiTypeEdge)
        edges.push(assocClasse)
    })
    return context.db.query(aql`let te = ${termos}
                                FOR t IN te INSERT t INTO Nodes
                                let ed = ${edges}
                                FOR e IN ed INSERT e INTO edges
                                LET inserted = NEW RETURN inserted`)
                                .then(d => d.all()).then(list => {console.log(list)})
        .catch(e => { throw new ApolloError('Erro ao inserir termos indice da Classe ' + classe._key + ': ' + e.response.body.errorMessage) });
}

module.exports.addTermosIndice = addTermosIndice

let addPai = (context, classe) => {
    if (classe.pai) {
        let parentedge = { _from: "Nodes/" + classe._key, _to: "Nodes/c" + classe.pai.codigo, rel: 'temPai' }
        if (classe.codigo.startsWith(classe.pai.codigo))
            context.db.query(aql`INSERT ${parentedge} INTO edges`)
        else
            throw new UserInputError('Codigo de processo pai inváldio')
    }
    else if (classe.nivel != 1)
        throw new UserInputError('Insere processo pai para classes de nivel >= 1')
}

module.exports.addPai = addPai

let addDonos = (context, classe) => {
    classe.donos.forEach(elem => {
        let donoEdge = { _from: "Nodes/" + classe._key, _to: "Nodes/" + elem._key, rel: 'temDono' }
        try {
            context.db.query(aql`INSERT ${donoEdge} INTO edges`)
        } catch {
            throw new ApolloError('Erro ao inserir donos da Classe ' + classe._key)
        }
    })
}

module.exports.addDonos = addDonos

let addParticipantes = (context, classe) => {
    classe.participantes.forEach(async elem => {
        let participanteEdge = { _from: "Nodes/" + classe._key, _to: "Nodes/" + elem._key, rel: 'temParticipante' + elem.participLabel }
        let isSP = await isSubPropertyOfRel(context, 'temParticipante' + elem.participLabel, 'temParticipante')
        if (isSP)
            try {
                context.db.query(aql`INSERT ${participanteEdge} INTO edges`)
            } catch {
                throw new ApolloError('Erro ao inserir participantes da Classe ' + classe._key)
            }
        else
            throw new UserInputError('Tipo de participante inválido: ' + elem.participLabel)
    })
}

module.exports.addParticipantes = addParticipantes

let addNotas = (context, classe) => {
    let edges = []
    let notas = []
    classe.notasAp.forEach(elem => {
        let notaEdge= { _from: "Nodes/" + classe._key , _to: "Nodes/" + elem._key, rel: 'temNotaAplicacao'}
        let notaTypeEdge = { _from: "Nodes/" + elem._key , _to: "Nodes/NotaAplicacao" + elem._key, rel: 'type'}
        let notaAp = {
            _key: elem._key,
            conteudo: elem.nota,
            'rdfs:label': 'Nota de Aplicação'
        }
        edges.push(notaEdge)
        edges.push(notaTypeEdge)
        notas.push(notaAp)
    })
    return context.db.query(aql`let te = ${notas}
                                FOR t IN te INSERT t INTO Nodes
                                let ed = ${edges}
                                FOR e IN ed INSERT e INTO edges
                                LET inserted = NEW RETURN inserted`)
        .then(d => d.all()).then(list => { console.log(list) })
        .catch(e => { throw new ApolloError('Erro ao inserir notas de aplicação da Classe ' + classe._key + ': ' + e.response.body.errorMessage) });
}

module.exports.addNotas = addNotas

let addExemplosNotas = (context, classe) => {
    let edges = []
    let notas = []
    classe.exemplosNotasAp.forEach(elem => {
        let notaEdge= { _from: "Nodes/" + classe._key , _to: "Nodes/" + elem._key, rel: 'temExemploNA'}
        let notaTypeEdge = { _from: "Nodes/" + elem._key , _to: "Nodes/ExemploNotaAplicacao" + elem._key, rel: 'type'}
        let exNotaAp = {
            _key: elem._key,
            conteudo: elem.nota,
            'rdfs:label': 'Exemplo de nota de Aplicação'
        }
        edges.push(notaEdge)
        edges.push(notaTypeEdge)
        notas.push(exNotaAp)
    })
    return context.db.query(aql`let te = ${notas}
                                FOR t IN te INSERT t INTO Nodes
                                let ed = ${edges}
                                FOR e IN ed INSERT e INTO edges
                                LET inserted = NEW RETURN inserted`)
        .then(d => d.all()).then(list => { console.log(list) })
        .catch(e => { throw new ApolloError('Erro ao inserir exemplos de notas de aplicação da Classe ' + classe._key + ': ' + e.response.body.errorMessage) });

}

module.exports.addExemplosNotas = addExemplosNotas

let addNotasExclusao = (context, classe) => {
    let edges = []
    let notas = []
    classe.notasEx.forEach(elem => {
        let notaEdge= { _from: "Nodes/" + classe._key , _to: "Nodes/" + elem._key, rel: 'temNotaExclusao'}
        let notaTypeEdge = { _from: "Nodes/" + elem._key , _to: "Nodes/NotaExclusao" + elem._key, rel: 'type'}
        let notaEx = {
            _key: elem._key,
            conteudo: elem.nota,
            'rdfs:label': 'Nota de Exclusao'
        }
        edges.push(notaEdge)
        edges.push(notaTypeEdge)
        notas.push(notaEx)
    })
    return context.db.query(aql`let te = ${notas}
                                FOR t IN te INSERT t INTO Nodes
                                let ed = ${edges}
                                FOR e IN ed INSERT e INTO edges
                                LET inserted = NEW RETURN inserted`)
        .then(d => d.all()).then(list => { console.log(list) })
        .catch(e => { throw new ApolloError('Erro ao inserir notas de exclusão da Classe ' + classe._key + ': ' + e.response.body.errorMessage) });

}

module.exports.addNotasExclusao = addNotasExclusao

let addProcRels = (context, classe) => {
    classe.processosRelacionados.forEach(async elem => {
        let procRelEdge = { _from: "Nodes/" + classe._key, _to: "Nodes/c" + elem.codigo, rel: elem.tipoRel }
        let isSP = await isSubPropertyOfRel(context, elem.tipoRel, 'temRelProc')
        if (isSP)
            try {
                context.db.query(aql`INSERT ${procRelEdge} INTO edges`)
            } catch {
                throw new ApolloError('Erro ao inserir processos relacionados da Classe ' + classe._key)
            }
        else
            throw new UserInputError('Relação de processo inválida: ' + elem.tipoRel)
    })
}

module.exports.addProcRels = addProcRels

let addTipoProc = (context, classe) => {
    if(classe.tipoProc == "Processo Específico"){
        let edge = { _from: "Nodes/" + classe._key, _to: "Nodes/vc_processoTipo_pe", rel: 'processoTipoVC' }
        try {
            context.db.query(aql`INSERT ${edge} INTO edges`)
        } catch {
            throw new ApolloError('Erro ao inserir tipoProc da Classe ' + classe._key)
        }
    }
    else if(classe.tipoProc == "Processo Comum"){
        let edge = { _from: "Nodes/" + classe._key, _to: "Nodes/vc_processoTipo_pc", rel: 'processoTipoVC' }
        try {
            context.db.query(aql`INSERT ${edge} INTO edges`)
        } catch {
            throw new ApolloError('Erro ao inserir tipoProc da Classe ' + classe._key)
        }
    }
}

module.exports.addTipoProc = addTipoProc

let addFilhos = (context, classe) => {
    classe.filhos.forEach(kid => {
        let filhoEdge = { _from: "Nodes/" + kid._key , _to: "Nodes/" + classe._key, rel: 'temPai' }
        try {
            context.db.query(aql`INSERT ${filhoEdge} INTO edges`)
        } catch {
            throw new ApolloError('Erro ao inserir filhos da Classe ' + classe._key)
        }
    })
}

module.exports.addFilhos = addFilhos

let addLegislacao = (context, classe) => {
    classe.legislacao.forEach(leg => {
        let legEdge = { _from: "Nodes/" + classe._key , _to: "Nodes/" + leg._key, rel: 'temLegislacao' }
        try {
            context.db.query(aql`INSERT ${legEdge} INTO edges`)
        } catch {
            throw new ApolloError('Erro ao inserir Legislacao da Classe ' + classe._key)
        }
    })
}

module.exports.addLegislacao = addLegislacao

let addDF = (context, classe) => {
    let nodes = []
    let edges = []
    nodes.push({ _key: classe.df._key, dfValor: classe.df.valor}) // NODO DF
    edges.push({ _from: "Nodes/" + classe._key, _to: "Nodes/" + classe.df._key, rel: 'temDF' }) // EDGE Classe => DF
    nodes.push({ _key: classe.df.idJust }) // NODO Justificaçao
    edges.push({ _from: "Nodes/" + classe.df._key, _to: "Nodes/" + classe.df.idJust, rel: 'temJustificacao' }) // EDGE DF => Justificação
    edges.push({ _from: "Nodes/" + classe.df.idJust, _to: "Nodes/JustificacaoDF", rel: 'type' }) // EDGE tipo justificação
    classe.df.justificacao.forEach(critJust => {
        nodes.push({ _key: critJust.criterio, conteudo: critJust.conteudo }) // NODO critJust
        edges.push({ _from: "Nodes/" + classe.df.idJust, _to: "Nodes/" + critJust.criterio, rel: 'temCriterio' }) // EDGE Justificação => critJust
        edges.push({ _from: "Nodes/" + critJust.criterio, _to: "Nodes/" + critJust.tipoId, rel: 'type' }) // EDGE tipo critJust
        critJust.processos.forEach(proc => {
            edges.push({ _from: "Nodes/" + critJust.criterio, _to: "Nodes/" + proc.procId, rel: 'critTemProcRel' }) // EDGE critJust => processos relacionados
        })
        critJust.legislacao.forEach(leg => {
            edges.push({ _from: "Nodes/" + critJust.criterio, _to: "Nodes/" + leg.legId, rel: 'critTemLegAssoc' }) // EDGE critJust => legislação
        })
    })

    return context.db.query(aql`let no = ${nodes}
                                FOR n IN no INSERT n INTO Nodes
                                let ed = ${edges}
                                FOR e IN ed INSERT e INTO edges
                                LET inserted = NEW RETURN inserted`)
        .then(d => d.all()).then(list => { console.log(list) })
        .catch(e => { throw new ApolloError('Erro ao inserir df da Classe ' + classe._key + ': ' + e.response.body.errorMessage) });


}

module.exports.addDF = addDF

let addPCA = (context, classe) => {
    let nodes = []
    let edges = []
    nodes.push({ _key: classe.pca._key, pcaValor: classe.pca.valores[0]}) // NODO PCA VALORES???
    edges.push({ _from: "Nodes/" + classe._key, _to: "Nodes/" + classe.pca._key, rel: 'temPCA' }) // EDGE Classe => PCA
    nodes.push({ _key: classe.pca.idJust }) // NODO Justificaçao
    edges.push({ _from: "Nodes/" + classe.pca._key, _to: "Nodes/" + classe.pca.idJust, rel: 'temJustificacao' }) // EDGE PCA => Justificação
    edges.push({ _from: "Nodes/" + classe.pca._key, _to: "Nodes/JustificacaoPCA", rel: 'type' }) // EDGE tipo justificação
    classe.pca.justificacao.forEach(critJust => {
        nodes.push({ _key: critJust.criterio, conteudo: critJust.conteudo }) // NODO critJust
        edges.push({ _from: "Nodes/" + classe.pca.idJust, _to: "Nodes/" + critJust.criterio, rel: 'temCriterio' }) // EDGE Justificação => critJust
        edges.push({ _from: "Nodes/" + critJust.criterio, _to: "Nodes/" + critJust.tipoId, rel: 'type' }) // EDGE tipo critJust
        critJust.processos.forEach(proc => {
            edges.push({ _from: "Nodes/" + critJust.criterio, _to: "Nodes/" + proc.procId, rel: 'critTemProcRel' }) // EDGE critJust => processos relacionados
        })
        critJust.legislacao.forEach(leg => {
            edges.push({ _from: "Nodes/" + critJust.criterio, _to: "Nodes/" + leg.legId, rel: 'critTemLegAssoc' }) // EDGE critJust => legislação
        })
    })

    return context.db.query(aql`let no = ${nodes}
                                FOR n IN no INSERT n INTO Nodes
                                let ed = ${edges}
                                FOR e IN ed INSERT e INTO edges
                                LET inserted = NEW RETURN inserted`)
        .then(d => d.all()).then(list => { console.log(list) })
        .catch(e => { throw new ApolloError('Erro ao inserir pca da Classe ' + classe._key + ': ' + e.response.body.errorMessage) });


}

module.exports.addPCA = addPCA


module.exports.add = async (context, classe) => {
    //ADDING TYPE EDGE
    if(!(classe.nivel >= 1 && classe.nivel <= 4))
        throw new UserInputError('Nivel de processo invalido')
    let edge = { _from: "Nodes/" + classe._key, _to: "Nodes/ClasseN"+classe.nivel, rel: 'type' }
    await context.db.query(aql`INSERT ${edge} INTO edges`)

    /*
        _key: DONE
        nivel: DONE
        pai: DONE
        codigo: DONE
        titulo: DONE
        descricao: DONE
        classeStatus: DONE
        termosInd: DONE
        tipoProc: DONE
        processoTransversal: DONE
        donos: DONE
        participantes: DONE
        filhos: DONE
        notasAp: DONE
        exemplosNotasAp: DONE
        notasEx: DONE
        temSubclasses4Nivel: IGNORAR
        temSubclasses4NivelDF: IGNORAR
        temSubclasses4NivelPCA: IGNORAR
        processosRelacionados: DONE
        legislacao: DONE
        df: ?Duvidas
        pca: ?Duvidas

        TO DO:
        - Check campo procDimQual e processoUniform (Não estão na lista mas deviam estar??)
        - Alterar objeto classe (criar novo em vez de remover campos)
    */

    //ADDING PARENT EDGE
    addPai(context,classe)

    //ADDING TERMOS INDICE
    await addTermosIndice(context,classe)


    //ADDING DONOS
    addDonos(context,classe)

    //ADDING PARTICIPANTES
    addParticipantes(context, classe)

    //ADDING NOTAS
    await addNotas(context,classe)
    await addExemplosNotas(context,classe)
    await addNotasExclusao(context, classe)

    //ADDING PROCESSOS RELACIONADOS
    addProcRels(context,classe)

    //ADDING TIPOPROC
    addTipoProc(context, classe)

    //ADDING FILHOS
    addFilhos(context, classe)

    //AADING LEGISLACAO
    addLegislacao(context, classe)

    await addDF(context,classe)
    await addPCA(context,classe)

    delete classe.nivel
    delete classe.pai
    delete classe.termosInd
    delete classe.donos
    delete classe.participantes
    delete classe.filhos
    delete classe.notasAp
    delete classe.exemplosNotasAp
    delete classe.notasEx
    delete classe.temSubclasses4Nivel
    delete classe.temSubclasses4NivelPCA
    delete classe.temSubclasses4NivelDF
    delete classe.processosRelacionados
    delete classe.legislacao
    delete classe.df
    delete classe.pca
    delete classe.tipoProc

    let cls = await context.db.query(aql`INSERT ${classe} INTO Nodes
                        LET inserted = NEW RETURN inserted`)
        .then(resp => resp.all()).then((list) => list[0])
        .catch(e => { throw new ApolloError('Erro ao inserir Classe ' + classe._key) })

    //ADDING ENTIDADE
    return cls 
}
