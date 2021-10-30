const request = require('supertest')
const app = require('./src/app.js')

describe('Sample Test', () => {
    it('Should test that true === true', async () => {
        const res = await request(app.callback()).get('/')
        expect(res.status).toBe(200)
        expect(res.text).toBe('Hello World')
    })
})