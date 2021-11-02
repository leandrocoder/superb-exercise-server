const request = require('supertest')
const app = require('./src/app.js')
const db = require('./src/database')
const queue = require('./src/queue')
const booking = require('./src/booking')

const wait = async (ms) => new Promise(res => setTimeout(res, ms))

var newTable = null
var newBooking = null

afterAll(() => { 
    db.mongoose.connection.close()
    queue.dispose()
})

describe('Database', () => {
    it('Connect', async () => {
        await wait(100)
        let readyState = db.mongoose.connection.readyState
        while (readyState == 2) {
            await wait(50)
            readyState = db.mongoose.connection.readyState
        }
        expect(readyState).toBe(1)
    })
})

describe('API', () => {
    it('Successful request the base route', async () => {
        const res = await request(app.callback()).get('/')
        expect(res.status).toBe(200)
        let json = null
        try { json = JSON.parse(res.text)} catch { }
        expect(json != null).toBe(true)
    })
})

describe('Booking', () => {
    it('Create a restaurant table', async () => {
        const payload = { chairs: 4 }
        return request(app.callback()).post('/table').send(payload).then(res => {
            newTable = res.body.id
            expect(res.status).toBe(200)
        })
    })

    it('Fail passing a invalid date', async () => {
        await wait(500)
        const payload = {"name":"Leandro","phone":"+55 11988898193","date":"2100-32-08","hour":"asas","chairs":1}
        let res = await booking.apply(payload)
        expect(!res.error).toBe(false)
    })

    it('Fail passing a date before today', async () => {
        await wait(500)
        const payload = {"name":"Leandro","phone":"+55 11988898193","date":"2100-32-08","hour":"asas","chairs":1}
        let res = await booking.apply(payload)
        expect(!res.error).toBe(false)
    })

    it('Fail passing a hour out of range', async () => {
        await wait(500)
        const payload = {"name":"Leandro","phone":"+55 11988898193","date":"2100-06-08","hour":"asas","chairs":1}
        let res = await booking.apply(payload)
        expect(!res.error).toBe(false)
    })

    it('Fail passing a invalid hour', async () => {
        await wait(500)
        const payload = {"name":"Leandro","phone":"+55 11988898193","date":"2100-06-08","hour":"50:00","chairs":1}
        let res = await booking.apply(payload)
        expect(!res.error).toBe(false)
    })

    it('Success requesting a booking with all correct data', async () => {
        await wait(500)
        const payload = {"name":"Leandro","phone":"+55 11988898193","date":"2100-06-08","hour":"14:00","chairs":1}
        newBooking = (await booking.apply(payload)).id
        expect(!!newBooking).toBe(true)
    })

    it('Delete booking', async () => {
        await wait(2000)
        let delRes = await booking.del(newBooking)
        expect(delRes.status).toBe(true)
    })

    
    it('Delete a table', async () => {
        await wait(2000)
        const payload = { chairs: 4 }
        let res = await request(app.callback()).del(`/table/${newTable}`)
        expect(res.body.status).toBe(true)
    })
})
