var ewkLib=
	{
	eventHandlerMethods: new Array(),
	eventHandlers: new Array(),
	newEventHandler: function(obj,method)
		{
		var index=ewkLib.eventHandlerMethods.indexOf(method);
		if(index===-1)
			{
			var fx=function () {	var args=arguments; return method.apply(obj, args); }
			ewkLib.eventHandlerMethods.push(method);
			ewkLib.eventHandlers.push(fx);
			index=ewkLib.eventHandlerMethods.length-1;
			}
		return ewkLib.eventHandlers[index];
		},
	dump: function(message)
		{
		Components.classes["@mozilla.org/consoleservice;1"]
			.getService(Components.interfaces.nsIConsoleService).logStringMessage("Ewk: " + message);
		}
	};