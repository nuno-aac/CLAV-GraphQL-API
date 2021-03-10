const { aql } = require("arangojs");

module.exports.list = (db) => {
    return db.query(aql`for n in users return n`)
        .then(resp => resp.all()).then((list) => list)
        .catch(err => console.log(err))
}

module.exports.find = (db,id) => {
    return db.query(aql`for n in users
                    filter n._id == ${id}
                    return n`)
        .then(resp => resp.all()).then((list) => list[0])
        .catch(err => console.log(err))
}

module.exports.add = async (db, user) => {
    return db.query(aql`INSERT ${user} INTO users LET inserted = NEW RETURN inserted`)
        .then(resp => resp.all()).then((list) => list[0])
        .catch(err => console.log(err))
}