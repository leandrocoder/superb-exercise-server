const settings = require('./src/settings')
const app = require('./src/app.js')
app.listen(settings.env.HTTP_PORT, () => {
    console.log(`Server running @ http://localhost:${settings.env.HTTP_PORT}`)
})
