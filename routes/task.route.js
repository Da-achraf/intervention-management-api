const express = require("express")
const router = express.Router()

const TaskController = require("../controllers/task.controller")


router.get('/task', TaskController.getTasks)
router.get('/task/:id', TaskController.getTask)
router.get('/task/closed', TaskController.getClosedTasks)
router.get('/task/current', TaskController.getCurrentTasks)
router.get('/task/new', TaskController.getNewTasks)
// router.get('/task/closed/count', TaskController.getClosedTasksCount)
// router.get('/task/current/count', TaskController.getCurrentTasksCount)
// router.get('/task/new/count', TaskController.getNewTasksCount)
router.post('/task', TaskController.addTask)
router.patch('/task/:id', TaskController.updateTask)
router.delete('/task/:id', TaskController.deleteTask)


module.exports = router