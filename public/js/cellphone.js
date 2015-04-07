
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
