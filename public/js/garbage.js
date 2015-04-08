
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
