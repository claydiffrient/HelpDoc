// JavaScript Document

//Define Globals
GLOBAL_XML = null;

// OLD BACK/FOWARD NAV

/*//Used to handle forward/back navigation.
window.onpopstate = function (stackState) {
   if (stackState.state !== null)
      loadSpecifiedDocument();
};
*/

/***********************
* Attempting to fix again the back/forward navigation..
***********************/

function change(state)
{
	if (state !== null)
	{
		loadSpecifiedDocument();
	}
}

$(window).bind("popstate", function(e)
{
	change(e.originalEvent.state);
});

(function(original)
{
	history.pushState = function (state)
	{
		change(state);
		return original.apply(this, arguments);
	};
})(history.pushState);





$(function()
{
   $("#leftNavigation").dynatree(
      {
         generateIds: true,
         idPrefix: "navItem_",
			minExpandLevel: 2,
         selectMode: 1,
         persist: true,
         onActivate: function(node)
         {
            if (node.data.href !== null)
               ajaxLoader(node.data.href);
            else
            {
               node.getChildren()[0].focus();
               node.getChildren()[0].activate();
            }
					
         }
      });
});


/**************************************************************
* Recursive function to add items below the inital title level.
**************************************************************/
function addNode(elementNode,parentNode)
{
   //Check for children
   if ($(elementNode).children().length > 0)
   {
      var parentKey = $(parentNode).attr("id");
      $("#leftNavigation").dynatree("getTree").getNodeByKey(parentKey).addChild(
      {
         title: $(elementNode).attr("title"),
         isFolder: false,
         href: $(elementNode).attr("ref"),
         icon: false,
         key: $(elementNode).attr("id")
      });
      $('> document', elementNode).each(function(index,element){
         addNode(element, elementNode);
      });
      
   }
   else
   {
      var anotherParentKey = $(parentNode).attr("id");
      $("#leftNavigation").dynatree("getTree").getNodeByKey(anotherParentKey).addChild(
      {
         title: $(elementNode).attr("title"),
         isFolder: false,
         href: $(elementNode).attr("ref"),
         icon: false,
         key: $(elementNode).attr("id")
      });
   }
}

/******************************************************************************
*Loads the specific document that is specified by the query string.
******************************************************************************/
function loadSpecifiedDocument(xmldoc)
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
      var giveFocusKey = false;
      ajaxLoader(specificDocument + ".vhtml");
      $("document", xmldoc).each(function(index, element)
      {
         var reference = $(element).attr("ref").split('\\').pop().split('/').pop().split('.');
         if (reference[0] == specificDocument)
         {
            giveFocusKey = $(element).attr("id");
         }
         if (giveFocusKey)
         {
            $("#leftNavigation").dynatree("getTree").getNodeByKey(giveFocusKey).activate();
         }
      });
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
   var fileName = "helpdoc2.vhtml?page=" + fileNameArray[0];
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
         window.history.pushState(stateObj, "", fileName);
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
   //loadSpecifiedDocument();
   var urlToLoad = "helpdoc.xml";
   
   var ajaxCall = $.ajax({
      async: false,
      url: urlToLoad,
      success: function(data, textStatus, jqXHR)
      {
         var xmlResponse = data;
         GLOBAL_XML = xmlResponse;
         $('helpnavigation title', xmlResponse).each(function(index, titleElement)
         {     
            var hrefVar;
            if ($(titleElement).attr("ref") !== undefined) 
            {
               hrefVar = $(titleElement).attr("ref");
            }
            $("#leftNavigation").dynatree("getRoot").addChild(
               {
                  title: $(titleElement).attr("name"),
                  isFolder: true,
                  key: $(titleElement).attr("id"),
                  href: hrefVar,
                  icon: false
               });      
            $('> document',titleElement).each(function(index,element)
            {
               addNode(element, titleElement);
            });
         }
         );
      }
   });
   $.when(ajaxCall).then(loadSpecifiedDocument(GLOBAL_XML));
}


