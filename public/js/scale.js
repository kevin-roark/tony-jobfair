
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
}

Scale.prototype.addTo = function(scene) {
  scene.add(this.mesh);
};

Scale.prototype.updateForMasses = function(leftMess, rightMass) {
  if (leftMess < rightMass) {
    this.rotateAnimated(-Math.PI / 10);
  }
  else if (leftMess > rightMass) {
    this.rotateAnimated(Math.PI / 10);
  }
  else {
    this.rotateAnimated(0);
  }
};

Scale.prototype.rotateAnimated = function(rz, steps) {
  if (!steps) steps = 60;

  var mesh = this.mesh;
  var diff = (rz - mesh.rotation.z) / steps;
  if (diff === 0) return;

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
