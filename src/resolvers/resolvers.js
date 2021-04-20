const entidades = require('../controllers/entidades')
const legislacoes = require('../controllers/legislacoes')
const classes = require('../controllers/classes')
const users = require('../controllers/users')
const tipologias = require('../controllers/tipologias')
const indicadoresResolvers = require('./indicadoresResolvers')
const tipologiasResolvers = require('./tipologiasResolvers')
const classesResolvers = require('./classesResolvers')

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
            classesCache = context.cache.get( "cache" );
            if ( classesCache == undefined ){
                var list = await classes.listFull(context,args)
                console.log(list)
                return list
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
        }
    },
    Indicadores: indicadoresResolvers.indicadores,
    IndicadoresClasses: indicadoresResolvers.classes,
    IndicadoresRelacoes: indicadoresResolvers.relacoes,
    Tipologia: tipologiasResolvers,
    Classe: classesResolvers
};

module.exports = resolvers