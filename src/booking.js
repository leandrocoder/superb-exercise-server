const db = require('./database')
const settings = require('./settings')

function validate(data) {
    if (!data.table) return { error: `Table not found.` }    
    const props = ['name', 'phone', 'chairs', 'date', 'hour']
    props.forEach(key => {
        if (!data.hasOwnProperty(key) || data[key].toString().length == 0) return { error: `Property ${key} required.`}        
    })

    // todo: validate if date and hour are valid format
    return { }
}

async function findATable(data) {
    const { date, hour } = data
    let bookings = await db.list('booking', {date, hour})   
    let tables = await db.list('table')
    if (!tables || tables.length == 0) return null
    tables = tables.map(x => x._id.toString())
    let bookingTables = bookings.map(x => x.table.toString())
    let avaliableTables = tables.filter(x => bookingTables.indexOf(x) < 0)
    return avaliableTables && avaliableTables.length > 0 ? avaliableTables[0] : null
}

function hourToInt(hour) {
    let parts = hour.split(':')
    let n = parseInt(parts[0])
    return n
}

async function hoursStatus(date) {
    let min = hourToInt(settings.get('openTime'))
    let max = hourToInt(settings.get('closeTime'))

    let bookings = await db.list('booking', {date})   
    let tables = await db.list('table')

    if (!tables || tables.length == 0) return []
    tables = tables.map(x => x._id.toString())

    let res = []
    for (let i = 0; i < 24; i++) {
        if (i >= min && i < max) {
            let t = ((i < 9) ? `0${i}` : i) + ':00'
            let bookedTables = bookings.filter(x => x.hour == t).map(x => x.table.toString())
            let tableList = tables.filter(x => bookedTables.indexOf(x) < 0)
            res.push({
                tables: tableList.length,
                time: t
            })
        }
    }

    return res
}

module.exports = { validate, findATable, hoursStatus }
