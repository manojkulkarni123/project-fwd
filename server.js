﻿const express = require("express"); const mongoose = require("mongoose"); const cors = require("cors"); const authRoutes = require("./routes/auth"); const app = express(); app.use(cors()); app.use(express.json()); mongoose.connect("mongodb://127.0.0.1:27017/feeding_india").then(() => console.log("Connected")).catch(err => console.error(err)); app.use("/api/auth", authRoutes); app.listen(5000, () => console.log("Server running"));
