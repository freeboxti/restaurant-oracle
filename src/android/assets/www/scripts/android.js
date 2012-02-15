/*
 * Stuff for Android-specific functionality. This should be included in all
 * of the HTML pages used to create the Android UI.
 *
 * Differences in the Android app:
 *
 *   - Similar to most native phone apps, 
 *
 * @author Henry Baba-Weiss <htw@cs.washington.edu>
 */

var LOCAL_BASE_URL = 'file:///android_asset/www/';
var EXTERNAL_BASE_URL = 'http://cubist.cs.washington.edu/~htw/';
var USER_EMAIL = 'ra_login_email';
var USER_ID = 'uid';

// Listen for Android startup routine
document.addEventListener('deviceready', androidInit, false);

// General initialization
$(function() {
	//$.get(EXTERNAL_BASE_URL + 'services/logout.php');
	//localStorage.removeItem(USER_EMAIL);
	//localStorage.removeItem(USER_ID);
	//$.get(EXTERNAL_BASE_URL + 'services/current_user.php', function(data) { alert('it worked: ' + data); });
	setup_session();
});

//
// Android event handlers
//

// Android-specific initialization
function androidInit() {
	// Register Android event handlers
	$(document).on('resume', setup_session);  // Make sure user is still logged in on resume
	
	// Handlers for Android button behavior
	$(document).on('searchbutton', search);
	$(document).on('menubutton', show_menu);
	$(document).on('backbutton', handle_back);
	
	/*var ajax = new XMLHttpRequest();
     ajax.open("GET","http://cubist.cs.washington.edu/~htw/services/current_user.php",true);
     ajax.send();
 
     ajax.onreadystatechange=function(){
          if(ajax.readyState==4 && (ajax.status==200)){
               alert('it works! ' + ajax.responseText);
          }
     }*/
}

//
// Android button handlers
//

function search() {
	window.location.href = 'search.html';
}

function show_menu() {
	// TODO: this should actually bring up a native Android menu
	alert('Not implemented yet!');
}

//
// Session management
// 

// Sets up session stuff. If the user isn't logged in, redirects
// to the login page. Otherwise, this will ensure that the user
// is logged in on the server-side as well.
function setup_session() {	
	var login_email = localStorage.getItem(USER_EMAIL);
	var uid = localStorage.getItem(USER_ID);
	
	if (login_email && uid) {
		// We have a cached login/user ID on the client, so make sure we're also
		// logged in on the server side as well.
		$.ajax({
			type: "GET",
			url: EXTERNAL_BASE_URL + "services/current_user.php",
			dataType: "json",
			success: refresh_session,
			error: connection_error
		});
	} else {
		// We don't have any cached userdata on the client (or it is inconsistent),
		// so we logout, which clears the client-side userdata and redirects to
		// the login screen.
		logout();
	}
}

function refresh_session(data) {
	if (data && data.uid !== localStorage.getItem(USER_ID)) {
		// Try to refresh the session
		login(localStorage.getItem(USER_EMAIL));
	}
}

function login(login_email) {
	localStorage.setItem(USER_EMAIL, login_email);  // Cache the username locally to avoid repeated logins
	
	$.ajax({
		type: "POST",
		url: EXTERNAL_BASE_URL + "services/profile.php",
		data: {ra_login_email: login_email},
		dataType: "json",
		success: login_success,
		error: connection_error
    });
}

function login_success(data, textStatus, jqXHR) {
	if (data) {
		localStorage.setItem(USER_ID, data.uid);
		
		// Redirect to the main page if we just logged in or created a profile
		if (window.location.href.indexOf(LOCAL_BASE_URL + 'login.html') === 0 ||
		    window.location.href.indexOf(LOCAL_BASE_URL + 'create_profile.html') === 0) {
			window.location.href = LOCAL_BASE_URL + 'index.html';
		}
	} else {
		alert('The email you entered does not belong to any account. Please re-enter your email and try again.');
	}
}

// TODO: there has to be a better way of doing this...
var errorCount = 0;

function connection_error(jqXHR, textStatus, errorThrown) {
	if (errorCount === 5) {
		alert('Oh no, error: ' + jqXHR.status + ', ' + jqXHR.responseText);  // TODO: make error message better
	} else {
		errorCount++;
		setup_session();
	}
}

function logout() {
	$.get(EXTERNAL_BASE_URL + 'services/logout.php');
	localStorage.removeItem(USER_EMAIL);
	localStorage.removeItem(USER_ID);
	
	// Only redirect to login page if we are *not* on the login or create profile page
	if (window.location.href.indexOf(LOCAL_BASE_URL + 'login.html') !== 0 &&
	    window.location.href.indexOf(LOCAL_BASE_URL + 'create_profile.html') !== 0) {
		window.location.href = LOCAL_BASE_URL + 'login.html';
	}
}