/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	if (typeof AFRAME === 'undefined') {
	  throw new Error('Component attempted to register before AFRAME was available.');
	}

	var DEFAULT_INFO_TEXT_BOTTOM = 'Double-click outside player to hide or show it.';
	var DEFAULT_INFO_TEXT_TOP = 'Look+click on play or bar. Space bar and arrows also work.';

	/**
	 ** Video control component for A-Frame.
	 */

	AFRAME.registerComponent('video-controls', {
	  schema: {
	    src: { type: 'string'},
	    size: { type: 'number', default: 1.0},
	    distance: { type: 'number', default:2.0},
	    backgroundColor: { default: 'black'},
	    barColor: { default: 'red'},
	    textColor: { default: 'yellow'},
	    infoTextBottom: { default: DEFAULT_INFO_TEXT_BOTTOM},
	    infoTextTop: { default: DEFAULT_INFO_TEXT_TOP},
	    infoTextFont: { default: '35px Helvetica Neue'},
	    statusTextFont: { default: '30px Helvetica Neue'},
	    timeTextFont: { default: '70px Helvetica Neue'}
	  },

	  position_time_from_steps: function(){

	        var unit_offset = this.current_step/this.bar_steps;

	        if(this.video_el.readyState > 0) {

	            this.video_el.currentTime = unit_offset * this.video_el.duration;
	        }


	  },

	  // Puts the control in from of the camera, at this.data.distance, facing it...

	  position_control_from_camera: function(){

	    var self = this;

	    var camera = self.el.sceneEl.camera;

	    if(camera) {

	        var camera_rotation = camera.el.getAttribute("rotation");

	        var camera_yaw = camera_rotation.y;

	        // Set position of menu based on camera yaw and data.pitch

	        // Have to add 1.6m to camera.position.y (????)

	        self.y_position = camera.position.y + 1.6;
	        self.x_position = -self.data.distance * Math.sin(camera_yaw * Math.PI / 180.0);
	        self.z_position = -self.data.distance * Math.cos(camera_yaw * Math.PI / 180.0);

	        self.el.setAttribute("position", [self.x_position, self.y_position, self.z_position].join(" "));

	        // and now, make our controls rotate towards origin

	        this.el.object3D.lookAt(new THREE.Vector3(camera.position.x, camera.position.y + 1.6, camera.position.z));

	    }

	  },
	  /**
	   * Called once when component is attached. Generally for initial setup.
	   */
	  init: function () {

	    var self = this;

	    // Next two vars used to control transport bar with keyboard arrows

	    this.bar_steps = 10.0;

	    this.current_step = 0.0;

	    this.el.setAttribute("visible", true);

	    this.video_selector = this.data.src;

	    this.video_el = document.querySelector(this.video_selector);

	    // image sources for play/pause

	    self.play_image_src = document.getElementById("video-play-image") ? "#video-play-image" : "https://res.cloudinary.com/dxbh0pppv/image/upload/c_scale,h_512,q_10/v1471016296/play_wvmogo.png";
	    self.pause_image_src = document.getElementById("video-pause-image") ? "#video-pause-image" :"https://res.cloudinary.com/dxbh0pppv/image/upload/c_scale,h_512,q_25/v1471016296/pause_ndega5.png";

	    // Create icon image (play/pause), different image whether video is playing.

	    this.play_image = document.createElement("a-image");

	    if (this.video_el.paused) {
	      this.play_image.setAttribute("src", self.play_image_src);
	    } else {
	      this.play_image.setAttribute("src", self.pause_image_src);
	    }

	    // Change icon to 'play' on end

	    this.video_el.addEventListener("ended", function(){

	        self.play_image.setAttribute("src", self.play_image_src);

	    });

	    // Change icon to 'pause' on start.

	    this.video_el.addEventListener("pause", function(){

	        self.play_image.setAttribute("src", self.play_image_src);

	    });

	    // Change icon to 'play' on pause.

	    this.video_el.addEventListener("playing", function(){

	        self.play_image.setAttribute("src", self.pause_image_src);

	    });

	    this.bar_canvas = document.createElement("canvas");
	    this.bar_canvas.setAttribute("id", "video_player_canvas");
	    this.bar_canvas.width = 1024;
	    this.bar_canvas.height = 256;
	    this.bar_canvas.style.display = "none";

	    this.context = this.bar_canvas.getContext('2d');

	    this.texture = new THREE.Texture(this.bar_canvas);

	    // On icon image, change video state and icon (play/pause)

	    this.play_image.addEventListener('click', function (event) {

	        if(!self.video_el.paused){
	            this.setAttribute("src", self.play_image_src);

	            self.video_el.pause();

	        }
	        else {
	            this.setAttribute("src", self.pause_image_src);

	            self.video_el.play();

	        }

	        // Prevent propagation upwards (e.g: canvas click)

	        event.stopPropagation();

	        event.preventDefault();

	    });


	    window.addEventListener('keyup', function(event) {
	      switch (event.keyCode) {

	        // If space bar is pressed, fire click on play_image
	        case 32:
	          self.play_image.dispatchEvent(new Event('click'));
	        break;

	        // Arrow left: beginning
	        case 37:
	           self.current_step = 0.0;
	           self.position_time_from_steps();
	        break;

	        // Arrow right: end
	        case 39:
	           self.current_step = self.bar_steps;
	           self.position_time_from_steps();

	        break;

	        // Arrow up: one step forward
	        case 38:
	           self.current_step = self.current_step < (self.bar_steps) ? self.current_step + 1 : self.current_step;
	           self.position_time_from_steps();
	        break;

	        // Arrow down: one step back
	        case 40:
	           self.current_step = self.current_step > 0 ? self.current_step - 1 : self.current_step;
	           self.position_time_from_steps();
	        break;

	      }
	    }, false);


	    // Create transport bar

	    this.bar = document.createElement("a-plane");
	    this.bar.setAttribute("color", "#000");

	    // On transport bar click, get point clicked, infer % of new pointer, and make video seek to that point

	    this.bar.addEventListener('click', function (event) {

	        // Get raycast intersection point, and from there, x_offset in bar

	        var point = document.querySelector("a-cursor").components.raycaster.raycaster.intersectObject(this.object3D, true)[0].point;

	        var x_offset = this.object3D.worldToLocal(point).x;

	        var unit_offset = (x_offset/self.data.size)+0.5;

	        // Update current step for coherence between point+click and key methods

	        self.current_step = Math.round(unit_offset*self.bar_steps);

	        if(self.video_el.readyState > 0) {

	            self.video_el.currentTime = unit_offset * self.video_el.duration;
	        }

	        // Prevent propagation upwards (e.g: canvas click)

	        event.stopPropagation();

	        event.preventDefault();

	    });

	    // Append image icon + info text + bar to component root

	    this.el.appendChild(this.bar_canvas);
	    this.el.appendChild(this.play_image);
	    this.el.appendChild(this.bar);


	    // Attach double click behavior outside player once scene is loaded

	    this.el.sceneEl.addEventListener("loaded", function(){

	        self.position_control_from_camera();

	        this.addEventListener("dblclick", function(){

	            var raycaster = document.querySelector("a-cursor").components.raycaster.raycaster;

	            // Double click is outside the player
	            // (note that for some reason you cannot prevent a dblclick on player from bubbling up (??)

	            if(raycaster.intersectObject(self.el.object3D, true).length == 0){

	                // If controls are show: hide


	                if(self.el.getAttribute("visible")) {
	                    self.el.setAttribute("visible", false);
	                }
	                // Else, show at 'distance' from camera
	                else {
	                    self.el.setAttribute("visible", true);

	                    self.position_control_from_camera();
	                }
	            }

	        });


	    });

	  },

	  /**
	   * Called when component is attached and when component data changes.
	   * Generally modifies the entity based on the data.
	   */
	  update: function (oldData) {

	    this.position_control_from_camera();

	    this.bar.setAttribute("height", this.data.size/4.0);
	    this.bar.setAttribute("width", this.data.size);
	    this.bar.setAttribute("position", "0.0 0.0 0");


	    this.play_image.setAttribute("height", this.data.size/4.0);
	    this.play_image.setAttribute("width", this.data.size/4.0);
	    this.play_image.setAttribute("position", ((-this.data.size/2.0) * 1.4) + " 0 0");


	  },

	  /**
	   * Called when a component is removed (e.g., via removeAttribute).
	   * Generally undoes all modifications to the entity.
	   */
	  remove: function () { },

	  /**
	   * Called on each scene tick.
	   */
	  tick: function (t) {

	    // Refresh every 250 millis

	    if(typeof(this.last_time) === "undefined" || (t - this.last_time ) > 250) {

	        // At the very least, have all video metadata
	        // (https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState)

	        if(this.video_el.readyState > 0) {

	            // Get current position minutes and second, and add leading zeroes if needed

	            var current_minutes = Math.floor(this.video_el.currentTime / 60);
	            var current_seconds = Math.floor(this.video_el.currentTime % 60);


	            current_minutes = current_minutes < 10 ? "0" + current_minutes : current_minutes;
	            current_seconds = current_seconds < 10 ? "0" + current_seconds : current_seconds;

	            // Get video duration in  minutes and second, and add leading zeroes if needed

	            var duration_minutes = Math.floor(this.video_el.duration / 60);
	            var duration_seconds = Math.floor(this.video_el.duration % 60);


	            duration_minutes = duration_minutes < 10 ? "0" + duration_minutes : duration_minutes;
	            duration_seconds = duration_seconds < 10 ? "0" + duration_seconds : duration_seconds;

	            // Refresh time information : currentTime / duration

	            var time_info_text = current_minutes + ":" + current_seconds + " / " + duration_minutes + ":" + duration_seconds;

	            //  Refresh transport bar canvas

	            var inc = this.bar_canvas.width / this.video_el.duration;

	            //  display buffered TimeRanges

	            if (this.video_el.buffered.length > 0) {

	                // Synchronize current step with currentTime

	                this.current_step = Math.round((this.video_el.currentTime/this.video_el.duration)*this.bar_steps);

	                var ctx = this.context;
	                ctx.fillStyle = this.data.backgroundColor;
	                ctx.fillRect(0, 0, this.bar_canvas.width, this.bar_canvas.height);

	                // Uncomment to draw a single bar for loaded data instead of 'bins'

	                //                ctx.fillStyle = "grey";
	                //
	                //                ctx.fillRect(0, 0,
	                //                    (this.video_el.buffered.end(this.video_el.buffered.length - 1) / this.video_el.duration)*this.bar_canvas.width,
	                //                    this.bar_canvas.height/2);



	                // Display time info text

	                ctx.font = this.data.timeTextFont;
	                ctx.fillStyle = "white";
	                ctx.textAlign = "center";
	                ctx.fillText(time_info_text, this.bar_canvas.width/2, this.bar_canvas.height* 0.65);

	                // DEBUG PURPOSES

	//                ctx.fillText(this.video_el.readyState, this.bar_canvas.width*0.1, this.bar_canvas.height* 0.65);

	                // If seeking to position, show

	                if(this.video_el.seeking){
	                    ctx.font = this.data.statusTextFont;
	                    ctx.fillStyle = this.data.textColor;
	                    ctx.textAlign = "end";
	                    ctx.fillText("Seeking", this.bar_canvas.width * 0.95, this.bar_canvas.height * 0.60);
	                }

	                // Uncomment below to see % of video loaded...

	                else {

	                    var percent = (this.video_el.buffered.end(this.video_el.buffered.length - 1) / this.video_el.duration) * 100;

	                    ctx.font = this.data.statusTextFont;
	                    ctx.fillStyle = this.data.textColor;
	                    ctx.textAlign = "end";

	                    ctx.fillText(percent.toFixed(0) + "% loaded", this.bar_canvas.width * 0.95, this.bar_canvas.height * 0.60);
	                }


	                // Info text

	                ctx.fillStyle = this.data.textColor;
	                ctx.font = this.data.infoTextFont;
	                ctx.textAlign = "center";
	                ctx.fillText(this.data.infoTextTop, this.bar_canvas.width/2, this.bar_canvas.height* 0.8);
	                ctx.fillText(this.data.infoTextBottom, this.bar_canvas.width/2, this.bar_canvas.height* 0.95);

	                // Show buffered ranges 'bins'

	                for (var i = 0; i < this.video_el.buffered.length; i++) {

	                    var startX = this.video_el.buffered.start(i) * inc;
	                    var endX = this.video_el.buffered.end(i) * inc;
	                    var width = endX - startX;

	                    ctx.fillStyle = "grey";
	                    ctx.fillRect(startX, 0, width, this.bar_canvas.height/3);

	                }

	                // Red bar with already played range

	                ctx.fillStyle = this.data.barColor;
	                ctx.fillRect(0, 0,
	                    (this.video_el.currentTime / this.video_el.duration)*this.bar_canvas.width,
	                    this.bar_canvas.height/3);

	            }


	            // If material is not mapped yet to canvas texture and bar object3D is ready
	            // assign canvas as a texture

	            if(this.bar.object3D.children.length > 0) {

	                // If material is not mapped yet to canvas texture...

	                if(this.bar.object3D.children[0].material.map === null) {
	                    this.bar.object3D.children[0].material = new THREE.MeshBasicMaterial();
	                    this.bar.object3D.children[0].material.map = this.texture;
	                }

	                this.texture.needsUpdate = true;
	            }


	        }

	        // Save this 't' to last_time

	        this.last_time = t;
	    }
	  },

	  /**
	   * Called when entity pauses.
	   * Use to stop or remove any dynamic or background behavior such as events.
	   */
	  pause: function () { },

	  /**
	   * Called when entity resumes.
	   * Use to continue or add any dynamic or background behavior such as events.
	   */
	  play: function () { }
	});


/***/ }
/******/ ]);