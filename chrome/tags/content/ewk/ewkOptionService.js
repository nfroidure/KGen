function ewkOptionService(prefix,branch)
	{
	this.prefsPrefix=prefix;
	this.prefsBranch=branch;
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
	this.initOptions();
	};
	/* FROZEN METHODS */
	ewkOptionService.prototype.setCharOption = function (name, value)
		{
		this.optionName['char'][this.optionName['char'].length] = name;
		this.optionValue['char'][name] = value;
		}
	ewkOptionService.prototype.setIntOption = function (name, value)
		{
		this.optionName['int'][this.optionName['int'].length] = name;
		this.optionValue['int'][name] = value;
		}
	ewkOptionService.prototype.setBoolOption = function (name, value)
		{
		this.optionName['bool'][this.optionName['bool'].length] = name;
		this.optionValue['bool'][name] = value;
		}
	ewkOptionService.prototype.setArrayOption = function (name, value)
		{
		this.optionName['char'][this.optionName['char'].length] = name;
		this.optionValue['char'][name] = value.join('!');
		}
	ewkOptionService.prototype.getCharOption = function (name)
		{
		if(this.optionIsCached(name,'char'))
			return this.optionValue['char'][name];
		else if(this.prefServ.prefHasUserValue(this.prefsPrefix+name))
			{
			this.optionName['char'][this.optionName['char'].length] = name;
			return this.optionValue['char'][name] = this.prefServ.getCharPref(this.prefsPrefix+name);
			}
		else if(this.defaultOptionIsset(name))
			return this.prefServ.getCharPref(this.prefsPrefix+name);
		return false;
		}
	ewkOptionService.prototype.getIntOption = function (name)
		{
		if(this.optionIsCached(name,'int'))
			return this.optionValue['int'][name];
		else if(this.prefServ.prefHasUserValue(this.prefsPrefix+name))
			{
			this.optionName['int'][this.optionName['int'].length] = name;
			return this.optionValue['int'][name] = this.prefServ.getIntPref(this.prefsPrefix+name);
			}
		else if(this.defaultOptionIsset(name))
			return this.prefServ.getIntPref(this.prefsPrefix+name);
		return false;
		}
	ewkOptionService.prototype.getBoolOption = function (name)
		{
		if(this.optionIsCached(name,'bool'))
			return this.optionValue['bool'][name];
		else if(this.prefServ.prefHasUserValue(this.prefsPrefix+name))
			{
			this.optionName['bool'][this.optionName['bool'].length] = name;
			return this.optionValue['bool'][name] = this.prefServ.getBoolPref(this.prefsPrefix+name);
			}
		else if(this.defaultOptionIsset(name))
			return this.prefServ.getBoolPref(this.prefsPrefix+name);
		return false;
		}
	ewkOptionService.prototype.getArrayOption = function (name)
		{
		return this.getCharOption(name).split('!');
		}
	ewkOptionService.prototype.clearOption = function (name)
		{
		if(this.prefServ.prefHasUserValue(this.prefsPrefix+name))
			this.prefServ.clearUserPref(this.prefsPrefix+name);
		if(this.optionIsCached(name, 'bool'))
			this.optionValue['bool'][name]=null;
		else if(this.optionIsCached(name, 'char'))
			this.optionValue['char'][name]=null;
		else if(this.optionIsCached(name, 'int'))
			this.optionValue['int'][name]=null;
		}
	ewkOptionService.prototype.optionIsset = function (name)
		{
		if(this.userOptionIsset(name))
			return true;
		else if(this.defaultOptionIsset(name))
			return true;
		else
			return false;
		}
	ewkOptionService.prototype.defaultOptionIsset = function (name)
		{
		var childList = this.defaultPrefServ.getChildList((this.prefsPrefix+name).replace(/(.+)\.(?:[^\.]+)/,'$1'),{});
		for(var i=0; i<childList.length; i++)
			if(childList[i] == this.prefsPrefix+name)
				return true;
		return false;
		}
	ewkOptionService.prototype.userOptionIsset = function (name)
		{
		if(this.optionIsCached(name, 'bool')||this.optionIsCached(name, 'char')||this.optionIsCached(name, 'int'))
			return true;
		else if(this.prefServ.prefHasUserValue(this.prefsPrefix+name))
			return true;
		return false;
		}
	ewkOptionService.prototype.optionIsCached = function (name, type)
		{
		if(this.optionValue[type][name]!==undefined&&this.optionValue[type][name]!==null)
			return true
		return false;
		}
	ewkOptionService.prototype.saveOptions = function ()
		{
		for(var i=0; i<this.optionName['char'].length; i++)
			{
			if(this.optionIsCached(this.optionName['char'][i],'char'))
				this.prefServ.setCharPref(this.prefsPrefix+this.optionName['char'][i], this.optionValue['char'][this.optionName['char'][i]]);
			}
		for(var i=0; i<this.optionName['int'].length; i++)
			{
			if(this.optionIsCached(this.optionName['int'][i],'int'))
				this.prefServ.setIntPref(this.prefsPrefix+this.optionName['int'][i], this.optionValue['int'][this.optionName['int'][i]]);
			}
		for(var i=0; i<this.optionName['bool'].length; i++)
			{
			if(this.optionIsCached(this.optionName['bool'][i],'bool'))
				this.prefServ.setBoolPref(this.prefsPrefix+this.optionName['bool'][i], this.optionValue['bool'][this.optionName['bool'][i]]);
			}
		}
	ewkOptionService.prototype.resetOptions = function ()
		{
		this.prefServ.resetUserPrefs();
		this.initOptions();
		}
	ewkOptionService.prototype.initOptions = function ()
		{
		this.prefServ = this.prefs.getBranch(this.prefsBranch);
		this.defaultPrefServ = this.prefs.getDefaultBranch(this.prefsBranch);
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
	ewkOptionService.prototype.getIntOptions = function (branchName)
		{
		var intOptions = new Array();
		var childList = this.defaultPrefServ.getChildList(this.prefsPrefix+branchName,{});
		for(var i=0; i<childList.length; i++)
			{
			intOptions[childList[i].replace(/(?:.+)\.([^\.]+)/,'$1')] = this.getIntOption(branchName+'.'+childList[i].replace(/(?:.+)\.([^\.]+)/,'$1'));
			}
		return intOptions;
		}
	ewkOptionService.prototype.getCharOptions = function (branchName)
		{
		var charOptions = new Array();
		var childList = this.defaultPrefServ.getChildList(this.prefsPrefix+branchName,{});
		for(var i=0; i<childList.length; i++)
			charOptions[childList[i].replace(/(?:.+)\.([^\.]+)/,'$1')] = this.getCharOption(branchName+'.'+childList[i].replace(/(?:.+)\.([^\.]+)/,'$1'));
		return charOptions;
		}
	ewkOptionService.prototype.getDefaultCharOption = function (name)
		{
			return this.defaultPrefServ.getCharPref(this.prefsPrefix+name);
		}
	ewkOptionService.prototype.getListOfArrayOptions = function (branchName)
		{
		var optionList = new Array();
		for(var i=0; this.defaultOptionIsset(branchName+'.'+i); i++)
			optionList[i] = this.getArrayOption(branchName+'.'+i)
		return optionList;
		}