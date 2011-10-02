function bbFile(file)
	{
	if(file)
		this.file = file;
	};

bbFile.prototype.fromUserCreation = function (message, leafname, filter, label)
	{
	var nfp = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nfp);
	fp.init(window, message, nfp.modeSave);
	if(filter)
		fp.appendFilter((label ? label : filter), filter);
	if(leafname)
		fp.defaultString = leafname;
	var res = fp.show();
	if (res == nfp.returnOK || res == nfp.returnReplace )
		{
		this.file = fp.file;
		return true;
		}
	else
		{ return false; }
	}

bbFile.prototype.fromUserSelection = function (message, leafname, filter, label)
	{
	var nfp = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nfp);
	fp.init(window, message, nfp.modeOpen);
	if(filter)
		fp.appendFilter((label ? label : filter), filter);
	if(leafname)
		fp.defaultString = leafname;
	var res = fp.show();
	if (res == nfp.returnOK)
		{
		this.file = fp.file;
		return true;
		}
	else
		{ return false; }
	}

bbFile.prototype.fromURLSpec = function (url)
	{
	var nfph = Components.classes["@mozilla.org/network/protocol;1?name=file"]
		.createInstance(Components.interfaces.nsIFileProtocolHandler);
	this.file = nfph.getFileFromURLSpec(url);
	return this.file.exists();
	}
bbFile.prototype.fromDirectory = function (directory)
	{
	this.file =  Components.classes["@mozilla.org/file/local;1"]
		.createInstance(Components.interfaces.nsILocalFile);
	this.file.initWithPath(directory);
	return this.file.exists();
	}
bbFile.prototype.fromUserProfile = function (filename, create)
	{
	var profile = Components.classes["@mozilla.org/file/directory_service;1"]
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsIFile);
	return this.fromDirectory(profile.path + filename);
	}
bbFile.prototype.getUri = function ()
	{
	var ios = Components.classes["@mozilla.org/network/io-service;1"]
	                    .getService(Components.interfaces.nsIIOService);
	var fileHandler = ios.getProtocolHandler("file")
	                     .QueryInterface(Components.interfaces.nsIFileProtocolHandler);
	return fileHandler.getURLSpecFromFile(this.file);
	}
bbFile.prototype.isOnline = function (url)
	{
	var request = new XMLHttpRequest();
	request.onload = null;
	request.open("HEAD", url, false);
	request.send(null);
	if(request.status && request.status == 200)
		return true;
	else
		return false;
	}

bbFile.prototype.putOnline = function (url,postname, filename, postparams)
	{
	if (this.file.exists())
		{ // Fonction vue sur www.XULfr.org
		var mis = Components.classes["@mozilla.org/io/multiplex-input-stream;1"]
			.createInstance(Components.interfaces.nsIMultiplexInputStream);

		var fin = Components.classes["@mozilla.org/network/file-input-stream;1"]
			.createInstance(Components.interfaces.nsIFileInputStream);
		fin.init(this.file, 0x01, 0444, null);
		var buf = Components.classes["@mozilla.org/network/buffered-input-stream;1"]
			.createInstance(Components.interfaces.nsIBufferedInputStream);
		buf.init(fin, 4096);

		var hsis = Components.classes["@mozilla.org/io/string-input-stream;1"]
			.createInstance(Components.interfaces.nsIStringInputStream);
		var sheader = new String();
		if(postparams)
			{
			postparams = postparams.split(/(?:[=\-]{1})/);
			for(var i=0; i<postparams.length; i=i+2)
				{
				sheader += "\r\n--" + "111222111" + "\r\nContent-disposition: form-data;name=\""+postparams[i]+"\"\r\n\r\n"+ (postparams[i+1] ? postparams[i+1] : '');
				}
			}
		sheader += "\r\n" + "--" + "111222111" + "\r\n"
		sheader += "Content-disposition: form-data;name=\"" + postname + "\";filename=\"" + filename + "\"\r\n";
		sheader += "Content-Type: " + Components.classes["@mozilla.org/mime;1"]
			.getService(Components.interfaces.nsIMIMEService)
			.getTypeFromFile(this.file) + "\r\n";
		sheader += "Content-Length: " + this.file.fileSize+"\r\n\r\n";
		hsis.setData(sheader, sheader.length);

		var endsis = Components.classes["@mozilla.org/io/string-input-stream;1"]
				.createInstance(Components.interfaces.nsIStringInputStream);
		var bs = new String("\r\n--" + "111222111" + "--\r\n");
		endsis.setData(bs, bs.length);

		mis.appendStream(hsis);
		mis.appendStream(buf);
		mis.appendStream(endsis);

		var xmlr = new XMLHttpRequest();
		xmlr.open("POST", url, false);
		xmlr.setRequestHeader("Content-Length", mis.available() - 2 );
		xmlr.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + "111222111");

		xmlr.send(mis);

		return xmlr;
		}
	else
		{
		return false;
		}
	return false;
	}

bbFile.prototype.getDataURL = function ()
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

bbFile.prototype.read = function ()
	{
	var is = Components.classes["@mozilla.org/network/file-input-stream;1"]
		.createInstance(Components.interfaces.nsIFileInputStream);
	is.init(this.file,0x01, 00004, null);
	var sis = Components.classes["@mozilla.org/scriptableinputstream;1"]
		.createInstance(Components.interfaces.nsIScriptableInputStream);
	sis.init(is);
	return this.decode(sis.read(sis.available()));
	}
bbFile.prototype.write = function (content)
	{
	var os = Components.classes["@mozilla.org/network/file-output-stream;1"]
		.createInstance(Components.interfaces.nsIFileOutputStream);
		os.init(this.file, 0x04 | 0x08 | 0x20, 420, 0);
	content = this.encode(content);
	var result = os.write(content, content.length);
	os.close();
	return result;
	}
bbFile.prototype.writeFromStream = function (is)
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
			bos.close();
			os.close();
			}
		};

	var listener = Components.classes["@mozilla.org/network/simple-stream-listener;1"]
	                         .createInstance(Components.interfaces.nsISimpleStreamListener);
	listener.init(bos, observer);
	pump.asyncRead(listener, null);
	}
bbFile.prototype.writeFromDataURL = function (dataURL)
	{
	var io = Components.classes["@mozilla.org/network/io-service;1"]  
		.getService(Components.interfaces.nsIIOService);  
	var source = io.newURI(dataURL, "UTF8", null);  
	var target = io.newFileURI(this.file);
	var persist = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
		.createInstance(Components.interfaces.nsIWebBrowserPersist);
	persist.persistFlags = Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_REPLACE_EXISTING_FILES;
	persist.persistFlags |= Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;
	persist.saveURI(source, null, null, null, null, this.file);  
	}
bbFile.prototype.create = function ()
	{
	this.file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0664);
	return this.file.exists();
	}

// Thanks to http://www.webtoolkit.info/javascript-utf8.html
bbFile.prototype.encode = function (string)
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

bbFile.prototype.decode = function (utftext)
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