chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.executeScript(null,{file:'Kgen.js'});
  chrome.tabs.executeScript(null,{file:'KgenUI.js'});
});

