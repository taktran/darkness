(function (){
  'use strict';

  $(document).ready(function () {
    var dataRef = new Firebase('https://darkness.firebaseIO.com/');

    dataRef.child("x" + ":" + "y").set("something");

    dataRef.on('value', function(data) {
      console.log(data.val());
    });
  });

})();