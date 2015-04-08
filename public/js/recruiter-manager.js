
var JobBooth = require('./job-booth');

var companies = module.exports.companies = [
  'linkedin',
  'buzzfeed',
  'jpmorgan',
  'vsco',
  'venmo',
  'addthis',
  'google',
  'millersfantasy',
  'facebook',
  'uber',
  'spotify',
  'apple',
  'microsoft',
  'nestle',
  'forbes'
];

module.exports.recruiterCount = companies.length;

module.exports.getPosterImage = function(company) {
  return '/media/posters/' + company + '.jpg';
};

module.exports.getRecruiterImage = function(company) {
  return '/media/recruiters/' + company + '.jpg';
};

module.exports.getCompanyShirt = function(company) {
  return '/media/tshirts/' + company + '.jpg';
};

var riddles = {};

module.exports.actionIsSuccessful = function(action, boothIndex) {
  return Math.random() < 0.5;
};

module.exports.distanceBetweenBooths = 400;
module.exports.closeToRecruiterDistance = 95;

module.exports.createBooths = function(scene) {
  var booths = [];

  for (var i = 0; i < module.exports.recruiterCount; i++) {
    var company = companies[i];
    var side = i % 2 === 0 ? 'left' : 'right';
    var booth = new JobBooth(
      {
        position: {x: (side === 'left' ? -12 : 12), y: 10, z: -i * module.exports.distanceBetweenBooths},
        scale: 1.5 + 2.5 * i,
        riddle: riddles[company],
        faceImageUrl: module.exports.getRecruiterImage(company)
      },
      module.exports.getPosterImage(company),
      side
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
