
var JobBooth = require('./job-booth');

var companies = module.exports.companies = [
  'addthis',
  'vsco',
  'venmo',
  'uber',
  'spotify',
  'buzzfeed',
  'nestle',
  'jpmorgan',
  'linkedin',
  'forbes',
  'microsoft',
  'apple',
  'facebook',
  'google',
  'millersfantasy'
];

module.exports.recruiterCount = companies.length;

module.exports.getPosterImage = function(company) {
  return '/media/posters/' + company + '.jpg';
};

module.exports.getRecruiterImage = function(company) {
  return '/media/recruiters/' + company + '.jpg';
};

module.exports.getCompanyShirt = function(company) {
  return '/media/shirts/' + company + '.jpg';
};

var riddles = {};

module.exports.actionIsSuccessful = function(action, boothIndex) {
  var company = companies[boothIndex];
  console.log(company);
  if (company === 'vsco' || company === 'facebook') {
    return action === 'spit';
  }
  if (company === 'venmo') {
    return action === 'bribe';
  }
  if (company === 'uber' || company === 'jpmorgan') {
    return action === 'kneel';
  }
  if (company === 'apple') {
    return action === 'handshake';
  }
  if (company === 'millersfantasy') {
    return true;
  }

  return Math.random() < 0.5;
};

module.exports.distanceBetweenBooths = 350;
module.exports.closeToRecruiterDistance = 70;

module.exports.createBooths = function(scene) {
  var booths = [];

  for (var i = 0; i < module.exports.recruiterCount; i++) {
    var company = companies[i];
    var side = i % 2 === 0 ? 'left' : 'right';

    var z = (i === 0 ? 45 : (-i * module.exports.distanceBetweenBooths) - i * 9.5 );
    var booth = new JobBooth(
      {
        position: {x: (side === 'left' ? -12 : 12), y: 10, z: z},
        scale: 1.5 + 1.75 * i,
        riddle: riddles[company],
        faceImageUrl: module.exports.getRecruiterImage(company)
      },
      module.exports.getPosterImage(company),
      side
    );

    booth.addTo(scene, (i === 0 ? -50 : null));
    booths.push(booth);
  }

  return booths;
};

module.exports.boothIndexForZ = function(z) {
  var pos = Math.abs(z);
  return Math.floor(Math.max(pos - module.exports.closeToRecruiterDistance, 0) / module.exports.distanceBetweenBooths);
};
