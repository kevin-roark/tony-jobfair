
module.exports = Scale;

function Scale(options) {
  if (!options) options = {};

  var material = new THREE.MeshBasicMaterial({
    color: options.color || 0xe9dc45
  });
  var geometry = new THREE.BoxGeometry(210, 5, 15);
  var scale = new THREE.Mesh(geometry, material);

  var baseMaterial = new THREE.MeshBasicMaterial({
    color: options.baseColor || 0x000000
  });
  var baseGeometry = new THREE.TetrahedronGeometry(10);
  var baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);

  scale.add(baseMesh);
  baseMesh.position.set(0, -10, 0);
  baseMesh.rotation.z -= Math.PI / 4;

  this.mesh = scale;
  this.baseMesh = baseMesh;
  this.leftObject = null;
  this.rightObject = null;
}

Scale.prototype.addTo = function(scene) {
  scene.add(this.mesh);
};

Scale.prototype.setLeftObject = function(obj) {
  if (obj) {
    this.mesh.add(obj);
    obj.position.set(-105, 5, 0);
  }

  this.leftObject = obj;
  this.didSetObject();
};

Scale.prototype.setRightObject = function(obj) {
  if (obj) {
    this.mesh.add(obj);
    obj.position.set(105, 5, 0);
  }

  this.rightObject = obj;
  this.didSetObject();
};

Scale.prototype.didSetObject = function() {
  var leftMass = this.leftObject ? this.leftObject.mass : -Math.random() * 1000 - 1000;
  var rightMass = this.rightObject ? this.rightObject.mass : -Math.random() * 1000 - 1000;
  this.updateForMasses(leftMass, rightMass);
};

Scale.prototype.numberOfObjects = function() {
  var count = 0;
  if (this.leftObject) count += 1;
  if (this.rightObject) count += 1;
  return count;
};

Scale.prototype.missingObject = function() {
  if (this.numberOfObjects() === 2) {
    return 'both';
  }

  if (!this.leftObject) {
    return 'left';
  }
  else if (!this.rightObject) {
    return 'right';
  }

  return null;
};

Scale.prototype.lightestObject = function() {
  if (this.leftObject.mass < this.rightObject.mass) {
    return this.leftObject;
  }

  return this.rightObject;
};

Scale.prototype.clearLightestObject = function(callback) {
  if (this.numberOfObjects() !== 2) {
    callback(null);
    return;
  }

  var self = this;
  var obj = this.lightestObject();
  var isLeft = obj === this.leftObject;
  var flame = addFlame();

  var alphaInterval = setInterval(function() {
    obj.material.opacity -= 0.01;
    flame.material.opacity += 0.01;
    if (obj.material.opacity <= 0.18) {
      clearInterval(alphaInterval);
      igniteFlame();
    }
  }, 20);

  function igniteFlame() {
    var interval = setInterval(function() {
      flame.material.opacity -= 0.0075;
      flame.position.x += (Math.random() - 0.5);
      flame.position.y += (Math.random() - 0.5);
      flame.position.z += (Math.random() - 0.5);

      if (flame.material.opacity <= 0.12) {
        clearInterval(interval);
        self.mesh.remove(flame);
        if (isLeft) {
          self.setLeftObject(null);
        } else {
          self.setRightObject(null);
        }
        callback(obj);
      }
    }, 20);
  }

  function addFlame() {
    var flame = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture('/media/textures/flame.jpg'),
        transparent: true,
        opacity: 0.0
      })
    );
    self.mesh.add(flame);

    flame.position.copy(obj.position);
    flame.position.z -= 5;

    return flame;
  }
};

Scale.prototype.updateForMasses = function(leftMass, rightMass) {
  if (leftMass < rightMass) {
    this.rotateAnimated(-Math.PI / 12);
  }
  else if (leftMass > rightMass) {
    this.rotateAnimated(Math.PI / 12);
  }
  else {
    this.rotateAnimated(0);
  }
};

Scale.prototype.rotateAnimated = function(rz, steps) {
  if (!steps) steps = 60;

  var mesh = this.mesh;
  var diff = (rz - mesh.rotation.z) / steps;

  var count = 0;
  rot();
  function rot() {
    if (count < steps) {
      mesh.rotation.z += diff;
      count += 1;
      setTimeout(rot, 20);
    }
  }
};
