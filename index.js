if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * Example component for A-Frame.
 */
AFRAME.registerComponent('video-controls', {
  schema: {
    src: { type: 'string'}
  },

  /**
   * Called once when component is attached. Generally for initial setup.
   */
  init: function () {
    console.log("VIDEO CONTROL INIT");
    console.log("PARAMS");
    console.log(this.data);

    var self = this;

    this.video_selector = this.data.src;

    this.video_el = document.querySelector(this.video_selector);

    // Stop video just in case...

    this.video_el.pause();

    // Playing video flag

    this.is_playing = false;

//    this.video_id_list = this.data.ids.split(",");

//    console.log(this.video_id_list);

//    for(var i=0; i<this.video_id_list.length; i++){
//        document.getElementById(this.video_id_list[i]).play();
//    }


//          <a-image src="#video-play-image" position="0 2.0 -2.0" height="2.0" width="2.0"></a-image>

    this.play_image = document.createElement("a-image");

    this.play_image.setAttribute("src", "#video-play-image");
    this.play_image.setAttribute("height", "2.0");
    this.play_image.setAttribute("width", "2.0");


    this.play_image.addEventListener('click', function () {

        console.log("CLICKED");

        if(this.is_playing){
            this.setAttribute("src", "#video-play-image");
            this.is_playing = false;

            self.video_el.pause();

        }
        else {
            this.setAttribute("src", "#video-pause-image");
            this.is_playing = true;

            self.video_el.play();

        }
    });


    this.el.appendChild(this.play_image);

  },

  /**
   * Called when component is attached and when component data changes.
   * Generally modifies the entity based on the data.
   */
  update: function (oldData) { },

  /**
   * Called when a component is removed (e.g., via removeAttribute).
   * Generally undoes all modifications to the entity.
   */
  remove: function () { },

  /**
   * Called on each scene tick.
   */
  // tick: function (t) { },

  /**
   * Called when entity pauses.
   * Use to stop or remove any dynamic or background behavior such as events.
   */
  pause: function () { },

  /**
   * Called when entity resumes.
   * Use to continue or add any dynamic or background behavior such as events.
   */
  play: function () { },
});
