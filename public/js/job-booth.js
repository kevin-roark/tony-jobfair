
var Recruiter = require('./recruiter');

module.exports = JobBooth;

function JobBooth(recruiterOptions, posterURL, side) {
  this.recruiter = new Recruiter(recruiterOptions);
  this.recruiterScale = this.recruiter.scale;

  this.side = side || 'left';

  this.desk = makeDesk();

  this.poster = makePoster(posterURL);
}

JobBooth.prototype.addTo = function(scene, deskOffset) {
  var self = this;
  this.recruiter.addTo(scene, function() {
    var rotation = self.side === 'left' ? Math.PI / 6 : - Math.PI / 6;
    self.recruiter.rotate(0, rotation, 0);

    var recruiterPos = self.recruiter.skinnedMesh.position;

    if (!deskOffset) {
      deskOffset = self.recruiterScale * 4;
    }

    scene.add(self.desk);
    self.desk.position.set(recruiterPos.x + (self.side === 'left' ? -17.5 : 17.5), 3, recruiterPos.z + deskOffset);
    self.desk.rotation.y = rotation / 1.75;

    self.desk.add(self.poster);
    self.poster.position.set(0, 18, 0);

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
  var geometry = new THREE.BoxGeometry(30, 30, 1);
  var poster = new THREE.Mesh(geometry, material);
  return poster;
}
