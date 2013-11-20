function ewkFile(file)
	{
	if(file)
		this.fromUri(file);
	};

ewkFile.prototype.fromUserCreation = function (message, directory, leafname, filter, label)
	{
	var nfp = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nfp);
	fp.init(window, message, nfp.modeSave);
	if(directory)
		{
		var dir=new ewkFile().fromUri(directory);
		fp.displayDirectory = dir.file;
		}
	if(leafname)
		fp.defaultString = leafname;
	if(filter)
		fp.appendFilter((label ? label : filter), filter);
	var res = fp.show();
	if ((res == nfp.returnOK || res == nfp.returnReplace )&&fp.file)
		{
		this.file = fp.file;
		return true;
		}
	else
		{ return false; }
	}

ewkFile.prototype.fromUserSelection = function (message, directory, leafname, filter, label)
	{
	var nfp = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nfp);
	fp.init(window, message, nfp.modeOpen);
	if(directory)
		{
		var dir=new ewkFile().fromUri(directory);
		fp.displayDirectory = dir.file;
		}
	if(leafname)
		fp.defaultString = leafname;
	if(filter)
		fp.appendFilter((label ? label : filter), filter);
	var res = fp.show();
	if (res == nfp.returnOK)
		{
		this.file = fp.file;
		return true;
		}
	else
		{ return false; }
	}

ewkFile.prototype.fromUri = function (uri)
	{
	var nfph = Components.classes["@mozilla.org/network/protocol;1?name=file"]
		.createInstance(Components.interfaces.nsIFileProtocolHandler);
	this.file = nfph.getFileFromURLSpec(uri);
	return this.file.exists();
	}
ewkFile.prototype.fromPath = function (path)
	{
	this.file =  Components.classes["@mozilla.org/file/local;1"]
		.createInstance(Components.interfaces.nsILocalFile);
	this.file.initWithPath(path);
	return this.file.exists();
	}
ewkFile.prototype.fromUserProfile = function (filename, create)
	{
	var profile = Components.classes["@mozilla.org/file/directory_service;1"]
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsIFile);
	return this.fromPath(profile.path + filename);
	}
ewkFile.prototype.fromTempDirectory = function (filename)
	{
	this.file = Components.classes["@mozilla.org/file/directory_service;1"].
		getService(Components.interfaces.nsIProperties).
		get("TmpD", Components.interfaces.nsIFile);
	this.file.append((filename?filename:"noname.tmp"));
	this.file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
	return this.file.exists();
	}
ewkFile.prototype.getUri = function ()
	{
	var ios = Components.classes["@mozilla.org/network/io-service;1"]
	                    .getService(Components.interfaces.nsIIOService);
	var fileHandler = ios.getProtocolHandler("file")
	                     .QueryInterface(Components.interfaces.nsIFileProtocolHandler);
	return fileHandler.getURLSpecFromFile(this.file);
	}
ewkFile.prototype.getDataURL = function ()
	{
	var contentType = Components.classes["@mozilla.org/mime;1"]
		.getService(Components.interfaces.nsIMIMEService)
		.getTypeFromFile(this.file);
	var inputStream = Components.classes["@mozilla.org/network/file-input-stream;1"]
		.createInstance(Components.interfaces.nsIFileInputStream);
	inputStream.init(this.file, 0x01, 0600, 0);
	var stream = Components.classes["@mozilla.org/binaryinputstream;1"]
		.createInstance(Components.interfaces.nsIBinaryInputStream);
	stream.setInputStream(inputStream);
	var encoded = btoa(stream.readBytes(stream.available()));
	return "data:" + contentType + ";base64," + encoded;
	}

ewkFile.prototype.read = function ()
	{
	var is = Components.classes["@mozilla.org/network/file-input-stream;1"]
		.createInstance(Components.interfaces.nsIFileInputStream);
	is.init(this.file,0x01, 00004, null);
	var sis = Components.classes["@mozilla.org/scriptableinputstream;1"]
		.createInstance(Components.interfaces.nsIScriptableInputStream);
	sis.init(is);
	return this.decode(sis.read(sis.available()));
	}
ewkFile.prototype.write = function (content)
	{
	var os = Components.classes["@mozilla.org/network/file-output-stream;1"]
		.createInstance(Components.interfaces.nsIFileOutputStream);
		os.init(this.file, 0x04 | 0x08 | 0x20, 420, 0);
	content = this.encode(content);
	var result = os.write(content, content.length);
	os.close();
	return result;
	}
ewkFile.prototype.writeFromStream = function (is,handler)
	{
	var os = Components.classes["@mozilla.org/network/file-output-stream;1"]
		.createInstance(Components.interfaces.nsIFileOutputStream);
		os.init(this.file, 0x04 | 0x08 | 0x20, 420, 0);

	var bos = Components.classes["@mozilla.org/network/buffered-output-stream;1"]
	                         .createInstance(Components.interfaces.nsIBufferedOutputStream);
	bos.init(os, 0x8000);

	var pump = Components.classes["@mozilla.org/network/input-stream-pump;1"]
	                     .createInstance(Components.interfaces.nsIInputStreamPump);
	pump.init(is, -1, -1, 0, 0, true);

	var observer =
		{
		onStartRequest: function(aRequest, aContext) {},
		onStopRequest: function(aRequest, aContext, aStatusCode)
			{
			this.bos.close();
			this.os.close();
			this.bos=null;
			this.os=null;
			if(this.handler)
				this.handler();
			//this=null;
			}
		};
	observer.bos=bos;
	observer.os=os;
	observer.handler=handler;

	var listener = Components.classes["@mozilla.org/network/simple-stream-listener;1"]
	                         .createInstance(Components.interfaces.nsISimpleStreamListener);
	listener.init(bos, observer);
	pump.asyncRead(listener, null);
	}
ewkFile.prototype.writeFromDataURL = function (dataURL,sourceWindow)
	{
	var io = Components.classes["@mozilla.org/network/io-service;1"]  
		.getService(Components.interfaces.nsIIOService);  
	var source = io.newURI(dataURL, "UTF8", null);  
	var target = io.newFileURI(this.file);
	var persist = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
		.createInstance(Components.interfaces.nsIWebBrowserPersist);
	persist.persistFlags = Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_REPLACE_EXISTING_FILES;
	persist.persistFlags |= Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;
	var privacyContext = sourceWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
		.getInterface(Components.interfaces.nsIWebNavigation)
		.QueryInterface(nsILoadContext);
	persist.saveURI(source, null, null, null, null, this.file, privacyContext);
	}
ewkFile.prototype.create = function ()
	{
	this.file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0664);
	return this.file.exists();
	}
ewkFile.prototype.createUnique = function ()
	{
	this.file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
	return this.file.exists();
	}

// Thanks to http://www.webtoolkit.info/javascript-utf8.html
ewkFile.prototype.encode = function (string)
	{
	string = string.replace(/\r\n/g,"\n");
	var utftext = "";
	for (var n = 0; n < string.length; n++)
		{
		var c = string.charCodeAt(n);
		if (c < 128)
			{
			utftext += String.fromCharCode(c);
			}
		else if((c > 127) && (c < 2048))
			{
			utftext += String.fromCharCode((c >> 6) | 192);
			utftext += String.fromCharCode((c & 63) | 128);
			}
		else
			{
			utftext += String.fromCharCode((c >> 12) | 224);
			utftext += String.fromCharCode(((c >> 6) & 63) | 128);
			utftext += String.fromCharCode((c & 63) | 128);
			}
		}
	return utftext;
	}

ewkFile.prototype.decode = function (utftext)
	{
	var string = "";
	var i = 0; var c = 0; var c2 = 0; var c3 = 0;
	while ( i < utftext.length )
		{
		c = utftext.charCodeAt(i);
		if (c < 128)
			{
			string += String.fromCharCode(c);
			i++;
			}
		else if((c > 191) && (c < 224))
			{
			c2 = utftext.charCodeAt(i+1);
			string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
			i += 2;
			}
		else
			{
			c2 = utftext.charCodeAt(i+1);
			c3 = utftext.charCodeAt(i+2);
			string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
			i += 3;
			}
		}
		return string;
	}
