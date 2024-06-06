const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: {
        type:String,
        maxlength:50
    },
    type: {
        type:String, 
        maxlength:40
    },
    priority: {
        type:String,
        maxlength:50
    },  
    description:{
        type: String
    },
    dateCreation: {
        type:String,
        maxlength:150
    },
    client: {
        type:String,
        maxlength:150
    },
    progres: {
        type: Number,
        default: 0
    },
    seen: {
        type:Boolean,
        default: false
    },
    isBegun: {
        type:Boolean,
        default: false
    },
    isPaused: {
        type:Boolean,
        default: false
    },
    interactionDisabled: {
        type:Boolean,
        default: true
    },
    report: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report'    
    },
    technicien: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Technicien'
    },
    username: {
        type: String,
        maxlength:50
    }
})

module.exports = mongoose.model('Task', taskSchema)