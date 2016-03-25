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
	userName = localStorage.userName = genName();
}

if (localStorage.userName) {
	userName = localStorage.userName;
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
		location.pathname = "/done.html";
		return;
	}
	if (pairno > 1) {
		var s = document.getElementsByClassName("container")[0].style;
		s.animationName = '';
		s.animationName = 'nextQuestion';
	}

	cond = cond_order[pairno];
	randomLeft = randomBool();
	choice1 = melodies_order[getModeName(1)].pop();
	choice2 = melodies_order[getModeName(2)].pop();
	document.getElementById("pairno").textContent = ++pairno;
	listen(1, function() { listen(2); });
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
		enableButtons();
		playingFlag.style.visibility = "hidden";
		if (callback) {
			callback();
		}
	}, 4400);
	disableButtons();
	playingFlag.style.visibility = "visible";
}

function listenSample() {
	var snd = new Audio('r0.mp3');
	snd.play();
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
