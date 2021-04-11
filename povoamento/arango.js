import arangojs, { aql, Database } from "arangojs";
import fs from 'fs'
import ttl_read from '@graphy/content.ttl.read'
/*
const db = new Database({
    url: "http://localhost:8529",
    databaseName: "Test",
    auth: { username: "root", password: "coficofi1" },
});
*/

let db = new Database({ url: "http://arangodb_db_container:8529", auth: { username: "root", password: "coficofi1" },});

db.listDatabases()
    .then(data => console.log(data))
    .catch(err => console.log(err))
db = await db.createDatabase("Test", {
    users: [{ username: "root" }]
});
// the database has been created
db.database("Test");
db.useBasicAuth("root", "coficofi1");

db.createCollection('users')
db.createCollection('Nodes')
db.createEdgeCollection('edges')

let edges = db.collection('edges')
let nodes = db.collection('Nodes')

let i = 0
fs.createReadStream('clav.ttl')
    .pipe(ttl_read())
    .on('data', (y_quad) => {

        if (y_quad.isolate().subject.termType != 'BlankNode' && y_quad.isolate().object.termType != 'BlankNode'){
            let sub;
            if(y_quad.isolate().subject.value == 'http://jcr.di.uminho.pt/m51-clav')
                sub = 'main'
            else
                sub = y_quad.isolate().subject.value.match(/#.*$/)[0]
            let pred = y_quad.isolate().predicate.value.match(/#.*$/)[0]
            let object = y_quad.isolate().object

            if(object.termType == 'Literal'){
                sub = sub.substring(1,sub.length)
                pred = pred.substring(1, pred.length )


                db.query(aql`UPSERT { _key:${sub} }
                             INSERT { _key:${sub}, ${pred}: ${object.value}}
                             UPDATE { ${pred}: ${object.value} } IN Nodes OPTIONS { exclusive: true }`)
                    .catch(err => console.log('[ERROR Nodes]' + sub + ' -> ' + pred + ' -> ' + object.value +'----------\n ' + err + '\n-------------------------------------\n'))
            } else {
                sub = sub.substring(1, sub.length)
                pred = pred.substring(1, pred.length)
                if (object.value.match(/#.*$/) != null){
                    let obj = object.value.match(/#.*$/)[0]
                    obj = obj.substring(1,obj.length)

                    edges.save({_from: "Nodes/" + sub, _to: "Nodes/" + obj,rel:pred})
                        .catch(err => console.log('[ERROR EDGE] ' + sub + '->' + pred + '->' + obj +'----------\n ' + err + '\n-------------------------------------\n'))
                }
                db.query(aql`UPSERT { _key:${sub} }
                             INSERT { _key:${sub} }
                             UPDATE {} IN Nodes OPTIONS { exclusive: true }`)
                    .catch(err => console.log('[ERROR Nodes]' + sub + ' -> ' + pred + ' -> ' + object.value + '----------\n ' + err + '\n-------------------------------------\n'))

            }
        }
        else{
            i+=1
            console.log(y_quad.isolate().predicate.value.match(/#.*$/)[0])
        }

    })
    .on('eof', () => {
        console.log('done! ' + i);
    });

db.createGraph('Graph', [{ collection: edges, from: nodes, to: nodes}]).catch(err => console.log(err))
