

module.exports.sendFlying = function(mesh, options, callback) {
  if (!mesh) {
    if (callback) callback();
    return;
  }

  var delta = options.delta || {x: 1.2 * (Math.random() - 0.5), y: Math.random() * 0.2, z: -2 * (Math.random() + 0.5)};

  var count = 0;
  var interval = setInterval(function() {
    mesh.position.x += delta.x;
    mesh.position.y += delta.y;
    mesh.position.z += delta.z;
    mesh.__dirtyPosition = true;

    count += 1;
    if (count >= options.steps) {
      clearInterval(interval);
      if (callback) callback();
    }
  }, 25);
};
