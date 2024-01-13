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
  at: { type: Date, default: Date.now() },
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
    at: Date.now() ,
  };
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// connect to the database
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB Connected...");

    io.engine.on("connection", (rawSocket) => {
      rawSocket.request = null;
      rawSocket.on("hello", (arg1) => {
        console.log("Got data", arg1);
      });

      rawSocket.on("saveLocation", (arg) => {
        console.log(arg);
        const newLocation = new Location(getFakeLocation());
        newLocation
          .save()
          .then(() => console.log("Location saved"))
          .catch((err) => console.log("Error saving location:", err));
        
          io.send("locationSaved");
      });

      // server B
      rawSocket.on("ping", (cb) => {
        cb("pong");
      });

      rawSocket.on("broad", (arg1) => {
        console.log("Got data", arg1);
      });
      log("connection", rawSocket.id);

      rawSocket.on('joinRoom', (roomId) => {
        rawSocket.join(roomId);
    
        // Send the current location to the client
        rawSocket.emit('locationUpdate', getFakeLocation());
    
        // Listen for location updates from the client
        rawSocket.on('locationUpdate', (newLocation) => {

          // Broadcast the new location to all other clients in the room
          rawSocket.to(roomId).emit('locationUpdate', getFakeLocation());
        });
      });

      rawSocket.on('leaveRoom', (roomId) => {
        rawSocket.leave(roomId);
      });

      rawSocket.on("disconnect", () => {
        log("disconnect", rawSocket.id);
      });


    });
  });



app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

httpServer.listen(3000);
