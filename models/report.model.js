const mongoose = require("mongoose");
const Schema = mongoose.Schema;


//Tech schema
const ReportSchema = new Schema({
    title: {
        type:String,
        required:true,
        maxlength:60,
    },
    dateCreation: {
        type: String,
        maxlength: 150
    },
    forTask: {
        type: Boolean // normal report or a one for a task
    },
    content: {
        type: String
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
            ref: 'Technicien'
    },      
    // in case the report is for  a task
    // it should have the task id
    task: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
    
})


module.exports = mongoose.model('Report', ReportSchema)