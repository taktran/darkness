var SENSOR_MIN = 0,
    SENSOR_MAX = 1023,
    SENSOR_1_MIN = 0,
    SENSOR_1_MAX = 100;

var fs = require("fs");
var url = require("url");
var Firebase = require('firebase'),
  dataRef = new Firebase('https://darkness.firebaseIO.com/');

var five = require("johnny-five"),
  board = new five.Board({ port: "/dev/tty.usbserial-A800ep51" }),
  Potentiometer = require("../lib/Potentiometer").Potentiometer,
  pot, pot2;

// static file http server
// serve files for application directory

var root = "app";
var http = require("http").createServer(handle);

function handle (req, res) {
  var request = url.parse(req.url, false);
  console.log("Serving request: " + request.pathname);

  var filename = request.pathname;

  if (filename == "/") { filename = "/index.html"; }

  filename = root + filename;

  try {
    fs.realpathSync(filename);
  } catch (e) {
    res.writeHead(404);
    res.end();
  }

  var contentType = "text/plain";

  if (filename.match(".js$")) {
    contentType = "text/javascript";
  } else if (filename.match(".html$")) {
    contentType = "text/html";
  } else if (filename.match(".css$")) {
    contentType = "text/css";
  }

  fs.readFile(filename, function(err, data) {
    if (err) {
      res.writeHead(500);
      res.end();
      return;
    }

    res.writeHead(200, {"Content-Type": contentType});
    res.write(data);
    res.end();
  });
}

http.listen(9090);

console.log("server started on localhost:9090");

var io = require("socket.io").listen(http); // server listens for socket.io communication at port 8000
io.set("log level", 1); // disables debugging. this is optional. you may remove it if desired.

function mapSensorValue(value, min, max) {
  var valueProportion = value / (SENSOR_MAX - SENSOR_MIN),
    valueMap = Math.floor(
      (valueProportion * (max - min)) + min
    );

  return valueMap;
}

// Connect to arduino
board.on("ready", function() {
  console.log("board ready");

  pot = new Potentiometer("A0");
  pot2 = new Potentiometer("A1");

  pot.on("read", function(value) {
    var mappedValue = mapSensorValue(value, SENSOR_1_MIN, SENSOR_1_MAX),
      bgColour = "hsl(0, 0%, " + mappedValue + "%)";

    dataRef.child("background-color").set(bgColour);
  });

  pot2.on("read", function() {
    console.log("pot2", pot2.val);
    io.sockets.emit("sensor2", pot2.val);
  });

  pot.injectIntoRepl(board);
  pot2.injectIntoRepl(board);
});

io.sockets.on("connection", function (socket) {
  // If socket.io receives message from the client browser then
  // this call back will be executed.
  socket.on("message", function (msg) {
    console.log(msg);
  });
  // If a web browser disconnects from Socket.IO then this callback is called.
  socket.on("disconnect", function () {
    console.log("disconnected");
  });
});