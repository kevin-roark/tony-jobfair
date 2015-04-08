
var kt = require('./lib/kutility');
var distanceUtil = require('./distance-util');
var Cellphone = require('./cellphone');
var Money = require('./money');
var Spit = require('./spit');

module.exports.spitToRecruiter = function(scene, booths, currentBooth, kevinRonald, callback) {
  var spit = new Spit();
  spit.addTo(scene);

  spit.mesh.position.copy(kevinRonald.head.mesh.position);
  spit.mesh.position.z -= 1;

  var recruiterPos = booths[currentBooth].recruiter.faceMesh.position;
  var target = {x: recruiterPos.x + (currentBooth % 2 === 0 ? -5 : 5), y: recruiterPos.y - 2, z: recruiterPos.z - 20};
  var spitInterval = setInterval(function() {
    distanceUtil.moveTowardsTarget(spit.mesh.position, target, {x: 0.75, y: 0.25, z: 1.4});
    if (distanceUtil.distanceMagnitude(spit.mesh.position, target) <= 2) {
      clearInterval(spitInterval);
      scene.remove(spit.mesh);
      callback();
    }
  }, 30);
};

module.exports.shakeHandsWithRecruiter = function(scene, booths, currentBooth, kevinRonald, callback) {
  var hand = currentBooth % 2 === 0 ? kevinRonald.leftArm : kevinRonald.rightArm;
  hand.rotate(Math.PI / 2, 0, 0);
  hand.move(0, 0, -7);
  cycle();

  var count = 0;
  function cycle() {
    fullShake(function() {
      count += 1;
      if (count > 4) {
        hand.rotate(-Math.PI / 2, 0 , 0);
        hand.move(0, 0, 7);
        callback();
      } else {
        cycle();
      }
    });
  }

  function fullShake(callback) {
    moveDown(function() {
      moveUp(function() {
        moveDown(function() {
          callback();
        });
      });
    });
  }

  function moveDown(callback, limit) {
    if (!limit) limit = 12;
    var downCount = 0;
    var interval = setInterval(function() {
      hand.move(0, -1.25, 0);
      downCount += 1;
      if (downCount >= limit) {
        clearInterval(interval);
        callback();
      }
    }, 30);
  }

  function moveUp(callback, limit) {
    if (!limit) limit = 24;
    var upCount = 0;
    var interval = setInterval(function() {
      hand.move(0, 1.25, 0);
      upCount += 1;
      if (upCount >= limit) {
        clearInterval(interval);
        callback();
      }
    }, 30);
  }
};

module.exports.kneelToRecruiter = function(scene, booths, currentBooth, kevinRonald, callback) {
  var rotIncrement = 0.05;
  var headYIncrement = 0.75;
  var headZIncrement = 1.25;

  var head = kevinRonald.head;
  var kneelParts = [head, kevinRonald.torso, kevinRonald.leftArm, kevinRonald.rightArm];

  cycle();

  var count = 0;
  function cycle() {
    fullKneel(function() {
      count += 1;
      if (count >= 3) {
        callback();
      } else {
        cycle();
      }
    });
  }

  function fullKneel(cb) {
    kneelDown(function() {
      comeBackUp(function() {
        cb();
      });
    });
  }

  function kneelDown(cb) {
    var totalRot = 0;
    var interval = setInterval(function() {
      for (var i = 0; i < kneelParts.length; i++) {
        kneelParts[i].rotate(-rotIncrement, 0, 0);
      }
      head.move(0, -headYIncrement, -headZIncrement);

      totalRot -= rotIncrement;
      if (totalRot <= -Math.PI / 2) {
        clearInterval(interval);
        cb();
      }
    }, 30);
  }

  function comeBackUp(cb) {
    var totalRot = 0;
    var interval = setInterval(function() {
      for (var i = 0; i < kneelParts.length; i++) {
        kneelParts[i].rotate(rotIncrement, 0, 0);
      }
      head.move(0, headYIncrement, headZIncrement);

      totalRot += rotIncrement;
      if (totalRot >= Math.PI / 2) {
        clearInterval(interval);
        cb();
      }
    }, 30);
  }
};

module.exports.bribeRecruiter = function(scene, booths, currentBooth, kevinRonald, callback) {
  var recruiterPos = booths[currentBooth].recruiter.faceMesh.position;
  var xOffset = currentBooth % 2 === 0 ? -20 : 14;
  var torsoPos = kevinRonald.torso.mesh.position;

  var moneys = [];
  var phone = new Cellphone({x: torsoPos.x + currentBooth % 2 === 0 ? 65 : 0, y: recruiterPos.y + 20, z: recruiterPos.z});
  phone.addTo(scene, function() {
    addMoneys();
    rainMoneys(function() {
      removeMoneys();
      phone.removeFrom(scene);
      callback();
    });
  });

  function addMoneys() {
    for (var i = 0; i < 20; i++) {
      var money = Money.create();
      money.position.set(recruiterPos.x + xOffset + kt.randInt(15, -15), recruiterPos.y + kt.randInt(20, 8), recruiterPos.z + kt.randInt(80, 40));
      scene.add(money);
      moneys.push(money);
    }
  }

  function rainMoneys(cb) {
    var intCount = 0;
    var moneyInterval = setInterval(function() {
      for (var i = 0; i < moneys.length; i++) {
        moneys[i].translateY(-0.1);
        moneys[i].translateZ(-0.4);
      }
      phone.move(Math.random() - 0.5, 0, 0);
      intCount += 1;
      if (intCount > 250) {
        clearInterval(moneyInterval);
        cb();
      }
    }, 30);
  }

  function removeMoneys() {
    for (var i = 0; i < moneys.length; i++) {
      scene.remove(moneys[i]);
    }
  }
};
