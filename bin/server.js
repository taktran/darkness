var SENSOR_MIN = 0,
    SENSOR_MAX = 1023,

    LIGHTNESS_MIN = 0,
    LIGHTNESS_MAX = 100,

    HUE_MIN = 1,
    HUE_MAX = 360,

    PEN_SIZE_MIN = 3,
    PEN_SIZE_MAX = 400;

var fs = require("fs");
var url = require("url");
var Firebase = require('firebase'),
  dataRef = new Firebase('https://darkness.firebaseIO.com/');

var five = require("johnny-five"),
  board = new five.Board({ port: "/dev/tty.usbserial-A800ep51" }),
  Sensor = require("../lib/Sensor"),

  lightnessPot,
  huePot,
  penSizePot,
  photoResistor;

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

  lightnessPot = new Sensor("A0", board);
  huePot = new Sensor("A1", board);
  penSizePot = new Sensor("A2", board);

  lightnessPot.on("read", function(value) {
    var lightness = mapSensorValue(value, LIGHTNESS_MIN, LIGHTNESS_MAX);

    dataRef.child("background-lightness").set(lightness);
  });

  huePot.on("read", function(value) {
    var hue = mapSensorValue(value, HUE_MIN, HUE_MAX);

    dataRef.child("background-hue").set(hue);
  });

  penSizePot.on("read", function(value) {
    var penSize = mapSensorValue(value, PEN_SIZE_MIN, PEN_SIZE_MAX);

    dataRef.child("pen-size").set(penSize);
  });


  // ------------------------------
  // Photo resister
  // ------------------------------
  photoResistor = new five.Sensor({
    pin: "A3",
    freq: 250
  });

  board.repl.inject({
    pot: photoResistor
  });

  photoResistor.on("read", function( err, value ) {
    // console.log( value, this.normalized );
  });
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