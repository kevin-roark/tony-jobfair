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

},{"./bodypart":3,"./lib/kutility":15,"./model_names":18}],2:[function(require,module,exports){

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

},{"./bodypart":3,"./lib/kutility":15,"./model_names":18}],3:[function(require,module,exports){
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
};

BodyPart.prototype.resetMovement = function() {
  var self = this;
  if (!self.mesh || !self.mesh.setLinearVelocity) return;

  self.mesh.setLinearVelocity({x: 0, y: 0, z: 0});
  self.mesh.setLinearFactor({x: 0, y: 0, z: 0});
  self.mesh.setAngularVelocity({x: 0, y: 0, z: 0});
  self.mesh.setAngularFactor({x: 0, y: 0, z: 0});
};

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

},{"./lib/kutility":15,"./model_names":18}],4:[function(require,module,exports){

var kt = require('./lib/kutility');
var modelNames = require('./model_names');

var BodyPart = require('./bodypart');

module.exports = Phone;

function Phone(startPos, scale, screenImage) {
  if (!startPos) startPos = {x: 0, y: 0, z: 0};
  this.startX = startPos.x;
  this.startY = startPos.y;
  this.startZ = startPos.z;

  this.scale = scale || 6;

  this.modelChoices = [modelNames.PHONE];

  this.screenImage = screenImage || '/media/textures/venmo.jpg';
}

Phone.prototype = Object.create(BodyPart.prototype);

Phone.prototype.addTo = function(scene, callback) {
  var self = this;

  var screenMaterial = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture(self.screenImage)});
  var screenGeometry = new THREE.PlaneGeometry(1.6 * self.scale, 2.8 * self.scale);
  self.screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
  scene.add(self.screenMesh);

  BodyPart.prototype.addTo.call(this, scene, callback);
};

Phone.prototype.removeFrom = function(scene) {
  scene.remove(this.mesh);
  scene.remove(this.screenMesh);
};

Phone.prototype.move = function(dx, dy, dz) {
  BodyPart.prototype.move.call(this, dx, dy, dz);

  this.screenMesh.position.set(this.mesh.position.x - 34, this.mesh.position.y - 17.5, this.mesh.position.z - 20);
};

},{"./bodypart":3,"./lib/kutility":15,"./model_names":18}],5:[function(require,module,exports){

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

},{"./arm":1,"./body":2,"./hand":10,"./head":11,"./leg":14,"./lib/kutility":15,"./model_names":18}],6:[function(require,module,exports){

var BodyPart = require('./bodypart');

module.exports = Computer;

var MAC = '/media/textures/mac_monitor.jpg';
var PC = '/media/textures/pc_monitor.jpg';
var LINUX = '/media/textures/linux_monitor.jpg';

module.exports.computerNames = [MAC, PC, LINUX];
var computerNames = module.exports.computerNames;
var computerIndex = 0;

var allComputers = [];

function Computer(startPos, scale, mass) {
  if (!startPos) startPos = {x: 0, y: 0, z: 0};
  this.startX = startPos.x;
  this.startY = startPos.y;
  this.startZ = startPos.z;

  this.textureName = computerNames[computerIndex % computerNames.length];
  computerIndex += 1;

  this.scale = scale || 20;
  this.mass = mass || 20;

  this.ignoreCollisons = false;

  this.meltIntensity = 0.5;
  this.twitchIntensity = 3;

  allComputers.push(this);
}

Computer.prototype = Object.create(BodyPart.prototype);

Computer.prototype.createMesh = function(callback) {
  this.geometry = new THREE.BoxGeometry(1, 0.75, 0.1);

  this.material = new THREE.MeshBasicMaterial({transparent: true, opacity: 1.0});
  this.material.map = THREE.ImageUtils.loadTexture(this.textureName);
  this.material = Physijs.createMaterial(this.material, 0.4, 0.6);

  this.mesh = new Physijs.BoxMesh(this.geometry, this.material, this.mass);

  callback();
};

Computer.prototype.becomeTransparent = function(delta, thresh, shatterAfter) {
  var self = this;

  if (!delta) delta = 0.01;
  if (!thresh) thresh = 0.5;

  var int = setInterval(function() {
    self.material.opacity -= delta;
    if (self.material.opacity <= thresh) {
      clearInterval(int);
      if (shatterAfter) {
        self.shatterable = true;
      }
    }
  }, 30);
};

function negrand(scalar, min) {
  var r = (Math.random() - 0.5) * scalar;
  if (r < 0) return r - min;
  else return r + min;
}

Computer.prototype.shatter = function() {
  if (this.shattering) {
    return;
  }

  this.shattering = true;
  this.ignoreCollisons = false;
  this.mesh.setLinearVelocity({x: negrand(36, 15), y: Math.random() * 36, z: negrand(36, 15)});
  this.mesh.setAngularVelocity({x: negrand(36, 15), y: Math.random() * 36, z: negrand(36, 15)});
};

},{"./bodypart":3}],7:[function(require,module,exports){


module.exports.nearest = function(object, targetObjects) {
  var nearest;
  var minDist = 1000000000000;

  for (var i = 0; i < targetObjects.length; i++) {
    var target = targetObjects[i];
    var dist = distanceMagnitude(object.position, target.position);
    if (dist < minDist) {
      minDist = dist;
      nearest = target;
    }
  }

  return {object: nearest, distance: minDist};
};

var distanceMagnitude = module.exports.distanceMagnitude = function(pos1, pos2) {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y) + Math.abs(pos1.z - pos2.z);
};

module.exports.middlePosition = function(p1, p2) {
  return {x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2, z: (p1.z + p2.z) / 2};
};

module.exports.moveTowardsTarget = function(pos, target, amt) {
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
};

module.exports.positionDeltaIncrement = function(pos1, pos2, steps) {
  return {
    x: (pos2.x - pos1.x) / steps,
    y: (pos2.y - pos1.y) / steps,
    z: (pos2.z - pos1.z) / steps
  };
};

},{}],8:[function(require,module,exports){

var modelNames = require('./model_names');

var BodyPart = require('./bodypart');

module.exports = Garbage;

function Garbage(startPos, scale, type) {
  if (!startPos) startPos = {x: 0, y: 0, z: 0};
  this.startX = startPos.x;
  this.startY = startPos.y;
  this.startZ = startPos.z;

  this.scale = scale || Math.random() * 9 + 2;

  this.modelChoices = [
    modelNames.TRASH_BANANA,
    modelNames.GARBAGE_CAN
  ];

  this.type = type;
  if (type === 'banana') {
    this.specificModelName = modelNames.TRASH_BANANA;
  } else if (type === 'garbage') {
    this.specificModelName = modelNames.GARBAGE_CAN;
    this.scale *= 4;
  }
}

Garbage.prototype = Object.create(BodyPart.prototype);

Garbage.prototype.createMesh = function(callback) {
  var self = this;
  BodyPart.prototype.createMesh.call(this, function() {
    if (self.type === 'banana') {
      self.materials.forEach(function(material) {
        material.color = new THREE.Color(0xded827);
        material.emissive = new THREE.Color(0xded827);
        material.needsUpdate = true;
      });
    }

    callback();
  });
};

},{"./bodypart":3,"./model_names":18}],9:[function(require,module,exports){


module.exports.calculateGeometryThings = function(geometry) {
  geometry.computeFaceNormals();
  geometry.computeVertexNormals();
};

},{}],10:[function(require,module,exports){

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

},{"./bodypart":3,"./lib/kutility":15,"./model_names":18}],11:[function(require,module,exports){

var kt = require('./lib/kutility');

var BodyPart = require('./bodypart');

module.exports = Head;

var headNames = ['/media/faces/kevin.jpg', '/media/faces/dylan.jpg'];
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

},{"./bodypart":3,"./lib/kutility":15}],12:[function(require,module,exports){

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
var eventsWithRapidRightArmVelocity = {one: 0, two: 0};
var eventsWithKneelingKnees = {one: 0, two: 0};
var eventsWithFlexingArms = {one: 0, two: 0};

var elbowHistory = {one: {rotUp: false, rotDown: false}, two: {rotUp: false, rotDown: false}};

var BIG_HEAD_MAG = 15;
var MAX_HEAD_SWELL = 30;
var TORSO_CLOSE_MAG = 11;

var BIG_ARMDELTA_MAG = 10;
var HANDSHAKE_ARMDELTA_FRAMES = 15;

var KNEELING_KNEE_Y_MAG = 15;
var KNEEL_GESTURE_CONSECUTIVE_EVENTS = 15;

var FAR_ELBOW_MAG = 300;

var FLEXING_HANDS_X_MAG = 15;
var FLEX_GESTURE_CONSECUTIVE_EVENTS = 20;
var CLOSE_HANDS_MAG = 100;

var TORSO_MOVEMENT_MAG_MULT = 0.21;

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
  var armVelocityKey = handNumber === 1 ? 'one' : 'two';
  var wrestler = handNumber === 1 ? wrestler1 : wrestler2;

  if (previousPositions[rightHandKey]) {
    if (module.exports.mode === module.exports.INTERVIEW) {
      if (positionDeltas[rightHandKey] && totalMagnitude(positionDeltas[rightHandKey]) < BIG_ARMDELTA_MAG) {
        var positionChange = delta(position, previousPositions[rightHandKey]);
        var mag = totalMagnitude(positionChange);

        if (mag > BIG_ARMDELTA_MAG) {
          eventsWithRapidRightArmVelocity[armVelocityKey] += 1;
        } else {
          eventsWithRapidRightArmVelocity[armVelocityKey] = Math.max(eventsWithRapidRightArmVelocity[armVelocityKey] - 1, 0);
        }

        if (eventsWithRapidRightArmVelocity[armVelocityKey] >= HANDSHAKE_ARMDELTA_FRAMES) {
          module.exports.eventHandler('handshake', {});
          eventsWithRapidRightArmVelocity[armVelocityKey] = 0;
        }
      }
    }
    else if (module.exports.mode === module.exports.JOBFAIR) {
      var denom = 7;
      var directions = {x: true, y: true, z: true};
      moveDelta(wrestler.rightArm, position, previousPositions[rightHandKey], denom, directions);
    }
    else if (module.exports.mode === module.exports.WEIGHING) {
      moveDelta(wrestler, position, previousPositions[rightHandKey], 2);
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
  var eventsKey = handNumber === 1 ? 'one' : 'two';

  if (module.exports.mode === module.exports.INTERVIEW) {
    var xMag = Math.abs(positionDelta.x);
    if (xMag >= FLEXING_HANDS_X_MAG) {
      eventsWithFlexingArms[eventsKey] += 1;
    } else if (eventsWithFlexingArms[eventsKey] > 0) {
      eventsWithFlexingArms[eventsKey] -= 1;
    }

    if (eventsWithFlexingArms[eventsKey] >= FLEX_GESTURE_CONSECUTIVE_EVENTS) {
      module.exports.eventHandler('bribe', {});
      eventsWithFlexingArms[eventsKey] = 0;
    }
  }

  var mag = totalMagnitude(positionDelta);
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
  var eventsKey = kneeNumber === 1 ? 'one' : 'two';

  if (module.exports.mode === module.exports.INTERVIEW) {
    var yMag = Math.abs(positionDelta.y);
    if (yMag >= KNEELING_KNEE_Y_MAG) {
      eventsWithKneelingKnees[eventsKey] += 1;
    } else if (eventsWithKneelingKnees[eventsKey] > 0) {
      eventsWithKneelingKnees[eventsKey] -= 1;
    }

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

},{}],13:[function(require,module,exports){

var Recruiter = require('./recruiter');

module.exports = JobBooth;

function JobBooth(recruiterOptions, posterURL, side) {
  this.recruiter = new Recruiter(recruiterOptions);
  this.recruiterScale = this.recruiter.scale;

  this.side = side || 'left';

  this.desk = makeDesk();

  this.poster = makePoster(posterURL);
}

JobBooth.prototype.addTo = function(scene) {
  var self = this;
  this.recruiter.addTo(scene, function() {
    var rotation = self.side === 'left' ? Math.PI / 6 : - Math.PI / 6;
    self.recruiter.rotate(0, rotation, 0);

    var recruiterPos = self.recruiter.skinnedMesh.position;

    scene.add(self.desk);
    self.desk.position.set(recruiterPos.x + (self.side === 'left' ? -17.5 : 17.5), 2, recruiterPos.z + self.recruiterScale * 3);
    self.desk.rotation.y = rotation / 1.75;

    self.desk.add(self.poster);
    self.poster.position.set(0, 18, 0);

    self.meshes = [self.desk, self.recruiter.skinnedMesh, self.recruiter.faceMesh];
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
  var geometry = new THREE.BoxGeometry(30, 30, 1);
  var poster = new THREE.Mesh(geometry, material);
  return poster;
}

},{"./recruiter":21}],14:[function(require,module,exports){

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

},{"./bodypart":3,"./lib/kutility":15,"./model_names":18}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){

$(function() {

  var kt = require('./lib/kutility');
  var distanceUtil = require('./distance-util');
  var geometryUtil = require('./geometry-util');
  var sceneUtil = require('./scene-util');
  var ronaldUI = require('./ronald-ui');

  var ronaldGestures = require('./ronald-gestures');
  var meshGestures = require('./mesh-gestures');

  var io = require('./io');

  var Character = require('./character');
  var RonaldText = require('./ronald-text');
  var Scale = require('./scale');
  var Shirt = require('./tshirt');
  var Garbage = require('./garbage');
  var Computer = require('./computer');
  var skybox = require('./skybox');
  var recruiterManager = require('./recruiter-manager');

  var TEST_MODE = true;
  var START_WITH_SCALE = false;
  var SPEED_TO_TRASH = false;

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

  var camera = new THREE.PerspectiveCamera(65, window.innerWidth/window.innerHeight, 1, 3200);
  camera.target = {x: 0, y: 0, z: 0};
  scene.add(camera);

  // mainLight shinin from above casting shadows and the like
  var mainLight = new THREE.DirectionalLight(0xffffff);
  mainLight.position.set(20, 20, -10);
  mainLight.target.position.copy(scene.position);
  mainLight.castShadow = true;
  scene.add(mainLight);

  io.eventHandler = function(event, data) {
    if (['spit', 'handshake', 'kneel', 'bribe'].indexOf(event) !== -1) {
      jobfairState.ronaldPerformedAction(event);
    }

    if (event === 'throw') {
      var name = data.ronaldNumber === 1 ? 'kevin' : 'dylan';
      weighingState.ronaldPerformedThrow(name, 'left');
    }
  };

  /*
   * * * * * STATE OBJECTS * * * * *
   */

  var active = {ronalds: false, lighting: false, camera: false, jobfair: false, weighing: false, trash: false};

  var jobfairState = {};
  var weighingState = {};
  var garbageState = {};

  var cameraFollowState = {
    target: null,
    offset: {x: 0, y: 0, z: 0},
  };
  var lightFollowState = {
    target: null,
    offset: {x: 0, y: 0, z: 0}
  };

  var kevinRonald = new Character({x: 0, y: -10, z: 100}, 20);
  kevinRonald.addTo(scene);

  var dylanRonald = new Character({x: 30, y: -10, z: 100}, 20);
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

    if (START_WITH_SCALE) {
      enterWeighingState();
    }
    else {
      enterJobfairState();
    }

    render();
    scene.simulate();

    $('body').keypress(function(ev) {
      console.log('key press eh? ' + ev.which);
      ev.preventDefault();

      if (ev.which === 32) { // spacebar
        resetRonaldPositions();
      }
      else if (ev.which === 97)  { // a
        if (io.mode !== io.INTERVIEW || TEST_MODE) kevinRonald.move(-2, 0, 0);
      }
      else if (ev.which === 119)  { // w
        if (io.mode !== io.INTERVIEW || TEST_MODE) kevinRonald.move(0, 0, -2);
      }
      else if (ev.which === 100)  { // d
        if (io.mode !== io.INTERVIEW || TEST_MODE) kevinRonald.move(2, 0, 0);
      }
      else if (ev.which === 115)  { // s
        if (io.mode !== io.INTERVIEW || TEST_MODE) kevinRonald.move(0, 0, 2);
      }
      else if (ev.which === 122) { // z
        jobfairState.ronaldPerformedAction('spit');
      }
      else if (ev.which === 120) { // x
        jobfairState.ronaldPerformedAction('handshake');
      }
      else if (ev.which === 99) { // c
        jobfairState.ronaldPerformedAction('kneel');
      }
      else if (ev.which === 118) { // v
        jobfairState.ronaldPerformedAction('bribe');
      }
      else if (ev.which === 107) { // k
        weighingState.ronaldPerformedThrow('kevin', 'left');
      }
      else if (ev.which === 108) { // l
        weighingState.ronaldPerformedThrow('kevin', 'right');
      }
      else if (ev.which === 113) { // q
        jobfairState.finishedPerformingPitch();
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
    if (active.trash) {
      garbageState.render();
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

    jobfairState.ground_geometry = new THREE.PlaneGeometry(160, 6000);
    geometryUtil.calculateGeometryThings(jobfairState.ground_geometry);

    jobfairState.ground = new Physijs.BoxMesh(jobfairState.ground_geometry, jobfairState.ground_material, 0);
    jobfairState.ground.rotation.x = -Math.PI / 2;
    jobfairState.ground.position.z = -3000;
    jobfairState.ground.position.y = 0;
    jobfairState.ground.__dirtyPosition = true;
    scene.add(jobfairState.ground);

    function makeWall(side) {
      var wallGeometry = side? new THREE.PlaneGeometry(6000, 100) : new THREE.PlaneGeometry(160, 100);
      var wallTexture = THREE.ImageUtils.loadTexture('/media/textures/wood.jpg');
      wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
      wallTexture.repeat.set(8, 8);
      var wallMaterial = new THREE.MeshBasicMaterial({
        map: wallTexture,
        side: THREE.DoubleSide
      });
      var wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
      if (side) {
        wallMesh.rotation.y = Math.PI / 2;
      }
      return wallMesh;
    }

    jobfairState.leftWall = makeWall(true);
    jobfairState.leftWall.position.set(-80, 50, -3000);
    scene.add(jobfairState.leftWall);

    jobfairState.rightWall = makeWall(true);
    jobfairState.rightWall.position.set(82, 50, -3000);
    scene.add(jobfairState.rightWall);

    jobfairState.backWall = makeWall(false);
    jobfairState.backWall.position.set(0, 50, -6000);

    cameraFollowState.target = kevinRonald.torso.mesh.position;
    cameraFollowState.offset = {x: 0, y: 40, z: 150};

    jobfairState.booths = recruiterManager.createBooths(scene);

    jobfairState.collectedTokens = [];
    jobfairState.hasPerformedActionForCurrentBooth = false;
    jobfairState.waitingForAction = false;

    var hasReachedBooths = false;
    var waitingForNextBooth = false;
    var overlay = $('.interview-overlay');
    var interviewOverlayInterval;

    function setCurrentBooth(index) {
      console.log('current booth: ' + index);
      jobfairState.currentBooth = index;
      io.mode = io.INTERVIEW;
      jobfairState.waitingForAction = true;
      jobfairState.finishedPerformingPitch = false;
      ronaldUI.flash(recruiterManager.companies[index], 1000);
    }

    function flashOverlay(color) {
      overlay.css('background-color', color);

      var hidden = true;
      if (interviewOverlayInterval) {
        clearInterval(interviewOverlayInterval);
      }
      interviewOverlayInterval = setInterval(function() {
        if (hidden) {
          overlay.show();
        } else {
          overlay.hide();
        }
        hidden = !hidden;
      }, 200);
    }

    function showSuccessfulResponse(z) {
      jobfairState.responseText = new RonaldText({
        phrase: 'SUCCESS',
        position: {x: jobfairState.currentBooth % 2 === 0 ? 20 : -20, y: 25, z: z},
        color: 0x00ff00
      });
      flashOverlay('rgb(0, 255, 0)');
      jobfairState.responseText.addTo(scene, null);
      setTimeout(function() {
        clearInterval(interviewOverlayInterval);
        overlay.hide();
        jobfairState.responseText = null;
      }, 5000);
    }

    function showFailedResponse(z) {
      jobfairState.responseText = new RonaldText({
        phrase: 'NO!!!',
        position: {x: jobfairState.currentBooth % 2 === 0 ? 20 : -20, y: 25, z: z},
        color: 0xff0000
      });
      flashOverlay('rgb(255, 0, 0)');
      jobfairState.responseText.addTo(scene, null);
      setTimeout(function() {
        clearInterval(interviewOverlayInterval);
        overlay.hide();
        jobfairState.responseText = null;
      }, 5000);
    }

    jobfairState.finishedPerformingPitch = function() {
      jobfairState.finishedPerformingPitch = true;
    };

    jobfairState.ronaldPerformedAction = function(action) {
      console.log('ronald performed: ' + action);

      if (!this.finishedPerformingPitch || !this.waitingForAction|| this.hasPerformedActionForCurrentBooth) {
        return;
      }
      this.hasPerformedActionForCurrentBooth = true;

      var self = this;
      var behaviorMap = {
        spit: ronaldGestures.spitToRecruiter,
        handshake: ronaldGestures.shakeHandsWithRecruiter,
        kneel: ronaldGestures.kneelToRecruiter,
        bribe: ronaldGestures.bribeRecruiter
      };

      if (behaviorMap[action]) {
        behaviorMap[action](scene, this.booths, this.currentBooth, kevinRonald, showResults);
      } else {
        showResults();
      }

      function showResults() {
        var success = recruiterManager.actionIsSuccessful(action, self.currentBooth);

        if (success) {
          showSuccessfulResponse(kevinRonald.position.z + 72);

          var shirt = new Shirt(null, null, recruiterManager.companies[jobfairState.currentBooth]);
          jobfairState.collectedTokens.push(shirt);
        }
        else {
          showFailedResponse(kevinRonald.position.z + 72);
        }

        setTimeout(function() {
          goToNextBooth();
        }, 3000);
      }

      function goToNextBooth() {
        if (self.currentBooth < recruiterManager.recruiterCount - 1) {
          io.mode = io.JOBFAIR;
          waitingForNextBooth = true;
          jobfairState.hasPerformedActionForCurrentBooth = false;
          jobfairState.waitingForAction = false;
        }
        else {
          self.endScene();
        }
      }
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

      if (jobfairState.responseText) {
        jobfairState.responseText.render();
      }
    };

    jobfairState.endScene = function() {
      var self = this;
      ronaldUI.fadeOverlay(true, function() {
        var meshes = [jobfairState.ground, jobfairState.leftWall, jobfairState.rightWall];
        jobfairState.booths.forEach(function(booth) {
          booth.meshes.forEach(function(mesh) {
            meshes.push(mesh);
          });
        });
        sceneUtil.clearScene(scene, meshes, [camera, mainLight]);
        scene.remove(jobfairState.ground);

        active.jobfair = false;
        enterWeighingState(self.collectedTokens);
        ronaldUI.fadeOverlay(false);
      });
    };
  }

  function enterWeighingState(tokens) {
    var FRAMES_FOR_THROW = 150;

    ronaldUI.flash('CHOOSE YOUR ROLE');

    if (!tokens) {
      tokens = [];
      for (var i = 0; i < recruiterManager.companies.length; i++) {
        if (Math.random() < 0.5) {
          var company = recruiterManager.companies[i];
          var shirt = new Shirt(null, null, company);
          tokens.push(shirt);
        }
      }
    }

    if (SPEED_TO_TRASH) {
      tokens = tokens.slice(0, 2);
    }

    console.log('tokens length: ' + tokens.length);

    active.ronalds = true;
    active.weighing = true;
    io.mode = io.WEIGHING;

    mainLight.position.set(0, 100, 0);
    mainLight.target.position.set(0, 5, -50);
    mainLight.intensity = 2.0;

    kevinRonald.moveTo(-70, 0, -140);
    dylanRonald.moveTo(70, 0, -140);

    var tokenMeshes = [];
    tokens.forEach(function(token) {
      token.addTo(scene, function() {
        token.moveTo((Math.random() - 0.5) * 360, Math.random() * 10 + 8, -kt.randInt(250, 160));
        token.mesh.__company = token.company;
        tokenMeshes.push(token.mesh);
      });
    });

    var scale = new Scale();
    scale.addTo(scene);
    scale.mesh.position.set(0, 45, -325);

    var scaleWidth = 210; // messy
    var leftScaleTarget = {x: scale.mesh.position.x - scaleWidth / 2, y: scale.mesh.position.y + 4, z: scale.mesh.position.z};
    var rightScaletarget = {x: scale.mesh.position.x + scaleWidth / 2, y: scale.mesh.position.y + 4, z: scale.mesh.position.z};

    var scaleText = new RonaldText({
      phrase: 'YOU HAVE TO WEIGH YOUR JOB OPTIONS',
      position: {x: 50, y: 75, z: -115},
      decay: 10000000,
      color: 0x4444ff
    });
    scaleText.geometry.center();
    scaleText.addTo(scene);

    weighingState.kevinRenderer = new WeighingStateRonaldRenderer('kevin');
    weighingState.dylanRenderer = new WeighingStateRonaldRenderer('dylan');
    weighingState.tokensDestroyed = 0;
    weighingState.scale = scale;
    weighingState.tokensThrown = {};

    weighingState.render = function() {
      var ronPos = kevinRonald.torso.mesh.position;
      var dylPos = dylanRonald.torso.mesh.position;
      cameraFollowState.target = {x: (ronPos.x + dylPos.x) / 2, y: 0, z: (ronPos.z + dylPos.z) / 2};
      cameraFollowState.offset = {x: 0, y: 72, z: 150};

      scaleText.render();

      this.kevinRenderer.render();
      this.dylanRenderer.render();
    };

    weighingState.ronaldPerformedThrow = function(ronaldName, direction) {
      if (!ronaldName) ronaldName = 'kevin';
      if (!direction) direction = 'left';

      if (ronaldName === 'kevin') {
        this.kevinRenderer.performedThrow(direction);
      } else {
        this.dylanRenderer.performedThrow(direction);
      }
    };

    weighingState.beginGarbageTransition = function() {
      console.log('beginning garbage transition');
      scale.updateForMasses(0, 0);
      setTimeout(function() {
        var fallingObjects = [];
        var multiplier = 0.1;
        var interval = setInterval(function() {
          scale.mesh.rotation.z += Math.random() * multiplier;
          multiplier *= 1.015;
          for (var i = 0; i < fallingObjects.length; i++) {
            if (fallingObjects[i].mesh.position.y > 0 || fallingObjects[i]._keepFallingAtGround) {
              fallingObjects[i].move(0, - (Math.random() + 0.25), 0);
            }
          }
        }, 40);

        function addGarbage(garbage) {
          garbage.addTo(scene, function() {
            garbage.rotate(0, Math.PI, 0);
            fallingObjects.push(garbage);
          });
        }

        function addBanana() {
          var banana = new Garbage({x: (Math.random() - 0.5) * 240, y: Math.random() * 80 + 30, z: - (kt.randInt(350, 120))}, null, 'banana');
          banana._keepFallingAtGround = true;
          banana.addTo(scene, function() {
            fallingObjects.push(banana);
          });
        }

        function addTruck() {
          clearInterval(interval);
          var geometry = new THREE.BoxGeometry(175, 125, 60);
          var material = new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture('/media/textures/garbage_truck.jpg'),
            side: THREE.DoubleSide
          });
          var truck = new THREE.Mesh(geometry, material);
          truck.position.set(0, 100, -300);
          scene.add(truck);
          var truckInterval = setInterval(function() {
            if (truck.position.y > 4) truck.position.y -= 0.5;
          }, 30);
          setTimeout(function() {
            clearInterval(truckInterval);
            exitState(truck);
          }, SPEED_TO_TRASH? 2000 : 10000);
        }

        function exitState(truck) {
          ronaldUI.fadeOverlay(true, function() {
            var lameMeshes = [scaleText, scale.mesh];
            tokenMeshes.forEach(function(mesh) {
              lameMeshes.push(mesh);
            });
            fallingObjects.forEach(function(obj) {
              lameMeshes.push(obj.mesh);
            });
            sceneUtil.clearScene(scene, lameMeshes, [camera, mainLight]);

            active.weighing = false;
            enterTrashState(truck);
            ronaldUI.fadeOverlay(false);
          });
        }

        setTimeout(function() {
          addGarbage(new Garbage({x: 70, y: 100, z: -170}, null, 'garbage'));
          setTimeout(function() {
            addGarbage(new Garbage({x: -40, y: 70, z: -130}, 8, 'garbage'));
            setTimeout(function() {
              var bananaCount = 0;
              var bananaInterval = setInterval(function() {
                addBanana();
                bananaCount += 1;
                if (bananaCount >= (SPEED_TO_TRASH? 5 : 40)) {
                  clearInterval(bananaInterval);
                  addTruck();
                }
              }, 900);
            }, 3000);
          }, SPEED_TO_TRASH? 500 : 33333);
        }, SPEED_TO_TRASH? 500 : 6666);

      }, 2500);
    };

    function WeighingStateRonaldRenderer(name) {
      this.name = name;
      this.ronald = name === 'kevin' ? kevinRonald : dylanRonald;
      this.frameCount = 0;
      this.mode = 'seeking';
    }
    WeighingStateRonaldRenderer.prototype.render = function() {
      this.frameCount += 1;
      var self = this;

      var ronaldHead = this.ronald.head.mesh;

      if (this.mode === 'seeking' && this.frameCount % 10 === 0) {
        var nearest = distanceUtil.nearest(ronaldHead, tokenMeshes);
        if (nearest.distance < 24) {
          this.mode = 'placing';
          this.activeTokenMesh = nearest.object;
        }
      }
      else if (this.mode === 'placing') {
        this.activeTokenMesh.position.set(ronaldHead.position.x + 2, ronaldHead.position.y - 15, ronaldHead.position.z + 5);
      }
      else if (this.mode === 'throwing') {
        this.activeTokenMesh.position.x += this.throwIncrement.x;
        this.activeTokenMesh.position.y += this.throwIncrement.y;
        this.activeTokenMesh.position.z += this.throwIncrement.z;
        this.activeTokenMesh.__dirtyPosition = true;

        this.currentThrowFrames += 1;
        if (this.currentThrowFrames >= FRAMES_FOR_THROW) {
          var scaleSetter = this.throwDirection === 'left' ? scale.setLeftObject.bind(scale) : scale.setRightObject.bind(scale);
          scaleSetter(this.activeTokenMesh);

          console.log('ended throw: ' + weighingState.tokensDestroyed);
          console.log('tokens lengtH: ' + tokens.length);

          // if scale is filled with last two things
          if (weighingState.tokensDestroyed === tokens.length - 1 && scale.numberOfObjects() === 2) {
            self.mode = 'waitingForGarbage';
            setTimeout(function() {
              weighingState.beginGarbageTransition();
            }, 1200);
            return;
          }

          self.mode = 'waiting';
          setTimeout(function() {
            scale.clearLightestObject(function(lightestObject) {
              meshGestures.sendFlying(lightestObject, {steps: 100}, function() {
                self.mode = 'seeking';
                if (!lightestObject || !weighingState.tokensThrown[lightestObject.__company]) {
                  console.log('destroyed a fresh token');
                  weighingState.tokensDestroyed += 1;

                  if (lightestObject) {
                    console.log('cleared: ' + lightestObject.__company);
                    weighingState.tokensThrown[lightestObject.__company] = true;
                  }
                }
              });
            });
          }, 500);
        }
      }
    };
    WeighingStateRonaldRenderer.prototype.performedThrow = function(direction) {
      if (this.mode !== 'placing') {
        return;
      }

      var missingObject = scale.missingObject();
      if (missingObject === 'left' || missingObject === 'right') {
        direction = missingObject;
      }

      this.mode = 'throwing';

      this.throwDirection = direction;
      this.throwTarget = direction === 'left' ? leftScaleTarget : rightScaletarget;
      this.throwIncrement = distanceUtil.positionDeltaIncrement(this.activeTokenMesh.position, this.throwTarget, FRAMES_FOR_THROW);
      this.currentThrowFrames = 0;
    };
  }

  function enterTrashState(truck) {
    io.mode = io.TRASH;
    active.trash = true;

    mainLight.position.set(0, 100, 0);
    mainLight.target.position.set(0, 5, -50);
    mainLight.intensity = 2.0;

    truck.position.set(0, 0, -30);
    truck.rotation.y -= Math.PI / 2;

    kevinRonald.moveTo(-55, 55, -30);
    dylanRonald.moveTo(55, 55, -30);

    var computerLab = skybox.create(null, '/media/textures/computer_lab.jpg');
    scene.add(computerLab);

    var computers = [];
    var compZOffset = 25;
    for (var i = 0; i < 100; i++) {
      var comp = new Computer({x: (Math.random() - 0.5) * 80, y: 10, z: -(i + 1) * compZOffset});
      computers.push(comp);
      comp.addTo(scene);
    }

    garbageState.nextComputerToShatterIndex = 0;
    garbageState.mode = 'waiting';

    ronaldUI.flash('YOU ARE GARBAGE', 2000);
    setTimeout(function() {
      garbageState.mode = 'driving';
    }, 3500);

    garbageState.render = function() {
      cameraFollowState.target = {x: truck.position.x, y: truck.position.y, z: truck.position.z};
      cameraFollowState.offset = {x: 0, y: 40, z: 300};

      if (this.mode === 'driving') {
        var inc = -0.6;
        truck.position.z += inc;
        kevinRonald.move(0, 0, inc);
        dylanRonald.move(0, 0, inc);

        shakeMesh(truck);

        if (this.nextComputerToShatterIndex >= 75 && !this.isFadingLinkedin) {
          this.fadeLinkedIn();
        }

        if (this.nextComputerToShatterIndex < computers.length && truck.position.z < -50 + (this.nextComputerToShatterIndex + 1) * -compZOffset) {
          computers[this.nextComputerToShatterIndex].shatter();
          this.nextComputerToShatterIndex += 1;
        }
      }
    };

    garbageState.fadeLinkedIn = function() {
      this.isFadingLinkedin = true;

      $('#endgame-overlay').fadeIn(10000);
    };
  }

  /*
   * * * * * UTILITY * * * * *
   */

  function resetRonaldPositions() {
    ronalds.forEach(function(ronald) {
      ronald.reset();
    });
  }

  function shakeMesh(mesh) {
    var dx = (Math.random() - 0.5) * 1;
    var dy = (Math.random() - 0.5) * 0.5;
    var dz = (Math.random() - 0.5) * 1;

    moveMesh(mesh, dx, dy, dz);
  }

  function moveMesh(mesh, dx, dy, dz) {
    mesh.position.x += dx;
    mesh.position.y += dy;
    mesh.position.z += dz;
  }

});

},{"./character":5,"./computer":6,"./distance-util":7,"./garbage":8,"./geometry-util":9,"./io":12,"./lib/kutility":15,"./mesh-gestures":17,"./recruiter-manager":20,"./ronald-gestures":22,"./ronald-text":23,"./ronald-ui":24,"./scale":25,"./scene-util":26,"./skybox":27,"./tshirt":29}],17:[function(require,module,exports){


module.exports.sendFlying = function(mesh, options, callback) {
  if (!mesh) {
    if (callback) callback();
    return;
  }

  var delta = options.delta || {x: 1.2 * (Math.random() - 0.5), y: Math.random() * 0.2, z: -2 * (Math.random() + 0.5)};

  var count = 0;
  var interval = setInterval(function() {
    mesh.position.x += delta.x;
    mesh.position.y += delta.y;
    mesh.position.z += delta.z;
    mesh.__dirtyPosition = true;

    count += 1;
    if (count >= options.steps) {
      clearInterval(interval);
      if (callback) callback();
    }
  }, 25);
};

},{}],18:[function(require,module,exports){

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

/* OBJECTS */

module.exports.PHONE = pre('phone.js');

/* GARBAGE */

module.exports.GARBAGE_CAN = pre('garbage_can.json');
module.exports.METAL_TRASH_CAN = pre('metal_trash_can.json');
module.exports.LOW_POLY_TRASH_CAN = pre('low_poly_trash_can.json');
module.exports.TRASH_ORANGE = pre('trash_orange.json');
module.exports.TRASH_BANANA = pre('trash_banana.json');
module.exports.CATERPILLAR = pre('caterpillar.json');

/* FUNCTIONS */

var loader = new THREE.JSONLoader();
var cache = {};
module.exports.loadModel = function(modelName, callback) {
  if (cache[modelName]) {
    var geo = cache[modelName].geometry.clone();
    var materials = cache[modelName].materials;
    var clonedMaterials = [];
    materials.forEach(function(material) {
      clonedMaterials.push(material.clone());
    });
    if (callback) callback(geo, clonedMaterials);
    return;
  }

  loader.load(modelName, function (geometry, materials) {
    cache[modelName] = {geometry: geometry, materials: materials};
    if (callback) callback(geometry, materials);
  });
};

},{}],19:[function(require,module,exports){

module.exports.create = function() {
  var geometry = new THREE.BoxGeometry(8, 3.5, 0.8);
  var material = new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture('/media/textures/money.jpg')
  });
  return new THREE.Mesh(geometry, material);
};

},{}],20:[function(require,module,exports){

var JobBooth = require('./job-booth');

var companies = module.exports.companies = [
  'addthis',
  'vsco',
  'venmo',
  'uber',
  'spotify',
  'buzzfeed',
  'nestle',
  'jpmorgan',
  'linkedin',
  'forbes',
  'microsoft',
  'apple',
  'facebook',
  'google',
  'millersfantasy'
];

module.exports.recruiterCount = companies.length;

module.exports.getPosterImage = function(company) {
  return '/media/posters/' + company + '.jpg';
};

module.exports.getRecruiterImage = function(company) {
  return '/media/recruiters/' + company + '.jpg';
};

module.exports.getCompanyShirt = function(company) {
  return '/media/shirts/' + company + '.jpg';
};

var riddles = {};

module.exports.actionIsSuccessful = function(action, boothIndex) {
  var company = companies[boothIndex];
  console.log(company);
  if (company === 'vsco' || company === 'facebook') {
    return action === 'spit';
  }
  if (company === 'venmo') {
    return action === 'bribe';
  }
  if (company === 'uber' || company === 'jpmorgan') {
    return action === 'kneel';
  }
  if (company === 'apple') {
    return action === 'handshake';
  }

  return Math.random() < 0.5;
};

module.exports.distanceBetweenBooths = 350;
module.exports.closeToRecruiterDistance = 70;

module.exports.createBooths = function(scene) {
  var booths = [];

  for (var i = 0; i < module.exports.recruiterCount; i++) {
    var company = companies[i];
    var side = i % 2 === 0 ? 'left' : 'right';
    var booth = new JobBooth(
      {
        position: {x: (side === 'left' ? -12 : 12), y: 10, z: (-i * module.exports.distanceBetweenBooths) - i * 9.5},
        scale: 1.5 + 1.75 * i,
        riddle: riddles[company],
        faceImageUrl: module.exports.getRecruiterImage(company)
      },
      module.exports.getPosterImage(company),
      side
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

},{"./job-booth":13}],21:[function(require,module,exports){

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
  this.faceMaterial = new THREE.MeshBasicMaterial({});
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
    self.updateFaceImage(self.faceImageUrl);

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
  this.faceImageUrl = image;

  var texture = THREE.ImageUtils.loadTexture(image);
  texture.needsUpdate = true;
  this.faceMaterial.map = texture;
  this.faceMaterial.needsUpdate = true;
};

},{"./model_names":18}],22:[function(require,module,exports){

var kt = require('./lib/kutility');
var distanceUtil = require('./distance-util');
var Cellphone = require('./cellphone');
var Money = require('./money');
var Spit = require('./spit');

module.exports.spitToRecruiter = function(scene, booths, currentBooth, kevinRonald, callback) {
  var spit = new Spit();
  spit.addTo(scene);

  spit.mesh.position.copy(kevinRonald.head.mesh.position);
  spit.mesh.position.z -= 1;

  var recruiterPos = booths[currentBooth].recruiter.faceMesh.position;
  var target = {x: recruiterPos.x + (currentBooth % 2 === 0 ? -5 : 5), y: recruiterPos.y - 2, z: recruiterPos.z - 20};
  var spitInterval = setInterval(function() {
    distanceUtil.moveTowardsTarget(spit.mesh.position, target, {x: 0.75, y: 0.25, z: 1.4});
    if (distanceUtil.distanceMagnitude(spit.mesh.position, target) <= 2) {
      clearInterval(spitInterval);
      scene.remove(spit.mesh);
      callback();
    }
  }, 30);
};

module.exports.shakeHandsWithRecruiter = function(scene, booths, currentBooth, kevinRonald, callback) {
  var hand = currentBooth % 2 === 0 ? kevinRonald.leftArm : kevinRonald.rightArm;
  hand.rotate(Math.PI / 2, 0, 0);
  hand.move(0, 0, -7);
  cycle();

  var count = 0;
  function cycle() {
    fullShake(function() {
      count += 1;
      if (count > 4) {
        hand.rotate(-Math.PI / 2, 0 , 0);
        hand.move(0, 0, 7);
        callback();
      } else {
        cycle();
      }
    });
  }

  function fullShake(callback) {
    moveDown(function() {
      moveUp(function() {
        moveDown(function() {
          callback();
        });
      });
    });
  }

  function moveDown(callback, limit) {
    if (!limit) limit = 12;
    var downCount = 0;
    var interval = setInterval(function() {
      hand.move(0, -1.25, 0);
      downCount += 1;
      if (downCount >= limit) {
        clearInterval(interval);
        callback();
      }
    }, 30);
  }

  function moveUp(callback, limit) {
    if (!limit) limit = 24;
    var upCount = 0;
    var interval = setInterval(function() {
      hand.move(0, 1.25, 0);
      upCount += 1;
      if (upCount >= limit) {
        clearInterval(interval);
        callback();
      }
    }, 30);
  }
};

module.exports.kneelToRecruiter = function(scene, booths, currentBooth, kevinRonald, callback) {
  var rotIncrement = 0.05;
  var headYIncrement = 0.75;
  var headZIncrement = 1.25;

  var head = kevinRonald.head;
  var kneelParts = [head, kevinRonald.torso, kevinRonald.leftArm, kevinRonald.rightArm];

  cycle();

  var count = 0;
  function cycle() {
    fullKneel(function() {
      count += 1;
      if (count >= 3) {
        callback();
      } else {
        cycle();
      }
    });
  }

  function fullKneel(cb) {
    kneelDown(function() {
      comeBackUp(function() {
        cb();
      });
    });
  }

  function kneelDown(cb) {
    var totalRot = 0;
    var interval = setInterval(function() {
      for (var i = 0; i < kneelParts.length; i++) {
        kneelParts[i].rotate(-rotIncrement, 0, 0);
      }
      head.move(0, -headYIncrement, -headZIncrement);

      totalRot -= rotIncrement;
      if (totalRot <= -Math.PI / 2) {
        clearInterval(interval);
        cb();
      }
    }, 30);
  }

  function comeBackUp(cb) {
    var totalRot = 0;
    var interval = setInterval(function() {
      for (var i = 0; i < kneelParts.length; i++) {
        kneelParts[i].rotate(rotIncrement, 0, 0);
      }
      head.move(0, headYIncrement, headZIncrement);

      totalRot += rotIncrement;
      if (totalRot >= Math.PI / 2) {
        clearInterval(interval);
        cb();
      }
    }, 30);
  }
};

module.exports.bribeRecruiter = function(scene, booths, currentBooth, kevinRonald, callback) {
  var recruiterPos = booths[currentBooth].recruiter.faceMesh.position;
  var xOffset = currentBooth % 2 === 0 ? -20 : 14;
  var torsoPos = kevinRonald.torso.mesh.position;

  var moneys = [];
  var phone = new Cellphone({x: torsoPos.x + currentBooth % 2 === 0 ? 65 : 0, y: recruiterPos.y + 20, z: recruiterPos.z});
  phone.addTo(scene, function() {
    addMoneys();
    rainMoneys(function() {
      removeMoneys();
      phone.removeFrom(scene);
      callback();
    });
  });

  function addMoneys() {
    for (var i = 0; i < 20; i++) {
      var money = Money.create();
      money.position.set(recruiterPos.x + xOffset + kt.randInt(15, -15), recruiterPos.y + kt.randInt(20, 8), recruiterPos.z + kt.randInt(80, 40));
      scene.add(money);
      moneys.push(money);
    }
  }

  function rainMoneys(cb) {
    var intCount = 0;
    var moneyInterval = setInterval(function() {
      for (var i = 0; i < moneys.length; i++) {
        moneys[i].translateY(-0.1);
        moneys[i].translateZ(-0.4);
      }
      phone.move(Math.random() - 0.5, 0, 0);
      intCount += 1;
      if (intCount > 250) {
        clearInterval(moneyInterval);
        cb();
      }
    }, 30);
  }

  function removeMoneys() {
    for (var i = 0; i < moneys.length; i++) {
      scene.remove(moneys[i]);
    }
  }
};

},{"./cellphone":4,"./distance-util":7,"./lib/kutility":15,"./money":19,"./spit":28}],23:[function(require,module,exports){
var kt = require('./lib/kutility');

module.exports = RonaldText;

function negrand(scalar) {
  return (Math.random() - 0.5) * scalar;
}

function randcolor() {
  var r = kt.randInt(255);
  var g = kt.randInt(255);
  var b = kt.randInt(255);
  return new THREE.Color(r, g, b);
}

function RonaldText(config) {
  if (!config) config = {};

  this.phrase = config.phrase || 'SUCCESS';
  this.position = config.position || {x: 8, y: 25, z: 20};
  this.velocity = config.velocity || {x: 0, y: 0, z: 0};
  this.decay = config.decay || 5000;
  this.color = config.color || randcolor();

  this.geometry = new THREE.TextGeometry(this.phrase, {
    size: 2 + negrand(1),
    height: 0.01,
    curveSegments: 1,
    font: "droid sans",
    bevelThickness: 0.35,
    bevelSize: 0.15,
    bevelSegments: 1,
    bevelEnabled: true
  });

  this.material = Physijs.createMaterial(
    new THREE.MeshBasicMaterial({
      ambient: this.color,
      color: this.color,
      emissive: this.color,
      side: THREE.DoubleSide
    }),
    0.4, // low friction
    0.6 // high restitution
  );

  this.mesh = new Physijs.BoxMesh(this.geometry, this.material);
  this.mesh.castShadow = this.mesh.receiveShadow = true;
}

RonaldText.prototype.move = function(x, y, z) {
  if (!this.mesh) return;

  this.mesh.position.x += x;
  this.mesh.position.y += y;
  this.mesh.position.z += z;

  this.mesh.__dirtyPosition = true;
};

RonaldText.prototype.rotate = function(rx, ry, rz) {
  if (!this.mesh) return;

  this.mesh.rotation.x += rx;
  this.mesh.rotation.y += ry;
  this.mesh.rotation.z += rz;

  this.mesh.__dirtyRotation = true;
};

RonaldText.prototype.moveTo = function(x, y, z) {
  if (!this.mesh) return;

  this.mesh.position.set(x, y, z);

  this.mesh.__dirtyPosition = true;
};

RonaldText.prototype.render = function() {
  this.rotate(0, 0.05, 0);
};

RonaldText.prototype.addTo = function(scene, addCallback, decayCallback) {
  scene.add(this.mesh);

  this.moveTo(this.position.x, this.position.y, this.position.z);
  this.mesh.setLinearVelocity(this.velocity);

  if (addCallback) addCallback();

  var self = this;
  setTimeout(function() {
    scene.remove(self.mesh);
    if (decayCallback) decayCallback();
  }, this.decay);
};

},{"./lib/kutility":15}],24:[function(require,module,exports){

module.exports.flash = function(text, timeout) {
  if (!text) return;
  if (!timeout) timeout = 275;

  $('#flash').text(text);
  $('#flash').show();
  setTimeout(function() {
    $('#flash').hide();
  }, timeout);
};

module.exports.fadeOverlay = function(fadein, callback, color, time) {
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
};

},{}],25:[function(require,module,exports){

module.exports = Scale;

function Scale(options) {
  if (!options) options = {};

  var material = new THREE.MeshBasicMaterial({
    color: options.color || 0xe9dc45
  });
  var geometry = new THREE.BoxGeometry(210, 5, 15);
  var scale = new THREE.Mesh(geometry, material);

  var baseMaterial = new THREE.MeshBasicMaterial({
    color: options.baseColor || 0x000000
  });
  var baseGeometry = new THREE.TetrahedronGeometry(10);
  var baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);

  scale.add(baseMesh);
  baseMesh.position.set(0, -10, 0);
  baseMesh.rotation.z -= Math.PI / 4;

  this.mesh = scale;
  this.baseMesh = baseMesh;
  this.leftObject = null;
  this.rightObject = null;
}

Scale.prototype.addTo = function(scene) {
  scene.add(this.mesh);
};

Scale.prototype.setLeftObject = function(obj) {
  if (obj) {
    this.mesh.add(obj);
    obj.position.set(-105, 5, 0);
  }

  this.leftObject = obj;
  this.didSetObject();
};

Scale.prototype.setRightObject = function(obj) {
  if (obj) {
    this.mesh.add(obj);
    obj.position.set(105, 5, 0);
  }

  this.rightObject = obj;
  this.didSetObject();
};

Scale.prototype.didSetObject = function() {
  var leftMass = this.leftObject ? this.leftObject.mass : -Math.random() * 1000 - 1000;
  var rightMass = this.rightObject ? this.rightObject.mass : -Math.random() * 1000 - 1000;
  this.updateForMasses(leftMass, rightMass);
};

Scale.prototype.numberOfObjects = function() {
  var count = 0;
  if (this.leftObject) count += 1;
  if (this.rightObject) count += 1;
  return count;
};

Scale.prototype.missingObject = function() {
  if (this.numberOfObjects() === 2) {
    return 'both';
  }

  if (!this.leftObject) {
    return 'left';
  }
  else if (!this.rightObject) {
    return 'right';
  }

  return null;
};

Scale.prototype.lightestObject = function() {
  if (this.leftObject.mass < this.rightObject.mass) {
    return this.leftObject;
  }

  return this.rightObject;
};

Scale.prototype.clearLightestObject = function(callback) {
  if (this.numberOfObjects() !== 2) {
    callback(null);
    return;
  }

  var self = this;
  var obj = this.lightestObject();
  var isLeft = obj === this.leftObject;
  var flame = addFlame();

  var alphaInterval = setInterval(function() {
    obj.material.opacity -= 0.01;
    flame.material.opacity += 0.01;
    if (obj.material.opacity <= 0.18) {
      clearInterval(alphaInterval);
      igniteFlame();
    }
  }, 20);

  function igniteFlame() {
    var interval = setInterval(function() {
      flame.material.opacity -= 0.0075;
      flame.position.x += (Math.random() - 0.5);
      flame.position.y += (Math.random() - 0.5);
      flame.position.z += (Math.random() - 0.5);

      if (flame.material.opacity <= 0.12) {
        clearInterval(interval);
        self.mesh.remove(flame);
        if (isLeft) {
          self.setLeftObject(null);
        } else {
          self.setRightObject(null);
        }
        callback(obj);
      }
    }, 20);
  }

  function addFlame() {
    var flame = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture('/media/textures/flame.jpg'),
        transparent: true,
        opacity: 0.0
      })
    );
    self.mesh.add(flame);

    flame.position.copy(obj.position);
    flame.position.z -= 5;

    return flame;
  }
};

Scale.prototype.updateForMasses = function(leftMass, rightMass) {
  if (leftMass < rightMass) {
    this.rotateAnimated(-Math.PI / 12);
  }
  else if (leftMass > rightMass) {
    this.rotateAnimated(Math.PI / 12);
  }
  else {
    this.rotateAnimated(0);
  }
};

Scale.prototype.rotateAnimated = function(rz, steps) {
  if (!steps) steps = 60;

  var mesh = this.mesh;
  var diff = (rz - mesh.rotation.z) / steps;

  var count = 0;
  rot();
  function rot() {
    if (count < steps) {
      mesh.rotation.z += diff;
      count += 1;
      setTimeout(rot, 20);
    }
  }
};

},{}],26:[function(require,module,exports){

module.exports.clearScene = function(scene, meshes, exemptions) {
  if (!meshes) meshes = scene.children;

  for (var i = meshes.length - 1; i >= 0; i--) {
    var obj = meshes[ i ];
    if (exemptions.indexOf(obj) === -1) {
      scene.remove(obj);
    }
  }
};

},{}],27:[function(require,module,exports){

var kt = require('./lib/kutility');

var girlRoomPath = '/images/girl_room.jpg';

function cubify(url) {
  return [url, url, url, url, url, url];
}

function makeCubemap(textureURL, repeatX, repeatY) {
  if (!textureURL) return;
  if (!repeatX) repeatX = 4;
  if (!repeatY) repeatY = 4;

  var textureCube = cubify(textureURL);

  var cubemap = THREE.ImageUtils.loadTextureCube(textureCube); // load textures
  cubemap.format = THREE.RGBFormat;
  cubemap.wrapS = THREE.RepeatWrapping;
  cubemap.wrapT = THREE.RepeatWrapping;
  cubemap.repeat.set(repeatX, repeatY);

  return cubemap;
}

function makeShader(cubemap) {
  var shader = THREE.ShaderLib['cube']; // init cube shader from built-in lib
  shader.uniforms['tCube'].value = cubemap; // apply textures to shader
  return shader;
}

function skyboxMaterial(textureURL) {
  var cubemap = makeCubemap(textureURL);
  var shader = makeShader(cubemap);

  return new THREE.ShaderMaterial({
    fragmentShader: shader.fragmentShader,
    vertexShader: shader.vertexShader,
    uniforms: shader.uniforms,
    depthWrite: false,
    side: THREE.BackSide,
    opacity: 0.5
  });
}

module.exports.create = function(size, textureURL) {
  if (!size) size = {x: 5000, y: 5000, z: 5000};
  if (!textureURL) textureURL = girlRoomPath;

  var geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
  var material = skyboxMaterial(textureURL);
  return new THREE.Mesh(geometry, material);
};

module.exports.blocker = function(size) {
  if (!size) size = {x: 19500, y: 19500, z: 19500};

  var geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
  var material = new THREE.MeshBasicMaterial({
      color: 0x000000
    , side: THREE.DoubleSide
    , opacity: 1.0
    , transparent: true
  });
  return new THREE.Mesh(geometry, material);
};

},{"./lib/kutility":15}],28:[function(require,module,exports){

module.exports = Spit;

function Spit() {
  this.mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1.5),
    new THREE.MeshBasicMaterial({color: 0x8888ff})
  );

  var leftSpit = new THREE.Mesh(
    new THREE.SphereGeometry(1),
    new THREE.MeshBasicMaterial({color: 0x00bbff})
  );
  this.mesh.add(leftSpit);
  leftSpit.position.set(-5, 1, 0);

  var rightSpit = new THREE.Mesh(
    new THREE.SphereGeometry(0.75),
    new THREE.MeshBasicMaterial({color: 0x0000ff})
  );
  this.mesh.add(rightSpit);
  rightSpit.position.set(4, -2, 0);
}

Spit.prototype.addTo = function(scene) {
  scene.add(this.mesh);
};

},{}],29:[function(require,module,exports){

var BodyPart = require('./bodypart');
var recruiterManager = require('./recruiter-manager');

module.exports = Shirt;

function Shirt(startPos, scale, company) {
  if (!startPos) startPos = {x: 0, y: 0, z: 0};
  this.startX = startPos.x;
  this.startY = startPos.y;
  this.startZ = startPos.z;

  this.scale = scale || 24;

  this.company = company || 'facebook';
}

Shirt.prototype = Object.create(BodyPart.prototype);

Shirt.prototype.createMesh = function(callback) {
  if (this.mass === undefined) {
    this.mass = Math.random() * 20 + 5;
  }

  var texture = THREE.ImageUtils.loadTexture(recruiterManager.getCompanyShirt(this.company));
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  this.material = Physijs.createMaterial(new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 1.0
  }), 0.4, 0.6);
  this.geometry = new THREE.BoxGeometry(1.8, 2.8, 0.25);
  this.mesh = new Physijs.ConvexMesh(this.geometry, this.material, this.mass);

  callback();
};

},{"./bodypart":3,"./recruiter-manager":20}]},{},[16]);
