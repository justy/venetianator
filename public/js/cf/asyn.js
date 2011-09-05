/*!
* asyn System v 0.0.1
* http://coolfusion.com.au/asyn
*
* Copyright 2011, Justin James Clayden
*
* Date: Fri Feb 25 13:55:29 2011 -0500
* Date: Wed Mar 23 - Adding queue
*/
    
var todoQueue;        // A FIFO queue of things to do
var activeRequests;   // Number of active http requests
var idleSpeed = 10;

//var debug_slomo;

function log(msg) {
  console.log(msg);
  $("#footer").html($("#footer").html() + "<br>" + msg );
  //$("#log").html($("#log").html() + "<br>" + $.error());
}

function blog(msg) {
  log("<div class='log'>"+ msg +"</div>");
}

// Interrogate each element for any asyn metadata
// Form a query based on this metadata and
// send it to the server
function asyn_boot() {
  debug_slomo = false;

  blog("Booting asyn");
  activeRequests = 0;
  todoQueue = [];
  asyn_activate($("*[data-asyn]"));
}

// Parse, execute* and scrub every element in the DOM
// with a data-asyn attribute

// * meaning, place it on the queue
function asyn_activate(els) {

  var foundData = false;

  if (typeof(els)=='undefined') {
    blog("nil els");
    return;
  }
  //var els = $("*[data-asyn]"); //.children();
  //log(els);
  blog ("Found " + els.length + " data-asyn bearers");

  els.each(

    // For each asyn enabled element
    // Do its command
    function() {

      var asyn_stuff = $(this).attr("data-asyn");
      blog ("DAB:" + asyn_stuff );
      var asyn_json = $.parseJSON(asyn_stuff);

      // log("id: " + $(this).attr("id"));
      // Inject the element's id
      if ($(this).attr("id")) {
        // If no element id is provided, use the id
        if (asyn_json.element_id) {
          //log("Element_id provided: " + asyn_json.element_id)
        } else {
          //log("No element_id provided: " + els)
          asyn_json.element_id = $(this).attr("id");
        }
        
         //asyn_do(asyn_json);
      } else {
        //log("No id provided: " + els)
      }
      
      // Ensure that asyn_do receives it correctly
      asyn_json.element_id = "#" +  asyn_json.element_id;
      $(this).removeAttr("data-asyn");
      enqueue(asyn_json);
      //log("asyn_json: " + asyn_json);
     //log("data-asyn: " + $(this).attr("data-asyn"));
    }

  )

  // Now, just set off a timer to check the queue
  scheduleNextCheck();

}


function scheduleNextCheck() {
  setTimeout(dequeueAndDo,idleSpeed);
}

function enqueue (some_json) {
    // Place the JSON on the queue
    todoQueue.push(some_json);
}

function dequeueAndDo () {

  //log("dequeueAndDo:" + todoQueue);
  
  // 
  if (todoQueue.length > 0) {

    asyn_do(todoQueue.pop());

  // If there's anything on the queue, set a timeout to do it
  if (todoQueue.length > 0) {
    scheduleNextCheck();
  }

  } else {
    
    blog("** Shouldn't happen **");

  }

}

// Send a request to the Server
function asyn_request (element, request) {

  if (debug_slomo) {
    chill(1000);
  }
  // element is a string selector eg "#page"
  // request is assumed to be valid JSON

  $(element).html("<div class='loading'>loading...</div>");  // temp

  $.ajax({
    type: "GET",
    url: "payloads",
    data: request,
    dataType: "json",
    success: function(data) {
      asyn_receive(element,data);
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      blog(textStatus);
      blog(errorThrown);
      asyn_error(element,textStatus);
    }

  });

/*
  $.get(
    "payloads",  // By convention
    request,
    function(data){
      asyn_receive(element, data);
    },
    "json"
  );
  */

  activeRequests++;

  //log("<div class='client_send'>Active Requests: " + activeRequests + "</div>");

}

// REFACTOR THIS
function asyn_receive(element, payload) {

  activeRequests--;

  blog("<div class='client_receive'>Active Requests: " + activeRequests + "</div>");

  blog("<div class='client_receive'>Accepting payload: " + payload + " for element: " + element + "</code>");
  // element is a string eg "#page"
  // payload is assumed to already be valid JSON

  // Bail if we got a dud response
  var status = payload.head.status;
  blog("<div class='client_receive'>Status: " + status + "</div>");

  if (status != 200) {
    $(element).html(":(");
    return;
  }
  var body = payload.body;

//  log("type of body: " + typeof(body));
  if (typeof(body) == 'object') {
    blog("There are " + body.length + " things to do.");
    for (var c in body) {
      command = body[c];
      command.element_id = element;
      //log("command: " + command.toString());
      asyn_do(command);
    }
  } else {
    asyn_do(body);
  }

  blog("Active requests: " + activeRequests);

  // Recurse
 // if (activeRequests < 5  && foundDataLastActivation) {
 //   blog("recursing..")
 //  asyn_activate($("*[data-asyn]"));
//  }

}

function asyn_error(element, data) {
 // alert("error");
  blog("***********ERROR*********" + data.status);

}

// Do a single command 
// SHOULD ONLY BE CALLED ON THE IDLE LOOP!
function asyn_do(command) {

  //log("Type of command: " + typeof(command));
  blog("<div class='client_do'>asyn_do:" + $.toJSON(command) + "</div>");//asyn_json);
  //log("command is a type of " + typeof(command));
  verb = command.verb;
  noun = command.noun;
  sender = command.sender;
  element_id = command.element_id;

  // blog ("verb: " + verb + ", noun: " + noun);
  if (typeof(noun) == 'string') {

    // String noun

    if (verb == 'set_content') {
      log ('element_id is: ' + element_id);
     //blog("<div class='client_do'>Setting content for element: " + element_id + " " + noun + "</div>");
     $(element_id).html(noun);
       return;
    }

    if (verb == 'log') {
      blog(noun);
    }

    if (verb == 'alert') {
      //blog("<div class='client_do'>Displaying alert: " + noun + "</div>");
      alert(noun);
    }

    if (verb == 'generate') {
      //blog("<div class='client_do'>Generating Content: " + noun + "</div>");
      $(element_id).html(noun);
    }

    if (verb == 'set_title') {
      //blog("<div class='client_do'>Setting title to: " + noun + "</div>");
      document.title = noun;
    }

    if (verb == 'request_uri') {
      if (element_id) {
        //blog("<div class='client_send_external'>Sending external request: " + noun + " on behalf of: " + element_id + "</div>" );
        asyn_request(element_id, command);
      } else {
        blog("No element ID provided.");
      }
    }

    if (verb == 'request_uri_body') {
      if (element_id) {
        //blog("<div class='client_send_external'>Sending external request: " + noun + " on behalf of: " + element_id + "</div>" );
        asyn_request(element_id, command);
      } else {
        blog("No element ID provided.");
      }
    }

    if (verb == 'request_local_id') {
      if (element_id) {
        //blog("<div class='client_send'>Sending payload request: " + noun + " on behalf of: " + element_id + "</div>" );
        asyn_request(element_id, command);
      } else {
        blog("No element ID provided.");
      }
    }

  }

}

function chill(millis)
{
  var date = new Date();
  var curDate = null;

  do { curDate = new Date(); }
  while(curDate-date < millis);
}