const mongoose = require("mongoose");
const Schema = mongoose.Schema;


//Tech schema
const TechnicienSchema = new Schema({
    username: {
        type:String,
        required:true,
        maxlength:40},
    email: {
        type:String,
        maxlength:40},
    password: {
        type:String,
        maxlength:100 },
    tel: {
        type:String,
        maxlength:11},
    role: {
        type:Boolean
    },
    tasks: [
        {type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'}
    ],
    reports: [
        {type: mongoose.Schema.Types.ObjectId,
        ref: 'Report',
        default: {}}
    ],

})


module.exports = mongoose.model('Technicien', TechnicienSchema)