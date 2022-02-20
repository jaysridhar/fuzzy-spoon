'use strict';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { timeSince } from './myfuncs';

dayjs.extend(utc);

export function prepare_userloc(uloc)
{
    if ( uloc.google_maps_location && uloc.google_maps_location.length > 0 ) {
	try {
	    uloc._google_loc = JSON.parse(uloc.google_maps_location)
	} catch(err) {
	    console.log('error parsing [%O...]: %O', uloc.google_maps_location.substring(0, 100), err)
	}
    }
    return uloc
}

export function make_refresh_func(url, status, row_preparer, afterRefreshHandler)
{
    return function(params) {
	let pstr = '?' + new URLSearchParams(params.data).toString();
	fetch(url + pstr).then(response => {
	    if ( response.ok ) return response.json();
	    else throw response;
	}).then(resp => {
	    console.log('resp[%O] = %O', status, resp);
	    let userloc;
	    if ( 'total' in resp ) {
		resp.rows = resp.rows.map(row_preparer)
		userloc = resp
	    } else {
		userloc = resp.map(row_preparer)
	    }
	    params.success(userloc)
	    if ( afterRefreshHandler ) afterRefreshHandler();
	});
    }
}
