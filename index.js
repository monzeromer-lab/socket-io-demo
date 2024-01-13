// add dotenv to read from .env file
require("dotenv").config();

// deps
const { log } = require("console");
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

//create a model to store the { latitude: number, longitude: number } object in the database
const locationSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
  at: { type: Date, default: Date.now },
});

const Location = mongoose.model("Location", locationSchema);

const Fakerjs = require("@faker-js/faker");

/**
 * @returns {{ latitude: number, longitude: number }}
 */
function getFakeLocation() {
  return {
    latitude: Fakerjs.allFakers.en.location.latitude(),
    longitude: Fakerjs.allFakers.en.location.longitude(),
  };
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// connect to the database
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB Connected...");

    io.engine.on("connection", (rawSocket) => {
      rawSocket.request = null;
      rawSocket.on("hello", (arg1) => {
        console.log("Got data", arg1);
      });

      rawSocket.on("saveLocation", (arg1) => {
        // Assuming arg1 is an object with latitude and longitude properties
        const newLocation = new Location(arg1);
        newLocation
          .save()
          .then(() => console.log("Location saved"))
          .catch((err) => console.log("Error saving location:", err));
      });

      // server B
      rawSocket.on("ping", (cb) => {
        cb("pong");
      });

      rawSocket.on("broad", (arg1) => {
        console.log("Got data", arg1);
      });
      log("connection", rawSocket.id);
    });
  });

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

httpServer.listen(3000);
