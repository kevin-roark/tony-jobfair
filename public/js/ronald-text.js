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
