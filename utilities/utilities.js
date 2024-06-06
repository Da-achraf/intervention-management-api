const moment = require('moment')
const Task = require("../models/task.model")


exports.getDateDifference = (given) => {

    let difference = -moment(given).diff(moment(new Date(), 'YYYY-MM-DD hh:mm:ss'), 'minutes')
    return difference
}

exports.findWeeklyTasks = async () => {
    // const tasks = Task.fin
}
