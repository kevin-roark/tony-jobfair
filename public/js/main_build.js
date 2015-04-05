(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var kt = require('./lib/kutility');

var modelNames = require('./model_names');

var BodyPart = require('./bodypart');

module.exports = Arm;

function Arm(startPos, scale, side) {
  if (!startPos) startPos = {x: 0, y: 0, z: 0};
  this.startX = startPos.x;
  this.startY = startPos.y;
  this.startZ = startPos.z;

  this.scale = scale || 1;
  this.scale *= 0.33;

  this.side = side || 'left';

  this.modelChoices = [modelNames.LOWPOLY_ARM];
}

Arm.prototype.__proto__ = BodyPart.prototype;

Arm.prototype.additionalInit = function() {
  if (this.modelName == modelNames.LOWPOLY_ARM) {
    this.move(0, 10, 0);
    if (this.side == 'left') {
      this.move(13, 0, 0);
      this.mesh.scale.x *= -1;
    } else {
      this.move(-13, 0, 0);
    }
  }
};

Arm.prototype.collisonHandle = function() {
  if (this.collisionHandler) this.collisionHandler();
}

},{"./bodypart":3,"./lib/kutility":10,"./model_names":12}],2:[function(require,module,exports){

var kt = require('./lib/kutility');

var modelNames = require('./model_names');

var BodyPart = require('./bodypart');

module.exports = Body;

function Body(startPos, scale) {
  if (!startPos) startPos = {x: 0, y: 0, z: 0};
  this.startX = startPos.x;
  this.startY = startPos.y;
  this.startZ = startPos.z;

  this.scale = scale || 1;
  this.scale *= 0.5;

  this.modelChoices = [modelNames.LOWPOLY_TORSO];
}

Body.prototype.__proto__ = BodyPart.prototype;

Body.prototype.additionalInit = function() {
  var self = this;

  if (self.modelName == modelNames.LOWPOLY_TORSO) {
    self.move(0, -15, -4);
  }
};

},{"./bodypart":3,"./lib/kutility":10,"./model_names":12}],3:[function(require,module,exports){
var kt = require('./lib/kutility');

var modelNames = require('./model_names');

module.exports = BodyPart;

function BodyPart(startPos, scale, model) {
  if (!startPos) startPos = {x: 0, y: 0, z: 0};
  this.startX = startPos.x;
  this.startY = startPos.y;
  this.startZ = startPos.z;

  this.scale = scale || 1;

  if (model) {
    this.specificModelName = model;
  }

  this.modelChoices = [];

  this.melting = false;
  this.twitching = false;
}

BodyPart.prototype.move = function(x, y, z) {
  if (!this.mesh) return;

  this.mesh.position.x += x;
  this.mesh.position.y += y;
  this.mesh.position.z += z;

  this.mesh.__dirtyPosition = true;
}

BodyPart.prototype.rotate = function(rx, ry, rz) {
  if (!this.mesh) return;

  this.mesh.rotation.x += rx;
  this.mesh.rotation.y += ry;
  this.mesh.rotation.z += rz;

  this.mesh.__dirtyRotation = true;
}

BodyPart.prototype.moveTo = function(x, y, z) {
  if (!this.mesh) return;

  this.mesh.position.set(x, y, z);

  this.move(0, 0, 0);
}

BodyPart.prototype.scaleBody = function(s) {
  if (!this.mesh) return;

  this.mesh.scale.set(s, s, s);
}

BodyPart.prototype.scaleMultiply = function(s) {
  if (!this.mesh) return;

  this.mesh.scale.set(this.initialScale.x * s, this.initialScale.y * s, this.initialScale.z * s);
}

BodyPart.prototype.swell = function(s) {
  var self = this;

  this.scaleMultiply(s);

  if (!this.materials) return;

  this.materials.forEach(function(material, index) {
    var initialColor = self.initialMaterialColors[index];

    var red = initialColor.r;
    if (s > 1.05) {
      red = Math.max(Math.min(1.0, initialColor.r * s), initialColor.r);
    }

    var swellColor = {r: red, g: initialColor.g, b: initialColor.b};
    material.color = swellColor;
  });
}

BodyPart.prototype.reset = function() {
  this.moveTo(this.initialPosition.x, this.initialPosition.y, this.initialPosition.z);

  this.mesh.rotation.x = this.initialRotation.x;
  this.mesh.rotation.y = this.initialRotation.y;
  this.mesh.rotation.z = this.initialRotation.z;
  this.mesh.__dirtyRotation = true;

  if (this.mesh.setAngularVelocity) {
    this.mesh.setAngularVelocity({x: 0, y: 0, z: 0});
    this.mesh.setLinearVelocity({x: 0, y: 0, z: 0});
  }

  this.cancelMelt();

  this.swell(1.0);
}

BodyPart.prototype.cancelMelt = function(pleaseWait) {
  var self = this;

  this.melting = false;
  this.resetMeltParameters();

  var timeout = 0;
  if (pleaseWait) timeout = 1500;

  setTimeout(function() {
    for (var i = 0; i < self.originalVertices.length; i++) {
      var vert = self.originalVertices[i];
      self.geometry.vertices[i] = {x: vert.x, y: vert.y, z: vert.z};
    }

    self.geometry.verticesNeedUpdate = true;
  }, timeout);
}

BodyPart.prototype.resetMeltParameters = function() {
  this.lastVertexModified = -1;
  this.maxMelt = kt.randInt(150, 20);
  this.meltCount = 0;
  this.step = kt.randInt(1000, 100);
  this.startI = kt.randInt(this.step - 1, 0);
}

BodyPart.prototype.meltValue = function() {
  return (Math.random() - 0.5) * this.meltIntensity;
}

BodyPart.prototype.createMesh = function(callback) {
  var self = this;

  if (self.mass === undefined) self.mass = 20;

  self.modelName = self.specificModelName || kt.choice(self.modelChoices);

  modelNames.loadModel(self.modelName, function (geometry, materials) {
    self.geometry = geometry;
    self.materials = materials;

    self.faceMaterial = new THREE.MeshFaceMaterial(materials);
    self.material = Physijs.createMaterial(self.faceMaterial, .4, .6);

    self.mesh = new Physijs.ConvexMesh(geometry, self.material, self.mass);

    callback();
  });
}

BodyPart.prototype.resetMovement = function() {
  var self = this;
  if (!self.mesh || !self.mesh.setLinearVelocity) return;

  self.mesh.setLinearVelocity({x: 0, y: 0, z: 0});
  self.mesh.setLinearFactor({x: 0, y: 0, z: 0});
  self.mesh.setAngularVelocity({x: 0, y: 0, z: 0});
  self.mesh.setAngularFactor({x: 0, y: 0, z: 0});
}

BodyPart.prototype.addTo = function(scene, callback) {
  var self = this;

  self.createMesh(function() {
    self.mesh.addEventListener('collision', function( other_object, relative_velocity, relative_rotation, contact_normal ) {
      if (self.ignoreCollisons) {
        self.resetMovement();
      }

      self.collisonHandle(other_object, relative_velocity, relative_rotation, contact_normal);
    });

    self.scaleBody(self.scale);

    self.moveTo(self.startX, self.startY, self.startZ);

    self.additionalInit();

    self.initialPosition = {x: self.mesh.position.x, y: self.mesh.position.y, z: self.mesh.position.z};
    self.initialScale = {x: self.mesh.scale.x, y: self.mesh.scale.y, z: self.mesh.scale.z};
    self.initialRotation = {x: self.mesh.rotation.x, y: self.mesh.rotation.y, z: self.mesh.rotation.z};

    if (self.materials) {
      self.initialMaterialColors = [];
      self.materials.forEach(function(mat) {
        self.initialMaterialColors.push(mat.color);
      });
    }

    self.verts = self.geometry.vertices;

    self.originalVertices = [];
    for (var i = 0; i < self.verts.length; i++) {
      var vert = self.verts[i];
      self.originalVertices.push({x: vert.x, y: vert.y, z: vert.z});
    }

    self.resetMeltParameters();
    if (!self.meltIntensity) self.meltIntensity = 0.1;

    scene.add(self.mesh);

    if (callback) {
      callback(self);
    }
  });
}

BodyPart.prototype.render = function() {
  if (this.melting && this.geometry) {
    for (var i = this.startI; i < this.verts.length; i += this.step) {
      var vert = this.verts[i];

      vert.x += this.meltValue();
      vert.y += this.meltValue();
      vert.z += this.meltValue();

      if (i + this.step >= this.verts.length) {
        this.lastVertexModified = i;
      }
    }

    this.geometry.verticesNeedUpdate = true;

    if (++this.meltCount >= this.maxMelt) {
      this.resetMeltParameters();
    }
  }

  if (this.twitching) {
    this.twitch(this.twitchIntensity || 1);
  }
  if (this.fluctuating) {
    this.fluctuate(1);
  }

  this.additionalRender();
}

BodyPart.prototype.twitch = function(scalar) {
  var x = (Math.random() - 0.5) * scalar;
  var y = (Math.random() - 0.5) * scalar;
  var z = (Math.random() - 0.5) * scalar;
  this.move(x, y, z);
}

BodyPart.prototype.fluctuate = function(scalar) {
  var x = (Math.random() - 0.5) * scalar;
  var y = (Math.random() - 0.5) * scalar;
  var z = (Math.random() - 0.5) * scalar;
  this.rotate(x, y, z);
}

BodyPart.prototype.fallToFloor = function(threshold, speed) {
  if (!threshold) threshold = 1.5;
  if (!speed) speed = 0.5;

  var self = this;

  var fallInterval = setInterval(function() {
    var dy = Math.random() * -speed;

    self.move(0, dy, 0);

    if (self.mesh && self.mesh.position.y < threshold) {
      clearInterval(fallInterval);
    }
  }, 24);
}

BodyPart.prototype.additionalInit = function() {};
BodyPart.prototype.additionalRender = function() {};
BodyPart.prototype.collisonHandle = function() {}

},{"./lib/kutility":10,"./model_names":12}],4:[function(require,module,exports){

var kt = require('./lib/kutility');

var modelNames = require('./model_names');
var Arm = require('./arm');
var Leg = require('./leg');
var Head = require('./head');
var Body = require('./body');
var Hand = require('./hand');

module.exports = Character;

function Character(startPos, scale) {
  var self = this;

  if (!startPos) startPos = {x: 0, y: 0, z: 0};
  this.startX = startPos.x;
  this.startY = startPos.y;
  this.startZ = startPos.z;

  this.position = startPos;

  this.scale = scale || 5;

  this.leftArm = new Arm({x: this.startX - scale, y: this.startY - scale, z: this.startZ}, scale, 'left');

  this.rightArm = new Arm({x: this.startX + scale, y: this.startY - scale, z: this.startZ}, scale, 'right');

  this.leftLeg = new Leg({x: this.startX - scale * 0.4, y: this.startY - scale * 0.75, z: this.startZ}, scale);

  this.rightLeg = new Leg({x: this.startX + scale * 0.4, y: this.startY - scale * 0.75, z: this.startZ}, scale);

  this.torso = new Body({x: this.startX, y: this.startY, z: this.startZ}, scale);

  this.head = new Head({x: this.startX, y: this.startY + 0.75 * scale, z: this.startZ}, scale);

  this.bodyParts = [this.leftArm, this.rightArm,
                    this.leftLeg, this.rightLeg,
                    this.torso, this.head];
  this.bodyParts.forEach(function(bodyPart) {
    bodyPart.ignoreCollisons = true;
    bodyPart.hostBody = self;
  });

  this.twitching = false; // random motion and rotation

  this.melting = false; // bone shaking
}

Character.prototype.addTo = function(scene, callback) {
  var self = this;

  this.scene = scene;

  var bodyCount = 0;
  this.bodyParts.forEach(function(part) {
    part.addTo(scene, function() {
      part.mesh.humanPart = true;

      bodyCount += 1;
      if (bodyCount == self.bodyParts.length) {
        if (callback) callback();
      }
    });
  });
}

Character.prototype.move = function(x, y, z) {
  this.position.x += x;
  this.position.y += y;
  this.position.z += z;

  this.bodyParts.forEach(function(part) {
    part.move(x, y, z);
  });
}

Character.prototype.walk = function(x, y, z) {
  this.move(x, y, z);

  this.leftLeg.twitch(0.9);
  this.rightLeg.twitch(0.9);
}

Character.prototype.moveTo = function(x, y, z) {
  var dx = x - this.position.x;
  var dy = y - this.position.y;
  var dz = z - this.position.z;

  this.move(dx, dy, dz);
}

Character.prototype.resetMovement = function() {
  this.bodyParts.forEach(function(part) {
    part.resetMovement();
  });
}

Character.prototype.rotate = function(rx, ry, rz) {
  this.bodyParts.forEach(function(part) {
    part.rotate(rx, ry, rz);
  });
}

Character.prototype.scaleBody = function(s) {
  this.bodyParts.forEach(function(part) {
    part.scaleBody(s);
  });
}

Character.prototype.scaleMultiply = function(s) {
  this.bodyParts.forEach(function(part) {
    part.scaleMultiply(s);
  });
}

Character.prototype.reset = function() {
  this.melting = false;

  this.bodyParts.forEach(function(part) {
    part.reset();
  });
}

Character.prototype.swell = function(s) {
  this.bodyParts.forEach(function(part) {
    part.swell(s);
  });
}

Character.prototype.cancelMelt = function(pleaseWait) {
  this.melting = false;

  this.bodyParts.forEach(function(part) {
    part.cancelMelt(pleaseWait);
  });
}

Character.prototype.discombobulate = function(callback1) {
  var self = this;

  var downInterval = setInterval(function() {
    var allDown = true;
    self.bodyParts.forEach(function(part) {
      if (part.mesh.position.y > -33) {
        part.move(0, -0.6, 0);
        allDown = false;
      }
    });

    if (allDown) {
      clearInterval(downInterval);
      callback1();
      spreadWide();
    }
  }, 20);

  function spreadWide() {
    var spreadDeltas = [];
    for (var i = 0; i < self.bodyParts.length; i++) {
      var delta = {x: posNegRandom() * 1.25, y: posNegRandom() * 1.25, z: Math.random() * -1.25};
      spreadDeltas.push(delta);
    }

    var spreadCount = 0;
    spreadThem();
    function spreadThem() {
      for (var i = 0; i < self.bodyParts.length; i++) {
        var part = self.bodyParts[i];
        var delta = spreadDeltas[i];
        part.move(delta.x, delta.y, delta.z);
      }

      if (++spreadCount < 250) setTimeout(spreadThem, kt.randInt(30, 15));
    }

  }
}

Character.prototype.render = function() {
  var self = this;

  if (this.twitching) {
    var x = (Math.random() - 0.5) * 2;
    var y = 0;
    var z = (Math.random() - 0.5) * 2;
    this.move(x, y, z);

    var rx = (Math.random() - 0.5) * 0.0001;
    var ry = (Math.random() - 0.5) * 0.4;
    var rz = (Math.random() - 0.5) * 0.0001;
    this.rotate(rx, ry, rz);
  }

  this.bodyParts.forEach(function(part) {
    part.melting = self.melting;
    part.render();
  });
}

function posNegRandom() {
  return (Math.random() - 0.5) * 2;
}

},{"./arm":1,"./body":2,"./hand":5,"./head":6,"./leg":9,"./lib/kutility":10,"./model_names":12}],5:[function(require,module,exports){

var kt = require('./lib/kutility');

var modelNames = require('./model_names');

var BodyPart = require('./bodypart');

module.exports = Hand;

function Hand(startPos, scale, side) {
  if (!startPos) startPos = {x: 0, y: 0, z: 0};
  this.startX = startPos.x;
  this.startY = startPos.y;
  this.startZ = startPos.z;

  this.side = side || 'left';

  this.scale = scale || 1;

  this.modelChoices = [modelNames.FOOTBALL_HAND, modelNames.BASE_HAND];
}

Hand.prototype.__proto__ = BodyPart.prototype;

Hand.prototype.additionalInit = function() {
  if (this.modelName == modelNames.FOOTBALL_HAND) {
    this.scale *= 45;
    this.scaleBody(this.scale);
    this.move(0, -6, 0);

    if (this.side == 'left') {
      this.move(8, 0, 0);
    } else {
      this.move(-10, 0, 0);
      this.mesh.scale.x *= -1;
    }
  }
  else if (this.modelName == modelNames.BASE_HAND) {
    this.rotate(0, 0, Math.PI);
  }
};

Hand.prototype.pokeUntilCollision = function(backwardsDistance, callback) {
  var self = this;

  var startZ = self.mesh.position.z;
  function moveback(cb) {
    var backInterval = setInterval(function() {
      self.move(0, 0, 2);
      if (self.mesh.position.z >= startZ + backwardsDistance) {
        clearInterval(backInterval);
        cb();
      }
    }, 20);
  }

  moveback(function() {
    var forwardInterval = setInterval(function() {
      self.move(0, 0, -2);
    }, 20);

    self.pokeCollisonHandler = function() {
      clearInterval(forwardInterval);
      self.pokeCollisonHandler = null;

      callback();
    };
  });
};

Hand.prototype.collisonHandle = function() {
  if (this.pokeCollisonHandler) {
    this.pokeCollisonHandler();
  }
};

},{"./bodypart":3,"./lib/kutility":10,"./model_names":12}],6:[function(require,module,exports){

var kt = require('./lib/kutility');

var BodyPart = require('./bodypart');

module.exports = Head;

var headNames = ['/images/kevin.jpg', '/images/dylan.jpg'];
var headIndex = 0;

function Head(startPos, scale) {
  if (!startPos) startPos = {x: 0, y: 0, z: 0};
  this.startX = startPos.x;
  this.startY = startPos.y;
  this.startZ = startPos.z;

  this.textureName = headNames[headIndex % headNames.length];
  headIndex += 1;

  this.scale = scale || 20;
  this.scale *= 0.4;

  this.revolving = true;
}

Head.prototype.__proto__ = BodyPart.prototype;

Head.prototype.createMesh = function(callback) {
  this.geometry = new THREE.SphereGeometry(1, 32, 32);

  this.material = new THREE.MeshBasicMaterial();
  this.material.map = THREE.ImageUtils.loadTexture(this.textureName);

  this.mesh = new THREE.Mesh(this.geometry, this.material);

  callback();
}

Head.prototype.render = function() {
  if (this.revolving) {
    this.mesh.rotation.y += 0.02;
  }
}

},{"./bodypart":3,"./lib/kutility":10}],7:[function(require,module,exports){

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

var previousPositions = {};
var positionDeltas = {};
var previousPositionDeltas = {};

var eventsWithRapidHeadVelocity = {one: 0, two: 0};

var startDate = new Date();
var meltingHistory = {one: {meltEndTime: startDate, meltStartTime: startDate}, two: {meltEndTime: startDate, meltStartTime: startDate}};

var kneeHistory = {one: {rotating: false}, two: {rotating: false}};

var elbowHistory = {one: {rotUp: false, rotDown: false}, two: {rotUp: false, rotDown: false}};

var BIG_HEAD_MAG = 15;
var MAX_HEAD_SWELL = 30;
var TORSO_CLOSE_MAG = 11;

var CLOSE_KNEE_MAG = 60;
var FAR_ELBOW_MAG = 300;

var CLOSE_HANDS_MAG = 100;

var TORSO_MOVEMENT_MAG_MULT = 0.21;
var MIN_DISTANCE_BETWEEN_WRESTLERS = 30;

module.exports.JOBFAIR = 1;
module.exports.WEIGHING = 2;
module.exports.INTERVIEW = 3;

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
    if (data.wrestler == 1) {
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

  socket.on('endPhrases', function() {
    module.exports.eventHandler('endPhrases');
  });
  socket.on('transparentComputers', function() {
    module.exports.eventHandler('transparentComputers');
  });
  socket.on('phoneShatter', function() {
    module.exports.eventHandler('phoneShatter');
  });
  socket.on('endPokes', function() {
    module.exports.eventHandler('endPokes');
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
    deltaZ = (position.z - lastPos.z) / -divisor;
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
  var wrestler = handNumber === 1 ? wrestler1 : wrestler2;

  if (previousPositions[rightHandKey]) {
    if (module.exports.mode === module.exports.JOBFAIR) {
      var denom = 7;
      var directions = {x: true, y: true, z: true};
      moveDelta(wrestler.rightArm, position, previousPositions[rightHandKey], denom, directions);
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
    if (module.exports.mode === module.exports.JOBFAIR) {
      var denom = 7;
      var directions = {x: true, y: true, z: true};
      moveDelta(wrestler.leftArm, position, previousPositions[leftHandKey], denom, directions);
    }
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
        if (eventsWithRapidHeadVelocity[headVelocityKey] === 0) {
          socket.emit('startSwell', headNumber);
        }

        eventsWithRapidHeadVelocity[headVelocityKey] = Math.min(eventsWithRapidHeadVelocity[headVelocityKey] + 1, MAX_HEAD_SWELL);
      } else {
        if (eventsWithRapidHeadVelocity[headVelocityKey] === 1) {
          socket.emit('endSwell', headNumber);
        }

        eventsWithRapidHeadVelocity[headVelocityKey] = Math.max(eventsWithRapidHeadVelocity[headVelocityKey] - 1, 0);
      }

      if (module.exports.mode === module.exports.INTERVIEW) {
        if (eventsWithRapidHeadVelocity[headVelocityKey] >= MAX_HEAD_SWELL) {
          module.exports.eventHandler('spit', {});
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
  var alternateWrestler = torsoNumber === 1 ? wrestler2: wrestler1;

  if (previousPositions[torsoKey]) {
    if (module.exports.mode === module.exports.JOBFAIR) {
      var d = delta(position, previousPositions[torsoKey]);
      var mag = totalMagnitude(d);
      var dist = TORSO_MOVEMENT_MAG_MULT * mag;
      wrestler.move(d.x / 30, 0, dist);

      if (wrestler.position.z - alternateWrestler.position.z > MIN_DISTANCE_BETWEEN_WRESTLERS) {
        alternateWrestler.move(0, 0, wrestler.position.z - MIN_DISTANCE_BETWEEN_WRESTLERS);
      }
    }

    positionDeltas[torsoKey] = delta(position, previousPositions[torsoKey]);
  }

  previousPositions[torsoKey] = position;
}

/*** KNEES ***/

function leftKnee1(position) {
  leftKneeBehavior(position, 1);
}

function leftKnee2(position) {
  leftKneeBehavior(position, 2);
}

function leftKneeBehavior(position, kneeNumber) {
  var leftKneeKey = 'leftKnee' + kneeNumber;
  var rightKneeKey = 'rightKnee' + kneeNumber;
  var kneeDeltaKey = 'knee' + kneeNumber;
  var wrestler = kneeNumber === 1 ? wrestler1 : wrestler2;

  if (previousPositions[rightKneeKey]) {
    var rh = previousPositions[rightKneeKey];
    positionDeltas[kneeDeltaKey] = {x: position.x - rh.x, y: position.y - rh.y, z: position.z - rh.z};
    knee2DeltaAction(positionDeltas[kneeDeltaKey]);
  }

  if (previousPositions[leftKneeKey]) {
    if (module.exports.mode === module.exports.JOBFAIR) {
      moveDelta(wrestler.leftLeg, position, previousPositions[leftKneeKey], 8, {x: true, y: true, z: true});
    }
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
    if (module.exports.mode === module.exports.JOBFAIR) {
      moveDelta(wrestler.rightLeg, position, previousPositions[rightKneeKey], 8, {x: true, y: true, z: true});
    }
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
  var mag = totalMagnitude(positionDelta);
  var date = new Date();

  if (mag < CLOSE_HANDS_MAG) {

  } else {

  }
}

function knee1DeltaAction(positionDelta) {
  kneeDeltaActionBehavior(positionDelta, 1);
}

function knee2DeltaAction(positionDelta) {
  kneeDeltaActionBehavior(positionDelta, 2);
}

function kneeDeltaActionBehavior(positionDelta, kneeNumber) {
  var mag = totalMagnitude(positionDelta);

  if (mag < CLOSE_KNEE_MAG) {

  } else {

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

},{}],8:[function(require,module,exports){

var Recruiter = require('./recruiter');

module.exports = JobBooth;

function JobBooth(recruiterOptions, posterURL) {
  this.recruiter = new Recruiter(recruiterOptions);

  this.desk = makeDesk();

  this.poster = makePoster(posterURL);
}

JobBooth.prototype.addTo = function(scene) {
  var self = this;
  this.recruiter.addTo(scene, function() {
    self.recruiter.skinnedMesh.add(self.desk);
    self.desk.position.set(-10, 0, -4);

    self.recruiter.skinnedMesh.add(self.poster);
    self.poster.position.set(-10, 7, -4);

    self.meshes = [self.desk, self.poster, self.recruiter.skinnedMesh, self.recruiter.faceMesh];
  });
};

function makeDesk() {
  var material = new THREE.MeshBasicMaterial({color: 0x655513});
  var geometry = new THREE.BoxGeometry(10, 6, 4);
  var desk = new THREE.Mesh(geometry, material);
  return desk;
}

function makePoster(imageURL) {
  var material = new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture(imageURL)
  });
  var geometry = new THREE.BoxGeometry(5, 7, 1);
  var poster = new THREE.Mesh(geometry, material);
  return poster;
}

},{"./recruiter":14}],9:[function(require,module,exports){

var kt = require('./lib/kutility');

var modelNames = require('./model_names');

var BodyPart = require('./bodypart');

module.exports = Leg;

function Leg(startPos, scale) {
  if (!startPos) startPos = {x: 0, y: 0, z: 0};
  this.startX = startPos.x;
  this.startY = startPos.y;
  this.startZ = startPos.z;

  this.scale = scale || 1;
  this.scale *= 0.25;

  this.modelChoices = [modelNames.LOWPOLY_LEG];
}

Leg.prototype.__proto__ = BodyPart.prototype;

Leg.prototype.additionalInit = function() {
  var self = this;

  if (self.modelName == modelNames.LOWPOLY_LEG) {

  }
};

},{"./bodypart":3,"./lib/kutility":10,"./model_names":12}],10:[function(require,module,exports){
/* export something */
module.exports = new Kutility;

/* constructor does nothing at this point */
function Kutility() {

}

/**
 * get a random object from the array arr
 *
 * @api public
 */

Kutility.prototype.choice = function(arr) {
    var i = Math.floor(Math.random() * arr.length);
    return arr[i];
}

/**
 * return shuffled version of an array.
 *
 * adapted from css tricks
 *
 * @api public
 */
Kutility.prototype.shuffle = function(arr) {
  var newArray = new Array(arr.length);
  for (var i = 0; i < arr.length; i++)
    newArray[i] = arr[i];

  newArray.sort(function() { return 0.5 - Math.random() });
  return newArray;
}

/**
 * returns a random color as an 'rgb(x, y, z)' string
 *
 * @api public
 */
Kutility.prototype.randColor = function() {
    var r = Math.floor(Math.random() * 256);
    var g = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

Kutility.prototype.randInt = function(max, min) {
  if (min)
    return Math.floor(Math.random() * (max - min)) + min;
  else
    return Math.floor(Math.random() * (max));
}

/**
 * Color wheel 1 -> 1536.
 *
 * Written by Henry Van Dusen, all attribution to the big boy.
 * Slightly modified by Kev.
 *
 * @api public
 */
 Kutility.prototype.colorWheel = function(num) {
    var text = "rgb(";
    var entry = num % 1536;
    var num = entry % 256;

    if(entry < 256 * 1)
    	return text + "0,255," + num + ")";
    else if(entry < 256 * 2)
    	return text + "0," + (255 - num) + ",255)";
    else if(entry < 256 * 3)
      return text + num + ",0,255)";
    else if(entry < 256 * 4)
      return text + "255,0," + (255 - num) + ")";
    else if(entry < 256 * 5)
      return text + "255," + num + ",0)";
    else
      return text + (255 - num) + ",255,0)";
 }

 /**
  * Make an rbg() color string an rgba() color string
  *
  * @api public
  */
Kutility.prototype.alphize = function(color, alpha) {
  color.replace('rgb', 'rgba');
  color.replace(')', ', ' + alpha + ')');
  return color;
}

/**
 * Get an array of two random contrasting colors.
 *
 * @api public
 */
Kutility.prototype.contrasters = function() {
  var num = Math.floor(Math.random() * 1536);
  var fg = this.colorWheel(num);
  var bg = this.colorWheel(num + 650);
  return [fg, bg];
}

/**
 * Add a random shadow to a jquery element
 *
 * @api public
 */
Kutility.prototype.randomShadow = function(el, size) {
  var s = size + 'px';
  var shadow = '0px 0px ' + s + ' ' + s + ' ' + this.randColor();
  addShadow(el, shadow);
}

/**
 * Add shadow with offset x and y pixels, z pixels of blur radius,
 * w pizels of spread radius, and cool color
 *
 * @api public
 */
Kutility.prototype.shadow = function(el, x, y, z, w, color) {
  var xp = x + "px";
  var yp = y + "px";
  var zp = z + "px";
  var wp = w + "px";

  var shadow = xp + " " + yp + " " + zp + " " + wp + " " + color;
  addShadow(el, shadow);
}

function addShadow(el, shadow) {
  el.css('-webkit-box-shadow', shadow);
  el.css('-moz-box-shadow', shadow);
  el.css('box-shadow', shadow);
}

/**
 * Add transform to element with all the lame browser prefixes.
 *
 * @api public
 */
Kutility.prototype.addTransform = function(el, transform) {
  var curTransform = this.getTransform(el);
  curTransform = curTransform.replace('none', '');
  var newTransform = curTransform + transform;
  this.setTransform(el, newTransform);
}

/**
 * Set transform of element with all the lame browser prefixes.
 *
 * @api public
 */
Kutility.prototype.setTransform = function(el, transform) {
  el.css('-webkit-transform', transform);
  el.css('-moz-transform', transform);
  el.css('-ms-transform', transform);
  el.css('-o-transform', transform);
  el.css('transform', transform);
}

/**
 * Check an elements tansform.
 *
 * @api public
 */
Kutility.prototype.getTransform = function(el) {
  var possible = ['transform', '-webkit-transform', '-moz-transform', '-ms-transform', '-o-transform'];

  for (var i = 0; i < possible.length; i++) {
    var f = el.css(possible[i]);
    if (f == 'none' && i + 1 < possible.length) {
      var pf = el.css(possible[i + 1]);
      if (pf)
        continue;
    }
    return f;
  }
}

/**
 * Remove all transforms from element.
 *
 * @api public
 */
Kutility.prototype.clearTransforms = function(el) {
  el.css('-webkit-transform', '');
  el.css('-moz-transform', '');
  el.css('-ms-transform', '');
  el.css('-o-transform', '');
  el.css('transform', '');
}

/**
 * Rotate an element by x degrees.
 *
 * @api public
 */
Kutility.prototype.rotate = function(el, x) {
  var ct = this.getTransform(el);
  ct = ct.replace(/matrix\(.*?\)/, '').replace('none', '');

  var t = ' rotate(' + x + 'deg)';
  this.setTransform(el, ct  + t);
}

/**
 * Scale an element by x (no units);
 *
 * @api public
 */
Kutility.prototype.scale = function(el, x) {
  var ct = this.getTransform(el);
  ct = ct.replace(/matrix\(.*?\)/, '').replace('none', '');

  var t = ' scale(' + x + ',' + x + ')';
  this.setTransform(el, ct + t);
}

/**
 * Translate an element by x, y (include your own units);
 *
 * @api public
 */
Kutility.prototype.translate = function(el, x, y) {
  var ct = this.getTransform(el);
  console.log(ct);
  ct = ct.replace(/matrix\(.*?\)/, '').replace('none', '');

  var t = ' translate(' + x + ', '  + y + ')';
  this.setTransform(el, ct + t);
}

/**
 * Skew an element by x, y degrees;
 *
 * @api public
 */
Kutility.prototype.skew = function(el, x, y) {
  var ct = this.getTransform(el);
  ct = ct.replace(/skew\(.*?\)/, '').replace(/matrix\(.*?\)/, '').replace('none', '');

  var xd = x + 'deg';
  var yd = y + 'deg';
  var t = ' skew(' + xd + ', ' + yd + ')';
  this.setTransform(el, ct + t);
}

/**
 * Warp an element by rotating and skewing it.
 *
 * @api public
 */
Kutility.prototype.warp = function(el, d, x, y) {
  var ct = this.getTransform(el);
  ct = ct.replace(/matrix\(.*?\)/, '').replace('none', '');

  var r = ' rotate(' + d + 'deg)';
  var xd = x + 'deg';
  var yd = y + 'deg';
  var s = ' skew(' + xd + ', ' + yd + ')';

  this.setTransform(el, ct + r + s);
}

/**
 * scale by w, translate x y
 *
 * @api public
 */
Kutility.prototype.slaw = function(el, w, x, y) {
  var ct = this.getTransform(el);
  ct = ct.replace(/matrix\(.*?\)/, '').replace('none', '');

  var s = ' scale(' + w + ',' + w + ')';
  var t = ' translate(' + x + ', '  + y + ')';
  this.setTransform(el, ct + s + t);
}

/**
 * scale by w, rotate by x
 *
 * @api public
 */
Kutility.prototype.straw = function(el, w, x) {
  var ct = this.getTransform(el);
  ct = ct.replace(/matrix\(.*?\)/, '').replace('none', '');

  var s = ' scale(' + w + ',' + w + ')';
  var r = ' rotate(' + x + 'deg)';
  this.setTransform(el, ct + s + r);
}

/**
 * Set perspective to x pixels
 *
 * @api public
 */
Kutility.prototype.perp = function(el, x) {
  var p = x + 'px';
  el.css('-webkit-perspective', p);
  el.css('-moz-perspective', p);
  el.css('-ms-perspective', p);
  el.css('-o-perspective', p);
  el.css('perspective', p);
}

/**
 * Set perspective-origin to x and y percents.
 *
 * @api public
 */
Kutility.prototype.perpo = function(el, x, y) {
  var p = x + "% " + y + "%";
  el.css('-webkit-perspective-origin', p);
  el.css('-moz-perspective-origin', p);
  el.css('-ms-perspective-origin', p);
  el.css('-o-perspective-origin', p);
  el.css('perspective-origin', p);
}

/**
 * Translate an element by x, y, z pixels
 *
 * @api public
 */
Kutility.prototype.trans3d = function(el, x, y, z) {
  var ct = this.getTransform(el);
  ct = ct.replace(/matrix3d\(.*?\)/, '').replace('none', '');

  var t = ' translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px)';
  this.setTransform(el, ct + t);
}

/**
 * Scale an element by x (no units)
 *
 * @api public
 */
Kutility.prototype.scale3d = function(el, x) {
  var ct = this.getTransform(el);
  ct = ct.replace(/matrix3d\(.*?\)/, '').replace('none', '');

  var t = ' scale3d(' + x + ', ' + x + ', ' + z + ')';
  this.setTransform(el, ct + t);
}

/**
 * Rotate an element about <x, y, z> by d degrees
 *
 * @api public
 */
Kutility.prototype.rotate3d = function(el, x, y, z, d) {
  var ct = this.getTransform(el);
  ct = ct.replace(/matrix3d\(.*?\)/, '').replace('none', '');

  var t = ' rotate3d(' + x + ', ' + y + ', ' + z + ', ' + d + 'deg)';
  this.setTransform(el, ct + t);
}

/**
 * Rotate an element about x axis by d degrees
 *
 * @api public
 */
Kutility.prototype.rotate3dx = function(el, d) {
  this.rotate3d(el, 1, 0, 0, d);
}

/**
 * Rotate an element about y axis by d degrees
 *
 * @api public
 */
Kutility.prototype.rotate3dy = function(el, d) {
  this.rotate3d(el, 0, 1, 0, d);
}

/**
 * Rotate an element about z axis by d degrees
 *
 * @api public
 */
Kutility.prototype.rotate3dz = function(el, d) {
  this.rotate3d(el, 0, 0, 1, d);
}

/**
 * Add filter to element with all the lame browser prefixes.
 *
 * @api public
 */
Kutility.prototype.addFilter = function(el, filter) {
  var curFilter = this.getFilter(el);
  curFilter = curFilter.replace('none', '');
  var newFilter = curFilter + ' ' + filter;
  this.setFilter(el, newFilter);
}

/**
 * Set filter to element with all lame prefixes.
 *
 * @api public
 */
Kutility.prototype.setFilter = function(el, filter) {
  el.css('-webkit-filter', filter);
  el.css('-moz-filter', filter);
  el.css('-ms-filter', filter);
  el.css('-o-filter', filter);
  el.css('filter', filter);
}

/**
 * Check an elements filter.
 *
 * @api public
 */
Kutility.prototype.getFilter = function(el) {
  var possible = ['filter', '-webkit-filter', '-moz-filter', '-ms-filter', '-o-filter'];

  for (var i = 0; i < possible.length; i++) {
    var f = el.css(possible[i]);
    if (f == 'none' && i + 1 < possible.length) {
      var pf = el.css(possible[i + 1]);
      if (pf)
        continue;
    }
    return f;
  }
}

/**
 * Remove all filters from element.
 *
 * @api public
 */
Kutility.prototype.clearFilters = function(el) {
  el.css('-webkit-filter', '');
  el.css('-moz-filter', '');
  el.css('-ms-filter', '');
  el.css('-o-filter', '');
  el.css('filter', '');
}

/**

/**
 * Grayscale an element by x percent.
 *
 * @api public
 */
Kutility.prototype.grayscale = function(el, x) {
  var cf = this.getFilter(el);
  cf = cf.replace(/grayscale\(.*?\)/, '').replace('none', '');

  var f = ' grayscale(' + x + '%)';
  this.setFilter(el, cf  + f);
}

/**
 * Sepia an element by x percent.
 *
 * @api public
 */
Kutility.prototype.sepia = function(el, x) {
  var cf = this.getFilter(el);
  cf = cf.replace(/sepia\(.*?\)/, '').replace('none', '');

  var f = ' sepia(' + x + '%)';
  this.setFilter(el, cf + f);
}

/**
 * Saturate an element by x percent.
 *
 * @api public
 */
Kutility.prototype.saturate = function(el, x) {
  var cf = this.getFilter(el);
  cf = cf.replace(/saturate\(.*?\)/, '').replace('none', '');

  var f = ' saturate(' + x + '%)';
  this.setFilter(el, cf + f);
}

/**
 * Invert an element by x percent.
 *
 * @api public
 */
Kutility.prototype.invert = function(el, x) {
  var cf = this.getFilter(el);
  cf = cf.replace(/invert\(.*?\)/, '').replace('none', '');

  var f = ' invert(' + x + '%)';
  this.setFilter(el, cf + f);
}

/**
 * Hue-rotate an element by x degrees.
 *
 * @api public
 */
Kutility.prototype.hutate = function(el, x) {
  var cf = this.getFilter(el);
  cf = cf.replace(/hue-rotate\(.*?\)/, '').replace('none', '');

  var f = ' hue-rotate(' + x + 'deg)';
  this.setFilter(el, cf + f);
}

/**
 * Set opacity of an element to x percent.
 *
 * @api public
 */
Kutility.prototype.opace = function(el, x) {
  var cf = this.getFilter(el);
  cf = cf.replace(/opacity\(.*?\)/, '').replace('none', '');

  var f = ' opacity(' + x + '%)';
  this.setFilter(el, cf + f);
}

/**
 * Set brightness of an element to x percent.
 *
 * @api public
 */
Kutility.prototype.brightness = function(el, x) {
  var cf = this.getFilter(el);
  cf = cf.replace(/brightness\(.*?\)/, '').replace('none', '');

  var f = ' brightness(' + x + '%)';
  this.setFilter(el, cf + f);
}

/**
 * Set contrast of an element to x percent.
 *
 * @api public
 */
Kutility.prototype.contrast = function(el, x) {
  var cf = this.getFilter(el);
  cf = cf.replace(/contrast\(.*?\)/, '').replace('none', '');

  var f = ' contrast(' + x + '%)';
  this.setFilter(el, cf + f);
}

/**
 * Blur an element by x pixels.
 *
 * @api public
 */
Kutility.prototype.blur = function(el, x) {
  var cf = this.getFilter(el);
  cf = cf.replace(/blur\(.*?\)/, '').replace('none', '');

  var f = ' blur(' + x + 'px)';
  this.setFilter(el, cf + f);
}

},{}],11:[function(require,module,exports){

$(function() {

  var Character = require('./character');
  var io = require('./io');
  var recruiterManager = require('./recruiter-manager');

  var TEST_MODE = true;

  /*
   * * * * * RENDERIN AND LIGHTIN * * * * *
   */

  var renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xffffff);
	document.body.appendChild(renderer.domElement);

  var scene = new Physijs.Scene();
  scene.setGravity(new THREE.Vector3(0, 0, 0));
  scene.addEventListener('update', function() {
    // here wanna apply new forces to objects and things based on state

    scene.simulate(undefined, 1);
  });

  var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 1000);
  camera.target = {x: 0, y: 0, z: 0};
  scene.add(camera);

  // mainLight shinin from above casting shadows and the like
  var mainLight = new THREE.DirectionalLight(0xffffff);
  mainLight.position.set(20, 20, -10);
  mainLight.target.position.copy(scene.position);
  mainLight.castShadow = true;
  scene.add(mainLight);

  io.eventHandler = function(event, data) {
    if (['spit', 'handshake'].indexOf(event) !== -1) {
      jobfairState.ronaldPerformedAction(event);
    }
  };

  /*
   * * * * * STATE OBJECTS * * * * *
   */

  var active = {ronalds: false, lighting: false, camera: false, jobfair: false, weighing: false};

  var jobfairState = {};
  var weighingState = {};

  var cameraFollowState = {
    target: null,
    offset: {x: 0, y: 0, z: 0},
  };
  var lightFollowState = {
    target: null,
    offset: {x: 0, y: 0, z: 0}
  };

  var kevinRonald = new Character({x: 7, y: -30, z: 100}, 20);
  kevinRonald.addTo(scene);

  var dylanRonald = new Character({x: 30, y: -30, z: 100}, 20);
  dylanRonald.addTo(scene);
  var ronalds = [kevinRonald, dylanRonald];

  /*
   * * * * * STARTIN AND RENDERIN * * * * *
   */

  setTimeout(start, 2000);
  function start() {
    if (!TEST_MODE) {
      io.begin(kevinRonald, dylanRonald, camera);
    }

    enterJobfairState();

    render();
    scene.simulate();

    $('body').keypress(function(ev) {
      console.log('key press eh? ' + ev.which);
      ev.preventDefault();

      if (ev.which === 32) { // spacebar
        resetRonaldPositions();
      }
      else if (ev.which === 97)  { // a
        if (io.mode === io.JOBFAIR) kevinRonald.move(-1, 0, 0);
      }
      else if (ev.which === 119)  { // w
        if (io.mode === io.JOBFAIR) kevinRonald.move(0, 0, -1);
      }
      else if (ev.which === 100)  { // d
        if (io.mode === io.JOBFAIR) kevinRonald.move(1, 0, 0);
      }
      else if (ev.which === 115)  { // s
        if (io.mode === io.JOBFAIR) kevinRonald.move(0, 0, 1);
      }
      else if (ev.which === 122) { // z
        jobfairState.ronaldPerformedAction('spit');
      }
      else if (ev.which === 113) { // q
        moveCameraPosition(0, 1, 0);
        if (cameraFollowState.offset) {
          cameraFollowState.offset.z += 1;
        }
      }
      else if (ev.which === 101) { // e
        moveCameraPosition(0, -1, 0);
        if (cameraFollowState.offset) {
          cameraFollowState.offset.z += -1;
        }
      }
    });
  }

  function render() {
    requestAnimationFrame(render);

    if (active.ronalds) {
      ronalds.forEach(function(ronald) {
        ronald.render();
      });
    }

    if (active.jobfair) {
      jobfairState.render();
    }
    if (active.weighing) {
      weighingState.render();
    }

    if (cameraFollowState.target) {
      camera.position.copy(cameraFollowState.target).add(cameraFollowState.offset);
      camera.lookAt(cameraFollowState.target);
    }
    if (lightFollowState.target) {
      mainLight.target.position.copy(lightFollowState.target);
      mainLight.position.addVectors(mainLight.target.position, lightFollowState.offset);
    }

    renderer.render(scene, camera);
  }

  /*
   * * * * * STATE CHANGES * * * * *
   */

  function enterJobfairState() {
    active.jobfair = true;
    io.mode = io.JOBFAIR;

    jobfairState.ground_material = Physijs.createMaterial(
      new THREE.MeshBasicMaterial({color: 0x111111, side: THREE.DoubleSide, transparent: true, opacity: 0.2}),
      0.8, // high friction
      0.4 // low restitution
    );

    jobfairState.ground_geometry = new THREE.PlaneGeometry(140, 2000);
    calculateGeometryThings(jobfairState.ground_geometry);

    jobfairState.ground = new Physijs.BoxMesh(jobfairState.ground_geometry, jobfairState.ground_material, 0);
    jobfairState.ground.rotation.x = -Math.PI / 2;
    jobfairState.ground.position.z = -1000;
    jobfairState.ground.position.y = 0;
    jobfairState.ground.__dirtyPosition = true;
    scene.add(jobfairState.ground);

    cameraFollowState.target = kevinRonald.torso.mesh.position;
    cameraFollowState.offset = {x: 0, y: 60, z: 150};

    jobfairState.booths = recruiterManager.createBooths(scene);

    var hasReachedBooths = false;
    var waitingForNextBooth = false;

    function setCurrentBooth(index) {
      console.log('current booth: ' + index);
      jobfairState.currentBooth = index;
      io.mode = io.INTERVIEW;
    }

    jobfairState.ronaldPerformedAction = function(action) {
      // here would want to do UI and shit yum
      console.log('ronald performed: ' + action);
      if (recruiterManager.actionIsSuccessful(action, this.currentBooth)) {

      } else {

      }

      if (this.currentBooth !== recruiterManager.recruiterCount - 1) {
        io.mode = io.JOBFAIR;
        waitingForNextBooth = true;
      }
      else {
        this.transitionToWeighing();
      }
    };

    jobfairState.transitionToWeighing = function() {
      active.jobfair = false;
      enterWeighingState();
    };

    jobfairState.render = function() {
      if (!hasReachedBooths) {
        if (kevinRonald.position.z <= -recruiterManager.closeToRecruiterDistance) {
          hasReachedBooths = true;
          setCurrentBooth(0);
        }
      }
      else if (waitingForNextBooth) {
        var currentBooth = recruiterManager.boothIndexForZ(kevinRonald.position.z);
        if (currentBooth > this.currentBooth) {
          setCurrentBooth(currentBooth);
        }
      }
    };

    jobfairState.endScene = function() {
      fadeOverlay(true, function() {
        var meshes = [jobfairState.ground];
        jobfairState.booths.forEach(function(booth) {
          booth.meshes.forEach(function(mesh) {
            meshes.push(mesh);
          });
        });
        clearScene(meshes);

        active.jobfair = false;
        enterWeighingState();
        fadeOverlay(false);
      });
    };
  }

  function enterWeighingState() {
    flash('RONALD IS BORN');

    active.ronalds = true;
    active.weighing = true;
    io.mode = io.WEIGHING;

    setCameraPosition(0, 0, 0);

    mainLight.position.set(0, 20, 0);
    mainLight.target.position.set(0, 5, -100);
    mainLight.intensity = 5.0;

    kevinRonald.moveTo(-80, 8, -140);
    kevinRonald.rotate(0, Math.PI/4, 0);

    dylanRonald.moveTo(80, 8, -140);
    dylanRonald.rotate(0, -Math.PI/4, 0);

    weighingState.render = function() {

    };
  }

  /*
   * * * * * UTILITY * * * * *
   */

  function clearScene(meshes) {
    if (!meshes) meshes = scene.children;

    for (var i = meshes.length - 1; i >= 0; i--) {
      var obj = meshes[ i ];
      if (obj !== camera && obj !== mainLight) {
        scene.remove(obj);
      }
    }
  }

  function resetRonaldPositions() {
    ronalds.forEach(function(ronald) {
      ronald.reset();
    });
  }

  function flash(text, timeout) {
    if (!text) return;
    if (!timeout) timeout = 275;

    $('#flash').text(text);
    $('#flash').show();
    setTimeout(function() {
      $('#flash').hide();
    }, timeout);
  }

  function shakeCamera() {
    var dx = (Math.random() - 0.5) * 1;
    var dy = (Math.random() - 0.5) * 0.5;
    var dz = (Math.random() - 0.5) * 1;

    moveCameraPosition(dx, dy, dz);
  }

  function moveCameraPosition(dx, dy, dz) {
    camera.position.x += dx;
    camera.position.y += dy;
    camera.position.z += dz;
  }

  function setCameraPosition(x, y, z) {
    camera.position.x = x;
    camera.position.y = y;
    camera.position.z = z;
  }

  function fadeOverlay(fadein, callback, color, time) {
    if (!color) color = 'rgb(255, 255, 255)';
    if (!time) time = 4000;
    if (!callback) callback = function(){};

    if (fadein) {
      $('.overlay').css('background-color', color);
      $('.overlay').fadeIn(time, function() {
        callback();
      });
    } else {
      $('.overlay').fadeOut(time, function() {
        callback();
      });
    }
  }

  function calculateGeometryThings(geometry) {
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
  }

  function middlePosition(p1, p2) {
    return {x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2, z: (p1.z + p2.z) / 2};
  }

  function negrand(scalar) {
    return (Math.random() - 0.5) * scalar;
  }

  function moveTowardsTarget(pos, target, amt) {
    if (pos.x < target.x) {
      pos.x += amt.x;
    } else if (pos.x > target.x) {
      pos.x -= amt.x;
    }

    if (pos.y < target.y) {
      pos.y += amt.y;
    } else if (pos.y > target.y) {
      pos.y -= amt.y;
    }

    if (pos.z < target.z) {
      pos.z += amt.z;
    } else if (pos.z > target.z) {
      pos.z -= amt.z;
    }
  }

  function distanceMagnitude(pos1, pos2) {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y) + Math.abs(pos1.z - pos2.z);
  }

});

},{"./character":4,"./io":7,"./recruiter-manager":13}],12:[function(require,module,exports){

var prefix = '/js/models/';

function pre(text) {
  return prefix + text;
}

/* LEGS */

module.exports.LOWPOLY_LEG = pre('low_poly_leg.js');

/* HEADS */

module.exports.LOWPOLY_HEAD = pre('low_poly_head.js');

/* ARMS */

module.exports.FOOTBALL_ARM = pre('football_arm.js');

module.exports.LOWPOLY_ARM = pre('low_poly_arm.js');

/* BODIES */

module.exports.FOOTBALL_TORSO = pre('football_torso.js');

module.exports.LOWPOLY_TORSO = pre('low_poly_torso.js');

module.exports.MALE_BODY = pre('body.js');

/* HANDS */

module.exports.FOOTBALL_HAND = pre('football_hand.js');

module.exports.BASE_HAND = pre('base_hand.js');

/* FEET */

module.exports.FOOTBALL_FOOT = pre('football_foot.js');

/* HUMANS */

module.exports.TWEEN_GIRL = pre('manga.js');
module.exports.BOY = pre('chubby.js');

/* FUNCTIONS */

module.exports.loadModel = function(modelName, callback) {
  var loader = new THREE.JSONLoader;

  loader.load(modelName, function (geometry, materials) {
    callback(geometry, materials);
  });
}

},{}],13:[function(require,module,exports){

var JobBooth = require('./job-booth');

module.exports.recruiterCount = 10;

var riddles = [
  '',
  '',
  '',
];

var posterImages = [
  '/images/linkedin.jpg',
  '/images/linkedin.jpg',
  '/images/linkedin.jpg',
  '/images/linkedin.jpg',
  '/images/linkedin.jpg',
  '/images/linkedin.jpg',
  '/images/linkedin.jpg',
  '/images/linkedin.jpg',
  '/images/linkedin.jpg',
  '/images/linkedin.jpg'
];

module.exports.actionIsSuccessful = function(action, boothIndex) {
  return Math.random() < 0.5;
};

module.exports.distanceBetweenBooths = 200;
module.exports.closeToRecruiterDistance = 90;

module.exports.createBooths = function(scene) {
  var booths = [];

  for (var i = 0; i < module.exports.recruiterCount; i++) {
    var booth = new JobBooth(
      {
        position: {x: -6, y: 10, z: -i * module.exports.distanceBetweenBooths},
        riddle: riddles[i]
      },
      posterImages[i]
    );

    booth.addTo(scene);
    booths.push(booth);
  }

  return booths;
};

module.exports.boothIndexForZ = function(z) {
  var pos = Math.abs(z);
  return Math.floor(Math.max(pos - module.exports.closeToRecruiterDistance, 0) / module.exports.distanceBetweenBooths);
};

},{"./job-booth":8}],14:[function(require,module,exports){

// requirements
var mn = require('./model_names');

module.exports = Recruiter;

function Recruiter(options) {
  if (!options) options = {};

  this.initialPosition = options.position || {x: 0, y: 0, z: 0};
  if (!this.initialPosition.y) this.initialPosition.y = 0;

  this.riddle = options.riddle || 'who am i / what can i do';

  this.scale = options.scale || 2;

  this.postLoadBehaviors = [];

  this.twitching = false;

  this.faceGeometry = new THREE.BoxGeometry(2, 2, 2);
  this.faceMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
  this.faceMesh = new THREE.Mesh(this.faceGeometry, this.faceMaterial);

  this.updateSkinColor(options.color || '#000000');

  this.updateFaceImage(options.faceImageUrl);
}

Recruiter.prototype.addTo = function(scene, callback) {
  var self = this;

  mn.loadModel(mn.MALE_BODY, function (geometry, materials) {
    self.geometry = geometry;
    self.materials = materials;

    self.skinnedMesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials));

    self.skinnedMesh.scale.set(self.scale, self.scale, self.scale);
    self.faceMesh.scale.set(self.scale / 2, self.scale / 2, self.scale / 2);

    self.updateSkinColor(self.color);

    self.move(self.initialPosition.x, self.initialPosition.y, self.initialPosition.z);

    scene.add(self.skinnedMesh);
    scene.add(self.faceMesh);

    for (var i = 0; i < self.postLoadBehaviors.length; i++) {
      self.postLoadBehaviors[i]();
    }

    if (callback) callback();
  });
};

Recruiter.prototype.move = function(x, y, z) {
  if (!this.skinnedMesh) return;

  this.skinnedMesh.position.x += x;
  this.skinnedMesh.position.y += y;
  this.skinnedMesh.position.z += z;

  this.faceMesh.position.x = this.skinnedMesh.position.x;
  this.faceMesh.position.z = this.skinnedMesh.position.z;
  this.faceMesh.position.y = this.skinnedMesh.position.y + 2.5 * this.scale;
};

Recruiter.prototype.rotate = function(rx, ry, rz) {
  if (!this.skinnedMesh) return;

  this.skinnedMesh.rotation.x += rx;
  this.skinnedMesh.rotation.y += ry;
  this.skinnedMesh.rotation.z += rz;

  this.faceMesh.rotation.copy(this.skinnedMesh.rotation);
};

Recruiter.prototype.rotateTo = function(x, y, z) {
  if (!this.skinnedMesh) {
    var self = this;
    this.postLoadBehaviors.push(function() {
      self.rotateTo(x, y, z);
    });
    return;
  }

  this.skinnedMesh.rotation.set(x, y, z);
  this.rotate(0, 0, 0);
};

Recruiter.prototype.moveTo = function(x, y, z) {
  if (!this.skinnedMesh) return;

  this.skinnedMesh.position.set(x, y, z);
  this.move(0, 0, 0);
};

Recruiter.prototype.setScale = function(s) {
  this.skinnedMesh.scale.set(s, s, s);
  this.faceMesh.scale.set(s / 2, s / 2, s / 2);
};

Recruiter.prototype.setVisible = function(visible) {
  this.skinnedMesh.visible = visible;
  this.faceMesh.visible = visible;
};

Recruiter.prototype.render = function() {
  if (this.twitching) {
    var x = (Math.random() - 0.5) * 2;
    var y = 0;
    var z = (Math.random() - 0.5) * 2;
    this.move(x, y, z);

    var rx = (Math.random() - 0.5) * 0.0001;
    var ry = (Math.random() - 0.5) * 0.4;
    var rz = (Math.random() - 0.5) * 0.0001;
    this.rotate(rx, ry, rz);
  }
};

Recruiter.prototype.meshes = function() {
  var m = [this.faceMesh];
  if (this.skinnedMesh) {
    m.push(this.skinnedMesh);
  }
  return m;
};

Recruiter.prototype.updateSkinColor = function(hex) {
  this.color = hex;

  if (!this.skinnedMesh) return;

  var materials = this.skinnedMesh.material.materials;
  for (var i = 0; i < materials.length; i++) {
    var material = materials[i];
    material.color = new THREE.Color(hex);
    material.ambient = new THREE.Color(hex);
    material.emissive = new THREE.Color(hex);
    material.needsUpdate = true;
  }
};

Recruiter.prototype.updateFaceImage = function(image) {
  var texture;

  if (typeof image === 'string' && image.length > 0) {
    this.faceImageUrl = image;
    texture = THREE.ImageUtils.loadTexture(image);
  } else if (image) {
    // gotta assume its a texturable image object thing (ie canvas)
    this.faceImageCanvas = image;
    texture = new THREE.Texture(image);
  }

  if (texture) {
    texture.needsUpdate = true;
    this.faceMaterial.map = texture;
    this.faceMaterial.needsUpdate = true;
  }
};

},{"./model_names":12}]},{},[11]);
