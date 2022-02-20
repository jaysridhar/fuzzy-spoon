'use strict';

import * as ut from './utils';

$(function() {
    console.log('loaded user.js');
    if ( ! navigator.geolocation ) {
	Swal.fire('No Location', 'Your browser does not support geolocation');
    } else {
	navigator.geolocation.getCurrentPosition(pos => {
	    $.ajax({
		method: 'POST',
		url: '/api/user/location',
		data: pos.coords,
		headers: { 'X-CSRFToken': ut.getCookieValue('csrftoken') },
	    }).done(resp => {
		console.log('resp = %O', resp);
	    }).fail(function(jqxhr, status) {
		console.log('fail(%O)', arguments);
		Swal.fire({
		    title: 'Failed to save location',
		    text: jqxhr.responseText,
		})
	    })
	}, () => {
	    Swal.fire('Access Denied', 'You have denied access to your location');
	})
    }
})
