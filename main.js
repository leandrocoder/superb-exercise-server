const app = require('./src/app.js')
app.listen(process.env.HTTP_PORT, () => {
    console.log(`Server running @ http://localhost:${process.env.HTTP_PORT}`)
})
