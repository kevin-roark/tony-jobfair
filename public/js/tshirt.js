
var BodyPart = require('./bodypart');
var recruiterManager = require('./recruiter-manager');

module.exports = Shirt;

function Shirt(startPos, scale, company) {
  if (!startPos) startPos = {x: 0, y: 0, z: 0};
  this.startX = startPos.x;
  this.startY = startPos.y;
  this.startZ = startPos.z;

  this.scale = scale || 2;

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

  var material = Physijs.createMaterial(new THREE.MeshBasicMaterial({map: texture}), 0.4, 0.6);
  var geometry = new THREE.BoxGeometry(1, 2.5, 0.25);
  var mesh = new Physijs.ConvexMesh(geometry, material, this.mass);

  this.mesh = mesh;
  callback();
};
