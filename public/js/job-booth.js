
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
    self.desk.position.set(recruiterPos.x + (self.side === 'left' ? -15 : 15), 5, recruiterPos.z + self.recruiterScale * 1.5);
    self.desk.rotation.y = rotation;

    self.desk.add(self.poster);
    self.poster.position.set(0, 14, 0);
    self.poster.rotation.y = rotation;

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
  var geometry = new THREE.BoxGeometry(20, 20, 1);
  var poster = new THREE.Mesh(geometry, material);
  return poster;
}
