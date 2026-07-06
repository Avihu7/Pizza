const express = require("express");
const cors = require("cors");

const menuRouter = require("./routes/menu");
const ordersRouter = require("./routes/orders");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/menu", menuRouter);
app.use("/api/orders", ordersRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

module.exports = app;
