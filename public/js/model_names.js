
var prefix = '/js/models/';

function pre(text) {
  return prefix + text;
}

/* LEGS */

module.exports.LOWPOLY_LEG = pre('low_poly_leg.js');

/* HEADS */

module.exports.LOWPOLY_HEAD = pre('low_poly_head.js');

/* ARMS */

module.exports.FOOTBALL_ARM = pre('football_arm.js');

module.exports.LOWPOLY_ARM = pre('low_poly_arm.js');

/* BODIES */

module.exports.FOOTBALL_TORSO = pre('football_torso.js');

module.exports.LOWPOLY_TORSO = pre('low_poly_torso.js');

module.exports.MALE_BODY = pre('body.js');

/* HANDS */

module.exports.FOOTBALL_HAND = pre('football_hand.js');

module.exports.BASE_HAND = pre('base_hand.js');

/* FEET */

module.exports.FOOTBALL_FOOT = pre('football_foot.js');

/* HUMANS */

module.exports.TWEEN_GIRL = pre('manga.js');
module.exports.BOY = pre('chubby.js');

/* OBJECTS */

module.exports.PHONE = pre('phone.js');

/* GARBAGE */

module.exports.GARBAGE_CAN = pre('garbage_can.json');
module.exports.METAL_TRASH_CAN = pre('metal_trash_can.json');
module.exports.LOW_POLY_TRASH_CAN = pre('low_poly_trash_can.json');
module.exports.TRASH_ORANGE = pre('trash_orange.json');
module.exports.TRASH_BANANA = pre('trash_banana.json');

/* FUNCTIONS */

var loader = new THREE.JSONLoader();
var cache = {};
module.exports.loadModel = function(modelName, callback) {
  if (cache[modelName]) {
    var geo = cache[modelName].geometry.clone();
    var materials = cache[modelName].materials;
    var clonedMaterials = [];
    materials.forEach(function(material) {
      clonedMaterials.push(material.clone());
    });
    if (callback) callback(geo, clonedMaterials);
    return;
  }

  loader.load(modelName, function (geometry, materials) {
    cache[modelName] = {geometry: geometry, materials: materials};
    if (callback) callback(geometry, materials);
  });
};
