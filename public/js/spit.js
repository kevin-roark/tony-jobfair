
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