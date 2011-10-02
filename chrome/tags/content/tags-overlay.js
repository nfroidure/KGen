bbcManager.prototype.tagsDisplay = function ()
	{
	var curElement = this.focusedBBComposer.getSelectedElement();
	if(curElement&&curElement.nodeName.toLowerCase()!='body')
		this.sidebar.contentWindow.startScan();
	}