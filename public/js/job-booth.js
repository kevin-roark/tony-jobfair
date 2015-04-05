
var Recruiter = require('./recruiter');

function JobBooth(recruiterOptions, posterURL) {
  this.recruiter = new Recruiter(recruiterOptions);

  this.desk = makeDesk();

  this.poster = makePoster(posterURL);
}

JobBooth.prototype.addTo = function(scene) {
  var self = this;
  this.recruiter.addTo(scene, function() {
    self.recruiter.skinnedMesh.add(self.desk);
    self.desk.position.set(-15, 0, -4);

    self.recruiter.skinnedMesh.add(self.poster);
    self.poster.position.set(-15, 7, -4);

    self.meshes = [self.desk, self.poster, self.recruiter.skinnedMesh, self.recruiter.faceMesh];
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
  var geometry = new THREE.BoxGeometry(5, 7, 1);
  var poster = new THREE.Mesh(geometry, material);
  return poster;
}
