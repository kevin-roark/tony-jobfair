
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
