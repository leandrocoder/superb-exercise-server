const mongoose = require('mongoose')
const definition = {
    openTime: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    closeTime: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    openDays: {
        type: mongoose.Schema.Types.Mixed,
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

const model = mongoose.model('Settings', Model)
module.exports = model
