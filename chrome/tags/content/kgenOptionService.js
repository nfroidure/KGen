function kgenOptionService(prefBranch)
	{
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
	this.initOptions();
	};
	/* FROZEN METHODS */
	kgenOptionService.prototype.setCharOption = function (name, value)
		{
		this.optionName['char'][this.optionName['char'].length] = name;
		this.optionValue['char'][name] = value;
		}
	kgenOptionService.prototype.setIntOption = function (name, value)
		{
		this.optionName['int'][this.optionName['int'].length] = name;
		this.optionValue['int'][name] = value;
		}
	kgenOptionService.prototype.setBoolOption = function (name, value)
		{
		this.optionName['bool'][this.optionName['bool'].length] = name;
		this.optionValue['bool'][name] = value;
		}
	kgenOptionService.prototype.setArrayOption = function (name, value)
		{
		this.optionName['char'][this.optionName['char'].length] = name;
		this.optionValue['char'][name] = value.join('!');
		}
	kgenOptionService.prototype.getCharOption = function (name)
		{
		if(this.optionIsCached(name,'char'))
			return this.optionValue['char'][name];
		else if(this.prefServ.prefHasUserValue(name))
			{
			this.optionName['char'][this.optionName['char'].length] = name;
			return this.optionValue['char'][name] = this.prefServ.getCharPref(name);
			}
		else if(this.defaultOptionIsset(name))
			return this.prefServ.getCharPref(name);
		return false;
		}
	kgenOptionService.prototype.getIntOption = function (name)
		{
		if(this.optionIsCached(name,'int'))
			return this.optionValue['int'][name];
		else if(this.prefServ.prefHasUserValue(name))
			{
			this.optionName['int'][this.optionName['int'].length] = name;
			return this.optionValue['int'][name] = this.prefServ.getIntPref(name);
			}
		else if(this.defaultOptionIsset(name))
			return this.prefServ.getIntPref(name);
		return false;
		}
	kgenOptionService.prototype.getBoolOption = function (name)
		{
		if(this.optionIsCached(name,'bool'))
			return this.optionValue['bool'][name];
		else if(this.prefServ.prefHasUserValue(name))
			{
			this.optionName['bool'][this.optionName['bool'].length] = name;
			return this.optionValue['bool'][name] = this.prefServ.getBoolPref(name);
			}
		else if(this.defaultOptionIsset(name))
			return this.prefServ.getBoolPref(name);
		return false;
		}
	kgenOptionService.prototype.getArrayOption = function (name)
		{
		return this.getCharOption(name).split('!');
		}
	kgenOptionService.prototype.clearOption = function (name)
		{
		if(this.prefServ.prefHasUserValue(name))
			this.prefServ.clearUserPref(name);
		if(this.optionIsCached(name, 'bool'))
			this.optionValue['bool'][name]=null;
		else if(this.optionIsCached(name, 'char'))
			this.optionValue['char'][name]=null;
		else if(this.optionIsCached(name, 'int'))
			this.optionValue['int'][name]=null;
		}
	kgenOptionService.prototype.optionIsset = function (name)
		{
		if(this.userOptionIsset(name))
			return true;
		else if(this.defaultOptionIsset(name))
			return true;
		else
			return false;
		}
	kgenOptionService.prototype.defaultOptionIsset = function (name)
		{
		var childList = this.defaultPrefServ.getChildList(name.replace(/(.+)\.(?:[^\.]+)/,'$1'),{});
		for(var i=0; i<childList.length; i++)
			if(childList[i] == name)
				return true;
		return false;
		}
	kgenOptionService.prototype.userOptionIsset = function (name)
		{
		if(this.optionIsCached(name, 'bool')||this.optionIsCached(name, 'char')||this.optionIsCached(name, 'int'))
			return true;
		else if(this.prefServ.prefHasUserValue(name))
			return true;
		return false;
		}
	kgenOptionService.prototype.optionIsCached = function (name, type)
		{
		if(this.optionValue[type][name]!==undefined&&this.optionValue[type][name]!==null)
			return true
		return false;
		}
	kgenOptionService.prototype.saveOptions = function ()
		{
		for(var i=0; i<this.optionName['char'].length; i++)
			{
			if(this.optionIsCached(this.optionName['char'][i],'char'))
				this.prefServ.setCharPref(this.optionName['char'][i], this.optionValue['char'][this.optionName['char'][i]]);
			}
		for(var i=0; i<this.optionName['int'].length; i++)
			{
			if(this.optionIsCached(this.optionName['int'][i],'int'))
				this.prefServ.setIntPref(this.optionName['int'][i], this.optionValue['int'][this.optionName['int'][i]]);
			}
		for(var i=0; i<this.optionName['bool'].length; i++)
			{
			if(this.optionIsCached(this.optionName['bool'][i],'bool'))
				this.prefServ.setBoolPref(this.optionName['bool'][i], this.optionValue['bool'][this.optionName['bool'][i]]);
			}
		}
	kgenOptionService.prototype.resetOptions = function ()
		{
		this.prefServ.resetUserPrefs();
		this.initOptions();
		}
	kgenOptionService.prototype.initOptions = function ()
		{
		this.prefServ = this.prefs.getBranch('');
		this.defaultPrefServ = this.prefs.getDefaultBranch('');
		this.optionValue = new Array();
		this.optionValue['char'] = new Array();
		this.optionValue['bool'] = new Array();
		this.optionValue['int'] = new Array();
		this.optionName = new Array();
		this.optionName['char'] = new Array();
		this.optionName['bool'] = new Array();
		this.optionName['int'] = new Array();
		}
	/* END OF FROZEN METHODS */
	kgenOptionService.prototype.getIntOptions = function (branchName)
		{
		var intOptions = new Array();
		var childList = this.prefServ.getChildList(branchName,{});
		for(var i=0; i<childList.length; i++)
			{
			intOptions[childList[i].replace(/(?:.+)\.([^\.]+)/,'$1')] = this.getIntOption(childList[i]);
			}
		return intOptions;
		}
	kgenOptionService.prototype.getCharOptions = function (branchName)
		{
		var charOptions = new Array();
		var childList = this.prefServ.getChildList(branchName,{});
		for(var i=0; i<childList.length; i++)
			charOptions[childList[i].replace(/(?:.+)\.([^\.]+)/,'$1')] = this.getCharOption(childList[i]);
		return charOptions;
		}
	kgenOptionService.prototype.getDefaultCharOption = function (name)
		{
			return this.defaultPrefServ.getCharPref(name);
		}
	kgenOptionService.prototype.getListOfArrayOptions = function (branchName)
		{
		var optionList = new Array();
		for(var i=0; this.defaultOptionIsset(branchName+'.'+i); i++)
			optionList[i] = this.getArrayOption(branchName+'.'+i)
		return optionList;
		}