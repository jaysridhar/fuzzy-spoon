'use strict';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { timeSince } from './myfuncs';
import * as ut from './utils';
import { get_row, get_table } from './menu_funcs';
import { make_refresh_func, prepare_userloc } from './app_utils';

dayjs.extend(utc);

function buildColumns($tableEl, titlesArr)
{
    const addressFormatTmpl = $('#address-format-tmpl').html();
    const addressFormatter = (value, row) => {
	return ut.renderString(addressFormatTmpl, {'addr': value});
    }
    let columns = [{ field: "id",
		     title: "ID",
		     sortable: true },
		   { field: "latitude",
		     title: "Latitude",
		     sortable: true },
		   { field: "longitude",
		     title: "Longitude",
		     sortable: true },
		   { field: "accuracy",
		     title: "Accuracy",
		     sortable: true },
		   { field: '_google_loc',
		     title: 'Address',
		     formatter: addressFormatter,
		     sortable: true }
		  ];
    if ( !titlesArr ) titlesArr = columns.map(x => x.title);
    columns.forEach(item => {
	if ( titlesArr.find(title => title === item.title) ) item.visible = true
	else item.visible = false;
    });
    return [{ checkbox: true }].concat(columns);
}

function make_load_complete($tableEl)
{
    return function(param) {
	let $tabPane = $tableEl.closest('div.tab-pane'),
	    paneId = $tabPane.prop('id'),
	    $tabEl = $tabPane.closest('div.tab-content').prev('.nav-tabs').find(`a[href="#${paneId}"]`);
	console.log('$tableEl = %O, paneId = %O, $tabEl = %O', $tableEl, paneId, $tabEl);
	$tabEl.find('div.spin').remove();
	console.log('param = %O', param);
	let total = param.rows.length || 0, filtered = $tabEl.find('span.badge').data('filtered') || 0;
	$tabEl.find('span.badge').remove();
	$tabEl.append(` <span data-total="${total}" class="badge badge-secondary">${total}</span>`);
    }
}

function setupNew()
{
    let $tableEl = $('#new-table');
    let columns = buildColumns($tableEl),
	updateBtn = () => $('.new-btn').prop('disabled', $tableEl.bootstrapTable('getSelections').length == 0),
	changeBtnState = row => updateBtn();;
    $tableEl.bootstrapTable({
	columns: columns,
	uniqueId: 'id',
	sidePagination: 'server',
	ajax: make_refresh_func('/api/admin/status/new', 'new', prepare_userloc),
	pagination: true,
	showColumns: true,
	clickToSelect: true,
	showColumnsSearch: true,
	showRefresh: true,
	search: true,
	showExtendedPagination: true,
	cookie: true,
	cookieIdTable: 'new',
	cookieExpire: '7d',
	showMultiSort: true,
	sortPriority: [],
	rowStyle: (row, index) => {return { classes: 'show-completed-menu' }},
	onCheck: changeBtnState,
	onCheckAll: changeBtnState,
	onUncheck: changeBtnState,
	onUncheckAll: changeBtnState,
	onLoadSuccess: make_load_complete($tableEl),
	//onSearch: make_on_search($tableEl),
    })
}

function setupApproved()
{
    let $tableEl = $('#approved-table');
    let columns = buildColumns($tableEl),
	updateBtn = () => $('.approved-btn').prop('disabled', $tableEl.bootstrapTable('getSelections').length == 0),
	changeBtnState = row => updateBtn();
    $tableEl.bootstrapTable({
	columns: columns,
	uniqueId: 'id',
	sidePagination: 'server',
	ajax: make_refresh_func('/api/admin/status/approved', 'approved', prepare_userloc),
	pagination: true,
	showColumns: true,
	clickToSelect: true,
	showColumnsSearch: true,
	showRefresh: true,
	search: true,
	showExtendedPagination: true,
	cookie: true,
	cookieIdTable: 'approved',
	cookieExpire: '7d',
	showMultiSort: true,
	sortPriority: [],
	rowStyle: (row, index) => {return { classes: 'show-completed-menu' }},
	onCheck: changeBtnState,
	onCheckAll: changeBtnState,
	onUncheck: changeBtnState,
	onUncheckAll: changeBtnState,
	onLoadSuccess: make_load_complete($tableEl),
	//onSearch: make_on_search($tableEl),
    })
}

$(function() {
    console.log('loaded app.js');
    setupNew();
    setupApproved();
})
