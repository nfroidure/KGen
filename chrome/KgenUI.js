/********* KGen UI *********************************/
var KgenUI = function () {
	this.currentKGen = null;
	this.bottombar = null;
	this.keywordsList = null;
	this.keywordsTagCloud = null;
	this.startScan();
}

KgenUI.prototype.startScan = function () {
	this.bottombar = document.getElementById('kgenBottomBar')
	if (this.bottombar)
		this.removeBottomBar();
	this.currentKGen = new KGen();
	this.currentKGen.getElementWords(document, 0);
	this.currentKGen.getWordsFrom(document.location.host, 7);
	this.currentKGen.getWordsFrom(decodeURI(document.location.path), 3);
	this.currentKGen.sort('weight');
	this.drawBottomBar();
}

KgenUI.prototype.drawBottomBar = function () {
	this.bottombar = document.createElement('div');
	this.bottombar.setAttribute('id', 'kgenBottomBar');
	this.bottombar.setAttribute('style', 'position:fixed; bottom:0; left:0; \
  	width:100%; height:235px; background:#dbdbdb; border-top:2px solid #ccc;');
	this.bottombar.innerHTML = '\
	  <p style="line-height:30px; font-size:15px; color:#fff; margin:0 1%;">\
	    <strong>KGen 4 Chrome : SEO Keyword Scanner</strong>\
	    - <a href="http://kgen.elitwork.com/">Home / Donate us</a>\
	  </p>\
	  <div style="width:40%; height:200px; float:left; margin:0 1% 0 1%; background:#fff;">\
	    <p style="line-height:15px; padding:0; margin:0;"><strong>Keywords list</strong></p>\
	    <table style="display:block; height:185px; width:100%; overflow:auto;">\
	      <thead><tr>\
	        <th>Keyword</th>\
	        <th>Repeats</th>\
	        <th>Weight</th>\
	        <th>Position</th>\
        </tr></thead>\
        <tbody id="kgenKeywords">\
        </tbody>\
      </table>\
    </div>\
    <div id="kgenTagCloud" style="width:33%; float:left; margin:0 1% 0 1%;\
      height:200px; overflow:auto; background:#fff; line-height:15px;"></div>\
    <div id="kgenStats" style="width:22%; float:left; margin:0 1% 0 0;\
      height:200px; overflow:auto; background:#fff;">\
      <p style="line-height:15px; padding:0; margin:0;">\
        <strong>Page stats</strong>\
      </p>\
      <p>\
        <strong>Keywords</strong><br/>\
        Total words found : <span id="kgenStatsTotalwords"></span><br/>\
        Different words found : <span id="kgenStatsOriginalwords"></span><br/>\
        Vocable richness (%) : <span id="kgenStatsVocable"></span>\
      </p>\
      <p>\
        <strong>HTML</strong><br/>\
        Total characters found : <span id="kgenStatsTotalchars"></span><br/>\
        Characters displaying text : <span id="kgenStatsEfficientchars"></span><br/>\
        HTML richness (%) : <span id="kgenStatsHtmlquality"></span>\
      </p>\
    </div>';
	document.body.setAttribute('style', 'padding:0 0 202px 0; font-size:12px;');
	document.body.appendChild(this.bottombar);
	this.keywordsList = new KgenKeywords(this);
	this.keywordsList.fill();
	this.keywordsTagCloud = new KgenKeywordTagCloud(this);
	this.keywordsTagCloud.fill();
	document.getElementById('kgenStatsTotalwords').innerHTML =
	  this.currentKGen.wordsTot;
	document.getElementById('kgenStatsOriginalwords').innerHTML =
	  this.currentKGen.words.length;
	document.getElementById('kgenStatsVocable').innerHTML =
	  Math.round(this.currentKGen.words.length / this.currentKGen.wordsTot * 10000) / 100;
	document.getElementById('kgenStatsTotalchars').innerHTML =
	  document.body.innerHTML.length;
	document.getElementById('kgenStatsEfficientchars').innerHTML =
	  this.currentKGen.textChars;
	document.getElementById('kgenStatsHtmlquality').innerHTML =
	  Math.round(this.currentKGen.textChars / document.body.innerHTML.length * 10000) / 100;
}

KgenUI.prototype.removeBottomBar = function () {
	this.bottombar.parentNode.removeChild(this.bottombar);
}

KgenUI.prototype.close = function () {
	delete this;
}

/********* KGen Listboxes *********************************/
var KgenKeywords = function (kgenUI) {
	this.kgenUI = kgenUI;
	this.tbody = document.getElementById('kgenKeywords');
}

KgenKeywords.prototype.empty = function () {
	while (this.tbody.firstChild)
		this.tbody.removeChild(this.tbody.firstChild);
}

KgenKeywords.prototype.fill = function () {
	this.empty();
	var withPercents = false;
	var withWordsTot = false;
	var x = this.kgenUI.currentKGen.words.length;
	for (var i = 0; i < x; i++) {
		var tr = document.createElement("tr");
		var td = document.createElement("td");
		td.innerHTML = this.kgenUI.currentKGen.words[i].name;
		tr.appendChild(td);
		td = document.createElement("td");
		if (withPercents) {
			td.innerHTML = this.kgenUI.currentKGen.words[i].getRepeatPercents((
			  withWordsTot ?
			    this.kgenUI.currentKGen.wordsTot :
			    this.kgenUI.currentKGen.repeatTot));
		} else {
		  td.innerHTML = this.kgenUI.currentKGen.words[i].repeat;
		}
		tr.appendChild(td);
		td = document.createElement("td");
		if (withPercents) {
			td.innerHTML = this.kgenUI.currentKGen.words[i].getWeightPercents(
			  this.kgenUI.currentKGen.weightTot);
		} else {
			td.innerHTML = this.kgenUI.currentKGen.words[i].weight;
		}
		tr.appendChild(td);
		td = document.createElement("td");
		if (withPercents) {
			td.innerHTML = this.kgenUI.currentKGen.words[i].getAveragePositionPercents(
			  this.kgenUI.currentKGen.wordsTot);
		} else {
			td.innerHTML = this.kgenUI.currentKGen.words[i].getAveragePosition();
		}
		tr.appendChild(td);
		this.tbody.appendChild(tr);
	}
}


/********* KGen TagCloud *********************************/
function KgenKeywordTagCloud(kgenUI) {
	this.kgenUI = kgenUI;
	this.tagcloud = document.getElementById('kgenTagCloud');
}

KgenKeywordTagCloud.prototype.empty = function () {
	while (this.tagcloud.firstChild) {
		this.tagcloud.removeChild(this.tagcloud.firstChild);
	}
}

KgenKeywordTagCloud.prototype.fill = function () {
	var factor = 75;
	this.empty();
	var x = this.kgenUI.currentKGen.words.length;
	var newP = document.createElement('p');
	for (var i = 0; i < x; i++) {
		var newSpan = document.createElement('span');
		newSpan.innerHTML = this.kgenUI.currentKGen.words[i].name + ' ';
		newSpan.setAttribute('style', 'font-size:'
		  + (this.kgenUI.currentKGen.words[i].getWeightPercents(
		    this.kgenUI.currentKGen.weightTot) * factor / 100) +
		    'em; line-height:' + (this.kgenUI.currentKGen.words[i].getWeightPercents(
		      this.kgenUI.currentKGen.weightTot) * factor / 600) + 'em;');
		newP.appendChild(newSpan);
	}
	this.tagcloud.appendChild(newP);
}

new KgenUI();
