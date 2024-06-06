const express = require("express")
const router = express.Router()

const ReportController = require("../controllers/report.controller")


router.get('/report', ReportController.getReports)
// router.get('/reports/:id', ReportController.getTask)
// router.post('/task', ReportController.addTask)
// router.patch('/task/:id', ReportController.updateTask)
router.delete('/report/:id', ReportController.deleteReport)


module.exports = router