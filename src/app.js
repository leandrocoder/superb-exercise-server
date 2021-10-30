const Koa = require('koa')
const cors = require('@koa/cors');
const Router = require('koa-router')
const queue = require('./queue')

const settings= require('./settings')

const app = new Koa()
const router = new Router()

// Return the current version of API
router.get('/', ctx => {
    queue.add('test')
    ctx.body = 'Hello World'
})

// Return the array of tables
router.get('/table', ctx => {
    //todo: Return table list
    ctx.body = JSON.stringify([])
})

// Add a book request to the queue
router.post('/booking', ctx => {
    const bookingRequest = ctx.request.body
    const {name} = bookingRequest
    queue.add(bookingRequest)
    ctx.body = name
})

router.get('/settings', ctx => {
    ctx.body = settings.get()
})

router.post('/settings', ctx => {
    settings.save(ctx.request.body)
    ctx.body = settings.get()
})

app.use(cors());
app.use(require('koa-body')())
app.use(router.allowedMethods())
app.use(router.routes())

module.exports = app
