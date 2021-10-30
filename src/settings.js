var data =  {
    openTime:  "08:00",
    closeTime: "20:00",
    openDays: [true, true, true, true, true, true, true],
}

function save(payload) {
    // todo: save in database
    data = payload
}

function get() {
    return data
}

module.exports = { get, save }
