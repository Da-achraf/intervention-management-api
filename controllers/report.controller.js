const Task = require("../models/task.model")
const Technicien = require('../models/technicien.model')
const Report = require('../models/report.model')
const moment = require('moment')
const CONSTANTS = require('../constantes/request-response')
const Utility = require('../utilities/utilities')

// Get All reports
exports.getReports = async (req, res) => {
    try {
        const reports = await Report.find({},{forTask: false})
        if(reports){
            if(reports.length != 0)
                return res.status(200).json({success: true, data: reports})
            else
                return res.status(200).json({success: true, message: CONSTANTS.UNKOWN_ERROR, data : []})
        }
    } catch (error) {
        res.status(401).json({success: false, message: CONSTANTS.UNKOWN_ERROR, error: error.message})
    }
}
0

// Get All reports for specific technicien
exports.getTechnicienReports = async (req, res) => {
    try {
        const reports = await Report.findOne({owner: req.body.owner})
        if(reports){
            if(reports.length != 0)
                return res.status(200).json({success: true, data: reports})
            else
                return res.status(200).json({success: true, message: CONSTANTS.UNKOWN_ERROR, data : []})
        }
    } catch (error) {
        res.status(401).json({success: false, message: CONSTANTS.UNKOWN_ERROR, error: error.message})
    }
}


// Get One report 
exports.getReport = async (req, res) => {
    try {
        const report = await report.find({_id: req.body.id})
        if(report.length != 0)
            return res.status(200).json({success: true, data: report})
        else
            return res.status(200).json({success: true, message: CONSTANTS.UNKOWN_ERROR})
    } catch (error) {
        res.status(401).json({success: false, message: CONSTANTS.UNKOWN_ERROR, error: error.message})
    }
}

// Add report 
exports.addReport = async (req, res) => {
    try {
        const technicien = await Technicien.findOne({username: req.body.owner})

        const newReport = await new Report({
            title: req.body.title,
            forTask: false, // a normal report, not for a specefic task
            dateCreation: moment(new Date(), 'YYYY-MM-DD hh:mm:ss'),
            content: req.body.content,
            owner: technicien._id,
            // username: technicien.username
        })
        

        const report = await newReport.save()
        technicien.reports.push(newReport)
        await technicien.save()
        if(report){
            // req.io.emit('newreport', {data: report})
            return res.status(201).json({success: true, message: CONSTANTS.CREATED})
        }
    } catch (error) {
        res.status(401).json({success: false, message: CONSTANTS.UNKOWN_ERROR, error: error.message})
    }
}


exports.addTaskReport = async (report, taskId, req, res) => {
    try {
        const technicien = await Technicien.findById(report.owner)
        const task = await Task.findById(taskId)

        // creating it
        const newReport = await new Report({
            title: report.title || 'Rapport de la tâche',
            forTask: true,
            dateCreation: moment(new Date(), 'YYYY-MM-DD hh:mm:ss'),
            content: report.content,
            owner: report.owner,
            task: taskId
        })

        console.log('step 1..')

        const savedReport = await newReport.save()

        // adding it to the reports of the technicien
        technicien.reports.push(newReport)
        await technicien.save()

        // linikng it to the convenable task
        task.report = newReport
        const updatedTask = await task.save()
        const populatedTask = await updatedTask.populate('report')


        if(savedReport){
            req.io.emit('updatedTask', {data: updatedTask})
            return res.status(201).json({success: true, message: CONSTANTS.CREATED})
        }
    } catch (error) {
        return res.status(401).json({success: false, message: CONSTANTS.UNKOWN_ERROR, error: error.message})
    }
}

exports.updateTaskReport = async (report, taskId, req, res) => {
    try {
        const updatedReport = await Report.findOneAndUpdate({task: taskId}, {$set : report})
        if(updatedReport){
            const updatedTask = await Task.findById(taskId)
            const populatedTask = await updatedTask.populate('report')
            req.io.emit('updatedTask', {data: populatedTask})
            return res.status(200).json({success: true, message: CONSTANTS.UPDATED})
        }
    } catch (error) {
        return res.status(401).json({success: false, message: CONSTANTS.UNKOWN_ERROR, error: error.message})
    }   
}

// Update report
exports.updateReport = async (req, res) => {
    try {
        const body = await req.body

        // technicien can update the normal report
        // only if the difference between the date of
        // its creation and the date of its upload

        let report = await Report.findById(req.params.id)
        let given = report.dateCreation

        if(Utility.getDateDifference(given) > 60)
            return res.status(200).json({success : false, message : CONSTANTS.DELAY_PASSED})

        let updatedreport = await Report.findByIdAndUpdate(req.params.id, {$set : body})
        if(updatedreport){
                // adding report to new technicien reports
                const owner = await Technicien.findById(body.owner)
                owner.reports.push(updatedreport._id) // or updatedreport._id
                await newTechnicien.save()
        

                return res.status(200).json({success: true, message: CONSTANTS.UPDATED, data: updatedreport})
            
            
                updatedreport = await report.findByIdAndUpdate(req.params.id, {$set : body}, {new : true})
                req.io.emit('updatedreport', {data: updatedreport})
                return res.status(200).json({success: true, message: CONSTANTS.UPDATED, data: updatedreport})
            
        }
        else
            res.status(200).json({success : false, message : CONSTANTS.UNKOWN_ERROR})
    } catch (error) {
        res.status(401).json({success : false, message : CONSTANTS.UNKOWN_ERROR, error: error.message})
    }
}

// Delete report
exports.deleteReport = async (req, res) => {
    try {
        const deletedReport = await Report.findByIdAndRemove(req.params.id)
        if(!deletedReport){
            return res.status(200).json({success : false, message : CONSTANTS.UNKOWN_ERROR})
        }
        else{
            const technicien = await Technicien.findById(deletedReport.owner)
            technicien.reports = await technicien.reports.filter(reportId => !deletedReport._id.equals(reportId))
            await technicien.save()
            req.io.emit('deletedReport', {data: deletedReport._id})
            return res.status(200).json({success:true, message : CONSTANTS.DELETED, data: deletedReport})
        }
    } catch (error) {
        return res.status(500).json({message: CONSTANTS.UNKOWN_ERROR ,error: error.message})
    }
}