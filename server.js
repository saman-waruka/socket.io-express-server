import express from "express";
import bodyParser from "body-parser";
import http from "http";
const cron = require("node-cron");
import socketIO from "socket.io";
const server = express();
const port = 9000;

server.use(bodyParser.json());
server.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

server.get("/", (req, res) => {
  res.send("ok");
});

const app = server.listen(port, function (err, result) {
  console.log("running in port http://localhost:" + port);
});

const io = socketIO.listen(app);
// รอการ connect จาก client
const nsp = io.of("/my-namespace");
const nsp2 = io.of("/12345");

// io.on("connection", (client) => {
//   console.log("user connected");

//   // เมื่อ Client ตัดการเชื่อมต่อ
//   client.on("disconnect", () => {
//     console.log("user disconnected");
//   });

//   // ส่งข้อมูลไปยัง Client ทุกตัวที่เขื่อมต่อแบบ Realtime
//   client.on("sent-message", function (message) {
//     io.sockets.emit("new-message", message);
//   });
// });

nsp.on("connection", (client) => {
  console.log("user connected /my-namespace");
  console.log(nsp);
  let amountConn = Object.keys(nsp.sockets).length;
  console.log("/my-namespace Count connections in this nsp ====> ", amountConn);
  // เมื่อ Client ตัดการเชื่อมต่อ
  client.on("disconnect", () => {
    console.log("user disconnected /my-namespace");
    amountConn = Object.keys(nsp.sockets).length;
    console.log(
      "/my-namespace Count connections in this nsp ====> ",
      amountConn
    );
  });

  // ส่งข้อมูลไปยัง Client ทุกตัวที่เขื่อมต่อแบบ Realtime
  client.on("sent-message", function (message) {
    client.broadcast.emit("new-message", message);
    console.log(message);
  });
});
let hasScheduleNSP2 = false;
let task = null;
nsp2.on("connection", (client) => {
  console.log("user connected /12345");
  // console.log(nsp2);
  // console.log(client.nsp.connected);

  if (!hasScheduleNSP2) {
    console.log(" Start task NSP /12345");

    task = cron.schedule("0-59/5 * * * * *", () => {
      console.log("running a task every five seconds : ", new Date());
      nsp2.emit("new-message", new Date());
    });
    hasScheduleNSP2 = true;
  }

  let amountConn = Object.keys(nsp2.sockets).length;
  console.log("/12345 Count connections in this nsp ====> ", amountConn);
  console.log(client.adapter.rooms);

  // console.log(" clients ====>  ", nsp2.sockets);
  console.log(" namespace ====>  ", nsp2.name);
  // console.log(" connection ====>  ", nsp2.connected);

  // เมื่อ Client ตัดการเชื่อมต่อ
  client.on("disconnect", () => {
    console.log("user disconnected /12345");
    console.log(client.adapter.rooms);
    amountConn = Object.keys(nsp2.sockets).length;
    if (!amountConn) {
      task.destroy();
      console.log(" Destroy task NSP /12345");
      hasScheduleNSP2 = false;
    }
    console.log("/12345 Count connections in this nsp ====> ", amountConn);
  });

  // ส่งข้อมูลไปยัง Client ทุกตัวที่เขื่อมต่อแบบ Realtime
  client.on("sent-message", function (message) {
    client.broadcast.emit("new-message", message);
    console.log(message);
  });
});

export default server;
