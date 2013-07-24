(function (){
  'use strict';
  var dataRef = new Firebase('https://darkness.firebaseIO.com/');;

  $(document).ready(function () {
    dataRef.on('value', function(data) {
      console.log("value", data.val());
    });

    dataRef.child("lines").on('child_added', function(data) {
      console.log("child_added", data.val());
    });

    var sketchpad = Raphael.sketchpad("editor", {
      width: 900,
      height: 800,
      editing: true
    });

    var pen = sketchpad.pen();
    pen.color("#0000ff");
    pen.opacity(0.5);

    // When the sketchpad changes, update the input field.
    sketchpad.change(function() {
      var data = sketchpad.json();
      dataRef.child("lines").push(data);
    });

    // Global variables (for debugging)
    window.App = {
      sketchpad: sketchpad
    };
  });

})();