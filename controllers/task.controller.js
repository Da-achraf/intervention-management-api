const Task = require("../models/task.model")
const Report = require("../models/report.model")
const Technicien = require('../models/technicien.model')
const moment = require('moment')
const ReportController = require("../controllers/report.controller")
const CONSTANTS = require('../constantes/request-response')




// Get All Tasks
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find()
        if(tasks){
            if(tasks.length != 0){
                let populatedTasks = []
                for(let task of tasks){
                    let populatedTask = await task.populate('report')
                    populatedTasks.push(populatedTask)
                }
                return res.status(200).json({success: true, data: populatedTasks.reverse()})
            }
            else
                return res.status(200).json({success: true, message: CONSTANTS.UNKOWN_ERROR, data : []})
        }
    } catch (error) {
        res.status(401).json({success: false, message: CONSTANTS.UNKOWN_ERROR, error: error.message})
    }
}


// Closed tasks
exports.getClosedTasks = async (req, res) => {
    try {
        const closedTasks = await Task.find({progres: 100})
        if(closedTasks.length != 0)
            return res.status(200).json({success: true, data: closedTasks})
        else
            return res.status(200).json({success: true, message: CONSTANTS.UNKOWN_ERROR})
    } catch (error) {
        res.status(401).json({success: false, message: CONSTANTS.UNKOWN_ERROR, error: error.message})
    }
}


// Closed tasks
exports.getCurrentTasks = async (req, res) => {
    try {
        const curentTasks = await Task.find({$where: 'progres > 0 && progres < 100'})
        if(curentTasks.length != 0)
            return res.status(200).json({success: true, data: curentTasks})
        else
            return res.status(200).json({success: true, message: CONSTANTS.UNKOWN_ERROR})
    } catch (error) {
        res.status(401).json({success: false, message: CONSTANTS.UNKOWN_ERROR, error: error.message})
    }
}


// New tasks
exports.getNewTasks = async (req, res) => {
    try {
        const newTasks = await Task.find({progres: 0})
        if(newTasks.length != 0)
            return res.status(200).json({success: true, data: newTasks})
        else
            return res.status(200).json({success: true, message: CONSTANTS.UNKOWN_ERROR})
    } catch (error) {
        res.status(401).json({success: false, message: CONSTANTS.UNKOWN_ERROR, error: error.message})
    }
}


// Get cout of closed tasks
exports.getClosedTasksCount = async (req, res) => {
    try {
        const closedTasks = await Task.count({progres: 100})
        if(closedTasks.length != 0)
            return res.status(200).json({success: true, data: closedTasks})
        else
            return res.status(200).json({success: true, message: CONSTANTS.UNKOWN_ERROR})
    } catch (error) {
        res.status(401).json({success: false, message: CONSTANTS.UNKOWN_ERROR, error: error.message})
    }
}


// Get One Task 
exports.getTask = async (req, res) => {
    try {
        const task = await Task.findById(req.body.id)
        if(task.length != 0)
            return res.status(200).json({success: true, data: task})
        else
            return res.status(200).json({success: true, message: CONSTANTS.UNKOWN_ERROR})
    } catch (error) {
        res.status(401).json({success: false, message: CONSTANTS.UNKOWN_ERROR, error: error.message})
    }
}

// Add Task 
exports.addTask = async (req, res) => {
    try {
        const body = req.body

        const technicien = await Technicien.findOne({username: body.assignTo})

        
        const newTask = await new Task({
            title: body.title,
            type: body.type,
            priority: body.priority,
            dateCreation: moment(new Date(), 'YYYY-MM-DD hh:mm:ss'),
            description: body.description,
            client: body.client,
            technicien: technicien._id,
            username: technicien.username
        })
        

        const task = await newTask.save()
        technicien.tasks.push(newTask)
        await technicien.save()
        if(task){
            req.io.emit('newTask', {data: task})
            return res.status(201).json({success: true, message: CONSTANTS.CREATED})
        }
    } catch (error) {
        res.status(401).json({success: false, message: CONSTANTS.UNKOWN_ERROR, error: error.message})
    }
}

// Update Task
exports.updateTask = async (req, res) => {
        try {
            let taskId = req.params.id
            let body = await req.body
            if(Object.keys(body).includes('report')){
                let report = body.report
                const foundReport = await Report.findOne({task: taskId})
                if(!foundReport){
                    // in case the task has no report yet
                    ReportController.addTaskReport(report, taskId, req, res)
                    return
                }
                // otherwise
                ReportController.updateTaskReport(report, taskId, req, res)
                return 
            }

            let updatedTask = await Task.findByIdAndUpdate(taskId, {$set : body}, {new : false})
            console.log(updatedTask);
            if(updatedTask){
                if(Object.keys(body).includes('username')){ // wich means that the task has been affected to someone else
                    // removing task from old technicien tasks
                    const oldTechnicien = await Technicien.findById(updatedTask.technicien)
                    oldTechnicien.tasks = oldTechnicien.tasks.filter(taskId =>
                        !updatedTask._id.equals(taskId))
                    await oldTechnicien.save()
    
                    // adding task to new technicien tasks
                    const newTechnicien = await Technicien.findById(body.technicien)
                    newTechnicien.tasks.push(updatedTask._id) // or updatedTask._id
                    await newTechnicien.save()
            
                    updatedTask = await Task.findByIdAndUpdate(req.params.id, {$set : body}, {new : true})
    
                    req.io.emit('updatedTask', {data: updatedTask})
                    return res.status(200).json({success: true, message: CONSTANTS.UPDATED, data: updatedTask})
                }
                else{
                    updatedTask = await Task.findByIdAndUpdate(req.params.id, {$set : body}, {new : true})
                    req.io.emit('updatedTask', {data: updatedTask})
                    return res.status(200).json({success: true, message: CONSTANTS.UPDATED, data: updatedTask})
                }
            }
            else
                res.status(200).json({success : false, message : CONSTANTS.UNKOWN_ERROR})


    } catch (error) {
        res.status(401).json({success : false, message : CONSTANTS.UNKOWN_ERROR, error: error.message})
    }
}

// Delete Task
exports.deleteTask = async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndRemove(req.params.id)
        if(!deletedTask){
            return res.status(200).json({success : false, message : CONSTANTS.UNKOWN_ERROR})
        }
        else{
            const technicien = await Technicien.findById(deletedTask.technicien)
            technicien.tasks = await technicien.tasks.filter(taskId => !deletedTask._id.equals(taskId))
            await technicien.save()
            req.io.emit('deletedTask', {data: deletedTask._id})
            return res.status(200).json({success:true, message : CONSTANTS.DELETED, data: deletedTask})
        }
    } catch (error) {
        return res.status(500).json({message: CONSTANTS.UNKOWN_ERROR ,error: error.message})
    }
}
