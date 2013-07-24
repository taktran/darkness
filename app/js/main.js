(function (){
  'use strict';
  var dataRef = new Firebase('https://darkness.firebaseIO.com/'),
    sketchpad = Raphael.sketchpad("editor", {
      width: 900,
      height: 800,
      editing: true
    }),
    pen = sketchpad.pen(),
    penColour = randomColour();

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

  pen.color(penColour);
  pen.opacity(0.5);

  $(document).ready(function () {
    $("footer").css("background-color", penColour);

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

      dataRef.on('child_removed', function() {
        console.log("child_removed", data.val());
        // var lines = data.val();
        // sketchpad.json(lines);
      });

      // When the sketchpad changes, upload data
      sketchpad.change(function() {
        var data = sketchpad.json();
        dataRef.child("lines").set(data);
      });
    });

    $("#clear").click(function() {
      dataRef.child("lines").remove();
    });
  });

  // Global variables (for debugging)
  window.App = {
    dataRef: dataRef,
    sketchpad: sketchpad
  };
})();