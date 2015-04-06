
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
