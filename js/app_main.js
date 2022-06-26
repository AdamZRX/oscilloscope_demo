var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext;
var audioGain;
var analyser;
var analyserL, analyserR, dataArrayL, dataArrayR, splitter,size;
var frequencyData;
var clock;
var cvs;
var ctx;
var theWindow;
var viewMode;
var thisOsc;
var bufferLength;
class Oscilloscope {
	
	constructor(options) {
		thisOsc = this;
		this.at 			= options.at			|| "container";
		this.background 	= options.background	|| "white";
		this.color 			= options.color			|| "black";
		this.framerate 		= options.framerate		|| 24;
		this.id 			= options.id			|| "theOsc";
		this.thickness 		= options.thickness		|| 5;
		this.window 		= options.window		|| 2.0;
		this.fade 			= options.fade			|| 1;
		this.smoothing 		= options.smoothing		|| 0.8;
		this.type 			= options.type	 		|| "oscilloscope";
		this.playing 		= options.playing	 	|| false;
		this.fftSize 		= options.fftSize	 	|| 2048;
		this.direction 		= options.direction	 	||"forward";
		this.maxDecibels 		= options.maxDecibels	 	|| -30;
		this.minDecibels 		= options.minDecibels	 	|| -100;
		
		var canvas = document.createElement('canvas')
		canvas.id = this.id;
		canvas.style.backgroundColor = this.background;
		var container = document.querySelector('#'+this.at)
		container.appendChild(canvas);
		cvs = canvas;
		cvs.width = 1000;
		cvs.height = 1000;
		ctx = cvs.getContext('2d');
		ctx.strokeStyle = this.color;
		ctx.fillStyle = hexToRGB(this.background, this.fade);
		theWindow = this.window;
		this.setThickness(this.thickness);
		viewMode = this.type;
		this.setType(this.type);
	}
	
	draw(e){
			if (viewMode == "XY"){
				 size = Math.min(cvs.width, cvs.height)
				analyserL.getFloatTimeDomainData(dataArrayL);
				analyserR.getFloatTimeDomainData(dataArrayR);
				ctx.fillRect(0, 0, cvs.width, cvs.height);
				ctx.beginPath();
				ctx.moveTo(-(dataArrayL[0]+1)*size/2+size/2+cvs.width/2, -(dataArrayR[0]+1)*size/2+size);
				for (var i = 0; i < dataArrayL.length; i++) {
					ctx.lineTo(-(dataArrayL[i]+1)*size/2+size/2+cvs.width/2, -(dataArrayR[i]+1)*size/2+size);
				}
				ctx.stroke();
		   }
	}
	
	setFramerate(e){
		this.framerate = e;
		var milliseconds = 1000 / this.framerate;
		clearInterval(clock);
		clock = setInterval(this.draw, milliseconds);
	}
	
	setColor(e) {
		this.color = e;
		ctx.strokeStyle = this.color;
		this.draw()
	}
	
	setBackground(e) {
		this.background = e;
		cvs.style.backgroundColor = this.background;
		ctx.fillStyle = hexToRGB(this.background, 0.5);
	}
	
	setType(e) {
		this.type = e;
		viewMode = e;
		if (e == 'XY'){
			ctx.strokeStyle = this.color;
			ctx.fillStyle = hexToRGB(thisOsc.background, thisOsc.fade);
	   }
	}
	
	setThickness(e) {
		this.thickness = e;
		ctx.lineWidth = this.thickness;
	}
	
	setFFTSize(e) {
		this.fftSize = e;
		analyser.fftSize = e;
	}
	
	setFade(e) {
		this.fade = e;
	   ctx.fillStyle = hexToRGB(thisOsc.background, thisOsc.fade);
	}
	
	setDirection(e) {
		this.direction = e;
	}
	
	setWindow(e) {
		this.window = e;
		theWindow = this.window
	}
	setSmoothing(e) {
		this.smoothing = parseFloat(e);
		analyser.smoothingTimeConstant = this.smoothing;
	}
	
	setMinDecibels(e) {
		analyser.minDecibels = e;
	}
	
	setMaxDecibels(e) {console.log(e)
		analyser.maxDecibels = e;
	}
  
	resume() {
		this.setFramerate(this.framerate);
		this.playing = true;
	}
	
	freeze() {
		clearInterval(clock);
		this.playing = false;
	}
}

function hexToRGB(hex, alpha) {
   var r = parseInt(hex.slice(1, 3), 16),
	   g = parseInt(hex.slice(3, 5), 16),
	   b = parseInt(hex.slice(5, 7), 16);
   if (alpha) {
	   return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
   } else {
	   return "rgb(" + r + ", " + g + ", " + b + ")";
   }
}

var aplayer = document.getElementById('mAudioPlayer');
//var aplayer = new Audio('spavec.mp3');
aplayer.loop = true;

var options = {
	at: "container",
	type: "XY",
	thickness: 1,
	id: "theOsc",
	color: "#000000",
	background: "#ffffff",
	fade: 1,
	fftSize: 2048,
}

var newSource;
var myOscilloscope = new Oscilloscope(options)
   function audioSetup(){ audioContext = new AudioContext();
	   analyser = audioContext.createAnalyser();
	   analyser.fftSize = 2048;
	   analyser.smoothingTimeConstant = 0.5;
	   analyser.maxDecibels = -30;
	   analyser.minDecibels = -100;
	   analyser.smoothingTimeConstant = 0.1;
	   frequencyData = new Float32Array(analyser.frequencyBinCount);
	   aplayer.setAttribute('src', 'spavec.mp3');
	   var oscillator = audioContext.createOscillator();
	   oscillator.type = "sine";
	   oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
	   //oscillator.connect(analyser);
	   oscillator.start();
	   audioGain = audioContext.createGain();
	   audioGain.gain.setValueAtTime(1, audioContext.currentTime);
	   audioGain.connect(analyser);
	   audioGain.connect(audioContext.destination);
	   myOscilloscope.resume();
	   radioSrc = audioContext.createMediaElementSource(aplayer);
	   radioSrc.connect(audioGain);
	   splitter = audioContext.createChannelSplitter();
	   analyserL = audioContext.createAnalyser();
	   analyserL.smoothingTimeConstant = 0.7;
	   analyserR = audioContext.createAnalyser();
	   analyserR.smoothingTimeConstant = 0.7;
	   radioSrc.connect(splitter);
	   splitter.connect(analyserL,0,0);
	   splitter.connect(analyserR,1,0);
	   analyserL.fftSize = 4096;
	   analyserR.fftSize = 4096;
	   bufferLength = analyserL.fftSize;
	   dataArrayL = new Float32Array(bufferLength);
	   dataArrayR = new Float32Array(bufferLength);
	}

myOscilloscope.setFramerate('60');
audioSetup();
//aplayer.play();
