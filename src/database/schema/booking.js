const mongoose = require('mongoose')
const definition = {
    table: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    date: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    hour: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    name: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    phone: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    chairs: {
        type: mongoose.Schema.Types.Number,
        required: true
    },
    _createdAt: {
        type: mongoose.Schema.Types.Date,
        private: true
    },
    _updatedAt: {
        type: mongoose.Schema.Types.Date,
        private: true
    }
}

const Model = new mongoose.Schema(definition, {
    toObject: { virtuals: false },
    toJSON: { virtuals: false }
})

Model.pre('save', async function(next) { 
    const now = +new Date();
    this._updatedAt = now;
    if(!this._createdAt) this._createdAt = now
    next();
})

const model = mongoose.model('Booking', Model)
module.exports = model
