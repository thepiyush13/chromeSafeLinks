// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
  	//get link status from google api call
  	curTabId = sender.tab.id
  	sendRequest(request.url,sender.url,request.uuid)
  	//send it back to process at content script
    //sendResponse("bg"+sender.url);
  });

/******** INIT*********************/
var apiKey = "AIzaSyB4aYhj6pTRbvnJalMJqJQBfVmSZ9uMZVw"
var baseUrl = "https://sb-ssl.google.com/safebrowsing/api/lookup?client=SafeLinks&key="+apiKey+"&appver=0.0.1&pver=3.1&url="
var sendMethod = "GET"
var curTabId = 0;


/******** CORE FUNCTIONS **************/
//send an ajax request to google server for url status
function sendRequest(url,tabUrl,uuid){


//ecnode url before the request
// receiveResponse({responseText:"malware"},uuid);
// return ;
var sendUrl = baseUrl + encodeURIComponent(url);
var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
  if (xhr.readyState == 4) {    
    receiveResponse(xhr,uuid);
  }
}
xhr.open(sendMethod, sendUrl, true);
xhr.send();

}


//process the result return for ajax query, and update the ui after validation
function receiveResponse(result,uuid){
	if (isValidObject(result) ){
		// if( isBadLink(result.responseText)){
		// 	var linkStatus = result.responseText;
		// 	updateLinkStatus(linkStatus,uuid);
		// }
		var linkStatus = result.responseText;
		updateLinkStatus(linkStatus,uuid);
	}
	

}

// get status of the result returned from google api call, 
// false if link is safe, a value if it is unsafe
//could be GET_RESP_BODY = “phishing” | “malware” | "unwanted" | “phishing,malware” | "phishing,unwanted" | "malware,unwanted" | "phishing,malware,unwanted"
function isBadLink(status){
	if( !isValidString(status) ){return false;}
	return status;
}

//update link status and UI html
function updateLinkStatus(status,uuid){
	//alert(status);
	var result = {status:true,msg:"safe"};
	if(status!=""){
		result.status= false;
		result.msg = status;
	}
	chrome.tabs.sendMessage(curTabId, {result: result,eid:uuid}, function(response) {
      
    });
}




/******** UTIL FUNCTIONS **************/





//function to check valid array type
function isValidObject(a){
  if(!a  || a.length<1 || a !== Object(a)){  return false }
    return true;
  //tested
}

//function for basic sanity check 
function isValidString(str){
	if(!str || 0 === str.length ||  /^\s*$/.test(str)){
		return false
	}
	return true
}