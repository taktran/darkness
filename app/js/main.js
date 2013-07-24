(function (){
  'use strict';
  var dataRef = new Firebase('https://darkness.firebaseIO.com/'),
    sketchpad = Raphael.sketchpad("editor", {
      width: 900,
      height: 800,
      editing: true
    }),
    pen = sketchpad.pen();

  pen.color("#0000ff");
  pen.opacity(0.5);

  $(document).ready(function () {
    // dataRef.on('value', function(data) {
    //   console.log("value", data.val());
    // });

    // Initial draw
    dataRef.once('value', function(data) {
      var dataVal = data.val();

      if (dataVal && _.has(dataVal, "lines")) {
        var linesData = dataVal.lines,
          lines = _.values(linesData),
          linesArray = [];

        _.each(lines, function(line) {
          var lineHash = JSON.parse(line)[0];
          linesArray.push(lineHash);
        });
        console.log(linesArray.length +  " lines");

        sketchpad.strokes(linesArray);
      }

      dataRef.child("lines").on('child_added', function(data) {
        var lines = data.val();
        // console.log("child_added", lines);
        // sketchpad.json(lines);
      });

      // When the sketchpad changes, upload data
      sketchpad.change(function() {
        var data = sketchpad.json();
        dataRef.child("lines").push(data);
      });
    });
  });

  // Global variables (for debugging)
  window.App = {
    sketchpad: sketchpad
  };
})();