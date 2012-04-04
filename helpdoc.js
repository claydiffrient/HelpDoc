// JavaScript Document

//Used to handle forward/back navigation.
window.onpopstate = function (stackState) {
   if (stackState.state !== null)
      loadSpecifiedDocument();
};


/******************************************************************************
*Loads the specific document that is specified by the query string.
******************************************************************************/
function loadSpecifiedDocument()
{
   var specificDocument = false;
   var cx = 0;
   mySearch = location.search.substr(1).split("&");
   for (cx = 0; cx < mySearch.length; cx++)
   {
      if (mySearch[cx].length > 0)
      {
         var mySplitSearch = mySearch[cx].split("=");
         if (mySplitSearch[0] == "page") 
         {
            specificDocument = mySplitSearch[1];
         }
      }
   }
   if (specificDocument)
   {
      ajaxLoader(specificDocument + ".vhtml");
   }
}

/******************************************************************************
* ajaxLoader is a function that will open a particular document in a specified
* div tag.
* Inputs - urlToLoad - Document to load.
******************************************************************************/
function ajaxLoader(urlToLoad)
{
   document.getElementById("mainContent").innerHTML = "<img id='loading' src='/Resource/14853/Web/Style/Image/loading.gif' />";
   var ajax;
   var fileNameArray = urlToLoad.split('\\').pop().split('/').pop().split('.');
   var fileName = "helpdoc.vhtml?page=" + fileNameArray[0];
	var stateObj = { page: fileNameArray[0] };
   if (window.XMLHttpRequest) //Check if it's modern
	{
		ajax = new XMLHttpRequest();
   }
   else
   {
      ajax = new ActiveXObject("Microsoft.XMLHTTP");
   }
   ajax.onreadystatechange = function()
   {
      if ((ajax.readyState == 4) && (ajax.status == 200))
      {
         document.getElementById("mainContent").innerHTML = ajax.responseText;
         window.history.replaceState(stateObj, "", fileName);
      }
      else
      {
         console.log("Ajax error while loading: " + urlToLoad + " into mainContent.");
      }
   };
	ajax.open("GET", urlToLoad, true);
	ajax.send();
}

/******************************************************************************
* navLoader is a function that will open the navigation into the navigation pane.
******************************************************************************/
function navLoader()
{
   loadSpecifiedDocument();
   var urlToLoad = "helpdoc.xml";
   var ajax;
   if (window.XMLHttpRequest) //Check if it's modern
	{
		ajax = new XMLHttpRequest();
   }
   else
   {
      ajax = new ActiveXObject("Microsoft.XMLHTTP");
   }
   ajax.onreadystatechange = function()
   {
      if ((ajax.readyState == 4) && (ajax.status == 200))
      {
         
         var xmlResponse = ajax.responseXML;
         GLOBAL_XML = xmlResponse;
         $('helpnavigation title', xmlResponse).each(function(index, element) {
            var linkString = "";
            $("#leftNavigation").append("<span class='titleHeading'>" + $(element).attr("name") + "</span><br />");
            
            $('> document',element).each(function(index,element) {
				
               linkString += "<a class='level" + $(element).attr("level") + "' href='#' onclick='ajaxLoader(\"" + $(element).attr("ref") + "\")'>" + $(element).attr("title") + "</a><br />";
            });
            
            $("#leftNavigation").append(linkString);
         }
         );
      }
   };
	ajax.open("GET", urlToLoad, true);
	ajax.send();
}

