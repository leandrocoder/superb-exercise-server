const db = require('./database')
const settings = require('./settings')

function checkValidHour(hour) {
    let hourParts = hour.toString().split(':')
    if (hourParts.length != 2 || isNaN(hourParts[0])  || isNaN(hourParts[1])) {
        return false
    }
    return true
}

function isDate(dateStr) {
    return !isNaN(new Date(dateStr).getDate());
}

function checkBiggerThanNow(dateStr) {
    let now = Date.now()
    let d = new Date(dateStr).getTime()
    return d > now
}

function validate(data) {
    if (!data.table) return { error: `Table not found.` }    
    const props = ['name', 'phone', 'chairs', 'date', 'hour']
    props.forEach(key => {
        if (!data.hasOwnProperty(key) || data[key].toString().length == 0) return { error: `Property ${key} required.`}        
    })

    if (!checkValidHour(data.hour)) return { error: `Invalid hour format.`}
    if (!isDate(data.date)) return { error: `Invalid date format.` }

    if (!checkBiggerThanNow(data.date)) return { error: `The date cannot be less than now`}

    let min = hourToInt(settings.get('openTime'))
    let max = hourToInt(settings.get('closeTime'))
    let requested = hourToInt(data.hour)

    if (requested < min || requested >= max) {
        return { error: `Passing hour out of possible range.`}        
    }

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

async function del(id) {
    return await db.del('booking', id)
}

async function apply(body) {
    body.table = await findATable(body)
    const validPayload = validate(body)
    if (validPayload.error) {
        return validPayload || {error: 'Unknow error'}
    }

    try {
        await db.create('booking', body)
    }
    catch { return { status: false } }
    return { status: true}
}

module.exports = { validate, findATable, hoursStatus, del, apply }
