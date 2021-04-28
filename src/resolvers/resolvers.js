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
const { ApolloError } = require('apollo-server-errors')

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
            let entsCache = context.cache.get( "cacheEnts" );
            if ( entsCache == undefined ){
                return entidades.list(context).then(list => {
                    context.cache.set('cacheEnts', list)
                    return list
                })
            }
            else {
                return entsCache
            }
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
        tipologias: (obj, args, context) => {
            let tipsCache = context.cache.get( "cacheTips" );
            if ( tipsCache == undefined ){
                tipologias.listFull(context,args).then(list => {
                    context.cache.set('cacheTips', list)
                })
                console.log("no cache")
                return tipologias.list(context)
            }
            else {
                console.log('cache')
                return tipsCache
            }         
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
                let loaded = false;
                let readable = file.createReadStream()
                readable.on('end', function () {
                    loaded = true
                });
                readable.on('error', function () {
                    loaded = false
                });
                let f = await streamToPromise(readable)
                let cls = JSON.parse(f)
                for (const classe of cls){
                    await classes.add(context,classe)
                }
                console.log(loaded)
                return loaded
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