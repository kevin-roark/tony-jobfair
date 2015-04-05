
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

module.exports.distanceBetweenBooths = 50;

module.exports.createBooths = function(scene) {
  var booths = [];

  for (var i = 0; i < module.exports.recruiterCount; i++) {
    var booth = new JobBooth(
      {
        position: {x: -5, y: 0, z: -i * module.exports.distanceBetweenBooths},
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
  return Math.floor(Math.max(pos - 5, 0) / module.exports.distanceBetweenBooths);
};
