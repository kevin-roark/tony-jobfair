
$(function() {

  var kt = require('./lib/kutility');
  var io = require('./io');
  var Character = require('./character');
  var RonaldText = require('./ronald-text');
  var Scale = require('./scale');
  var Shirt = require('./tshirt');
  var recruiterManager = require('./recruiter-manager');
  var ronaldGestures = require('./ronald-gestures');
  var distanceUtil = require('./distance-util');
  var meshGestures = require('./mesh-gestures');

  var TEST_MODE = true;
  var START_WITH_SCALE = true;

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
    if (['spit', 'handshake', 'kneel', 'bribe'].indexOf(event) !== -1) {
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

    if (START_WITH_SCALE) {
      enterWeighingState();
    }
    else {
      enterJobfairState();
    }

    render();
    scene.simulate();

    $('body').keypress(function(ev) {
      console.log('key press eh? ' + ev.which);
      ev.preventDefault();

      if (ev.which === 32) { // spacebar
        resetRonaldPositions();
      }
      else if (ev.which === 97)  { // a
        kevinRonald.move(-1, 0, 0);
      }
      else if (ev.which === 119)  { // w
        kevinRonald.move(0, 0, -1);
      }
      else if (ev.which === 100)  { // d
        kevinRonald.move(1, 0, 0);
      }
      else if (ev.which === 115)  { // s
        kevinRonald.move(0, 0, 1);
      }
      else if (ev.which === 122) { // z
        jobfairState.ronaldPerformedAction('spit');
      }
      else if (ev.which === 120) { // x
        jobfairState.ronaldPerformedAction('handshake');
      }
      else if (ev.which === 99) { // c
        jobfairState.ronaldPerformedAction('kneel');
      }
      else if (ev.which === 118) { // v
        jobfairState.ronaldPerformedAction('bribe');
      }
      else if (ev.which === 107) { // k
        weighingState.ronaldPerformedThrow('kevin', 'left');
      }
      else if (ev.which === 108) { // l
        weighingState.ronaldPerformedThrow('kevin', 'right');
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

    jobfairState.collectedTokens = [];

    var hasReachedBooths = false;
    var waitingForNextBooth = false;
    var overlay = $('.interview-overlay');
    var interviewOverlayInterval;

    function setCurrentBooth(index) {
      console.log('current booth: ' + index);
      jobfairState.currentBooth = index;
      io.mode = io.INTERVIEW;
      flash(recruiterManager.companies[index]);
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

    jobfairState.ronaldPerformedAction = function(action) {
      // here would want to do UI and shit yum
      console.log('ronald performed: ' + action);
      var behaviorMap = {
        spit: ronaldGestures.spitToRecruiter,
        handshake: ronaldGestures.shakeHandsWithRecruiter,
        kneel: ronaldGestures.kneelToRecruiter,
        bribe: ronaldGestures.bribeRecruiter
      };

      if (behaviorMap[action]) {
        console.log('bribing');
        behaviorMap[action](scene, this.booths, this.currentBooth, kevinRonald, showResults);
      } else {
        showResults();
      }

      function showResults() {
        var success = recruiterManager.actionIsSuccessful(action, this.currentBooth);

        if (success) {
          showSuccessfulResponse(kevinRonald.position.z + 72);

          var shirt = new Shirt(null, null, recruiterManager.companies[jobfairState.currentBooth]);
          jobfairState.collectedTokens.push(shirt);
        }
        else {
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
      enterWeighingState(this.collectedTokens);
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

  function enterWeighingState(tokens) {
    var FRAMES_FOR_THROW = 150;

    flash('CHOOSE YOUR ROLE');

    if (!tokens) {
      tokens = [];
      for (var i = 0; i < recruiterManager.companies.length; i++) {
        if (Math.random() < 0.5) {
          var company = recruiterManager.companies[i];
          var shirt = new Shirt(null, null, company);
          tokens.push(shirt);
        }
      }
    }

    console.log('tokens length: ' + tokens.length);

    active.ronalds = true;
    active.weighing = true;
    io.mode = io.WEIGHING;

    mainLight.position.set(0, 20, 0);
    mainLight.target.position.set(0, 5, -100);
    mainLight.intensity = 5.0;

    kevinRonald.moveTo(-70, 0, -140);
    dylanRonald.moveTo(70, 0, -140);

    var tokenMeshes = [];
    tokens.forEach(function(token) {
      token.addTo(scene, function() {
        token.moveTo(negrand(200), Math.random() * 10 + 20, -kt.randInt(250, 140));
        tokenMeshes.push(token.mesh);
      });
    });

    var scale = new Scale();
    scale.addTo(scene);
    scale.mesh.position.set(0, 45, -300);

    var scaleWidth = 210; // messy
    var leftScaleTarget = {x: scale.mesh.position.x - scaleWidth / 2, y: scale.mesh.position.y + 4, z: scale.mesh.position.z};
    var rightScaletarget = {x: scale.mesh.position.x + scaleWidth / 2, y: scale.mesh.position.y + 4, z: scale.mesh.position.z};

    var scaleText = new RonaldText({
      phrase: 'YOU HAVE TO WEIGH YOUR JOB OPTIONS',
      position: {x: 50, y: 75, z: -115},
      decay: 10000000,
      color: 0x4444ff
    });
    scaleText.geometry.center();
    scaleText.addTo(scene);

    weighingState.kevinRenderer = new WeighingStateRonaldRenderer('kevin');
    weighingState.dylanRenderer = new WeighingStateRonaldRenderer('dylan');

    weighingState.render = function() {
      var ronPos = kevinRonald.torso.mesh.position;
      var dylPos = dylanRonald.torso.mesh.position;
      cameraFollowState.target = {x: (ronPos.x + dylPos.x) / 2, y: 0, z: (ronPos.z + dylPos.z) / 2};
      cameraFollowState.offset = {x: 0, y: 72, z: 150};

      scaleText.render();

      this.kevinRenderer.render();
      this.dylanRenderer.render();
    };

    weighingState.ronaldPerformedThrow = function(ronaldName, direction) {
      if (!ronaldName) ronaldName = 'kevin';
      if (!direction) direction = 'left';

      if (ronaldName === 'kevin') {
        this.kevinRenderer.performedThrow(direction);
      } else {
        this.dylanRenderer.performedThrow(direction);
      }
    };

    function WeighingStateRonaldRenderer(name) {
      this.name = name;
      this.ronald = name === 'kevin' ? kevinRonald : dylanRonald;
      this.frameCount = 0;
      this.mode = 'seeking';
    }
    WeighingStateRonaldRenderer.prototype.render = function() {
      this.frameCount += 1;
      var self = this;

      var ronaldHead = this.ronald.head.mesh;

      if (this.mode === 'seeking' && this.frameCount % 10 === 0) {
        var nearest = distanceUtil.nearest(ronaldHead, tokenMeshes);
        if (nearest.distance < 24) {
          this.mode = 'placing';
          this.activeTokenMesh = nearest.object;
        }
      }
      else if (this.mode === 'placing') {
        this.activeTokenMesh.position.set(ronaldHead.position.x + 2, ronaldHead.position.y - 15, ronaldHead.position.z + 5);
      }
      else if (this.mode === 'throwing') {
        this.activeTokenMesh.position.x += this.throwIncrement.x;
        this.activeTokenMesh.position.y += this.throwIncrement.y;
        this.activeTokenMesh.position.z += this.throwIncrement.z;
        this.activeTokenMesh.__dirtyPosition = true;

        this.currentThrowFrames += 1;
        if (this.currentThrowFrames >= FRAMES_FOR_THROW) {
          var scaleSetter = this.throwDirection === 'left' ? scale.setLeftObject.bind(scale) : scale.setRightObject.bind(scale);
          scaleSetter(this.activeTokenMesh);

          self.mode = 'waiting';
          setTimeout(function() {
            scale.clearLightestObject(function(lightestObject) {
              if (!lightestObject) {
                self.mode = 'seeking';
                return;
              }

              meshGestures.sendFlying(lightestObject, {steps: 100}, function() {
                self.mode = 'seeking';
              });
            });
          }, 500);
        }
      }
    };
    WeighingStateRonaldRenderer.prototype.performedThrow = function(direction) {
      if (this.mode !== 'placing') {
        return;
      }

      var missingObject = scale.missingObject();
      console.log('missing object: ' + missingObject);
      if (missingObject === 'left' || missingObject === 'right') {
        direction = missingObject;
      }

      this.mode = 'throwing';

      this.throwDirection = direction;
      this.throwTarget = direction === 'left' ? leftScaleTarget : rightScaletarget;
      this.throwIncrement = distanceUtil.positionDeltaIncrement(this.activeTokenMesh.position, this.throwTarget, FRAMES_FOR_THROW);
      this.currentThrowFrames = 0;
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

  function negrand(scalar) {
    return (Math.random() - 0.5) * scalar;
  }

});
