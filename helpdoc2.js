/****************************************************************************
* Helpdoc is used to run the I-Learn Help Documentation System.
* Depends on:
*    jQuery
*    jQuery UI
*    Dynatree
*    History.js
****************************************************************************/

//Define needed global variable.
GLOBAL_XML = null;

/****************************************************************************
* Function used to handle the History.js forward/back notifications.
* Everything is default History.js information unless noted.
****************************************************************************/
(function(window,undefined){

    // Prepare
    var History = window.History; // Note: We are using a capital H instead of a lower h
    if ( !History.enabled ) {
         // History.js is disabled for this browser.
         // This is because we can optionally choose to support HTML4 browsers or not.
        return false;
    }

    // Bind to StateChange Event
    History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
        var State = History.getState(); // Note: We are using History.getState() instead of event.state
        History.log(State.data, State.title, State.url);
		  // Added so that the file is loaded properly when the back button is pressed.
		  loadSpecifiedDocument(GLOBAL_XML);
    });
})(window);


/*****************************************************************************
* Function used to define the Dynatree object and apply settings to it.
*****************************************************************************/
$(function()
{
   $("#leftNavigation").dynatree(
      {
         generateIds: true,     //Makes each element of the tree have an html id attribute.
         idPrefix: "navItem_",  //Gives a prefix to each of the element's id.
			minExpandLevel: 2,     //Forces the top level items to be expanded and non-collapsable.
         selectMode: 1,         //Only allows a single item to be selected.
         persist: true,         //Persist is actually not completely functioning.  REMOVE???
         onActivate: function(node)  //Perform this function when a node is activated
         {
            if (node.data.href !== null)  //If the node has an href tag load it.
               ajaxLoader(node.data.href);
            else                          //If not load it's first child.
            {
               node.getChildren()[0].focus();
               node.getChildren()[0].activate();
            }
					
         }
      });
});


/**********************************************************************
* Recursive function that will add nodes that are nested within the XML
* document.  It will load any nested document tags.
***********************************************************************/
function addNode(elementNode,parentNode)
{
   //Check for children in the node.
   if ($(elementNode).children().length > 0)
   {
      //Store the parent's id key.
		var parentKey = $(parentNode).attr("id");
      //Add this particular document to the tree.
		$("#leftNavigation").dynatree("getTree").getNodeByKey(parentKey).addChild(
      {
         title: $(elementNode).attr("title"),
         isFolder: false,
         href: $(elementNode).attr("ref"),
         icon: false,
         key: $(elementNode).attr("id")
      });
		//Recurse through each child document.
      $('> document', elementNode).each(function(index,element){
         addNode(element, elementNode);
      });
      
   }
   else  //If there aren't children...
   {
      var anotherParentKey = $(parentNode).attr("id");
      //Add the document to the tree.
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
* Loads the specific document that is specified by the query string.
* This function essentially allows us to have a url direct directly to a
* document rather than just the home screen.
******************************************************************************/
function loadSpecifiedDocument(xmldoc)
{
   //Start a variable that will contain the specific document.  False by default.
	var specificDocument = false;
   var cx = 0;
	//Split out all the "&" characters into an array.
   mySearch = location.search.substr(1).split("&");
	//Loop through the array.
   for (cx = 0; cx < mySearch.length; cx++)
   {
      //Check the length of the array entry.
		if (mySearch[cx].length > 0)
      {
         //Split the entry into an array based on "="
			var mySplitSearch = mySearch[cx].split("=");
			//Check if the entry is a "page" entry.
         if (mySplitSearch[0] == "page") 
         {
				//Set the specific document variable to the value of the "page"
            specificDocument = mySplitSearch[1];
         }
      }
   }
	if (!specificDocument)
	{
		//Set the specific document to Overview if nothing was present.
		specificDocument = "Overview";
	}
   if (specificDocument)
   {
      //Create a variable used to set the key of the node which needs to be focused.
		var giveFocusKey = false;
		//Call ajaxLoader to load the actual document into the content frame.
      ajaxLoader(specificDocument + ".vhtml");
		//Search through the xmldoc finding the elements as needed.
      $("document", xmldoc).each(function(index, element)
      {
         //Check if the item doesn't have a ref tag then...
			if ($(element['ref']).length == 0)
         {
            //Check if it has children then...
				if ($(element).children().length > 0)
            {
               //For each of it's children do this...
					$("document", element).each(function(index, element)
               {
                  //Set the reference to the filename portion of the ref
						var reference = $(element).attr("ref").split('\\').pop().split('/').pop().split('.');
                  //Check that the reference matches the specific document.
						if (reference[0] == specificDocument)
                  {
                     //Set the focus key to the id attribute of the element.
							giveFocusKey = $(element).attr("id");
                  }
						//Check that focus key was set.
                  if (giveFocusKey)
                  {
                     //Activate and set focus to the given node.
							$("#leftNavigation").dynatree("getTree").getNodeByKey(giveFocusKey).activate();
                     $("#leftNavigation").dynatree("getTree").getNodeByKey(giveFocusKey).focus();
                  }
               });
            }
         }
			//If the item did hava a ref tag then...
         else
         {
            //Set the reference to the filename portion of the ref
				var reference = $(element).attr("ref").split('\\').pop().split('/').pop().split('.');
             //Check that the reference matches the specific document.
				if (reference[0] == specificDocument)
            {
               //Set the focus key to the id attribute of the element.
					giveFocusKey = $(element).attr("id");
            }
            //Check that focus key was set.
			   if (giveFocusKey)
            {
               //Activate and set focus to the given node.
					$("#leftNavigation").dynatree("getTree").getNodeByKey(giveFocusKey).activate();
               $("#leftNavigation").dynatree("getTree").getNodeByKey(giveFocusKey).focus();
            }
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
   //Display a loading image while we load everything.
	document.getElementById("mainContent").innerHTML = "<img id='loading' src='/Resource/14853/Web/Style/Image/loading.gif' />";
   var ajax;
	//Split the url down to an array of the filename and the extension.
   var fileNameArray = urlToLoad.split('\\').pop().split('/').pop().split('.');
	//Variable with the filename and the page variable ready to go concatenated witht the filename.
   var fileName = "helpdoc2.vhtml?page=" + fileNameArray[0];
	//Create a state object to be used with the pushState function.
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
         //Replace the loading image with the requested page.
			document.getElementById("mainContent").innerHTML = ajax.responseText;
			//Push the state out to the browser.
			History.pushState(stateObj, "", fileName);
      }
   };
	//Complete the ajax operations
	ajax.open("GET", urlToLoad, true);
	ajax.send();
}

/******************************************************************************
* navLoader is a function that will open the navigation into the navigation pane.
* It loads from an external XML page.
******************************************************************************/
function navLoader()
{
   //The name of the document to load.
	var urlToLoad = "helpdoc.xml";
	//jQuery AJAX call which is done synchronously.
   var ajaxCall = $.ajax({
      async: false,
      url: urlToLoad,
      success: function(data, textStatus, jqXHR)
      {
         var xmlResponse = data;
         //Store the xml file into the GLOBAL_XML variable.
			GLOBAL_XML = xmlResponse;
			//For each title item do this...
         $('helpnavigation title', xmlResponse).each(function(index, titleElement)
         {     
            //Create link variable to use if needed.
				var hrefVar;
				//Check if the item has a "ref" attribute.
            if ($(titleElement).attr("ref") !== undefined) 
            {
               //Store it into hrefVar if it does have an attribute.
					hrefVar = $(titleElement).attr("ref");
            }
				//Add the title elements to the dynatree "root" node.
            $("#leftNavigation").dynatree("getRoot").addChild(
               {
                  title: $(titleElement).attr("name"),
                  isFolder: true,
                  key: $(titleElement).attr("id"),
                  href: hrefVar,
                  icon: false
               });   
				//For each of the documents below the title do this...   
            $('> document',titleElement).each(function(index,element)
            {
               //Run the recursive addNode function (which will add all the nested documents).
					addNode(element, titleElement);
            });
         }
         );
      }
   });
	//When the ajax call finishes run the loadSpecified Document function to see if a file should appear.
	//It will show Overview.vhtml by default.  See loadSpecifiedDocument for more information.
   $.when(ajaxCall).then(loadSpecifiedDocument(GLOBAL_XML));
}


