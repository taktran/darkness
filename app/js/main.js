(function (){
  'use strict';
  var SENSOR_MIN = 0,
    SENSOR_MAX = 1023,
    INPUT_MIN = 100,
    INPUT_MAX = 255;

  var dataRef = new Firebase('https://darkness.firebaseIO.com/'),
    sketchpad = Raphael.sketchpad("editor", {
      width: 900,
      height: 800,
      editing: true
    }),
    pen = sketchpad.pen(),
    penColour;

  function randomColour() {
    // 30 random hues with step of 12 degrees
    var hue = Math.floor(Math.random() * 30) * 12;

    return $.Color({
      hue: hue,
      saturation: 0.9,
      lightness: 0.6,
      alpha: 1
    }).toHexString();
  }

  function randomPenColour() {
    penColour = randomColour();
    console.log("randomPenColour", penColour);
    pen.color(penColour);
    $("footer").css("background-color", penColour);
  }

  function mapSensorValue(value) {
    var valueProportion = value / (SENSOR_MAX - SENSOR_MIN),
      valueMap = Math.floor(
        (valueProportion * (INPUT_MAX - INPUT_MIN)) + INPUT_MIN
      );

    return valueMap;
  }

  function setupSocketIO() {
    var socket = io.connect("/", {
      "reconnect" : true,
      "reconnection delay" : 500,
      "max reconnection attempts" : 10
    });

    socket.on("connect", function() {
      socket.emit("message", "Connected - " + (new Date()).toString());
    });

    socket.on("sensor1", function(value) {
      var mappedValue = mapSensorValue(value);
      console.log("1:", value, mappedValue);
    });

    socket.on("sensor2", function(value) {
      var mappedValue = mapSensorValue(value);
      console.log("2:", value, mappedValue);
    });
  }

  $(document).ready(function () {
    // Set up pen
    randomPenColour();
    pen.opacity(0.5);

    // Initial draw
    dataRef.once('value', function(data) {
      var dataVal = data.val();

      if (dataVal && _.has(dataVal, "lines")) {
        var strokes = dataVal.lines;
        sketchpad.json(strokes);
      }

      dataRef.on('value', function(data) {
        var dataVal = data.val();
        console.log("value", dataVal);

        if (dataVal && _.has(dataVal, "lines")) {
          var lines = dataVal.lines;
          sketchpad.json(lines);
        } else {
          // Clear canvas
          sketchpad.clear();
        }
      });

      // When the sketchpad changes, upload data
      sketchpad.change(function() {
        var data = sketchpad.json();
        dataRef.child("lines").set(data);
      });
    });

    $("#clear").click(function(event) {
      dataRef.child("lines").remove();

      event.stopPropagation();
    });

    // Change pen colour when clicking on footer
    $("footer").click(function() {
      randomPenColour();
    });

    setupSocketIO();
  });

  // Global variables (for debugging)
  window.App = {
    dataRef: dataRef,
    sketchpad: sketchpad
  };
})();