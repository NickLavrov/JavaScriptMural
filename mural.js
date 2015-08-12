/********************
Nick Lavrov
mural.js

Creates a dynamic mosaic-like mural of a picture.
User can drag and drop their own photo.
Press space to save the image.

Visit nicklavrov.com/mural to see it in action!
********************/

// Draws the image on the canvas so that we can use getImageData() to get 
// the color of each pixel Then we clear the canvas, of course, and let 
// the mosaic effect occur.
function drawImage(imageObj) {
	// resize image and canvas to fit in window correctly
	imageObj.width = imageObj.naturalWidth;
	imageObj.height = imageObj.naturalHeight;
	if (imageObj.width > maxWidth) {
		var scale = maxWidth / imageObj.width;
		imageObj.width = imageObj.width * scale;
		imageObj.height = imageObj.height * scale;
	}
	if (imageObj.height > maxHeight) {
		var scale = maxHeight / imageObj.height;
		imageObj.width = imageObj.width * scale;
		imageObj.height = imageObj.height * scale;
	}
	cWidth = imageObj.width;
	cHeight = imageObj.height;
	canvas.width = cWidth;
	canvas.height = cHeight;
	// draw the image and pull all the colors into an array
	context.drawImage(imageObj, 0, 0, cWidth, cHeight);
	var imageData = context.getImageData(0, 0, imageObj.width, imageObj.height);
	myData = imageData.data;
	// get image data has four entries for each array. For simplicity, convert
	// every four entries into one hex string
	var hexColors = new Array(myData.length/4);
	var dec2hex = function(d) {
		var s = "00" + Number(d).toString(16);
		return s.substring(s.length - 2);
	};
	for (var i = 0; i < myData.length; i += 4) {
		hexColors[i/4] = "#" + dec2hex(myData[i]) + dec2hex(myData[i+1]) + dec2hex(myData[i+2]);
	}
	myHexData = hexColors;
}

// draws the block on the canvas
function drawRectangle(myRectangle, context) {
	context.beginPath();
	context.rect(myRectangle.x-myRectangle.size/2, myRectangle.y-myRectangle.size/2, myRectangle.size, myRectangle.size);
	context.fillStyle = myRectangle.color;
	context.fill();
}

// converts the Cartesian coordinates into a linear index and returns 
// the color of the identified pixel
function getColorFromData(x, y) {
	var index= x + (y - 1) * cWidth;
	return myHexData[index];
}

// A shim to handle the different requestAnimationFrame functions
window.requestAnimFrame = (function(callback) {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function(callback) {
		window.setTimeout(callback, 1000 / 60);
	};
})();

// The main animation loop
function animate(myRectangle, canvas, context) {
	// Pick a random pixel, get the color, and draw the block
	myRectangle.x=Math.round(Math.random()*cWidth);
	myRectangle.y=Math.round(Math.random()*cHeight);
	myRectangle.color=getColorFromData(myRectangle.x, myRectangle.y);
	drawRectangle(myRectangle, context);
	// adjust size variable, make it shrink then grow
	myRectangle.size += inc;
	if (myRectangle.size < minSize || myRectangle.size > maxSize) {
		inc *= -1;	
	}
	// request new frame
	requestAnimFrame(function() {
		animate(myRectangle, canvas, context);
	});
}



// Will run while user is holding a file over the window
function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
}

// Will run once user releases the file
function handleFileSelect(evt) {
	evt.stopPropagation();
	evt.preventDefault();
    var files = evt.dataTransfer.files; // FileList object.
    var f = files[0]; // Only take one file, in case they try and be sneaky and drag over a few
    var reader = new FileReader();
    reader.onloadend = function() {
    	imageObj.src = reader.result; // runs the imageObj.onload function again
    };
    if (f) {
    	reader.readAsDataURL(f);
    } else {
    	alert('no file');
    }		
}

// Save image as png when user presses spacebar
function handleKeyboard(e) {
	var k = e.which || e.keyCode;
	if (k == "32") {
		var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");  
		// here is the most important part because if you dont replace you will get a DOM 18 exception.
		var link = document.createElement('a');
		var filename = prompt("Save picture as:", "mural.png");
		link.download = filename;
		link.href=image;
		if (filename !== null) {
			link.click();
		}
	}
}

// Define the context to draw on
var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');

// size variables for the blocks
var maxSize = 70;
var minSize = 2;
var inc = -1/50;

// object to hold the data for a block
var myRectangle = {
	x: 0,
	y: 75,
	size: maxSize,
	color: "#123456"
};

// vars about image and canvas size
var cWidth = 100;
var cHeight = 100;
var maxWidth = 1000;
var maxHeight = 650;

// vars to hold image color data
var myData = [];
var myHexData = [];

var imageList = ['ocean.jpg', 'bird.jpg', 'tree.jpg']; // some random pictures I found

var imageObj = new Image();
imageObj.src = imageList[Math.round(Math.random()*(imageList.length-1))];

// Won't start until the image has loaded
imageObj.onload = function() {
	drawImage(this);
    //okay now the colors are all in myHexData!!!!
    context.clearRect(0, 0, canvas.width, canvas.height);
    myRectangle.size = maxSize;
    drawRectangle(myRectangle, context);
    animate(myRectangle, canvas, context);
};

// add listeners
window.addEventListener('dragover', handleDragOver, false);
window.addEventListener('drop', handleFileSelect, false);
window.addEventListener("keypress", handleKeyboard, false);
