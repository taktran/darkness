(function (){
  'use strict';

  var HUE_MIN = 0,
      HUE_MAX = 360;

  var dataRef = new Firebase('https://darkness.firebaseIO.com/'),
    sketchpad = Raphael.sketchpad("editor", {
      width: 900,
      height: 800,
      editing: true
    }),
    pen = sketchpad.pen(),
    penColour,
    bgColour = {
      h: "0",
      s: "0",
      l: "0"
    };

  function init() {
    // Background colour
    updateBgColour();

    // Set up pen
    randomPenColour();
    pen.opacity(0.5);
  }

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

  function updateBgColour() {
    var colour = "hsl(" + bgColour.h + "," +
                          bgColour.s + "%," +
                          bgColour.l + "%)";


    console.log(colour);
    $("body").css("background-color", colour);
  }

  // function setupSocketIO() {
  //   var socket = io.connect("/", {
  //     "reconnect" : true,
  //     "reconnection delay" : 500,
  //     "max reconnection attempts" : 10
  //   });

  //   socket.on("connect", function() {
  //     socket.emit("message", "Connected - " + (new Date()).toString());
  //   });


  //   socket.on("sensor1", function(value) {

  //   });

  //   socket.on("sensor2", function(value) {

  //   });
  // }

  $(document).ready(function () {
    init();

    // Initial draw
    dataRef.once('value', function(data) {
      var dataVal = data.val();

      if (dataVal && _.has(dataVal, "lines")) {
        var strokes = dataVal.lines;
        sketchpad.json(strokes);
      }

      dataRef.child("background-lightness").on('value', function(data) {
        bgColour.l = data.val();
        updateBgColour();
      });

      dataRef.child("background-hue").on('value', function(data) {
        bgColour.h = data.val();

        if (bgColour.h === HUE_MIN) {
          bgColour.s = 100;
        } else if (bgColour.h === HUE_MAX) {
          bgColour.s = 0;
        } else {
          bgColour.s = 50;
        }

        updateBgColour();
      });

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

    // Not used anymore - using firebase instead
    // setupSocketIO();
  });

  // Global variables (for debugging)
  window.App = {
    dataRef: dataRef,
    sketchpad: sketchpad
  };
})();