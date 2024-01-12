// add dotenv to read from .env file
require("dotenv").config();

// deps
const { log } = require("console");
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

//create a model to store the { latitude: number, longitude: number } object in the database


const Fakerjs = require('@faker-js/faker');

/**
 * @returns {{ latitude: number, longitude: number }}
 */
function getFakeLocation() {
  return {
    latitude: Fakerjs.allFakers.en.location.latitude(),
    longitude: Fakerjs.allFakers.en.location.longitude()
  }
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

io.engine.on("connection", (rawSocket) => {
  rawSocket.request = null;
  rawSocket.on("hello", (arg1) => {
    console.log("Got data", arg1);
  });

  rawSocket.on("data", (arg1) => {
    console.log("Got data", arg1);
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

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

httpServer.listen(3000);
