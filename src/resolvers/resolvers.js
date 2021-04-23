const entidades = require('../controllers/entidades')
const legislacoes = require('../controllers/legislacoes')
const classes = require('../controllers/classes')
const users = require('../controllers/users')
const tipologias = require('../controllers/tipologias')
const indicadoresResolvers = require('./indicadoresResolvers')
const tipologiasResolvers = require('./tipologiasResolvers')
const classesResolvers = require('./classesResolvers')
const { GraphQLUpload } = require('graphql-upload')
const streamToPromise = require('stream-to-promise')

// Provide resolver functions for your schema fields
const resolvers = {
    Query: {
        users: (obj, args, context) => {
            return users.list(context)
        },
        user: (obj, args, context) => {
            return users.find(context,args.id)
        },
        entidades: (obj, args, context) => {
            return entidades.list(context)
        },
        entidade: (obj, args, context) => {
            return entidades.find(context,args._key)
        },
        legislacoes: (obj, args, context) => {
            return legislacoes.list(context.db)
        },
        legislacao: (obj, args, context)  => {
            return legislacoes.find(context, args._key)
        },
        tipologia: (obj, args, context) => {
            return tipologias.find(context, args._key)
        },
        classes: async (obj, args, context) => {
            let classesCache = context.cache.get( "cache" );
            if ( classesCache == undefined ){
                classes.listFull(context,args).then(list => {
                    context.cache.set('cache', list)
                })
                return classes.list(context,args)
            }
            else {
                return classesCache
            }
        },
        classesTree: (obj, args, context) => {
            return classes.tree(context, args)
        },
        indicadores: () =>{
            return {//Object will be filled in auxiliary resolvers bellow
                classes:{},
                relacoes:{}
            }  
        }
    },
    Mutation: {
        registerUser: (obj, args, context) => {
            return users.add(context, args.u)
        },
        login: (obj, args, context) => {
            return users.login(context,args.email,args.password)
        },
        addlegislacao: (obj, args, context) => {
            return legislacoes.add(context, args.leg)
        },
        addEntidade: (obj,args,context) => {
            return entidades.add(context,args.ent)
        },
        addClasse: (obj, args, context) => {
            return classes.add(context, args.classe)
        },
        importClasses: (obj, args, context) => {
            return args.file.then(async file => {
                console.log(file)
                //Contents of Upload scalar: https://github.com/jaydenseric/graphql-upload#class-graphqlupload
                let readable = file.createReadStream()
                //node stream api: https://nodejs.org/api/stream.html
                readable.on('data', (chunk) => {
                    console.log(`Received ${chunk.length} bytes of data.`);
                });
                readable.on('end', function () {
                    console.log('end')
                    return true
                });
                readable.on('error', function () {
                    console.log('error')
                    return false
                });
                let f = await streamToPromise(readable)
                console.log(f.toString())
                return true
            });
        }
    },
    Upload: GraphQLUpload,
    Indicadores: indicadoresResolvers.indicadores,
    IndicadoresClasses: indicadoresResolvers.classes,
    IndicadoresRelacoes: indicadoresResolvers.relacoes,
    Tipologia: tipologiasResolvers,
    Classe: classesResolvers
};

module.exports = resolvers