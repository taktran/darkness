# Darkness

> It's dark in here.

[http://taktran.github.io/darkness/](http://taktran.github.io/darkness/)

A collaborative canvas, which tends towards darkness when there is no activity or too much light.

Built using [nodejs](http://nodejs.org/), with [arduino hardware](http://www.arduino.cc/) connected using [johnny five](https://github.com/rwldrn/johnny-five), and backend database connected using [firebase](https://www.firebase.com/).

The backend server and arduino adjusts the pen size using a potentiometer, the pen opacity using a light sensor.

Made for [pebblecode](http://pebblecode.com) art hack 2013.

## Installation

1. Prerequisites
    * [Node](http://nodejs.org/)
    * [Sass](http://sass-lang.com/download.html)
    * [GruntJS](http://gruntjs.com/)
    * [Bower](http://bower.io/)

2. Install node packages

        npm install

3. Install nodemon (for live updates)

        npm install nodemon

## Development

1. Connect the arduino (more instructions to come)
2. Start the node server:

        nodemon bin/server.js

3. Start the front end:

        grunt

3. Go to http://localhost:7770/

## Author

Created by [Tak Tran (ttt)](http://tutaktran.com).