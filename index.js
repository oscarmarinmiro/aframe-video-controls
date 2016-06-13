if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * Example component for A-Frame.
 */
AFRAME.registerComponent('video-controls', {
  dependencies: ['text'],
  schema: {
    src: { type: 'string'},
    size: { type: 'int', default: 5 },
    distance: { type: 'number', default:2.0 }
  },

  /**
   * Called once when component is attached. Generally for initial setup.
   */
  init: function () {

    var self = this;

//    this.el.setAttribute("position", "0 0 0");

    this.el.setAttribute("rotation", "0 0 -90");


    this.video_selector = this.data.src;

    this.video_el = document.querySelector(this.video_selector);

    // Stop video just in case at the beginning (This should be configurable in the component - TODO - )

    this.video_el.pause();

    this.video_el.addEventListener("progress", function(pe) {
//        console.log("PROGRESS");
//        console.log(this);
//        console.log(pe);

    });

    // Change icon to 'play' on end

    this.video_el.addEventListener("ended", function(){

        self.play_image.setAttribute("src", "#video-play-image");

    });


    // Create icon image (play/pause)

    this.play_image = document.createElement("a-image");

    this.play_image.setAttribute("src", "#video-play-image");

    this.bar_canvas = document.createElement("canvas");
    this.bar_canvas.setAttribute("id", "video_player_canvas");
    this.bar_canvas.width = 256;
    this.bar_canvas.height = 256;
    this.bar_canvas.style.display = "none";

    this.context = this.bar_canvas.getContext('2d');

    this.texture = new THREE.Texture(this.bar_canvas);

    // On icon image, change video state and icon (play/pause)

    this.play_image.addEventListener('click', function () {

        if(!self.video_el.paused){
            this.setAttribute("src", "#video-play-image");

            self.video_el.pause();

        }
        else {
            this.setAttribute("src", "#video-pause-image");

            self.video_el.play();

        }
    });


    // Create info text with current video time and total duration

    this.info_text = document.createElement("a-entity");
    this.info_text_format_string = "size:"+ (this.data.size)*0.050 +"; height:0.0";
    this.info_text.setAttribute("text", "text:00:00 / 00:00;" + this.info_text_format_string);
    this.info_text.setAttribute("material", "color:white");

    // Create transport bar

    this.bar = document.createElement("a-plane");
    this.bar.setAttribute("color", "#000");

    // On transport bar, get point clicked, infer % of new pointer, and make video seek to that point

    this.bar.addEventListener('click', function () {

        var point = document.querySelector("a-cursor").components.raycaster.raycaster.intersectObject(this.object3D, true)[0].point;

        console.log("POINT EN BARRA");

        console.log(point);

        console.log("BARRA");

        console.log(this.object3D);

        console.log(this.object3D.worldToLocal(point));

        var x_offset = this.object3D.worldToLocal(point).x;

        console.log("OFFSET");
        console.log(x_offset);

        var unit_offset = (x_offset/self.data.size)+0.5;

        console.log("UNIT OFFSET");
        console.log(unit_offset);

        if(self.video_el.readyState > 0){
            self.video_el.currentTime = unit_offset * self.video_el.duration;
        }

    });

    // Append image icon + info text + bar to component root

    this.el.appendChild(this.bar_canvas);
    this.el.appendChild(this.play_image);
    this.el.appendChild(this.info_text);
    this.el.appendChild(this.bar);



  },

  /**
   * Called when component is attached and when component data changes.
   * Generally modifies the entity based on the data.
   */
  update: function (oldData) {

//      console.log("ATTACH STATE");
//    console.log(this.el.attachedToParent);

//    this.el.setAttribute("position", "0 0 -50");

//    this.el.components.position.data.z = -this.data.distance;

      // Sets position of the bar

//    this.el.setAttribute("translate", "0 0 -50");
//
////    this.el.setAttribute("position", "0 0 -2");

    // WHY CHANGING POSITION ATTRIBUTE DO NOT CHANGE REAL THREE.JS POSITION ON FIRST ITERATION?

//    this.el.object3D.position = new THREE.Vector3(0,0, -1 * this.data.distance);

    this.bar.setAttribute("height", this.data.size/10.0);
    this.bar.setAttribute("width", this.data.size);
    this.bar.setAttribute("position", "0.0 0.0 0.0");


    this.info_text_format_string = "size:"+ (this.data.size)*0.050 +"; height:0.0";
    this.info_text.setAttribute("position", ((this.data.size/2.0) * 1.10) + " " + -(this.data.size*0.025) +" 0");

    this.play_image.setAttribute("height", this.data.size/10.0);
    this.play_image.setAttribute("width", this.data.size/10.0);
    this.play_image.setAttribute("position", ((-this.data.size/2.0) * 1.2) + " 0 0");




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

//    this.el.setAttribute("position", "0 0 " + -this.data.distance);

//    console.log("ATTACH STATE");
//    console.log(this.el.attachedToParent);


//      this.el.setAttribute("position", "0 0 -50");
    // Refresh every 100 millis

    if(typeof(this.last_time) === "undefined" || (t - this.last_time ) > 100) {

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

            this.info_text.setAttribute("text", "text: " + time_info_text + ";" + this.info_text_format_string);

            // Refresh transport bar canvas

            var inc = this.bar_canvas.width / this.video_el.duration;

            // display TimeRanges

            if (this.video_el.buffered.length > 0) {

                var ctx = this.context;
                ctx.fillStyle = "black";
                ctx.fillRect(0, 0, this.bar_canvas.width, this.bar_canvas.height);

                ctx.fillStyle = "grey";
                ctx.fillRect(0, 0,
                    (this.video_el.buffered.end(this.video_el.buffered.length - 1) / this.video_el.duration)*this.bar_canvas.width,
                    this.bar_canvas.height);

                ctx.fillStyle = "red";
                ctx.fillRect(0, 0,
                    (this.video_el.currentTime / this.video_el.duration)*this.bar_canvas.width,
                    this.bar_canvas.height);


//                for (var i = 0; i < this.video_el.buffered.length; i++) {
//
//                    var startX = this.video_el.buffered.start(i) * inc;
//                    var endX = this.video_el.buffered.end(i) * inc;
//                    var width = endX - startX;
//
//                    ctx.fillStyle = "red";
//                    ctx.fillRect(startX, 0, width, this.bar_canvas.height);
//
//
////                    ctx.fillStyle = "red";
//
//                }
            }


            // If material is not mapped yet to canvas texture and bar object3D is ready

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
