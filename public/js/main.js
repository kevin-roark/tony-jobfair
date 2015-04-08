
$(function() {

  var kt = require('./lib/kutility');
  var distanceUtil = require('./distance-util');
  var geometryUtil = require('./geometry-util');
  var sceneUtil = require('./scene-util');
  var ronaldUI = require('./ronald-ui');

  var ronaldGestures = require('./ronald-gestures');
  var meshGestures = require('./mesh-gestures');

  var io = require('./io');

  var Character = require('./character');
  var RonaldText = require('./ronald-text');
  var Scale = require('./scale');
  var Shirt = require('./tshirt');
  var Garbage = require('./garbage');
  var Computer = require('./computer');
  var skybox = require('./skybox');
  var recruiterManager = require('./recruiter-manager');

  var TEST_MODE = true;
  var START_WITH_SCALE = true;
  var SPEED_TO_TRASH = true;

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

  var camera = new THREE.PerspectiveCamera(65, window.innerWidth/window.innerHeight, 1, 3200);
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

  var active = {ronalds: false, lighting: false, camera: false, jobfair: false, weighing: false, trash: false};

  var jobfairState = {};
  var weighingState = {};
  var garbageState = {};

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
        moveMesh(camera, 0, 1, 0);
        if (cameraFollowState.offset) {
          cameraFollowState.offset.z += 1;
        }
      }
      else if (ev.which === 101) { // e
        moveMesh(camera, 0, -1, 0);
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
    if (active.trash) {
      garbageState.render();
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
    geometryUtil.calculateGeometryThings(jobfairState.ground_geometry);

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
      ronaldUI.flash(recruiterManager.companies[index]);
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
      ronaldUI.fadeOverlay(true, function() {
        var meshes = [jobfairState.ground];
        jobfairState.booths.forEach(function(booth) {
          booth.meshes.forEach(function(mesh) {
            meshes.push(mesh);
          });
        });
        sceneUtil.clearScene(scene, meshes, [camera, mainLight]);

        active.jobfair = false;
        enterWeighingState();
        ronaldUI.fadeOverlay(false);
      });
    };
  }

  function enterWeighingState(tokens) {
    var FRAMES_FOR_THROW = 150;

    ronaldUI.flash('CHOOSE YOUR ROLE');

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

    if (SPEED_TO_TRASH) {
      tokens = tokens.slice(0, 2);
    }

    console.log('tokens length: ' + tokens.length);

    active.ronalds = true;
    active.weighing = true;
    io.mode = io.WEIGHING;

    mainLight.position.set(0, 100, 0);
    mainLight.target.position.set(0, 5, -50);
    mainLight.intensity = 2.0;

    kevinRonald.moveTo(-70, 0, -140);
    dylanRonald.moveTo(70, 0, -140);

    var tokenMeshes = [];
    tokens.forEach(function(token) {
      token.addTo(scene, function() {
        token.moveTo((Math.random() - 0.5) * 240, Math.random() * 10 + 8, -kt.randInt(250, 140));
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
    weighingState.tokensDestroyed = 0;
    weighingState.scale = scale;

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

    weighingState.beginGarbageTransition = function() {
      console.log('beginning garbage transition');
      scale.updateForMasses(0, 0);
      setTimeout(function() {
        var fallingObjects = [];
        var multiplier = 0.1;
        var interval = setInterval(function() {
          scale.mesh.rotation.z += Math.random() * multiplier;
          multiplier *= 1.015;
          for (var i = 0; i < fallingObjects.length; i++) {
            if (fallingObjects[i].mesh.position.y > 0 || fallingObjects[i]._keepFallingAtGround) {
              fallingObjects[i].move(0, - (Math.random() + 0.25), 0);
            }
          }
        }, 40);

        function addGarbage(garbage) {
          garbage.addTo(scene, function() {
            garbage.rotate(0, Math.PI, 0);
            fallingObjects.push(garbage);
          });
        }

        function addBanana() {
          var banana = new Garbage({x: (Math.random() - 0.5) * 240, y: Math.random() * 80 + 30, z: - (kt.randInt(350, 120))}, null, 'banana');
          banana._keepFallingAtGround = true;
          banana.addTo(scene, function() {
            fallingObjects.push(banana);
          });
        }

        function addTruck() {
          clearInterval(interval);
          var geometry = new THREE.BoxGeometry(175, 125, 60);
          var material = new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture('/media/textures/garbage_truck.jpg'),
            side: THREE.DoubleSide
          });
          var truck = new THREE.Mesh(geometry, material);
          truck.position.set(0, 100, -300);
          scene.add(truck);
          var truckInterval = setInterval(function() {
            if (truck.position.y > 4) truck.position.y -= 0.5;
          }, 30);
          setTimeout(function() {
            clearInterval(truckInterval);
            exitState(truck);
          }, SPEED_TO_TRASH? 2000 : 10000);
        }

        function exitState(truck) {
          ronaldUI.fadeOverlay(true, function() {
            var lameMeshes = [scaleText, scale.mesh];
            tokenMeshes.forEach(function(mesh) {
              lameMeshes.push(mesh);
            });
            fallingObjects.forEach(function(obj) {
              lameMeshes.push(obj.mesh);
            });
            sceneUtil.clearScene(scene, lameMeshes, [camera, mainLight]);

            active.weighing = false;
            enterTrashState(truck);
            ronaldUI.fadeOverlay(false);
          });
        }

        setTimeout(function() {
          addGarbage(new Garbage({x: 70, y: 100, z: -170}, null, 'garbage'));
          setTimeout(function() {
            addGarbage(new Garbage({x: -40, y: 70, z: -130}, 8, 'garbage'));
            setTimeout(function() {
              var bananaCount = 0;
              var bananaInterval = setInterval(function() {
                addBanana();
                bananaCount += 1;
                if (bananaCount >= (SPEED_TO_TRASH? 5 : 40)) {
                  clearInterval(bananaInterval);
                  addTruck();
                }
              }, 900);
            }, 3000);
          }, SPEED_TO_TRASH? 500 : 33333);
        }, SPEED_TO_TRASH? 500 : 6666);

      }, 2500);
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

          console.log('ended throw: ' + weighingState.tokensDestroyed);

          // if scale is filled with last two things
          if (weighingState.tokensDestroyed === tokens.length - 1 && scale.numberOfObjects() == 2) {
            self.mode = 'waitingForGarbage';
            setTimeout(function() {
              weighingState.beginGarbageTransition();
            }, 1200);
            return;
          }

          self.mode = 'waiting';
          setTimeout(function() {
            scale.clearLightestObject(function(lightestObject) {
              meshGestures.sendFlying(lightestObject, {steps: 100}, function() {
                self.mode = 'seeking';
                weighingState.tokensDestroyed += 1;
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

  function enterTrashState(truck) {
    io.mode = io.TRASH;
    active.trash = true;

    mainLight.position.set(0, 100, 0);
    mainLight.target.position.set(0, 5, -50);
    mainLight.intensity = 2.0;

    truck.position.set(0, 0, -30);
    truck.rotation.y -= Math.PI / 2;

    kevinRonald.moveTo(-55, 55, -30);
    dylanRonald.moveTo(55, 55, -30);

    var computerLab = skybox.create(null, '/media/textures/computer_lab.jpg');
    scene.add(computerLab);

    var computers = [];
    var compZOffset = 25;
    for (var i = 0; i < 100; i++) {
      var comp = new Computer({x: (Math.random() - 0.5) * 80, y: 10, z: -(i + 1) * compZOffset});
      computers.push(comp);
      comp.addTo(scene);
    }

    garbageState.nextComputerToShatterIndex = 0;
    garbageState.mode = 'waiting';

    ronaldUI.flash('YOU ARE GARBAGE', 2000);
    setTimeout(function() {
      garbageState.mode = 'driving';
    }, 3500);

    garbageState.render = function() {
      cameraFollowState.target = {x: truck.position.x, y: truck.position.y, z: truck.position.z};
      cameraFollowState.offset = {x: 0, y: 40, z: 300};

      if (this.mode === 'driving') {
        var inc = -0.6;
        truck.position.z += inc;
        kevinRonald.move(0, 0, inc);
        dylanRonald.move(0, 0, inc);

        shakeMesh(truck);

        if (this.nextComputerToShatterIndex >= 75 && !this.isFadingLinkedin) {
          this.fadeLinkedIn();
        }

        if (this.nextComputerToShatterIndex < computers.length && truck.position.z < -50 + (this.nextComputerToShatterIndex + 1) * -compZOffset) {
          computers[this.nextComputerToShatterIndex].shatter();
          this.nextComputerToShatterIndex += 1;
        }
      }
    };

    garbageState.fadeLinkedIn = function() {
      this.isFadingLinkedin = true;

      $('#endgame-overlay').fadeIn(10000);
    };
  }

  /*
   * * * * * UTILITY * * * * *
   */

  function resetRonaldPositions() {
    ronalds.forEach(function(ronald) {
      ronald.reset();
    });
  }

  function shakeMesh(mesh) {
    var dx = (Math.random() - 0.5) * 1;
    var dy = (Math.random() - 0.5) * 0.5;
    var dz = (Math.random() - 0.5) * 1;

    moveMesh(mesh, dx, dy, dz);
  }

  function moveMesh(mesh, dx, dy, dz) {
    mesh.position.x += dx;
    mesh.position.y += dy;
    mesh.position.z += dz;
  }

});
