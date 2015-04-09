
var osc = require('node-osc');
var config = require('./network-config');

var PORT_MAX_LISTENING = 12349;
var HOST = config.MAX_HOST;

var START_SWELL_ADDRESS = '/startSwell';
var END_SWELL_ADDRESS = '/endSwell';
var START_KNEES_ADDRESS = '/startKnees';
var END_KNEES_ADDRESS = '/endKnees';
var START_ROTUP_ADDRESS = '/startRotUp';
var END_ROTUP_ADDRESS = '/endRotUp';
var START_ROTDOWN_ADDRESS = '/startRotDown';
var END_ROTDOWN_ADDRESS = '/endRotDown';
var HAND_DELTA_ADDRESS = '/handDelta';

var START_PITCH_ADDRESS = '/startPitch';
var STOP_PITCH_ADDRESS = '/stopPitch';
var BOOTH_INDEX_ADDRESS = '/boothIndex';
var BEGIN_WALKING_ADDRESS = '/beginWalking';
var ENCOUNTER_RECRUITER_ADDRESS = '/encounterRecruiter';
var GESTURE_SUCCESS_ADDRESS = '/gestureSuccess';
var GESTURE_FAILURE_ADDRESS = '/gestureFailure';
var REACHED_SCALE_ADDRESS = '/reachedScale';
var GARBAGE_EMERGES_ADDRESS = '/garbageEmerges';
var ENTER_LAB_ADDRESS = '/enterLab';

var signalMap = {};
signalMap[playerize(START_SWELL_ADDRESS, 1)] = 1;
signalMap[playerize(START_SWELL_ADDRESS, 2)] = 2;
signalMap[playerize(END_SWELL_ADDRESS, 1)] = 3;
signalMap[playerize(END_SWELL_ADDRESS, 2)] = 4;
signalMap[playerize(START_KNEES_ADDRESS, 1)] = 5;
signalMap[playerize(START_KNEES_ADDRESS, 2)] = 6;
signalMap[playerize(END_KNEES_ADDRESS, 1)] = 7;
signalMap[playerize(END_KNEES_ADDRESS, 2)] = 8;
signalMap[playerize(START_ROTUP_ADDRESS, 1)] = 9;
signalMap[playerize(START_ROTUP_ADDRESS, 2)] = 10;
signalMap[playerize(END_ROTUP_ADDRESS, 1)] = 11;
signalMap[playerize(END_ROTUP_ADDRESS, 2)] = 12;
signalMap[playerize(START_ROTDOWN_ADDRESS, 1)] = 13;
signalMap[playerize(START_ROTDOWN_ADDRESS, 2)] = 14;
signalMap[playerize(END_ROTDOWN_ADDRESS, 1)] = 15;
signalMap[playerize(END_ROTDOWN_ADDRESS, 2)] = 16;

var maxClient = new osc.Client(HOST, PORT_MAX_LISTENING);

/// Body parts

module.exports.startSwell = function(player) {
  sendAddressSignalMapToMax(player, START_SWELL_ADDRESS);
};

module.exports.endSwell = function(player) {
  sendAddressSignalMapToMax(player, END_SWELL_ADDRESS);
};

module.exports.startKnees = function(player) {
  sendAddressSignalMapToMax(player, START_KNEES_ADDRESS);
};

module.exports.endKnees = function(player) {
  sendAddressSignalMapToMax(player, END_KNEES_ADDRESS);
};

module.exports.startElbowRotUp = function(player) {
  sendAddressSignalMapToMax(player, START_ROTUP_ADDRESS);
};

module.exports.startElbowRotDown = function(player) {
  sendAddressSignalMapToMax(player, START_ROTDOWN_ADDRESS);
};

module.exports.endElbowRotUp = function(player) {
  sendAddressSignalMapToMax(player, END_ROTUP_ADDRESS);
};

module.exports.endElbowRotDown = function(player) {
  sendAddressSignalMapToMax(player, END_ROTDOWN_ADDRESS);
};

module.exports.handDelta = function(player, mag) {
  var address = playerize(HAND_DELTA_ADDRESS, player);
  sendPacketToMax(address, mag);
};

/// Special Events

module.exports.startedPitch = function(companyIndex) {
  maxClient.send(START_PITCH_ADDRESS, 1);
};

module.exports.stoppedPitch = function() {
  maxClient.send(STOP_PITCH_ADDRESS, 1);
};

module.exports.boothIndex = function(boothIndex) {
  maxClient.send(BOOTH_INDEX_ADDRESS, boothIndex);
};

module.exports.beginWalking = function() {
  maxClient.send(BEGIN_WALKING_ADDRESS, 1);
};

module.exports.encounterRecruiter = function() {
  maxClient.send(ENCOUNTER_RECRUITER_ADDRESS, 1);
};

module.exports.gestureSuccess = function() {
  maxClient.send(GESTURE_SUCCESS_ADDRESS, 1);
};

module.exports.gestureFailure = function() {
  maxClient.send(GESTURE_FAILURE_ADDRESS, 1);
};

module.exports.reachedScale = function() {
  maxClient.send(REACHED_SCALE_ADDRESS, 1);
};

module.exports.garbageEmerges = function() {
  maxClient.send(GARBAGE_EMERGES_ADDRESS, 1);
};

module.exports.labEntered = function() {
  maxClient.send(ENTER_LAB_ADDRESS, 1);
};

function playerize(address, player) {
  return address + '-' + player;
}

function sendAddressSignalMapToMax(player, address) {
  var trueAddress = playerize(address, player);
  sendPacketToMax(trueAddress, signalMap[trueAddress]);
}

function sendPacketToMax(address, args) {
  console.log('maxer sending ' + address);
  maxClient.send(address, args);
}
