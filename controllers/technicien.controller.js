const Technicien = require("../models/technicien.model");
const Task = require("../models/task.model");
const EncryptPass = require("../Middleware/encryptPass");
const Authentication = require("../Middleware/authentication");
const CONSTANTS = require('../constantes/request-response');

//get techs
exports.getTechs = (req, res) => {

    Technicien.find().then(techData => {
        return res.status(200).json({success: true, data: techData})
    }).catch(error => {
        res.status(500).json({message: CONSTANTS.UNKOWN_ERROR, error: error.message})
    })
}


//get one tech
exports.getTech = (req, res, next) => {

    Technicien.findById(req.params.id ).then(techData => {
        return res.status(200).json({success: true, data: techData})
    }).catch(err => {
        res.status(500).json({message: CONSTANTS.UNKOWN_ERROR})
    })
}


// Tasks by technicien
exports.tasksByTechnicien = async (req, res) => {

    try {
        const technicien = await Technicien.findById(req.params.id).populate('tasks')
        if(technicien){
            if(technicien.tasks.length != 0){
                let populatedTasks = []
                for(let task of technicien.tasks){
                    let populatedTask = await task.populate('report')
                    populatedTasks.push(populatedTask)
                }
                return res.status(200).json({success: true, data: populatedTasks})
            }
            else
                return res.status(200).json({success: false, message: CONSTANTS.UNKOWN_ERROR, data: []})
        }
        else
            return res.status(200).json({success: false, message: CONSTANTS.UNKOWN_ERROR})
    } catch (error) {
        return res.status(401).json({success: false, message: CONSTANTS.UNKOWN_ERROR, error: error.message})
    }
}


//login
exports.login = async (req, res, next) => {

    try {
        if(req.headers["email"] == '' || !req.headers["email"] 
           || req.headers["password"] == '' || !req.headers["password"]){
            return res.status(200).json({ success: false, message: "Veuillez saisir vos données"})
        }
        else{
            const tech = await Technicien.findOne({ email: req.headers["email"] })
            if (tech){
                const result = await EncryptPass.ComparePasswords(tech.password, req.headers["password"])
                if (result) {
                    const token = await Authentication.CreateToken({ email: tech.email, username: tech.username })
                    return res.status(200).json({ success: true, token: token, data: tech})
                }else {
                    return res.status(200).json({ success: false, message: CONSTANTS.BAD_PASSWORD}) 
                }
            }else {
                return res.status(200).json({ success: false, message: CONSTANTS.BAD_EMAIL })
            } 
        }
    } catch (error) {
        return res.status(200).json({success: false, message: CONSTANTS.UNKOWN_ERROR, error: error.message})
    }
}


//add tech
exports.addTech = async (req, res) => {
    try {
        const foundTechnicien = await Technicien.findOne({email: req.body.email})
        if(foundTechnicien)
            return res.status(200).json({ success: false, message: CONSTANTS.ALREADY_USED_EMAIL})
        else{
            const technicien = await Technicien.findOne({username: req.body.username})
            if(technicien)
                return res.status(200).json({ success: false, message: CONSTANTS.ALREADY_USED_USERNAME})
            else{
                const newTechnicien = new Technicien({
                    username: req.body.username,
                    email: req.body.email,
                    password: await EncryptPass.CreateCipherPass(req.body.password),
                    role: req.body.role,
                    tel: req.body.tel
                })
                await newTechnicien.save()
                return res.status(200).json({ success: true, message: CONSTANTS.CREATED})
            }
        }
    } catch (error) {
        return res.status(200).json({success: false, message: CONSTANTS.UNKOWN_ERROR, error: error.message})
    }
}


//update tech
exports.updateTech = async (req, res, next) => {

    try {
        const body = await req.body
        const updatedTechnicien = await Technicien.findByIdAndUpdate(req.params.id, { $set: body }, { new: true })
        if(updatedTechnicien)
            return res.status(200).json({success: true, message: CONSTANTS.UPDATED})
        else
            return res.status(200).json({success : false, message : CONSTANTS.UNKOWN_ERROR})
    } catch (error) {
        return res.status(401).json({success: false, message: CONSTANTS.UNKOWN_ERROR, error: error.message})
    }
}


//delete tech
exports.deleteTech = async (req, res, next) => {

    try {
        const technicien = await Technicien.findById(req.params.id).populate('tasks')
        const technicienTasks = await technicien.tasks
        const noBody = await Technicien.findOne({username: 'No body'}).populate('tasks')
        const noBodyTasks = await noBody.tasks

        let updatedTask = {}
        for(let task of technicienTasks){
            updatedTask = await Task.findByIdAndUpdate(task._id, {$set: {technicien: noBody._id, username: noBody.username}})
            await updatedTask.save()
            await noBodyTasks.push(task._id)
        }
        await technicien.save()
        await noBody.save()
        const deletedTechnicien = await Technicien.findByIdAndDelete(req.params.id)
        if(deletedTechnicien){
            return res.status(200).json({ success: true, message: CONSTANTS.DELETED})
        }
    } catch (error) {
        return res.status(500).json({success: false, message: CONSTANTS.UNKOWN_ERROR, error: error.message})
    }

}