var userName;

var conds = [
	['r', 'gf'],
	['r', 'gs'],
	['gf', 'gs']];
var cond = -1;
var pairno = 0;

var randomInt = function(max)
{
	return Math.floor(Math.random() * max);
};

var shuffle = function(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = randomInt(currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

var randomBool = function()
{
	return Math.random() < .5;
};

var cond_order = [];
for (var i = 0; i < 5; i++) {
	cond_order.push(0);
	cond_order.push(1);
	cond_order.push(2);
}
var melodies_order = {r: [], gf: [], gs: []};

for (i = 0; i < 10; i++) {
	melodies_order.r.push(i);
	melodies_order.gf.push(i);
	melodies_order.gs.push(i);
}

shuffle(cond_order);
shuffle(melodies_order.r);
shuffle(melodies_order.gf);
shuffle(melodies_order.gs);

var genName = function()
{
    var text = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 10; i++) 
    {
        text += characters.charAt(randomInt(characters.length));
    }

    return text;
};

function newName()
{
	userName = sessionStorage.userName = genName();
}

if (localStorage.userName) {
	userName = sessionStorage.userName;
} else {
	newName();
}

var survey_url = "/post/survey";
var choice1, choice2, randomLeft;

var getModeName = function(argument) {
	return conds[cond][randomLeft == (argument == 1) ? 0 : 1];
}

function newChoices()
{
	if (pairno == 15) {
		location.pathname = "/thanks.html";
		return;
	}

	disableButtons();
	cond = cond_order[pairno];
	randomLeft = randomBool();
	choice1 = melodies_order[getModeName(1)].pop();
	choice2 = melodies_order[getModeName(2)].pop();
	document.getElementById("pairno").textContent = ++pairno;
	document.querySelector(".progress > span").style.width = (pairno / 15 * 100) + "%";
	document.getElementsByTagName("h2")[0].textContent = "Next pair comes in 3 seconds...";
	setTimeout(function() {
		document.getElementsByTagName("h2")[0].textContent = "Next pair comes in 2 seconds...";
		setTimeout(function() {
			document.getElementsByTagName("h2")[0].textContent = "Next pair comes in 1 second...";
			setTimeout(function() {
				document.getElementsByTagName("h2")[0].textContent = "Listen to the melodies";
				listen(1, function() { listen(2); });
			}, 1000);
		}, 1000);
	}, 1000);
}

var getSampleName = function(argument)
{
	var sample = argument == 1 ? choice1 : choice2;
	return getModeName(argument) + sample;
}

var enableButtons = function()
{
	var btns = document.getElementsByTagName("button");
	for (var i = 0; i < btns.length; i++)
	{
		btns[i].disabled = false;
	}
};

var disableButtons = function()
{
	var btns = document.getElementsByTagName("button");
	for (var i = 0; i < btns.length; i++)
	{
		btns[i].disabled = true;
	}
};

function listen(argument, callback) {
	var snd = new Audio(getSampleName(argument) + '.mp3');
	snd.play();
	var playingFlag = document.querySelector(".ebox" + argument + " .playing");
	setTimeout(function() {
		playingFlag.style.visibility = "hidden";
		if (callback) {
			setTimeout(callback, 750);
		} else {
			document.getElementsByTagName("h2")[0].textContent = "Which of these melodies do you prefer?";
			enableButtons();
		}
	}, 4000);
	disableButtons();
	playingFlag.style.visibility = "visible";
}

function listenSample() {
	var snd = new Audio('r0.mp3');
	snd.play();
	var button = document.getElementsByClassName("play")[0];
	button.disabled = true;
	setTimeout(function() {
		button.disabled = false;
	}, 4000);
}

function prefer(argument)
{
	disableButtons();
	var request = new XMLHttpRequest();
	request.onreadystatechange = function () {
	    var DONE = this.DONE || 4;
	    if (this.readyState === DONE) {
	        newChoices();
	    }
	};
	request.open('POST', survey_url, true);
	request.setRequestHeader("Content-Type", "text/plain");
	document.getElementById("pairno").textContent = pairno + 1;
	request.send([userName, getSampleName(argument), getSampleName(3 - argument), cond].join());
}
