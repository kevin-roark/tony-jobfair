
module.exports.create = function() {
  var geometry = new THREE.BoxGeometry(8, 3.5, 0.8);
  var material = new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture('/media/textures/money.jpg')
  });
  return new THREE.Mesh(geometry, material);
};
