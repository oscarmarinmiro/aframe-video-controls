## aframe-video-controls

A video control component for [A-Frame](https://aframe.io).

It attaches to a video asset so you can play/pause the video (assuing it is projected on a plane or sphere) by looking and clicking on the 'play' icon or transport bar.

You can also press the 'space bar' or the arrow keys to control the video if you are in a 'desktop' computer

!["The component in action"](/img/video-component.png?raw=true "The component in action")

### Demo

You can play with a live demo [here] (https://oscarmarinmiro.github.io/aframe-video-controls)


### Properties

| Property | Description | Default Value |
| -------- | ----------- | ------------- |
| src         | selector of the video asset              | mandatory               |
| size         | horizontal size of the player in meters              | 1.0              |
| distance        | distance of the player from the camera in meters              | 2.0             |

### Usage

Just include the component and put your video into the A-frame assets section. **Keep in mind that you must include two images into the assets,
with the exact 'ids' displayed below, that will be used as the play/pause icons (so you must also include the files in your project). You can find these images in the examples or supply your own**

Then just include an entity with the 'src' attribute 'pointing' to the video asset you want to control.

#### Browser Installation

Install and use by directly including the [browser files](dist):

This example projects a 360 video into a videosphere and attaches the controls to it.

```html

<head>
  <title>My A-Frame Scene</title>
  <script src="https://aframe.io/releases/0.2.0/aframe.min.js"></script>
  <script src="https://rawgit.com/oscarmarinmiro/aframe-video-controls/master/dist/aframe-video-controls.min.js"></script>
</head>

 <body>
    <a-scene>
      <a-assets>
        <img id="video-play-image" src="img/play.png">
        <img id="video-pause-image" src="img/pause.png">

        <video id="video_1" src="https://ucarecdn.com/bcece0a8-86ce-460e-856b-40dac4875f15/"></video>
      </a-assets>

      <a-camera position="0 0 5">
          <a-cursor id="cursor" color="yellow"></a-cursor>
      </a-camera>

      <a-videosphere src="#video_1" rotation="0 180 0"></a-videosphere>

      <a-entity video-controls="src:#video_1"></a-entity>

    </a-scene>
  </body>

```

#### NPM Installation

Install via NPM:

```bash
npm install aframe-video-controls
```

Then register and use.

```js
require('aframe');
require('aframe-video-controls');
```
