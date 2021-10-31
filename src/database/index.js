require('../env')

const mongoose = require('mongoose')
const normalize = require('normalize-mongoose')

const DBCONFIG = {
    HOST: process.env.MONGO_HOST,
    USER: process.env.MONGO_USER,
    PASSWORD: process.env.MONGO_PASSWORD,
    DATABASE: process.env.MONGO_DB,
}

const END_POINT = `mongodb+srv://${DBCONFIG.USER}:${DBCONFIG.PASSWORD}@${DBCONFIG.HOST}/${DBCONFIG.DATABASE}?retryWrites=true&w=majority`


mongoose.plugin(normalize)
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(END_POINT)
mongoose.Promise = global.Promise

String.prototype.toObjectId = function() {
    return new mongoose.Types.ObjectId(this.toString())
}

const models = {
    settings: require('./schema/settings'),
    booking: require('./schema/booking'),
    table: require('./schema/table')
}

async function create(table, data) {
    let model = models[table]
    if (!model) return
    return await model.create(data)
}

async function list(table, where = {}) {
    let model = models[table]
    if (!model) return
    let res = await model.find(where)
    if (!res || !res.length) return []
    return res
}

async function getFirst(table) {
    let model = models[table]
    if (!model) return
    let res = await model.findOne()
    return res
}

async function get(table, id) {
    let model = models[table]
    if (!model) return
    return await model.find({_id:id})
}

async function del(table, id) {
    let model = models[table]
    if (!model) return
    let res = await model.deleteOne({_id:id})
    if (res.n > 0) {
        return { status: true }
    }
    return { status: false }
}

async function put(table, id, data) {
    let model = models[table]
    if (!model) return
    return await model.findOneAndUpdate({_id:id}, data, {new:true})
}

async function drop(table) {
    let model = models[table]
    if (!model) return
    await model.collection.drop();
}

module.exports = { drop, mongoose, create, list, get, getFirst, del, put }
