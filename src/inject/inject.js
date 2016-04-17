
//todo
/*

content to bg , bg to google api, api to content back is complete
api call event for all valid links is done
add warning html and Css to link child if link result is bad
	add link child if it is not there
	update link child html if it is there
people issues with norton safe search
-makes search slow
-changes default search engine, people want google not ask
-shows adware


*/
/* INIT   */
//element and unique id map for identifying unique DOM elements
var elmMap ={};
var imgUrl = {safe:'img/safe.png',unsafe:'img/unsafe.png',loading:'img/loading.gif'}
var statusImgClass = "safeLinksResult"
var timer;

// Mouse listener for any mouse enter event on the current document.
document.addEventListener('mouseover', function (e) {

var srcElement = e.srcElement;
  var href = srcElement.href;
  // Lets check if our underlying element is a LINK.
  if (srcElement.nodeName != 'A') {
    return;
	  }
	//we do not want to process internal urls 
  if(!isExternal(href,window.location.href)){return false};

  //create a reference so that we can retrieve the element later
  var eid = guid();
  elmMap[eid] = srcElement;

  // go ahead and add waiting sign
  var img = createImgElement();
  img.setAttribute('src',chrome.extension.getURL(imgUrl.loading));
  updateChild(eid,img);
  
    
  chrome.extension.sendMessage({url:href, uuid:eid}, function(response) {
	//alert(response)
		
	});

  //end outer function
}, false);


//complements mouse enter event so execute only if mouseover for x seconds
// document.addEventListener('mouseleave', function (e) {

// 	clearInterval(timer);
// });

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	
	//create child element to append
	var img = createImgElement();
	//get the target link
	var target  = request.eid;
	// update img source on link status
	console.log(request);
	var source = (request.result.status==true)? imgUrl.safe : imgUrl.unsafe ;
	//update the source of the image
	img.setAttribute('src', chrome.extension.getURL(source));
	img.setAttribute('alt', request.result.msg);
	updateChild(target,img)
	//wait till 5 seconds and cleanup/delete the DOM status
	setTimeout(function() { deleteNode(img); }, 1400);
    //clean up from the element map 
	//elmMap[eid] = undefined;
	delete elmMap[target];

});


//delets a node from the DOM
function deleteNode(node){
	node.parentNode.removeChild(node);
	return ;
}
//this function updates or appends a child element to the target link 
function updateChild(eid, append){
	var target = elmMap[eid];
	
var childs   = target.childNodes;
for(child in childs){
	if(childs[child].className==append.className){
		target.removeChild(childs[child]);
	}
}
target.appendChild(append);
	
//
}

//function to crate a new IMage element to be inserted as status
function createImgElement(){

	var img = document.createElement("IMG");
	img.setAttribute('class', statusImgClass);	
	return img;
}

// function creates a GUID which represents a unique element ID in the call-flow
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

//function to check if url is external to current tab
//http://stackoverflow.com/questions/6238351/fastest-way-to-detect-external-urls
var checkDomain = function(url) {
  return url.toLowerCase().replace(/([a-z])?:\/\//,'$1').split('/')[0];
};

var isExternal = function(url,baseUrl) {
  return ( ( url.indexOf(':') > -1 || url.indexOf('//') > -1 ) && checkDomain(baseUrl) !== checkDomain(url) );
};