const express = require("express");

const {
  createTicket,
  getScreeningsByScreenId,
} = require("../controllers/cinema");

const router = express.Router();

router.post("/", createTicket);
router.get("/screen/:id", getScreeningsByScreenId);

module.exports = router;
