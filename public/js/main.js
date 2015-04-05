$(function() {

  var Character = require('./character');
  var io = require('./io');
  var recruiterManager = require('./recruiter-manager');

  var TEST_MODE = true;

  /*
   * * * * * RENDERIN AND LIGHTIN * * * * *
   */

  var renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

  var scene = new Physijs.Scene();
  scene.setGravity(new THREE.Vector3(0, 0, 0));
  scene.addEventListener('update', function() {
    // here wanna apply new forces to objects and things based on state

    scene.simulate(undefined, 1);
  });

  var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 20000);
  camera.target = {x: 0, y: 0, z: 0};
  scene.add(camera);

  // mainLight shinin from above casting shadows and the like
  var mainLight = new THREE.DirectionalLight(0xffffff);
  mainLight.position.set(20, 20, -10);
  mainLight.target.position.copy(scene.position);
  mainLight.castShadow = true;
  scene.add(mainLight);

  var startedShatter = false;
  io.eventHandler = function(event, data) {
    // ok ok check tony-ronald for how to use
  };

  /*
   * * * * * STATE OBJECTS * * * * *
   */

  var active = {ronalds: false, lighting: false, camera: false, jobfair: false, weighing: false};
  var history = {};

  var jobfairState = {};

  var cameraFollowState = {
    target: null,
    offset: {x: 0, y: 0, z: 0},
  };
  var lightFollowState = {
    target: null,
    offset: {x: 0, y: 0, z: 0}
  };

  var kevinRonald = new Character({x: 0, y: 5, z: 0}, 20);
  kevinRonald.addTo(scene);

  var dylanRonald = new Character({x: 30, y: 5, z: 0}, 20);
  dylanRonald.addTo(scene);
  var ronalds = [kevinRonald, dylanRonald];

  /*
   * * * * * STARTIN AND RENDERIN * * * * *
   */

  start();
  function start() {
    if (!TEST_MODE) {
      io.begin(kevinRonald, dylanRonald, camera);
    }

    enterJobfairState();

    render();
    scene.simulate();

    $('body').keypress(function(ev) {
      console.log('key press eh? ' + ev.which);
      ev.preventDefault();

      if (ev.which === 32) { // spacebar
        resetRonaldPositions();
      }
      else if (ev.which === 97)  { // left
        moveCameraPosition(-1, 0, 0);
        if (cameraFollowState.offset) {
          cameraFollowState.offset.x += -1;
        }
      }
      else if (ev.which === 119)  { // up
        moveCameraPosition(0, 0, 1);
        if (cameraFollowState.offset) {
          cameraFollowState.offset.y += 1;
        }
      }
      else if (ev.which === 100)  { // right
        moveCameraPosition(1, 0, 0);
        if (cameraFollowState.offset) {
          cameraFollowState.offset.x += 1;
        }
      }
      else if (ev.which === 115)  { // down
        moveCameraPosition(0, 0, -1);
        if (cameraFollowState.offset) {
          cameraFollowState.offset.y += -1;
        }
      }
      else if (ev.which === 113) { // q
        moveCameraPosition(0, 1, 0);
        if (cameraFollowState.offset) {
          cameraFollowState.offset.z += 1;
        }
      }
      else if (ev.which === 101) { // e
        moveCameraPosition(0, -1, 0);
        if (cameraFollowState.offset) {
          cameraFollowState.offset.z += -1;
        }
      }
    });
  }

  function render() {
    requestAnimationFrame(render);

    if (active.ronalds) {
      ronalds.forEach(function(ronald) {
        ronald.render();
      });
    }

    if (active.jobfair) {
      jobfairState.render();
    }

    if (cameraFollowState.target) {
      camera.position.copy(cameraFollowState.target).add(cameraFollowState.offset);
      camera.lookAt(cameraFollowState.target);
    }
    if (lightFollowState.target) {
      mainLight.target.position.copy(lightFollowState.target);
      mainLight.position.addVectors(mainLight.target.position, lightFollowState.offset);
    }

    renderer.render(scene, camera);
  }

  /*
   * * * * * STATE CHANGES * * * * *
   */

  function enterJobfairState() {
    active.jobfair = true;
    io.mode = io.JOBFAIR;

    jobfairState.ground_material = Physijs.createMaterial(
      new THREE.MeshBasicMaterial({color: 0x111111, side: THREE.DoubleSide, transparent: true, opacity: 0.2}),
      0.8, // high friction
      0.4 // low restitution
    );

    jobfairState.ground_geometry = new THREE.PlaneGeometry(100, 100);
    calculateGeometryThings(jobfairState.ground_geometry);

    jobfairState.ground = new Physijs.BoxMesh(jobfairState.ground_geometry, jobfairState.ground_material, 0);
    jobfairState.ground.rotation.x = -Math.PI / 2;
    jobfairState.ground.position.z = -50;
    jobfairState.ground.position.y = 0;
    jobfairState.ground.__dirtyPosition = true;
    scene.add(jobfairState.ground);

    setCameraPosition(0, 40, 10);

    jobfairState.booths = recruiterManager.createBooths(scene);
    jobfairState.currentBooth = 0;

    function moveRonaldToBooth(boothNumber, callback) {
      var booth = jobfairState.booths[boothNumber];
      kevinRonald.position.z = booth.recruiter.skinnedMesh.position.z + 8;
      callback();
    }

    jobfairState.render = function() {
      var currentBooth = recruiterManager.boothIndexForZ(kevinRonald.position.z);
      if (currentBooth !== jobfairState.currentBooth) {
        // lets react to that change in booth eh?
        jobfairState.currentBooth = currentBooth;
        moveRonaldToBooth(currentBooth, function() {
          io.mode = io.INTERVIEW;
        });
      }
    };

    jobfairState.endScene = function() {
      fadeOverlay(true, function() {
        var meshes = [jobfairState.ground];
        jobfairState.booths.forEach(function(booth) {
          booth.meshes.forEach(function(mesh) {
            meshes.push(mesh);
          });
        });
        clearScene(meshes);

        active.jobfair = false;
        enterWeighingState();
        fadeOverlay(false);
      });
    };
  }

  function enterWeighingState() {
    flash('RONALD IS BORN');

    active.ronalds = true;
    active.weighing = true;
    io.mode = io.WEIGHING;

    setCameraPosition(0, 0, 0);

    mainLight.position.set(0, 20, 0);
    mainLight.target.position.set(0, 5, -100);
    mainLight.intensity = 5.0;

    kevinRonald.moveTo(-80, 8, -140);
    kevinRonald.rotate(0, Math.PI/4, 0);

    dylanRonald.moveTo(80, 8, -140);
    dylanRonald.rotate(0, -Math.PI/4, 0);

    ronalds = [kevinRonald, dylanRonald];
  }

  /*
   * * * * * UTILITY * * * * *
   */

  function clearScene(meshes) {
    if (!meshes) meshes = scene.children;

    for (var i = meshes.length - 1; i >= 0; i--) {
      var obj = meshes[ i ];
      if (obj !== camera && obj !== mainLight) {
        scene.remove(obj);
      }
    }
  }

  function resetRonaldPositions() {
    ronalds.forEach(function(ronald) {
      ronald.reset();
    });
  }

  function flash(text, timeout) {
    if (!text) return;
    if (!timeout) timeout = 275;

    $('#flash').text(text);
    $('#flash').show();
    setTimeout(function() {
      $('#flash').hide();
    }, timeout);
  }

  function shakeCamera() {
    var dx = (Math.random() - 0.5) * 1;
    var dy = (Math.random() - 0.5) * 0.5;
    var dz = (Math.random() - 0.5) * 1;

    moveCameraPosition(dx, dy, dz);
  }

  function moveCameraPosition(dx, dy, dz) {
    camera.position.x += dx;
    camera.position.y += dy;
    camera.position.z += dz;
  }

  function setCameraPosition(x, y, z) {
    camera.position.x = x;
    camera.position.y = y;
    camera.position.z = z;
  }

  function fadeOverlay(fadein, callback, color, time) {
    if (!color) color = 'rgb(255, 255, 255)';
    if (!time) time = 4000;
    if (!callback) callback = function(){};

    if (fadein) {
      $('.overlay').css('background-color', color);
      $('.overlay').fadeIn(time, function() {
        callback();
      });
    } else {
      $('.overlay').fadeOut(time, function() {
        callback();
      });
    }
  }

  function calculateGeometryThings(geometry) {
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
  }

  function middlePosition(p1, p2) {
    return {x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2, z: (p1.z + p2.z) / 2}
  }

  function negrand(scalar) {
    return (Math.random() - 0.5) * scalar;
  }

  function moveTowardsTarget(pos, target, amt) {
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
  }

  function distanceMagnitude(pos1, pos2) {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y) + Math.abs(pos1.z - pos2.z);
  }

});
