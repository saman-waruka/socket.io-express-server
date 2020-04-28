import express from "express";
import bodyParser from "body-parser";
import SocketIO from "./socketio";
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

SocketIO(app);
export default server;
