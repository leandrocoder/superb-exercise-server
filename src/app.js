require('./env')

const Koa = require('koa')
const cors = require('@koa/cors');
const Router = require('koa-router')

const pack = require('../package.json')
const settings = require('./settings')
const booking = require('./booking')

const db = require('./database')
db.mongoose.connection.on("connected", async () => {
    //await settings.loadFromDatabase(db)
});

const queue = require('./queue')
queue.on('json', json => {
    if (json.type == "booking" && json.data) {
        booking.apply(json.data)
    }
})

const app = new Koa()
const router = new Router()

// Return the current version of API
router.get('/', ctx => {
    ctx.body = {version:pack.version }
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
    ctx.body = booking.del(ctx.params.id)
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
