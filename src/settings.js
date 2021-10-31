require('./env')

const dotenv = require('dotenv')
const fs = require('fs')
const env = dotenv.parse(fs.readFileSync('.env'))

var docID = null

var data =  {
    openTime:  "09:00",
    closeTime: "18:00",
    openDays: [true, true, true, true, true, false, false],
}

async function save(payload) {
    // todo: save in database
    data = payload
    db.put('settings', docID, data)
}

function get(prop = null) {
    if (!prop) return data
    return data[prop]
}

async function loadFromDatabase(db)
{
    let res = await db.getFirst('settings')
    if (res == null) {
        res = await db.create('settings', data)
    }
    docID = res._id
    res = res.toObject()
    data = {}
    for (var key in res) {
        if (key.indexOf('_') != 0) {
            data[key] = res[key];
        }
    }
    return data
}

module.exports = { loadFromDatabase, get, save, env }
