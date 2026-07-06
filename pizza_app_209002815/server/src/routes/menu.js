const express = require("express");
const { pizzas, sizes, toppings } = require("../data/menu");

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({ pizzas, sizes, toppings });
});

module.exports = router;
