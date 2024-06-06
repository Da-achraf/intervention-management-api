const express = require("express");
const router = express.Router();

const TechnicienController = require("../controllers/technicien.controller");


router.get("/technicien", TechnicienController.getTechs);
router.get("/technicien/:id", TechnicienController.getTech);
router.post("/technicien", TechnicienController.addTech);
router.get("/technicien/task/:id", TechnicienController.tasksByTechnicien);
router.get("/login", TechnicienController.login);
router.patch("/technicien/:id", TechnicienController.updateTech);
router.delete("/technicien/:id", TechnicienController.deleteTech);


module.exports = router;