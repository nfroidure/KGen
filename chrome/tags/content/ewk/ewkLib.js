var ewkLib=
	{
	newEventHandler: function(obj,method)
		{
		var fx = method;
		return function () { return fx.apply(obj, arguments); }
		},
	dump: function(message)
		{
	  Components.classes["@mozilla.org/consoleservice;1"]
			 .getService(Components.interfaces.nsIConsoleService).logStringMessage("Ewk: " + message);
		}
	};