const bg = document.getElementById('bgm');
bg.volume = 0.1;

//listens for click
document.addEventListener('click', function () {
	bg.play();
	document.getElementById('click').hidden = true;
});
