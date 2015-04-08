
module.exports.clearScene = function(scene, meshes, exemptions) {
  if (!meshes) meshes = scene.children;

  for (var i = meshes.length - 1; i >= 0; i--) {
    var obj = meshes[ i ];
    if (exemptions.indexOf(obj) === -1) {
      scene.remove(obj);
    }
  }
};
