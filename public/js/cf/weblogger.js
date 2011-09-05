/*!
* weblogger.js v0.0.1
* http://coolfusion.com.au/asyn
*
* Copyright 2011, Justin James Clayden
*
* Date: Fri Feb 25 13:55:29 2011 -0500
*/

var debug_slomo;

function log(msg) {
  console.log(msg);
  $("#weblogger").html($("#weblogger").html() + "<br>" + msg );
  //$("#log").html($("#log").html() + "<br>" + $.error());
}

function blog(msg, mode) {

  if (mode == undefined) {
   mode = 'generic';
  }

  log("<div class='weblogger " + mode + "'>" + msg + "</div>");



}
