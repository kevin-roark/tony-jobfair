
var JobBooth = require('./job-booth');

module.exports.recruiterCount = 10;

var riddles = [
  '',
  '',
  '',
];

var posterImages = [
  '/images/linkedin.jpg',
  '/images/linkedin.jpg',
  '/images/linkedin.jpg',
  '/images/linkedin.jpg',
  '/images/linkedin.jpg',
  '/images/linkedin.jpg',
  '/images/linkedin.jpg',
  '/images/linkedin.jpg',
  '/images/linkedin.jpg',
  '/images/linkedin.jpg'
];

module.exports.actionIsSuccessful = function(action, boothIndex) {
  return Math.random() < 0.5;
};

module.exports.distanceBetweenBooths = 200;
module.exports.closeToRecruiterDistance = 90;

module.exports.createBooths = function(scene) {
  var booths = [];

  for (var i = 0; i < module.exports.recruiterCount; i++) {
    var booth = new JobBooth(
      {
        position: {x: -6, y: 10, z: -i * module.exports.distanceBetweenBooths},
        riddle: riddles[i]
      },
      posterImages[i]
    );

    booth.addTo(scene);
    booths.push(booth);
  }

  return booths;
};

module.exports.boothIndexForZ = function(z) {
  var pos = Math.abs(z);
  return Math.floor(Math.max(pos - module.exports.closeToRecruiterDistance, 0) / module.exports.distanceBetweenBooths);
};
