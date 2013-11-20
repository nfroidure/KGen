function KGen(minLength, minRepeat, minWeight, tagsWeight, attributesWeight, ignoredWords, wordSeparators, wordChainLength, spellCheckEngine)
	{
	// Initializing values
	this.words = new Array();
	this.curWordChain = new Array();
	this.weightTot = 0;
	this.repeatTot = 0;
	this.wordsTot = 0;
	this.rightWords = 0;
	this.badWords = 0;
	this.textChars = 0;
	// Initializing options
	this.minLength = (minLength?minLength:2);
	this.minRepeat = (minRepeat?minRepeat:2);
	this.minWeight = (minWeight?minWeight:2);
	if(tagsWeight&&typeof tagsWeight === 'Array')
		{ this.tagsWeight = tagsWeight; }
	else
		{
		this.tagsWeight = new Array();
		this.tagsWeight['title']=12;
		this.tagsWeight['h1']=10;
		this.tagsWeight['h2']=8;
		this.tagsWeight['h3']=6;
		this.tagsWeight['h4']=4;
		this.tagsWeight['h5']=3;
		this.tagsWeight['h6']=2;
		this.tagsWeight['strong']=3;
		this.tagsWeight['em']=2;
		this.tagsWeight['dt']=3;
		this.tagsWeight['style']=0;
		this.tagsWeight['script']=0;
		}
	if(attributesWeight&&typeof attributesWeight === 'Array')
		{ this.attributesWeight = attributesWeight;	}
	else
		{
		this.attributesWeight=new Array();
		this.attributesWeight['title']=1;
		this.attributesWeight['alt']=1;
		this.attributesWeight['summary']=1;
		this.attributesWeight['content']=1;
		}
	this.ignoredWords = ignoredWords;
	this.wordSeparators = (wordSeparators?wordSeparators:" {}+()[]!?;.,'\":|-_/\<>");
	this.spellCheckEngine = spellCheckEngine;
	this.wordChainLength = (wordChainLength?wordChainLength:1);
	};
KGen.prototype.filter = function ()
	{
	for(var i=0; i<this.words.length; i++)
		{
		var j=i;
		var k=0;
		while(i<this.words.length&&(this.words[i].repeat<this.minRepeat||this.words[i].weight<this.minWeight))
			{
			i++; k++;
			}
		if(k>0) { this.words.splice(j,k); i=j; }
		}
	}
KGen.prototype.getElementWords = function (element, ratio)
	{
	if(this.wordChainLength&&element.nodeName=='div'&&element.nodeName=='blockquote'
		&&element.nodeName=='h1'&&element.nodeName=='h2'&&element.nodeName=='h3'&&element.nodeName=='h4'&&element.nodeName=='h5'&&element.nodeName=='h6'
		&&element.nodeName=='p'&&element.nodeName=='br'&&element.nodeName=='pre'&&element.nodeName=='address'
		&&element.nodeName=='ol'&&element.nodeName=='ul'&&element.nodeName=='dl'&&element.nodeName=='li'&&element.nodeName=='dt'&&element.nodeName=='dd')
		this.curWordChain= new Array();
	if(element.attributes&&element.attributes.length)
		{
		for(var i=element.attributes.length-1; i>=0; i--)
			{
			if(this.attributesWeight[element.attributes[i].name]&&this.attributesWeight[element.attributes[i].name])
				this.getWordsFrom(element.attributes[i].value, this.attributesWeight[element.attributes[i].name]);
			}
		}
	if(this.tagsWeight[element.nodeName.toLowerCase()]&&this.tagsWeight[element.nodeName.toLowerCase()]>1)
		{
		ratio+=this.tagsWeight[element.nodeName.toLowerCase()];
		}
	else if(ratio==0) { ratio+=1; }
	var x = element.childNodes.length;
	for(var i=0; i<x; i++)
		{
		if(element.childNodes[i].nodeName.toLowerCase()=='#text'&&((this.tagsWeight[element.nodeName.toLowerCase()]===undefined)||this.tagsWeight[element.nodeName.toLowerCase()]>0))
			this.getWordsFrom(element.childNodes[i].data,ratio);
		else
			this.getElementWords(element.childNodes[i],ratio);
		}
	}
KGen.prototype.getWordsFrom = function (string, ratio)
	{
	var curString;
	var curWord;
	var x=string.length;
	this.textChars+=x;
	for(var i=0; i<x; i++)
		{
		curString='';
		while(i<x&&string[i]!='\f'&&string[i]!='\n'&&string[i]!='\r'&&string[i]!='\t'
		&&string[i]!='\v'&&string[i]!='\u00A0'&&string[i]!='\u2028'&&string[i]!='\u2029'
		&&this.wordSeparators.indexOf(string[i])===-1)
			{
			curString+=string[i]; i++;
			}
		if(curString.length>this.minLength)
			{
			this.wordsTot++;
			curString = curString.toLowerCase();
			var y = this.words.length;
			for(var j=0; j<y; j++)
				{
				if(this.words[j].name==curString)
					{
					curWord=this.words[j];
					this.words[j].weight+=ratio;
					this.words[j].repeat++;
					this.words[j].positions[this.words[j].positions.length]=this.wordsTot;
					this.repeatTot++;
					this.weightTot+=ratio;
					break;
					}
				}
			if(j==y)
				{
				if(this.ignoredWords)
					{
					var ignore=false;
					for(var k=this.ignoredWords.length-1; k>=0; k--)
						{
						if(curString == this.ignoredWords[k])
							{
							ignore=true; break;
							}
						}
					if(ignore)
						continue;
					}
				this.words[j] = curWord = new Word(curString, ratio, this.wordsTot);
				this.repeatTot++;
				this.weightTot+=ratio;
				if (this.spellCheckEngine&&this.spellCheckEngine.check(curString))
					{
					this.words[j].isRight=true;
					this.rightWords++;
					}
				else
					this.badWords++;
				}
			if(this.wordChainLength)
				{
				this.curWordChain.push(curWord);
				if(this.curWordChain.length>this.wordChainLength)
					this.curWordChain.splice(0,1);
				if(this.curWordChain.length>1)
					{
					var sentence='';
					for(var k=this.curWordChain.length-1; k>=0; k--)
						sentence=this.curWordChain[k].name+(sentence?' '+sentence:'');
					this.words[j+1]=new Word(sentence, ratio, this.wordsTot-1);
					}
				}
			}
		else if(curString.length>1)
			this.wordsTot++;
		}
	}
KGen.prototype.sort = function (criter)
	{
	if(criter=='repeat')
		{
		var sortFn = function(a,b)
			{
			if (a.repeat > b.repeat) return -1;
			if (a.repeat < b.repeat) return 1;
			return 0;
			}
		}
	else if(criter=='length')
		{
		var sortFn = function(a,b)
			{
			if (a.length > b.length) return -1;
			if (a.length < b.length) return 1;
			return 0;
			}
		}
	else if(criter=='name')
		{
		var sortFn = function(a,b)
			{
			for(var i=0; i<a.length && (i==0||a.name[i]==a.name[i]); i++)
				{
				if ((!b.name[i])||a.name[i]>b.name[i]) return 1;
				if (a.name[i]<b.name[i]) return -1;
				}
			return 0;
			}
		}
	else if(criter=='fposition')
		{
		var sortFn = function(a,b)
			{
			if (a.getFirstPosition() > b.getFirstPosition()) return -1;
			if (a.getFirstPosition() < b.getFirstPosition()) return 1;
			return 0;
			}
		}
	else if(criter=='aposition')
		{
		var sortFn = function(a,b)
			{
			if (a.getAveragePosition() > b.getAveragePosition()) return -1;
			if (a.getAveragePosition() < b.getAveragePosition()) return 1;
			return 0;
			}
		}
	else
		{
		var sortFn = function(a,b)
			{
			if (a.weight > b.weight) return -1;
			if (a.weight < b.weight) return 1;
			return 0;
			}
		}
	this.words.sort(sortFn);
	}

function Word(name,weight,position)
	{
	this.name = name;
	this.weight = weight;
	this.repeat = 1;
	this.length = name.length;
	this.positions = new Array();
	this.positions[0]=position;
	this.isRight=false;
	};

Word.prototype.getFirstPosition = function ()
	{
	return this.positions[0];
	}

Word.prototype.getFirstPositionPercents = function (wordTot)
	{
	return this.getFirstPosition()/wordTot*100;
	}

Word.prototype.getAveragePosition = function ()
	{
	var positionSum=0;
	var y=this.positions.length;
	for(var i=0; i<y; i++)
		positionSum+=this.positions[i];
	return Math.round(positionSum/this.positions.length);
	}

Word.prototype.getAveragePositionPercents = function (wordTot)
	{
	return Math.round((this.getAveragePosition()/wordTot)*10000)/100;
	}

Word.prototype.getWeightPercents = function (weightTot)
	{
	return Math.round((this.weight/weightTot)*10000)/100;
	}

Word.prototype.getRepeatPercents = function (repeatTot)
	{
	return Math.round((this.repeat/repeatTot)*10000)/100;
	}
