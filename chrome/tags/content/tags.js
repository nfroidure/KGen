function KgenUI()
	{
	// KGen vars
	this.currentKgen=null;
	this.keywordListbox=null;
	this.keywordTagcloud=null;
	this.tagsWeightListbox=null;
	this.attsWeightListbox=null;
	this.ignoredWordsListbox=null;
	// Gettin properties (i18n)
	this.currentLocales=parent.document.getElementById("kgen-properties");
	// Getting options
	this.currentOptions = new kgenOptionService();
	// Registering sidebar inside BBComposer
	if(window.parent.myBBComposerManager&&window.parent.myBBComposerManager.focusedBBComposer)
		{
		window.parent.myBBComposerManager.toggleSidebar('tags', true);
		}
	// Getting dictionnary interface
	var spellclass = "@mozilla.org/spellchecker/myspell;1";
	if ("@mozilla.org/spellchecker/hunspell;1" in Components.classes)
		spellclass = "@mozilla.org/spellchecker/hunspell;1";
	if ("@mozilla.org/spellchecker/engine;1" in Components.classes)
		spellclass = "@mozilla.org/spellchecker/engine;1";
	this.curKGenSpellCheckEngine = Components.classes[spellclass].getService(Components.interfaces.mozISpellCheckingEngine);
	this.loadOptions();
	this.initEvents();
	// Init KGen
	this.keywordListbox = new KgenKeywordListbox(this);
	this.keywordTagcloud = new KgenKeywordTagCloud(this);
	}

KgenUI.prototype.initEvents = function ()
	{
	window.addEventListener('unload',this.newEventHandler(this,this.unload),false);
	document.getElementById('tag-sortby-name').addEventListener('click',this.newEventHandler(this,function()
		{ this.sortBy('name'); }),false);
	document.getElementById('tag-sortby-repeat').addEventListener('click',this.newEventHandler(this,function()
		{ this.sortBy('repeat'); }),false);
	document.getElementById('tag-sortby-weight').addEventListener('click',this.newEventHandler(this,function()
		{ this.sortBy('weight'); }),false);
	document.getElementById('tag-sortby-aposition').addEventListener('click',this.newEventHandler(this,function()
		{ this.sortBy('aposition'); }),false);
	document.getElementById('tag-keywords2clipboard').addEventListener('command',this.newEventHandler(this,function()
		{ this.keywords2clipboard(false); }),false);
	document.getElementById('tag-keywords2clipboardall').addEventListener('command',this.newEventHandler(this,function()
		{ this.keywords2clipboard(true); }),false);
	document.getElementById('tag-startscan').addEventListener('command',this.newEventHandler(this,this.startScan),false);
	document.getElementById('tag-cloud-factor').addEventListener('change',this.newEventHandler(this,function()
		{ this.currentOptions.setIntOption('extensions.kgen.cloud.factor',document.getElementById('tag-cloud-factor').value); }),false);
	document.getElementById('tag-cloud-redraw').addEventListener('command',this.newEventHandler(this,function()
		{ this.sortBy(document.getElementById('tag-sort').value); }),false);
	document.getElementById('tag-cloud-clipboard').addEventListener('command',this.newEventHandler(this,function()
		{ this.keywordTagcloud.export(); }),false);
	document.getElementById('tag-export-cvsseparator').addEventListener('change',this.newEventHandler(this,function()
		{ this.currentOptions.setCharOption('extensions.kgen.cvsseparator',document.getElementById('tag-export-cvsseparator').value); }),false);
	document.getElementById('tag-export-cvsstring').addEventListener('change',this.newEventHandler(this,function()
		{ this.currentOptions.setCharOption('extensions.kgen.cvsstring',document.getElementById('tag-export-cvsstring').value); }),false);
	document.getElementById('tag-export-cvsselection').addEventListener('change',this.newEventHandler(this,function()
		{ this.currentOptions.setBoolOption('extensions.kgen.cvsselection',document.getElementById('tag-export-cvsselection').checked); }),false);
	document.getElementById('tag-export-cvssave').addEventListener('command',this.newEventHandler(this,this.keywords2file),false);
	document.getElementById('tag-sort').firstChild.addEventListener('popuphiding',this.newEventHandler(this,function()
		{ this.currentOptions.setCharOption('extensions.kgen.sort',document.getElementById('tag-sort').value); }),false);
	document.getElementById('tag-minlength').addEventListener('change',this.newEventHandler(this,function()
		{ this.currentOptions.setIntOption('extensions.kgen.minlength',document.getElementById('tag-minlength').value); }),false);
	document.getElementById('tag-minweight').addEventListener('change',this.newEventHandler(this,function()
		{ this.currentOptions.setIntOption('extensions.kgen.minweight',document.getElementById('tag-minweight').value); }),false);
	document.getElementById('tag-minrepeat').addEventListener('change',this.newEventHandler(this,function()
		{ this.currentOptions.setIntOption('extensions.kgen.minrepeat',document.getElementById('tag-minrepeat').value); }),false);
	document.getElementById('tag-maxword').addEventListener('change',this.newEventHandler(this,function()
		{ this.currentOptions.setIntOption('extensions.kgen.maxword',document.getElementById('tag-maxword').value); }),false);
	document.getElementById('tag-separator').addEventListener('change',this.newEventHandler(this,function()
		{ this.currentOptions.setCharOption('extensions.kgen.separator',document.getElementById('tag-separator').value); }),false);
	document.getElementById('tag-percent').addEventListener('command',this.newEventHandler(this,function()
		{ this.currentOptions.setBoolOption('extensions.kgen.percent',document.getElementById('tag-percent').checked); }),false);
	document.getElementById('tag-wordstot').addEventListener('command',this.newEventHandler(this,function()
		{ this.currentOptions.setBoolOption('extensions.kgen.wordstot',document.getElementById('tag-wordstot').checked); }),false);
	document.getElementById('tag-useignore').addEventListener('command',this.newEventHandler(this,function()
		{ this.currentOptions.setBoolOption('extensions.kgen.ignore',document.getElementById('tag-useignore').checked); }),false);
	document.getElementById('tag-wordseparator').addEventListener('change',this.newEventHandler(this,function()
		{ this.currentOptions.setCharOption('extensions.kgen.wordseparator',document.getElementById('tag-wordseparator').value); }),false);
	document.getElementById('tag-dictionnary').firstChild.addEventListener('popuphiding',this.newEventHandler(this,function()
		{ this.currentOptions.setCharOption('extensions.kgen.dictionnary',document.getElementById('tag-dictionnary').value); }),false);
	document.getElementById('tag-tagslistbox').addEventListener('select',this.newEventHandler(this,function()
		{
		this.tagsWeightListbox.showItem();
		this.tagsWeightListbox.activateCommands();
		}),false);
	document.getElementById('tag-tagsname').addEventListener('focus',this.newEventHandler(this,function()
		{
		this.tagsWeightListbox.activateCommands();
		}),false);
	document.getElementById('tag-tagsweight').addEventListener('focus',this.newEventHandler(this,function()
		{
		this.tagsWeightListbox.activateCommands();
		}),false);
	document.getElementById('tag-tagsadd').addEventListener('command',this.newEventHandler(this,function()
		{
		this.tagsWeightListbox.addItem();
		}),false);
	document.getElementById('tag-attslistbox').addEventListener('select',this.newEventHandler(this,function()
		{
		this.attsWeightListbox.showItem();
		this.attsWeightListbox.activateCommands();
		}),false);
	document.getElementById('tag-attsname').addEventListener('focus',this.newEventHandler(this,function()
		{
		this.attsWeightListbox.activateCommands();
		}),false);
	document.getElementById('tag-attsweight').addEventListener('focus',this.newEventHandler(this,function()
		{
		this.attsWeightListbox.activateCommands();
		}),false);
	document.getElementById('tag-attsadd').addEventListener('command',this.newEventHandler(this,function()
		{
		this.attsWeightListbox.addItem();
		}),false);
	document.getElementById('tag-hostname').addEventListener('change',this.newEventHandler(this,function()
		{ this.currentOptions.setIntOption('extensions.kgen.hostname',document.getElementById('tag-hostname').value); }),false);
	document.getElementById('tag-pathname').addEventListener('change',this.newEventHandler(this,function()
		{ this.currentOptions.setIntOption('extensions.kgen.pathname',document.getElementById('tag-pathname').value); }),false);
	document.getElementById('tag-context-ignore').addEventListener('command',this.newEventHandler(this.ignoredWordsListbox,this.ignoredWordsListbox.addItem),false);
	document.getElementById('tag-context-find').addEventListener('command',this.newEventHandler(this,this.findWord),false);
	document.getElementById('tag-context-synonym').addEventListener('command',this.newEventHandler(this,this.suggestWord),false);
	document.getElementById('tag-context-definition').addEventListener('command',this.newEventHandler(this,this.defineWord),false);
	document.getElementById('tag-context-copy').addEventListener('command',this.newEventHandler(this,function()
		{ this.keywords2clipboard(false,true); }),false);
	document.getElementById('tag-context-copyall').addEventListener('command',this.newEventHandler(this,function()
		{ this.keywords2clipboard(true,true); }),false);
	document.getElementById('tag-context-contribute').addEventListener('command',this.newEventHandler(this,this.contribute),false);
	}

KgenUI.prototype.loadOptions = function ()
	{
	// Initializing fields
	document.getElementById('tag-sort').value=this.currentOptions.getCharOption('extensions.kgen.sort');
	document.getElementById('tag-minlength').value=this.currentOptions.getIntOption('extensions.kgen.minlength');
	document.getElementById('tag-minweight').value=this.currentOptions.getIntOption('extensions.kgen.minweight');
	document.getElementById('tag-minrepeat').value=this.currentOptions.getIntOption('extensions.kgen.minrepeat');
	document.getElementById('tag-maxword').value=this.currentOptions.getIntOption('extensions.kgen.maxword');
	document.getElementById('tag-separator').value=this.currentOptions.getCharOption('extensions.kgen.separator');
	document.getElementById('tag-wordseparator').value=this.currentOptions.getCharOption('extensions.kgen.wordseparator');
	document.getElementById('tag-percent').checked=this.currentOptions.getBoolOption('extensions.kgen.percent');
	document.getElementById('tag-wordstot').checked=this.currentOptions.getBoolOption('extensions.kgen.wordstot');
	document.getElementById('tag-hostname').value=this.currentOptions.getIntOption('extensions.kgen.hostname');
	document.getElementById('tag-pathname').value=this.currentOptions.getIntOption('extensions.kgen.pathname');
	document.getElementById('tag-useignore').checked=this.currentOptions.getBoolOption('extensions.kgen.ignore');
	document.getElementById('tag-cloud-factor').value=this.currentOptions.getIntOption('extensions.kgen.cloud.factor');
	document.getElementById('tag-export-cvsseparator').value=this.currentOptions.getCharOption('extensions.kgen.cvsseparator');
	document.getElementById('tag-export-cvsstring').value=this.currentOptions.getCharOption('extensions.kgen.cvsstring');
	document.getElementById('tag-export-cvsselection').checked=this.currentOptions.getBoolOption('extensions.kgen.cvsselection');
	// Gettin' spellchecker options
	var dictionaries={};
	var count={};
	this.curKGenSpellCheckEngine.getDictionaryList(dictionaries,count);
	var defaultDictionnary = this.currentOptions.getCharOption('extensions.kgen.dictionnary');
	var dictOption = document.getElementById('tag-dictionnary');
	var present=false;
	for(var i=0; i<dictionaries.value.length; i++)
		{
		dictOption.firstChild.appendChild(document.createElement("menuitem"));
		dictOption.firstChild.lastChild.setAttribute('value',dictionaries.value[i]);
		dictOption.firstChild.lastChild.setAttribute('label',dictionaries.value[i]);
		if(dictionaries.value[i]==defaultDictionnary)
			{
			dictOption.value=defaultDictionnary;
			present=true;
			}
		}
	if(dictionaries.value.length&&!present)
		this.currentOptions.setCharOption('extensions.kgen.dictionnary',dictionaries.value[0]);
	else if(!present)
		this.currentOptions.setCharOption('extensions.kgen.dictionnary','');
	// Loading Tags and Attributes weights
	this.tagsWeightListbox = new KgenWeightListbox(this, 'tags');
	this.attsWeightListbox = new KgenWeightListbox(this, 'atts');
	// Loading ignored words
	this.ignoredWordsListbox = new KgenIgnoredWordsListbox(this);
	}

KgenUI.prototype.unload = function ()
	{
	if(window.parent.myBBComposerManager&&window.parent.myBBComposerManager.sidebar)
		window.parent.myBBComposerManager.sidebar=false;
	this.currentOptions.saveOptions();
	this.currentOptions = null;
	this.currentLocales = null;
	this.currentKgen=null;
	this.keywordListbox=null;
	this.keywordTagcloud=null;
	this.tagsWeightListbox=null;
	this.attsWeightListbox=null;
	this.ignoredWordsListbox=null;
	}

KgenUI.prototype.newEventHandler = function (obj,method,handler)
	{
	var fx = method;
	if(handler)
		{
		window[handler] = function () { return fx.apply(obj, arguments); };
		return window[handler];
		}
	return function () { return fx.apply(obj, arguments); }
	}

KgenUI.prototype.startScan = function ()
	{
	var element;
	// Enabling spellcheck engine
	var defaultDictionnary = this.currentOptions.getCharOption('extensions.kgen.dictionnary');
	if(defaultDictionnary)
		this.curKGenSpellCheckEngine.dictionary = defaultDictionnary;
	// Getting scan base element
	if(window.parent.myBBComposerManager&&window.parent.myBBComposerManager.focusedBBComposer&&window.parent.myBBComposerManager.focusedBBComposer.editor.contentDocument)
		{ element=window.parent.myBBComposerManager.focusedBBComposer.editor.contentDocument.body; }
	else if(window.parent.getBrowser().contentDocument&&window.parent.getBrowser().contentDocument.body)
		{ element=window.parent.getBrowser().contentDocument.documentElement; }
	// Starting KGen
	this.currentKGen=new KGen(this.currentOptions.getIntOption('extensions.kgen.minlength'),
		this.currentOptions.getIntOption('extensions.kgen.minrepeat'), this.currentOptions.getIntOption('extensions.kgen.minweight'),
		this.currentOptions.getIntOptions('extensions.kgen.tags'), this.currentOptions.getIntOptions('extensions.kgen.attributes'),
		(this.currentOptions.getBoolOption('extensions.kgen.ignore') ? false : this.currentOptions.getArrayOption('extensions.kgen.words')),
		this.currentOptions.getCharOption('extensions.kgen.wordseparator'), this.currentOptions.getIntOption('extensions.kgen.maxword'),
		(defaultDictionnary?this.curKGenSpellCheckEngine:null));
	// Getting words
	if((!window.parent.myBBComposerManager)||(!window.parent.myBBComposerManager.focusedBBComposer)||(!window.parent.myBBComposerManager.focusedBBComposer.editor.contentDocument))
		{
		this.currentKGen.getWordsFrom(window.parent.getBrowser().contentDocument.location.hostname, this.currentOptions.getIntOption('extensions.kgen.pathname'));
		this.currentKGen.getWordsFrom(decodeURI(window.parent.getBrowser().contentDocument.location.pathname), this.currentOptions.getIntOption('extensions.kgen.hostname'));
		}
	this.currentKGen.getElementWords(element,0);
	// Sorting
	this.currentKGen.filter();
	this.currentKGen.sort(this.currentOptions.getCharOption('extensions.kgen.sort'));
	// Filling ui
	this.keywordListbox.fill();
	this.keywordTagcloud.fill();
	document.getElementById('stats-totalwords').value=this.currentKGen.wordsTot;
	//document.getElementById('stats-originalwords').value=this.currentKGen.words.length;
	document.getElementById('stats-keptwords').value=this.currentKGen.words.length;
	document.getElementById('stats-vocable').value=Math.round(this.currentKGen.words.length/this.currentKGen.wordsTot*10000)/100;
	document.getElementById('stats-totalchars').value=element.innerHTML.length;
	document.getElementById('stats-efficientchars').value=this.currentKGen.textChars;
	document.getElementById('stats-htmlquality').value=Math.round(this.currentKGen.textChars/element.innerHTML.length*10000)/100;
	document.getElementById('stats-totalknown').value=this.currentKGen.rightWords;
	document.getElementById('stats-totalunknown').value=this.currentKGen.badWords;
	document.getElementById('stats-wordsquality').value=Math.round(this.currentKGen.rightWords/(this.currentKGen.rightWords+this.currentKGen.badWords)*10000)/100;
	}

KgenUI.prototype.keywords2clipboard = function (withRepeatAndWeight,onlySelection)
	{
	var separator = this.currentOptions.getCharOption('extensions.kgen.separator');
	var string='';
	if(onlySelection)
		var selectedItems = document.getElementById('tag-listbox').selectedItems;
	else
		var selectedItems = document.getElementById('tag-listbox').getElementsByTagName('listitem');
	var x = selectedItems.length;
	for(var i=0; i<x; i++)
		string+= selectedItems[i].firstChild.getAttribute('label') + (withRepeatAndWeight?' '+selectedItems[i].firstChild.nextSibling.getAttribute('label')+' '+selectedItems[i].firstChild.nextSibling.nextSibling.getAttribute('label')+' '+selectedItems[i].lastChild.getAttribute('label'):'') + (i<x-1?separator:'');
	const gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"]
		.getService(Components.interfaces.nsIClipboardHelper);
	gClipboardHelper.copyString(string);
	}

KgenUI.prototype.sortBy = function (sorter)
	{
	this.currentOptions.setCharOption('extensions.kgen.sort', sorter);
	document.getElementById('tag-sort').value=sorter;
	if(this.currentKGen&&this.keywordListbox)
		{
		this.currentKGen.sort(sorter);
		this.keywordListbox.fill();
		this.keywordTagcloud.fill();
		}
	}

KgenUI.prototype.keywords2file = function ()
	{
	var separator = this.currentOptions.getCharOption('extensions.kgen.cvsseparator');
	var stringseparator = this.currentOptions.getCharOption('extensions.kgen.cvsstring');
	var string='';
	var selectedItems;
	if(this.currentOptions.getBoolOption('extensions.kgen.cvsselection'))
		selectedItems = document.getElementById('tag-listbox').selectedItems;
	else
		selectedItems = document.getElementById('tag-listbox').getElementsByTagName('listitem');
	var x = selectedItems.length;
	if(!x)
		{
		if(this.currentOptions.getBoolOption('extensions.kgen.cvsselection'))
			alert(this.currentLocales.getString('extensions.kgen@elitwork.com.cvsnothingsel'));
		else
			alert(this.currentLocales.getString('extensions.kgen@elitwork.com.cvsnothing'));
		}
	else
		{
		for(var i=0; i<x; i++)
			string+= stringseparator+selectedItems[i].firstChild.getAttribute('label')+stringseparator+separator+selectedItems[i].firstChild.nextSibling.getAttribute('label')+separator+selectedItems[i].firstChild.nextSibling.nextSibling.getAttribute('label')+separator+selectedItems[i].lastChild.getAttribute('label') + (i<x-1?'\n':'');
		var myFile = new bbFile(null);
		if(myFile.fromUserCreation(this.currentLocales.getString('extensions.kgen@elitwork.com.cvssave'), 'kgen-'+new Date().getTime()+'.csv',  '*.csv;', this.currentLocales.getString('extensions.kgen@elitwork.com.cvsmime')))
			myFile.write(string);
		}
	}

KgenUI.prototype.suggestWord = function (hEvent)
	{
	if(this.suggestTab)
		{
		window.parent.getBrowser().selectedTab=this.suggestTab;
		if(window.parent.getBrowser().selectedTab!=this.suggestTab)
			this.suggestTab=false;
		}
	if(!this.suggestTab)
		{
		this.suggestTab=window.parent.getBrowser().addTab(this.currentLocales.getString('extensions.kgen@elitwork.com.suggesthref')+encodeURI(this.keywordListbox.listbox.selectedItem.firstChild.getAttribute('label')));
		window.parent.getBrowser().selectedTab=this.suggestTab;
		}
	else
		{
		window.parent.getBrowser().contentDocument.location.href=this.currentLocales.getString('extensions.kgen@elitwork.com.suggesthref')+encodeURI(this.keywordListbox.listbox.selectedItem.firstChild.getAttribute('label'));
		window.parent.getBrowser().selectedTab=this.suggestTab;
		}
	window.parent.getBrowser().focus();
	}

KgenUI.prototype.defineWord = function (hEvent)
	{
	if(this.defineTab)
		{
		window.parent.getBrowser().selectedTab=this.defineTab;
		if(window.parent.getBrowser().selectedTab!=this.defineTab)
			this.defineTab=false;
		}
	if(!this.defineTab)
		{
		this.defineTab=window.parent.getBrowser().addTab(this.currentLocales.getString('extensions.kgen@elitwork.com.definehref')+encodeURI(this.keywordListbox.listbox.selectedItem.firstChild.getAttribute('label')));
		window.parent.getBrowser().selectedTab=this.defineTab;
		}
	else
		{
		window.parent.getBrowser().contentDocument.location.href=this.currentLocales.getString('extensions.kgen@elitwork.com.definehref')+encodeURI(this.keywordListbox.listbox.selectedItem.firstChild.getAttribute('label'));
		window.parent.getBrowser().selectedTab=this.defineTab;
		}
	window.parent.getBrowser().focus();
	}

KgenUI.prototype.findWord = function (hEvent)
	{
	window.parent.gFindBar.toggleHighlight(false);
	window.parent.gFindBar.open();
	window.parent.gFindBar.getElement("findbar-textbox").value=this.keywordListbox.listbox.selectedItem.firstChild.getAttribute('label');
	window.parent.gFindBar._find(this.keywordListbox.listbox.selectedItem.firstChild.getAttribute('label'));
	window.parent.gFindBar.toggleHighlight(true);
	}

KgenUI.prototype.contribute = function (hEvent)
	{
	window.parent.getBrowser().addTab(this.currentLocales.getString('extensions.kgen@elitwork.com.contributehref'));
	window.parent.getBrowser().selectedTab=this.defineTab;
	window.parent.getBrowser().focus();
	}

/********* KGen Listboxes *********************************/
var KgenKeywordListbox = function (kgenUI)
	{
	this.kgenUI=kgenUI;
	this.listbox=document.getElementById('tag-listbox');
	}

KgenKeywordListbox.prototype.empty = function ()
	{
	var listitems = this.listbox.getElementsByTagName('listitem');
	for(var i=listitems.length-1; i>=0; i--)
		listitems[i].parentNode.removeChild(listitems[i]);
	}

KgenKeywordListbox.prototype.fill = function ()
	{
	this.empty();
	var withPercents = this.kgenUI.currentOptions.getBoolOption('extensions.kgen.percent');
	var withWordsTot = this.kgenUI.currentOptions.getBoolOption('extensions.kgen.wordstot');
	var x = this.kgenUI.currentKGen.words.length;
	for(var i=0; i<x; i++)
		{
		var curListitem = document.createElement("listitem");
		var curListcell = document.createElement("listcell");
		curListcell.setAttribute("label", this.kgenUI.currentKGen.words[i].name);
		if(this.kgenUI.currentKGen.words[i].isRight)
			curListcell.setAttribute('style','background:#ccffcc;');
		curListitem.appendChild(curListcell);
		curListcell = document.createElement("listcell");
		if(withPercents)
			curListcell.setAttribute("label", this.kgenUI.currentKGen.words[i].getRepeatPercents((withWordsTot ? this.kgenUI.currentKGen.wordsTot : this.kgenUI.currentKGen.repeatTot)));
		else
			curListcell.setAttribute("label", this.kgenUI.currentKGen.words[i].repeat);
		curListitem.appendChild(curListcell);
		curListcell = document.createElement("listcell");
		if(withPercents)
			curListcell.setAttribute("label", this.kgenUI.currentKGen.words[i].getWeightPercents(this.kgenUI.currentKGen.weightTot));
		else
			curListcell.setAttribute("label", this.kgenUI.currentKGen.words[i].weight);
		curListitem.appendChild(curListcell);
		curListcell = document.createElement("listcell");
		if(withPercents)
			curListcell.setAttribute("label", this.kgenUI.currentKGen.words[i].getAveragePositionPercents(this.kgenUI.currentKGen.wordsTot));
		else
			curListcell.setAttribute("label", this.kgenUI.currentKGen.words[i].getAveragePosition());
		curListitem.appendChild(curListcell);
		this.listbox.appendChild(curListitem);
		}
	}

var KgenWeightListbox = function(kgenUI, type)
	{
	this.kgenUI=kgenUI;
	this.listbox=document.getElementById('tag-'+type+'listbox');;
	this.type=type;
	this.fill();
	}

KgenWeightListbox.prototype.empty = KgenKeywordListbox.prototype.empty;

KgenWeightListbox.prototype.fill = function ()
	{
	this.empty();
	var curTags = this.kgenUI.currentOptions.getIntOptions('extensions.kgen.'+this.type);
	for(var i in curTags)
		{
		var curListitem = document.createElement("listitem");
		var curListcell = document.createElement("listcell");
		curListcell.setAttribute("label", i);
		curListitem.appendChild(curListcell);
		curListcell = document.createElement("listcell");
		curListcell.setAttribute("label", curTags[i]);
		curListitem.appendChild(curListcell);
		this.listbox.appendChild(curListitem);
		}
	}
KgenWeightListbox.prototype.activateCommands = function ()
	{
	//document.getElementById('tag-'+this.type+'del').setAttribute('disabled',false);
	document.getElementById('tag-'+this.type+'add').setAttribute('disabled',false);
	}
KgenWeightListbox.prototype.showItem = function ()
	{
	if(this.listbox.selectedItem)
		{
		document.getElementById('tag-'+this.type+'name').value=this.listbox.selectedItem.firstChild.getAttribute('label');
		document.getElementById('tag-'+this.type+'weight').value=this.listbox.selectedItem.lastChild.getAttribute('label');
		}
	}
KgenWeightListbox.prototype.addItem = function ()
	{
	this.kgenUI.currentOptions.setIntOption('extensions.kgen.'+this.type+'.'+document.getElementById('tag-'+this.type+'name').value,document.getElementById('tag-'+this.type+'weight').value);
	this.kgenUI.currentOptions.saveOptions();
	this.kgenUI.currentOptions.initOptions();
	this.fill();
	}
KgenWeightListbox.prototype.deleteItem = function ()
	{
	this.kgenUI.currentOptions.clearOption('extensions.kgen.'+this.type+'.'+document.getElementById('tag-'+string+'name').value);
	//this.kgenUI.currentOptions.setIntOption('extensions.kgen.'+this.type+'.'+document.getElementById('tag-'+string+'name').value,1);
	this.refresh(this.kgenUI.currentOptions.getIntOptions('extensions.kgen.'+this.type));
	}
	
var KgenIgnoredWordsListbox = function(kgenUI)
	{
	this.kgenUI=kgenUI;
	this.listbox=document.getElementById('tag-wordslistbox');
	this.fill();
	}

KgenIgnoredWordsListbox.prototype.empty = KgenKeywordListbox.prototype.empty;

KgenIgnoredWordsListbox.prototype.fill = function ()
	{
	this.empty();
	var iWords = this.kgenUI.currentOptions.getArrayOption('extensions.kgen.words');
	
	iWords.sort(function(a,b)
			{
			for(var i=0; i<a.length && (i==0||a[i]==a[i]); i++)
				{
				if ((!b[i])||a[i]>b[i]) return 1;
				if (a[i]<b[i]) return -1;
				}
			return 0;
			});
	for(var i=0; i<iWords.length; i++)
		{
		var curListitem = document.createElement("listitem");
		var curListcell = document.createElement("listcell");
		curListcell.setAttribute("label", iWords[i]);
		curListitem.appendChild(curListcell);
		this.listbox.appendChild(curListitem);
		curListitem.addEventListener('dblclick',this.kgenUI.newEventHandler(this,this.deleteItem),false);
		}
	}

KgenIgnoredWordsListbox.prototype.addItem = function (hEvent)
	{
	this.kgenUI.currentOptions.setCharOption('extensions.kgen.words', this.kgenUI.currentOptions.getCharOption('extensions.kgen.words')+'!'+this.kgenUI.keywordListbox.listbox.selectedItem.firstChild.getAttribute('label'));
	this.fill();
	}

KgenIgnoredWordsListbox.prototype.deleteItem = function (hEvent)
	{
	var iWords = this.kgenUI.currentOptions.getArrayOption('extensions.kgen.words');
	for(var i=0; i<iWords.length; i++)
		{
		if(iWords[i]==this.kgenUI.keywordListbox.listbox.selectedItem.firstChild.getAttribute('label'))
			{ iWords.splice(i,1) }
		}
	this.kgenUI.currentOptions.setArrayOption('extensions.kgen.words', iWords);
	this.fill();
	}

/********* KGen TagCloud *********************************/
function KgenKeywordTagCloud(kgenUI)
	{
	this.kgenUI=kgenUI;
	this.browser=document.getElementById('tag-cloud-browser');
	}

KgenKeywordTagCloud.prototype.empty = function ()
	{
	while(this.browser.contentDocument.body.firstChild)
		{
		this.browser.contentDocument.body.removeChild(this.browser.contentDocument.body.firstChild);
		}
	}
KgenKeywordTagCloud.prototype.fill = function ()
	{
	var factor=this.kgenUI.currentOptions.getIntOption('extensions.kgen.cloud.factor');
	this.empty();
	var x = this.kgenUI.currentKGen.words.length;
	var newP=this.browser.contentDocument.createElement('p');
	for(var i=0; i<x; i++)
		{
		var newSpan = this.browser.contentDocument.createElement('span');
		newSpan.innerHTML = this.kgenUI.currentKGen.words[i].name + ' ';
		newSpan.setAttribute('style','font-size:'+ (this.kgenUI.currentKGen.words[i].getWeightPercents(this.kgenUI.currentKGen.weightTot)*factor/100) +'em;');
		newP.appendChild(newSpan);
		}
	this.browser.contentDocument.body.appendChild(newP);
	}

KgenKeywordTagCloud.prototype.export = function (currentKGen, factor)
	{
	const clipboardHelper = Components.classes['@mozilla.org/widget/clipboardhelper;1']
	  .getService(Components.interfaces.nsIClipboardHelper);
	clipboardHelper.copyString(this.browser.contentDocument.body.innerHTML + '<p>'+this.kgenUI.currentLocales.getString('extensions.kgen@elitwork.com.cloud')+' <a href="'+this.kgenUI.currentLocales.getString('extensions.kgen@elitwork.com.link')+'" title="'+this.kgenUI.currentLocales.getString('extensions.kgen@elitwork.com.tooltip')+'">'+this.kgenUI.currentLocales.getString('extensions.kgen@elitwork.com.title')+'</a></p>');
	}

/* Initialisation */
var ui;
window.addEventListener('load',function ()
	{
	ui=new KgenUI();
	},false);