var fs = require("fs");
var url = require("url");

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

// Connect to arduino
board.on("ready", function() {
  console.log("board ready");

  pot = new Potentiometer("A0");
  pot2 = new Potentiometer("A1");

  pot.on("read", function() {
    console.log("pot", pot.val);
    io.sockets.emit("sensor1", pot.val);
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