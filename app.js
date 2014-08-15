var express = require('express');
var path = require('path');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var serialPort = require("serialport");
var LaunchpadServer = require('./lib/launchpad');

app.use(express.static(path.join(__dirname, 'resources')));

server.listen(3000, function(){
    console.log('   app listening on http://localhost:3000');
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

var availablePorts = {};

io.on('connection',function(socket){
    console.log('user0 connected');
    var launchpad = new LaunchpadServer();

    serialPort.list(function (err, ports) {
        availablePorts = ports;
        // ports.forEach(function(port) {
        //   console.log(port.comName);
        //   console.log(port.pnpId);
        //   console.log(port.manufacturer);
        // });
    });
    
    socket.on('listPortReq',function(){
        socket.emit('listPortRes', availablePorts);
    });
    socket.on('connectPort',function(selectedPort){
        launchpad.initialize(socket, selectedPort);
        launchpad.digitalWrite(socket);
        launchpad.analogWrite(socket);
        launchpad.pinMode(socket);
        // launchpad.analogFreqUpdate(socket);
        launchpad.sendI2CConfig(socket);
        launchpad.sendI2CWriteRequest(socket);
        launchpad.sendI2CReadRequest(socket);
    });

    socket.on('disconnectPort',function(){
        launchpad.closeSerialPort(socket);
    });

    socket.on('disconnect', function(){
        console.log('user0 disconnected');
        launchpad.closeSerialPort(socket);
    });
});