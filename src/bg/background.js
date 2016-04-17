// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
  	//get link status from google api call
  	curTabId = sender.tab.id
  	//check if url has invalid extensions
  	if(!isvalidExtension(request.url)){
  		var result = {status:false,msg:"invalidExtension"};	
		sendMsgToContent(result,request.uuid);
		return ;
  	}
  	var res = sendRequest(request.url,sender.url,request.uuid)
  	//send it back to process at content script
    //sendResponse(res);
  });

/******** INIT*********************/
var apiKey = "AIzaSyB4aYhj6pTRbvnJalMJqJQBfVmSZ9uMZVw"
var baseUrl = "https://sb-ssl.google.com/safebrowsing/api/lookup?client=SafeLinks&key="+apiKey+"&appver=0.0.1&pver=3.1&url="
var sendMethod = "GET"
var invalidExt = ["ade","adp","app","asa","asp","bas","bat","cer","chm","cmd","com","cpl","crt","csh","dll","exe","fxp","hlp","hta","htr","inf","ins","isp","its","js","jse","ksh","lnk","mad","maf","mag","mam","maq","mar","mas","mat","mau","mav","maw","mda","mdb","mde","mdt","mdw","mdz","mht","mhtm","mhtml","msc","msi","msp","mst","ocx","ops","pcd","pif","prf","prg","reg","scf","scr","sct","shb","shs","tmp","url","vb","vbe","vbs","vbx","vsmacros","vss","vst","vsw","ws","wsc","wsf","wsh","xsl","xlsx"]
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
    if(xhr.status === 200){
    	receiveResponse(xhr,uuid);
    }else{
    	var result = {status:true,msg:"safe"};	
		sendMsgToContent(result,uuid);
    }
    
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
	}else{
		var result = {status:true,msg:"safe"};	
		sendMsgToContent(result,uuid);
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
	sendMsgToContent(result,uuid);
	
}

//function sends message to chrome injected JS to act of the pages 
function sendMsgToContent(result,uuid){
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

//if the url contains an invalid file extension
function isvalidExtension(url){
	var ext  = getFileExtension(url);
	if(invalidExt.indexOf(ext)>-1){
		//found
		return false;
	}
	return true;
}

//get file url extension

function getFileExtension(url){
	var a = url.split(".");
	if( a.length === 1 || ( a[0] === "" && a.length === 2 ) ) {
	    return "";
	}
	return a.pop();
}