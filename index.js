
const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');


function getVideo(){
  navigator.mediaDevices.getUserMedia({video: true, audio: false})
   //returns a promise
   .then(localMediaStream => {
     console.log(localMediaStream);
     //convert the media stream object into a url so it can work (so video player can understand )
     video.src = window.URL.createObjectURL(localMediaStream);
    video.play();
   })
   //if doesn't allow to access webcam
   .catch(err =>{
     console.err("OH NO. Don't deny me your face", err);
   });
}

//get frames and paint it onto the screen
function paintToCanvas(){
  const width = video.videoWidth;
  const height = video.videoHeight;

  //make sure canvas is the same size as the video
  canvas.width = width;
  canvas.height = height;

  //every 16 milliseconds, put the frqme into the canvas
  return setInterval(() => {
    ctx.drawImage(video, 0 , 0, width, height);

    //take the pixels out and change them and put them back
    let pixels = ctx.getImageData(0, 0, width, height);
    // pixels = redEffect(pixels);
    pixels = rgbSplit(pixels);

    //showing 10 more frames
    ctx.globalAlpha = 0.1;
    ctx.putImageData(pixels, 0, 0);
  }, 16);
}

function takePhoto(){
  //playing the sound of photo being taken
  snap.currentTime = 0;
  snap.play();

  //take data out of the canvas
  const data = canvas.toDataURL('image/jpeg');

  //create a link, setting href to data , making a download for it.
  const link = document.createElement('a');
  link.href = data;
  link.setAttribute('download', 'handsome');
  link.innerHTML = `<img src = "${data}" alt = "Handsome girl" />`
  strip.insertBefore(link, strip.firstChild);
  console.log(data);
}

//making a red filter
function redEffect(pixels){
  for (let i = 0; i < pixels.data.length; i += 4){
    pixels.data[i + 0] = pixels.data[i + 0] + 100;
    pixels.data[i + 1] = pixels.data[i + 1] - 50;
    pixels.data[i + 2] = pixels.data[i + 2] * 0.5;
  }
  return pixels;
}

//different' color filter
function rgbSplit(pixels){
  for (let i = 0; i < pixels.data.length; i += 4){
    pixels.data[i - 150] = pixels.data[i + 0];
    pixels.data[i + 100] = pixels.data[i + 1];
    pixels.data[i - 500] = pixels.data[i + 2];
  }
  return pixels;
}

function greenScreen(pixels) {
  const levels = {};

  document.querySelectorAll('.rgb input').forEach((input) => {
    levels[input.name] = input.value;
  });

  for (i = 0; i < pixels.data.length; i = i + 4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3];

    if (red >= levels.rmin
      && green >= levels.gmin
      && blue >= levels.bmin
      && red <= levels.rmax
      && green <= levels.gmax
      && blue <= levels.bmax) {
      // take it out!
      pixels.data[i + 3] = 0;
    }
  }

  return pixels;
}
getVideo();

//once video is played, it's going to emit the can play event which will
//start the paint to canvas
video.addEventListener('canplay', paintToCanvas);
