
var geometryUtil = require('./geometry-util');

module.exports.wall = function(side) {
  var wallGeometry = side? new THREE.PlaneGeometry(6000, 100) : new THREE.PlaneGeometry(160, 100);
  var wallTexture = THREE.ImageUtils.loadTexture('/media/textures/wood.jpg');
  wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
  wallTexture.repeat.set(8, 8);
  var wallMaterial = new THREE.MeshBasicMaterial({
    map: wallTexture,
    side: THREE.DoubleSide
  });
  var wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
  if (side) {
    wallMesh.rotation.y = Math.PI / 2;
  }
  return wallMesh;
};

module.exports.ground = function() {
  var groundTexture = THREE.ImageUtils.loadTexture('/media/textures/marble.jpg');
  groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(4, 75);
  var groundMaterial = new THREE.MeshBasicMaterial({
    map: groundTexture,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.3
  });

  var groundGeometry = new THREE.PlaneGeometry(160, 6000);
  geometryUtil.calculateGeometryThings(groundGeometry);

  var ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  return ground;
};

module.exports.ceiling = function() {
  var ceilingTexture = THREE.ImageUtils.loadTexture('/media/textures/chapel.jpg');
  ceilingTexture.wrapS = ceilingTexture.wrapT = THREE.RepeatWrapping;
  ceilingTexture.repeat.set(1, 16);
  var ceilingMaterial = new THREE.MeshBasicMaterial({
    map: ceilingTexture,
    side: THREE.DoubleSide
  });

  var ceilingGeometry = new THREE.PlaneGeometry(160, 6000);
  geometryUtil.calculateGeometryThings(ceilingGeometry);

  var ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial, 0);
  ceiling.rotation.x = -Math.PI / 2;
  return ceiling;
};
