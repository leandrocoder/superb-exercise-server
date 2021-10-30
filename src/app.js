const Koa = require('koa')
const cors = require('@koa/cors');
const Router = require('koa-router')
const Queue = require('./queue')

const settings = require('./settings')
const db = require('./database')
const booking = require('./booking')
const queue = new Queue();

const pack = require('../package.json')

db.mongoose.connection.on("connected", async () => {
    settings.loadFromDatabase()
});

const app = new Koa()
const router = new Router()

queue.on('json', json => {
    if (json.type == "booking" && json.data) {
        booking.apply(json.data)
    }
})

// Return the current version of API
router.get('/', ctx => {
    ctx.body = {version:pack.version}
})

// Return the array of tables
router.get('/table', async ctx => {
    ctx.body = await db.list('table')
})

// Return the array of tables
router.post('/table', async ctx => {
    ctx.body = await db.create('table', ctx.request.body)
})

// Return the array of tables
router.del('/table/:id', async ctx => {
    const id = ctx.params.id
    ctx.body = await db.del('table', id)
})

router.get('/booking', async ctx => {
    let list = await db.list('booking')
    ctx.body = list
})

// Return the array of tables
router.del('/booking/:id', async ctx => {
    const id = ctx.params.id
    ctx.body = await db.del('booking', id)
})

// Add a book request to the queue
router.post('/queue', async ctx => {

    ctx.body = { status:true, message:'Booking added to queue' }
    const queueMessage = {
        type: "booking",
        data: ctx.request.body
    }
    queue.add(queueMessage)
})

// Create booking
router.post('/booking', async ctx => {
    ctx.body = booking.apply(ctx.request.body)
})

// Add a book request to the queue
router.post('/booking/test', async ctx => {
    let table = await booking.findATable(ctx.request.body)
    ctx.body = table
})

router.get('/settings', ctx => {
    ctx.body = settings.get()
})

router.post('/settings', ctx => {
    settings.save(ctx.request.body)
    ctx.body = settings.get()
})

router.get('/hours/:date', async ctx => {
    ctx.body = await booking.hoursStatus(ctx.params.date)
})

router.del('/drop/:table', async ctx => {
    try {
        await db.drop(ctx.params.table)
    } catch {}
    ctx.body = { status: true }
})

app.use(cors());
app.use(require('koa-body')())
app.use(router.allowedMethods())
app.use(router.routes())

module.exports = app
