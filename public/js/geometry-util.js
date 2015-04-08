

module.exports.calculateGeometryThings = function(geometry) {
  geometry.computeFaceNormals();
  geometry.computeVertexNormals();
};
