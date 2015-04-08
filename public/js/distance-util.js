

module.exports.nearest = function(object, targetObjects) {
  var nearest;
  var minDist = 1000000000000;

  for (var i = 0; i < targetObjects.length; i++) {
    var target = targetObjects[i];
    var dist = distanceMagnitude(object.position, target.position);
    if (dist < minDist) {
      minDist = dist;
      nearest = target;
    }
  }

  return {object: nearest, distance: minDist};
};

var distanceMagnitude = module.exports.distanceMagnitude = function(pos1, pos2) {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y) + Math.abs(pos1.z - pos2.z);
};

module.exports.middlePosition = function(p1, p2) {
  return {x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2, z: (p1.z + p2.z) / 2};
};

module.exports.moveTowardsTarget = function(pos, target, amt) {
  if (pos.x < target.x) {
    pos.x += amt.x;
  } else if (pos.x > target.x) {
    pos.x -= amt.x;
  }

  if (pos.y < target.y) {
    pos.y += amt.y;
  } else if (pos.y > target.y) {
    pos.y -= amt.y;
  }

  if (pos.z < target.z) {
    pos.z += amt.z;
  } else if (pos.z > target.z) {
    pos.z -= amt.z;
  }
};

module.exports.positionDeltaIncrement = function(pos1, pos2, steps) {
  return {
    x: (pos2.x - pos1.x) / steps,
    y: (pos2.y - pos1.y) / steps,
    z: (pos2.z - pos1.z) / steps
  };
};
