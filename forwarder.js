
var config = require('./network-config');

var PORT_FROM_KINECT = 12345; // also 12347
var LOCAL_HOST = '127.0.0.1';

var SERVER_HOST = config.SERVER_HOST;
var SERVER_PORT = config.SERVER_PORT;

var osc = require('osc');
var io = require('socket.io-client');

var udpPort = new osc.UDPPort({
    localAddress: LOCAL_HOST,
    localPort: PORT_FROM_KINECT
});

var socket = io('http://' + SERVER_HOST + ':' + SERVER_PORT);

var socketConnected = false;

console.log('creating socket now');

socket.on('connect', function() {
    console.log('connected dog');
    socketConnected = true;

    socket.emit('rollcall', 'forwarder');
});

// Listen for incoming OSC bundles.
udpPort.on("bundle", function (oscBundle) {
    if (!socketConnected) {
      console.log('not ready');
      return;
    }

   for (var i = 0; i < oscBundle.packets.length; i++) {
     var packet = oscBundle.packets[i];

     if (packet.address === '/righthand_pos_screen') {
       socket.emit('rightHand', packet);
     } else if (packet.address === '/lefthand_pos_screen') {
       socket.emit('leftHand', packet);
     } else if (packet.address === '/head_pos_screen') {
       socket.emit('head', packet);
     } else if (packet.address === '/leftknee_pos_screen') {
       socket.emit('leftKnee', packet);
     } else if (packet.address === '/rightknee_pos_screen') {
       socket.emit('rightKnee', packet);
     } else if (packet.address === '/torso_pos_screen') {
       socket.emit('torso', packet);
     } else if (packet.address === '/leftelbow_pos_screen') {
       socket.emit('leftElbow', packet);
     } else if (packet.address === '/rightelbow_pos_screen') {
       socket.emit('rightElbow', packet);
     } else if (packet.address === '/closesthand_pos_screen') {
       socket.emit('closestHand', packet);
     }
   }
});

// Open the socket.
udpPort.open();
