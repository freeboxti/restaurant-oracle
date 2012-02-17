﻿/*
 * @author Coral Peterson
 */


// Call this function to animate and display a drop down menu.
// The HTML should be in the format (replace [name] with an actual name):
// 
// <div id="[name]">
// 		<a href="#" id="[name]DisplayLink" onclick="toggleDropDown('[name]');"
//			class="button dropDown">
//			[Text to display]
// 		</a>
// 		<div id="[name]Details" class="hidden dropDownDetails">
// 			<!-- What you want to be displayed when the dropdown button is clicked -->
// 		</div>
// </div>
function toggleDropdown(name) {
	
	var detailsId = "#" + name + "Details";
	var linkId = "#" + name + "DisplayLink";
	
	$(detailsId).slideToggle(300);
	var timeout = 0;
	// if we are sliding down the window, then we want the class
	// to be toggled right away, but if we are hiding it, we don't
	// want it to be toggled until the animation is done
	
	if ($(linkId).hasClass("open")) {
		timeout = 300;
	}
	
	window.setTimeout(function() {
		$(linkId).toggleClass("open");
	}, timeout);	
}


function login_submit() {
	$("#login_form").submit();
}

function joinGroup(gid) {
	console.log("joinGroup called with gid: " + gid);	
	
	var formData = {groupId : gid};

    $.ajax({
		type: "POST",
		url: "services/join_group.php",
		data: formData,
		success: joinGroupSuccess,
		dataType: 'json',
		error: joinGroupError
    });	
}

function joinGroupSuccess(data, textStatus, jqXHR) {
	console.log("join group success!");
	
	//find td with id joinGroup_<gid>
	if (data && data.success === true) {
		$("#joinGroup_" + data.groupId).empty().html("Joined!");
	}
}

function joinGroupError(jqXHR, textStatus, errorThrown) {
	console.log("join group error");
}

function add_category() {
 
    var categoryData = $('select[name=category]').val();
    var ratingData = $('input:radio[name=rating]:checked').val();
    
    var formData = {category : categoryData, rating: ratingData};


    $.ajax({
		type: "POST",
		url: "services/profile_prefs_update.php",
		data: formData,
		success: addCategorySuccess,
		dataType: 'json',
		error: addCategoryError
    });    
}

function addCategorySuccess(data, textStatus, jqXHR) {
    console.log("add category success!");
    toggleDropdown("addCategory");
	
	if (data.update === 'updated') {
		var p = '#pref_' + data.cat['name'] + ' .rating';
		$(p).html(data.rating);
	} else {
		var tds = "<tr><td></td><td class='cat_name'>" + data.cat['name'] + "</td><td class='rating'>" + data.rating + "</td><td></td></tr>";

		$("#preferenceTable").append(tds);
	}
}

function addCategoryError(jqXHR, textStatus, errorThrown) {
    console.log("add category error");
	toggleDropdown("addCategory");
}

function findGroup() {
	var nameData = $('input:input[name=gname]').val();
	var formData = {name : nameData};
	
	$.ajax({
		type: "POST",
		url: "services/find_group.php",
		data: formData,
		success: findGroupSuccess,
		dataType: 'json',
		error: findGroupError
	});
}

function findGroupSuccess(data, textStatus, jqXHR) {
	console.log("find group success!");
	
	var groupList = data.groups;
	
	// $('#groupList').empty();
	var table = $('<table></table>');
	
	$('#groupList').empty().append(table);	
		
	
	table.append($(	'<tr>' +
					'	<th class="corner"><div class="left"></div></th>' +
					'	<th class="top">Group name</th>' +
					'	<th class="top">Join</th>' +
					'	<th class="corner"><div class="right"></div></th>' +
					'</tr>'
	));
	
	var even = true;
	
	$.each(groupList, function() {
		var row = $('<tr></tr>').addClass(even ? 'even' : 'odd');
		
		var nameCell = $('<td></td>').html(this.name);
		var joinCell = $('<td id="joinGroup_' + this.gid + '"></td>')
			.append($('<a class="button submit" ' +
				'onclick="joinGroup(' + this.gid + ');">Join</a>'));
		
		
		row.append(
			$('<td></td>'),
			nameCell,
			joinCell,
			$('<td></td>'));
		table.append(row);
		
		even = !even;
		// row.append("<td>test</td>");
	});
	
	table.append($(	'<tr class="bottom">' +
					'	<td></td>' +
					'	<td></td>' +
					'	<td><div></div></td>' +
					'	<td></td>' +
					'</tr>'
	));
	
}

function findGroupError(jqXHR, textStatus, errorThrown) {
	console.log("find group error!");
}

function createGroup() {
	var nameData = $('input:input[name=gname]').val();
	
	var formData = {name : nameData};
	
	$.ajax({
		type: "POST",
		url: "services/create_group.php",
		data: formData,
		success: createGroupSuccess,
		dataType: 'json',
		error: createGroupError
	});

}

function createGroupSuccess(data, textStatus, jqXHR) {
	console.log("create group success!");
	
	window.location.href = "my_groups.php";
}

function createGroupError(jqXHR, textStatus, errorThrown) {
	console.log("create group error. ):");
}

function create_profile() {
    var email_data = $('input:input[name=email]').val();
    var fname_data = $('input:input[name=fname]').val();
    var lname_data = $('input:input[name=lname]').val();

    var blob = {email: email_data, fname: fname_data, lname: lname_data };

    $.ajax({
		type: "POST",
		url: "services/create_profile.php",
		data: blob,
		success: create_profile_success,
		dataType: 'json',
		error: create_profile_error

    });
}

function create_profile_success(data, textStatus, jqXHR) {
    console.log("success!");
    
    /*$("#create_profile_status").html("Success!");
    $("#create_profile_status").css('backgroundColor', '#98FB98');
    $("#create_profile_status").slideDown(400);*/
	
	window.location.href = "profile.php";
}

function create_profile_error(jqXHR, textStatus, errorThrown){
    console.log("error! D:");
}

function getSearchResults(uid) {
	var isGroupSearch = $("input:radio[name='searchType']:checked").val() === "group";
	var guid = isGroupSearch ? $("select[name='group']").val() : uid;
	
	var formData = {isGroup: isGroupSearch, id: guid};
	
	//alert("isGroupSearch: " + isGroupSearch + "\nGroup / user id: " + guid);

	$.ajax({
		type: "GET",
		url: "services/results.php",
		data: formData,
		dataType: "json",
		success: getSearchResultsSuccess,
		error: getSearchResultsError
	});
	
}

function getSearchResultsSuccess(data, textStatus, jqXHR) {
	console.log("search results success! data: " + data);
	
	var restaurants = {
		0: {rid: 1105, name: "Jimmy John's"},
		1: {rid: 1, name: "1-2-3 Thai Food"},
		2: {rid: 493, name: "Chipotle"},
		3: {rid: 22, name: "A Burger Place"},
		5: {rid: 475, name: "China First"},
		6: {rid: 184, name: "Banana Leaf Cafe"}	
	};
	
	
	
	var table = $('<table></table>');
	
	$('#resultsTable').empty().append(table);	
		
	
	table.append($(	'<tr>' +
					'	<th class="corner"><div class="left"></div></th>' +
					'	<th class="top">Restaurant ID</th>' +
					'	<th class="top">Restaurant</th>' +
					'	<th class="corner"><div class="right"></div></th>' +
					'</tr>'
	));
	
	var even = true;
	
	$.each(restaurants, function() {
		var row = $('<tr></tr>').addClass(even ? 'even' : 'odd');
		
		var cellOne = $('<td></td>').html(this.rid);
		var cellTwo = $('<td></td>').html(this.name);
		
		
		row.append(
			$('<td></td>'),
			cellOne,
			cellTwo,
			$('<td></td>'));
		table.append(row);
		
		even = !even;
		// row.append("<td>test</td>");
	});
	
	table.append($(	'<tr class="bottom">' +
					'	<td></td>' +
					'	<td></td>' +
					'	<td><div></div></td>' +
					'	<td></td>' +
					'</tr>'
	));
	
}

function getSearchResultsError(jqXHR, textStatus, errorThrown){
	console.log("search results error: " + errorThrown);
}