
$(function() {

  var Character = require('./character');
  var RonaldText = require('./ronald-text');
  var Spit = require('./spit');
  var io = require('./io');
  var recruiterManager = require('./recruiter-manager');

  var TEST_MODE = true;

  /*
   * * * * * RENDERIN AND LIGHTIN * * * * *
   */

  var renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xffffff);
	document.body.appendChild(renderer.domElement);

  var scene = new Physijs.Scene();
  scene.setGravity(new THREE.Vector3(0, 0, 0));
  scene.addEventListener('update', function() {
    // here wanna apply new forces to objects and things based on state

    scene.simulate(undefined, 1);
  });

  var camera = new THREE.PerspectiveCamera(65, window.innerWidth/window.innerHeight, 1, 1000);
  camera.target = {x: 0, y: 0, z: 0};
  scene.add(camera);

  // mainLight shinin from above casting shadows and the like
  var mainLight = new THREE.DirectionalLight(0xffffff);
  mainLight.position.set(20, 20, -10);
  mainLight.target.position.copy(scene.position);
  mainLight.castShadow = true;
  scene.add(mainLight);

  io.eventHandler = function(event, data) {
    if (['spit', 'handshake'].indexOf(event) !== -1) {
      jobfairState.ronaldPerformedAction(event);
    }
  };

  /*
   * * * * * STATE OBJECTS * * * * *
   */

  var active = {ronalds: false, lighting: false, camera: false, jobfair: false, weighing: false};

  var jobfairState = {};
  var weighingState = {};

  var cameraFollowState = {
    target: null,
    offset: {x: 0, y: 0, z: 0},
  };
  var lightFollowState = {
    target: null,
    offset: {x: 0, y: 0, z: 0}
  };

  var kevinRonald = new Character({x: 0, y: -10, z: 100}, 20);
  kevinRonald.addTo(scene);

  var dylanRonald = new Character({x: 30, y: -10, z: 100}, 20);
  dylanRonald.addTo(scene);
  var ronalds = [kevinRonald, dylanRonald];

  /*
   * * * * * STARTIN AND RENDERIN * * * * *
   */

  setTimeout(start, 2000);
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
      else if (ev.which === 97)  { // a
        if (io.mode === io.JOBFAIR) kevinRonald.move(-1, 0, 0);
      }
      else if (ev.which === 119)  { // w
        if (io.mode === io.JOBFAIR) kevinRonald.move(0, 0, -1);
      }
      else if (ev.which === 100)  { // d
        if (io.mode === io.JOBFAIR) kevinRonald.move(1, 0, 0);
      }
      else if (ev.which === 115)  { // s
        if (io.mode === io.JOBFAIR) kevinRonald.move(0, 0, 1);
      }
      else if (ev.which === 122) { // z
        jobfairState.ronaldPerformedAction('spit');
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
    if (active.weighing) {
      weighingState.render();
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

    jobfairState.ground_geometry = new THREE.PlaneGeometry(140, 2000);
    calculateGeometryThings(jobfairState.ground_geometry);

    jobfairState.ground = new Physijs.BoxMesh(jobfairState.ground_geometry, jobfairState.ground_material, 0);
    jobfairState.ground.rotation.x = -Math.PI / 2;
    jobfairState.ground.position.z = -1000;
    jobfairState.ground.position.y = 0;
    jobfairState.ground.__dirtyPosition = true;
    scene.add(jobfairState.ground);

    cameraFollowState.target = kevinRonald.torso.mesh.position;
    cameraFollowState.offset = {x: 0, y: 40, z: 150};

    jobfairState.booths = recruiterManager.createBooths(scene);

    var hasReachedBooths = false;
    var waitingForNextBooth = false;
    var overlay = $('.interview-overlay');
    var interviewOverlayInterval;

    function setCurrentBooth(index) {
      console.log('current booth: ' + index);
      jobfairState.currentBooth = index;
      io.mode = io.INTERVIEW;
    }

    function flashOverlay(color) {
      overlay.css('background-color', color);

      var hidden = true;
      interviewOverlayInterval = setInterval(function() {
        if (hidden) {
          overlay.show();
        } else {
          overlay.hide();
        }
        hidden = !hidden;
      }, 200);
    }

    function showSuccessfulResponse(z) {
      jobfairState.responseText = new RonaldText({
        phrase: 'SUCCESS',
        position: {x: 20, y: 25, z: z},
        color: 0x00ff00
      });
      flashOverlay('rgb(0, 255, 0)');
      jobfairState.responseText.addTo(scene, null, function() {
        clearInterval(interviewOverlayInterval);
        overlay.hide();
        jobfairState.responseText = null;
      });
    }

    function showFailedResponse(z) {
      jobfairState.responseText = new RonaldText({
        phrase: 'NO!!!',
        position: {x: 20, y: 25, z: z},
        color: 0xff0000
      });
      flashOverlay('rgb(255, 0, 0)');
      jobfairState.responseText.addTo(scene, null, function() {
        clearInterval(interviewOverlayInterval);
        overlay.hide();
        jobfairState.responseText = null;
      });
    }

    jobfairState.spitToRecruiter = function(callback) {
      var spit = new Spit();
      spit.addTo(scene);

      spit.mesh.position.copy(kevinRonald.head.mesh.position);
      spit.mesh.position.z -= 1;

      var recruiterPos = jobfairState.booths[jobfairState.currentBooth].recruiter.faceMesh.position;
      var target = {x: recruiterPos.x + (jobfairState.currentBooth % 2 === 0 ? -5 : 5), y: recruiterPos.y - 2, z: recruiterPos.z - 20};
      var spitInterval = setInterval(function() {
        moveTowardsTarget(spit.mesh.position, target, {x: 0.75, y: 0.25, z: 1.4});
        if (distanceMagnitude(spit.mesh.position, target) <= 2) {
          clearInterval(spitInterval);
          scene.remove(spit.mesh);
          callback();
        }
      }, 30);
    };

    jobfairState.ronaldPerformedAction = function(action) {
      // here would want to do UI and shit yum
      console.log('ronald performed: ' + action);
      if (action === 'spit') {
        this.spitToRecruiter(showResults);
      } else {
        showResults();
      }

      function showResults() {
        if (recruiterManager.actionIsSuccessful(action, this.currentBooth)) {
          showSuccessfulResponse(kevinRonald.position.z + 72);
        } else {
          showFailedResponse(kevinRonald.position.z + 72);
        }

        goToNextBooth();
      }

      function goToNextBooth() {
        if (this.currentBooth !== recruiterManager.recruiterCount - 1) {
          io.mode = io.JOBFAIR;
          waitingForNextBooth = true;
        }
        else {
          this.transitionToWeighing();
        }
      }
    };

    jobfairState.transitionToWeighing = function() {
      active.jobfair = false;
      enterWeighingState();
    };

    jobfairState.render = function() {
      if (!hasReachedBooths) {
        if (kevinRonald.position.z <= -recruiterManager.closeToRecruiterDistance) {
          hasReachedBooths = true;
          setCurrentBooth(0);
        }
      }
      else if (waitingForNextBooth) {
        var currentBooth = recruiterManager.boothIndexForZ(kevinRonald.position.z);
        if (currentBooth > this.currentBooth) {
          setCurrentBooth(currentBooth);
        }
      }

      if (jobfairState.responseText) {
        jobfairState.responseText.render();
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

    weighingState.render = function() {

    };
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
    return {x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2, z: (p1.z + p2.z) / 2};
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
