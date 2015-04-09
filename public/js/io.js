
// CONTROLS::::

// move torso to move character
// shake head to swell character
// left and right hands correspond to left and right arms for the character
// delta between hands corresponds to degree of melt (closer together means more melt)
// left and right knees handle the legs of the character
// delta between knees controls rotation about y
// delta between elbows controls rotation about x
// elbows fuckily control the secondary light source

// what does closest hand do?

// TODO: all these things are separate and repetitive right now because there is no
// guarantee that each wrestler will behave the same. please fix later.

var socket = io('http://localhost:8888');
module.exports.socket = socket;

var previousPositions = {};
var positionDeltas = {};
var previousPositionDeltas = {};

var eventsWithRapidHeadVelocity = {one: 0, two: 0};
var eventsWithRapidRightArmVelocity = {one: 0, two: 0};
var eventsWithKneelingKnees = {one: 0, two: 0};
var eventsWithFlexingArms = {one: 0, two: 0};

var elbowHistory = {one: {rotUp: false, rotDown: false}, two: {rotUp: false, rotDown: false}};

var BIG_HEAD_MAG = 12;
var MAX_HEAD_SWELL = 13;
var TORSO_CLOSE_MAG = 11;

var HANDSHAKE_ARMDELTA_MAG = 25;
var HANDSHAKE_ARMDELTA_FRAMES = 27;

var KNEELING_KNEE_Y_MAG = 100;
var KNEEL_GESTURE_CONSECUTIVE_EVENTS = 30;

var FAR_ELBOW_MAG = 300;

var FLEXING_HANDS_X_MAG = 330;
var FLEX_GESTURE_CONSECUTIVE_EVENTS = 60;
var CLOSE_HANDS_MAG = 100;

var TORSO_MOVEMENT_MAG_MULT = -0.05;

module.exports.JOBFAIR = 1;
module.exports.WEIGHING = 2;
module.exports.INTERVIEW = 3;
module.exports.TRASH = 4;

module.exports.mode = module.exports.JOBFAIR;

var wrestler1, wrestler2, camera, light;

module.exports.eventHandler = function(event, data) {}

module.exports.socket = socket;

module.exports.maxPositions = {
  z: 1000,
  x: 1000,
  y: 1000
};
module.exports.minPositions = {
  z: -1000,
  x: -1000,
  y: -1000
};

module.exports.begin = function(w1, w2, cam, l) {
  wrestler1 = w1;
  wrestler2 = w2;
  camera = cam;
  light = l;

  socket.emit('rollcall', 'browser');

  socket.on('leftHand', function(data) {
    if (data.wrestler === 1) {
      leftHand1(data.position);
    } else {
      leftHand2(data.position);
    }
  });

  socket.on('rightHand', function(data) {
    if (data.wrestler === 1) {
      rightHand1(data.position);
    } else {
      rightHand2(data.position);
    }
  });

  socket.on('closestHand', function(data) {
    if (data.wrestler === 1) {
      closestHand1(data.position);
    } else {
      closestHand2(data.position);
    }
  });

  socket.on('head', function(data) {
    if (data.wrestler === 1) {
      head1(data.position);
    } else {
      head2(data.position);
    }
  });

  socket.on('leftKnee', function(data) {
    if (data.wrestler === 1) {
      leftKnee1(data.position);
    } else {
      leftKnee2(data.position);
    }
  });

  socket.on('rightKnee', function(data) {
    if (data.wrestler === 1) {
      rightKnee1(data.position);
    } else {
      rightKnee2(data.position);
    }
  });

  socket.on('leftElbow', function(data) {
    if (data.wrestler === 1) {
      leftElbow1(data.position);
    } else {
      leftElbow2(data.position);
    }
  });

  socket.on('rightElbow', function(data) {
    if (data.wrestler === 1) {
      rightElbow1(data.position);
    } else {
      rightElbow2(data.position);
    }
  });

  socket.on('torso', function(data) {
    if (data.wrestler === 1) {
      torso1(data.position);
    } else {
      torso2(data.position);
    }
  });

  socket.on('resetPlayer', function(player) {
    if (player === 1) {
      wrestler1.reset();
    } else {
      wrestler2.reset();
    }
  });
};

function moveDelta(bodypart, position, lastPos, divisor, directions) {
  if (!directions) directions = {x: true, y: true, z: true};

  var deltaX = 0;
  var deltaY = 0;
  var deltaZ = 0;

  if (directions.x) {
    deltaX = (position.x - lastPos.x) / divisor;
  }

  if (directions.y) {
    deltaY = (position.y - lastPos.y) / -divisor;
  }

  if (directions.z) {
    deltaZ = (position.z - lastPos.z) / divisor;
  }

  if (bodypart.mesh) {
    if (bodypart.mesh.position.x + deltaX < module.exports.minPositions.x ||
      bodypart.mesh.position.x + deltaX > module.exports.maxPositions.x) {
          deltaX = 0;
    }
    if (bodypart.mesh.position.y + deltaY < module.exports.minPositions.y ||
      bodypart.mesh.position.y + deltaY > module.exports.maxPositions.y) {
        deltaY = 0;
    }
    if (bodypart.mesh.position.z + deltaZ < module.exports.minPositions.z ||
      bodypart.mesh.position.z + deltaZ > module.exports.maxPositions.z) {
        deltaZ = 0;
    }
  }

  bodypart.move(deltaX, deltaY, deltaZ);
}

function delta(current, previous) {
  return {x: current.x - previous.x, y: current.y - previous.y, z: current.z - previous.z};
}

function totalMagnitude(pos) {
  return Math.abs(pos.x) + Math.abs(pos.y) + Math.abs(pos.z);
}

/*** HANDS ***/

function rightHand1(position) {
  rightHandBehavior(position, 1);
}

function rightHand2(position)  {
  rightHandBehavior(position, 2);
}

function rightHandBehavior(position, handNumber) {
  var rightHandKey = 'rightHand' + handNumber;
  var armVelocityKey = handNumber === 1 ? 'one' : 'two';
  var wrestler = handNumber === 1 ? wrestler1 : wrestler2;

  if (previousPositions[rightHandKey]) {
    if (module.exports.mode === module.exports.INTERVIEW) {
      var positionChange = delta(position, previousPositions[rightHandKey]);
      var mag = totalMagnitude(positionChange);
      //console.log('total arm mag: ' + mag);

      if (mag > HANDSHAKE_ARMDELTA_MAG) {
        eventsWithRapidRightArmVelocity[armVelocityKey] += 1;
      } else {
        eventsWithRapidRightArmVelocity[armVelocityKey] = Math.max(eventsWithRapidRightArmVelocity[armVelocityKey] - 1, 0);
      }

      if (eventsWithRapidRightArmVelocity[armVelocityKey] >= HANDSHAKE_ARMDELTA_FRAMES) {
        module.exports.eventHandler('handshake', {});
        eventsWithRapidRightArmVelocity[armVelocityKey] = 0;
      }
    }
    // else if (module.exports.mode === module.exports.JOBFAIR) {
    //   var denom = 12;
    //   var directions = {x: true, y: true, z: true};
    //   moveDelta(wrestler.rightArm, position, previousPositions[rightHandKey], denom, directions);
    // }
    else if (module.exports.mode === module.exports.WEIGHING) {
      moveDelta(wrestler, position, previousPositions[rightHandKey], 1.2, {x: true, y: false, z: true});
    }
  }

  previousPositions[rightHandKey] = position;
}

function leftHand1(position) {
  leftHandBehavior(position, 1, hand1DeltaAction);
}

function leftHand2(position) {
  leftHandBehavior(position, 2, hand2DeltaAction);
}

function leftHandBehavior(position, handNumber, handDeltaAction) {
  var leftHandKey = 'leftHand' + handNumber;
  var rightHandKey = 'rightHand' + handNumber;
  var handDeltaKey = 'hand' + handNumber;
  var wrestler = handNumber === 1 ? wrestler1 : wrestler2;

  if (previousPositions[rightHandKey]) {
    var rh = previousPositions[rightHandKey];
    positionDeltas[handDeltaKey] = {x: position.x - rh.x, y: position.y - rh.y, z: position.z - rh.z};
    handDeltaAction(positionDeltas[handDeltaKey]);
  }

  if (previousPositions[leftHandKey]) {
    // if (module.exports.mode === module.exports.JOBFAIR) {
    //   var denom = 12;
    //   var directions = {x: true, y: true, z: true};
    //   moveDelta(wrestler.leftArm, position, previousPositions[leftHandKey], denom, directions);
    // }
  }

  previousPositions[leftHandKey] = position;
}

function closestHand1(position) {}

function closestHand2(position) {}

/*** HEADS ***/

function head1(position) {
  headBehavior(position, 1);
}

function head2(position) {
  headBehavior(position, 2);
}

function headBehavior(position, headNumber) {
  var headKey = 'head' + headNumber;
  var torsoKey = 'torso' + headNumber;
  var headVelocityKey = headNumber === 1 ? 'one' : 'two';

  if (previousPositions[headKey]) {
    if (positionDeltas[torsoKey] && totalMagnitude(positionDeltas[torsoKey]) < TORSO_CLOSE_MAG) {
      var positionChange = delta(position, previousPositions[headKey]);
      var mag = totalMagnitude(positionChange);

      if (mag > BIG_HEAD_MAG) {
        eventsWithRapidHeadVelocity[headVelocityKey] = Math.min(eventsWithRapidHeadVelocity[headVelocityKey] + 1, MAX_HEAD_SWELL);
      } else {
        eventsWithRapidHeadVelocity[headVelocityKey] = Math.max(eventsWithRapidHeadVelocity[headVelocityKey] - 1, 0);
      }

      if (eventsWithRapidHeadVelocity[headVelocityKey] >= MAX_HEAD_SWELL) {
        if (module.exports.mode === module.exports.INTERVIEW) {
          module.exports.eventHandler('spit', {});
        }
        else if (module.exports.mode === module.exports.WEIGHING) {
          module.exports.eventHandler('throw', {ronaldNumber: headNumber});
        }
      }
    }
  }

  previousPositions[headKey] = position;
}

/*** TORSO ***/

function torso1(position) {
  torsoBehavior(position, 1);
}

function torso2(position) {
  torsoBehavior(position, 2);
}

function torsoBehavior(position, torsoNumber) {
  var torsoKey = 'torso' + torsoNumber;
  var wrestler = torsoNumber === 1 ? wrestler1 : wrestler2;

  if (previousPositions[torsoKey]) {
    if (module.exports.mode === module.exports.JOBFAIR) {
      var d = delta(position, previousPositions[torsoKey]);
      var mag = totalMagnitude(d);
      var dist = TORSO_MOVEMENT_MAG_MULT * mag;
      wrestler.move(d.x / 50, 0, dist);
    }

    positionDeltas[torsoKey] = delta(position, previousPositions[torsoKey]);
  }

  previousPositions[torsoKey] = position;
}

/*** KNEES ***/

function leftKnee1(position) {
  leftKneeBehavior(position, 1, knee1DeltaAction);
}

function leftKnee2(position) {
  leftKneeBehavior(position, 2, knee2DeltaAction);
}

function leftKneeBehavior(position, kneeNumber, deltaAction) {
  var leftKneeKey = 'leftKnee' + kneeNumber;
  var rightKneeKey = 'rightKnee' + kneeNumber;
  var kneeDeltaKey = 'knee' + kneeNumber;
  var wrestler = kneeNumber === 1 ? wrestler1 : wrestler2;

  if (previousPositions[rightKneeKey]) {
    var rh = previousPositions[rightKneeKey];
    positionDeltas[kneeDeltaKey] = {x: position.x - rh.x, y: position.y - rh.y, z: position.z - rh.z};
    deltaAction(positionDeltas[kneeDeltaKey]);
  }

  if (previousPositions[leftKneeKey]) {
    // if (module.exports.mode === module.exports.JOBFAIR) {
    //   moveDelta(wrestler.leftLeg, position, previousPositions[leftKneeKey], 20, {x: true, y: true, z: true});
    // }
  }

  previousPositions[leftKneeKey] = position;
}

function rightKnee1(position) {
  rightKneeBehavior(position, 1);
}

function rightKnee2(position) {
  rightKneeBehavior(position, 2);
}

function rightKneeBehavior(position, kneeNumber) {
  var rightKneeKey = 'rightKnee' + kneeNumber;
  var wrestler = kneeNumber === 1 ? wrestler1 : wrestler2;

  if (previousPositions[rightKneeKey]) {
    // if (module.exports.mode === module.exports.JOBFAIR) {
    //   moveDelta(wrestler.rightLeg, position, previousPositions[rightKneeKey], 20, {x: true, y: true, z: true});
    // }
  }

  previousPositions[rightKneeKey] = position;
}

/*** ELBOWS ***/

function leftElbow1(position) {
  leftElbowBehavior(position, 1, elbow1DeltaAction);
}

function leftElbow2(position) {
  leftElbowBehavior(position, 2, elbow2DeltaAction);
}

function leftElbowBehavior(position, elbowNumber, deltaAction) {
  var elbowDeltaKey = 'elbow' + elbowNumber;
  var leftElbowKey = 'leftElbow' + elbowNumber;
  var rightElbowKey = 'rightElbow' + elbowNumber;

  if (previousPositions[rightElbowKey]) {
    var rh = previousPositions[rightElbowKey];
    positionDeltas[elbowDeltaKey] = {x: position.x - rh.x, y: position.y - rh.y, z: position.z - rh.z};
    deltaAction(positionDeltas[elbowDeltaKey]);
  }

  previousPositions[leftElbowKey] = position;
}

function rightElbow1(position) {
  previousPositions.rightElbow1 = position;
}

function rightElbow2(position) {
  previousPositions.rightElbow2 = position;
}

/*** DELTA ACTIONS ***/

function hand1DeltaAction(positionDelta) {
  handDeltaActionBehavior(positionDelta, 1);

}

function hand2DeltaAction(positionDelta) {
  handDeltaActionBehavior(positionDelta, 2);
}

function handDeltaActionBehavior(positionDelta, handNumber) {
  var eventsKey = handNumber === 1 ? 'one' : 'two';
  var rightHandKey = 'rightHand' + handNumber;
  var rightElbowKey = 'rightElbow' + handNumber;
  var leftHandKey = 'leftHand' + handNumber;
  var leftElbowKey = 'leftElbow' + handNumber;

  if (module.exports.mode === module.exports.INTERVIEW) {
    var xMag = Math.abs(positionDelta.x);
    if (xMag >= FLEXING_HANDS_X_MAG &&
        previousPositions[rightHandKey] && previousPositions[rightElbowKey] && previousPositions[rightHandKey].y < previousPositions[rightElbowKey].y &&
        previousPositions[leftHandKey] && previousPositions[leftElbowKey] && previousPositions[leftHandKey].y < previousPositions[leftElbowKey].y) {
      // hands are far apart and above elbows u feel
      eventsWithFlexingArms[eventsKey] += 1;
    } else if (eventsWithFlexingArms[eventsKey] > 1) {
      eventsWithFlexingArms[eventsKey] -= 2;
    }

    if (eventsWithFlexingArms[eventsKey] >= FLEX_GESTURE_CONSECUTIVE_EVENTS) {
      module.exports.eventHandler('bribe', {});
      eventsWithFlexingArms[eventsKey] = 0;
    }
  }
  else if (module.exports.mode === module.exports.WEIGHING) {
    var mag = totalMagnitude(positionDelta);
    if (mag < CLOSE_HANDS_MAG) {
      module.exports.eventHandler('throw', {ronaldNumber: handNumber});
    }
  }
}

function knee1DeltaAction(positionDelta) {
  kneeDeltaActionBehavior(positionDelta, 1);
}

function knee2DeltaAction(positionDelta) {
  kneeDeltaActionBehavior(positionDelta, 2);
}

function kneeDeltaActionBehavior(positionDelta, kneeNumber) {
  var eventsKey = kneeNumber === 1 ? 'one' : 'two';
  var handDeltaKey = 'hand' + kneeNumber;

  if (module.exports.mode === module.exports.INTERVIEW) {
    var yMag = Math.abs(positionDelta.y);
    //console.log('knee delta mag: ' + yMag);
    if (positionDeltas[handDeltaKey]) {
      //console.log('hand delta mag: ' + totalMagnitude(positionDeltas[handDeltaKey]));
    }
    if (yMag >= KNEELING_KNEE_Y_MAG && positionDeltas[handDeltaKey] && totalMagnitude(positionDeltas[handDeltaKey]) <= 2 * CLOSE_HANDS_MAG) {
      eventsWithKneelingKnees[eventsKey] += 1;
    } else if (eventsWithKneelingKnees[eventsKey] > 0) {
      eventsWithKneelingKnees[eventsKey] -= 1;
    }

    console.log(eventsWithKneelingKnees[eventsKey]);

    if (eventsWithKneelingKnees[eventsKey] >= KNEEL_GESTURE_CONSECUTIVE_EVENTS) {
      module.exports.eventHandler('kneel', {});
      eventsWithKneelingKnees[eventsKey] = 0;
    }
  }
}

function elbow1DeltaAction(positionDelta) {
  elbowDeltaActionBehavior(positionDelta, 1);
}

function elbow2DeltaAction(positionDelta) {
  elbowDeltaActionBehavior(positionDelta, 2);
}

function elbowDeltaActionBehavior(positionDelta, elbowNum) {
  var elbowKey = 'elbow' + elbowNum;
  var rightHandKey = 'rightHand' + elbowNum;
  var leftHandKey = 'leftHand' + elbowNum;
  var rightElbowKey = 'rightElbow' + elbowNum;
  var leftElbowKey = 'leftElbow' + elbowNum;

  var mag = totalMagnitude(positionDelta);

  if (mag > FAR_ELBOW_MAG && handsBetweenElbows(elbowNum)) {
    if (previousPositions[rightHandKey].y < previousPositions[rightElbowKey].y - 10 &&
        previousPositions[leftHandKey].y > previousPositions[leftElbowKey].y + 10) {

    } else {
      checkElbowNonRot(elbowNum, true, false);
    }

    if (previousPositions[rightHandKey].y > previousPositions[rightElbowKey].y + 10 &&
             previousPositions[leftHandKey].y < previousPositions[leftElbowKey].y - 10) {

    } else {
      checkElbowNonRot(elbowNum, false, true);
    }
  } else {
    checkElbowNonRot(elbowNum, true, true);
  }

  previousPositionDeltas[elbowKey] = positionDelta;
}

function checkElbowNonRot(elbowNum, rotUp, rotDown) {
  var numKey = elbowNum === 1 ? 'one' : 'two';

  if (rotUp && elbowHistory[numKey].rotUp) {
    elbowHistory[numKey].rotUp = false;
  }

  if (rotDown && elbowHistory[numKey].rotDown) {
    elbowHistory[numKey].rotDown = false;
  }
}

function handsBetweenElbows(playerNum) {
  var leftHand, rightHand, leftElbow, rightElbow;

  if (playerNum === 1) {
    leftHand = previousPositions.leftHand1;
    rightHand = previousPositions.rightHand1;
    leftElbow = previousPositions.leftElbow1;
    rightElbow = previousPositions.rightElbow1;
  } else {
    leftHand = previousPositions.leftHand2;
    rightHand = previousPositions.rightHand2;
    leftElbow = previousPositions.leftElbow2;
    rightElbow = previousPositions.rightElbow2;
  }

  if (!leftHand || !rightHand || !leftElbow || !rightElbow) return false;

  // left hand above and to right of left elbow
  // right hand below and to the left of the right elbow

  // left hand below and to the right of left elbow
  // right hand above and to the left of right elbow

  return (leftHand.x > leftElbow.x) && (rightHand.x < rightElbow.x);
}
