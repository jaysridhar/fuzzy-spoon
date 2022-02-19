'use strict';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { timeSince } from './myfuncs';
import * as ut from './utils';
import { get_row, get_table } from './menu_funcs';

dayjs.extend(utc);

function buildColumns($tableEl, titlesArr)
{
    const nameFormatter = (value, row, index, field) => {
	let ctx = { value: value, row: row, spinner: false, error: false }
	if ( row.status === 'started' || row.status === 'not-started' ) {
	    $tableEl.data('rfq').add(row.id, x => x.status !== row.status)
	    ctx.spinner = true;
	} else if ( row.report_id ) {
	    if ( row.report_id === 'error' ) {
		ctx.error = true; ctx.spinner = false;
	    } else if ( row.report_id.startsWith('/') ) {
		ctx.error = false; ctx.spinner = false;
	    } else {
		/* has "report_id", "report_id" is not "error" and "report_id" does not start with "/" */
		let intId = setInterval(async function() {
		    let st = await fetch(`/api/dashboard/aireport?wq_id=${row.id}&statusonly`).then(r => r.json())
		    console.log('status = %O', JSON.stringify(st));
		    if ( row.id in st.status && st.status[row.id] ) {
			$tableEl.bootstrapTable('refresh');
			clearInterval(intId);
		    } else if ( row.id in st.errors ) {
			$tableEl.bootstrapTable('refresh');
			clearInterval(intId);
		    }
		}, 2000)
		ctx.spinner = true;
		ctx.error = false;
	    }
	}
	return ut.renderString($('#patient-name-toolbar-tmpl').html(), ctx)
    };
    const zipFormatter = (value, row) => {
	return `<a href="/api/dashboard/workqueue/zip/${row.id}"><i class="fas fa-file-archive"></i></a>`
    };
    let columns = [{ field: "id",
		     title: "ID",
		     sortable: true },
		   { field: "seq_no",
		     title: "Seq",
		     sortable: true },
		   { field: "study_id",
		     title: "Study ID",
		     visible: false,
		     sortable: true },
		   { field: "studydetail.patientName",
		     title: "Patient",
		     sortable: true,
		     formatter: nameFormatter },
		   { field: "studydetail.patientBirthDate",
		     title: "DOB",
		     sortable: true },
		   { field: "studydetail.patientSex",
		     title: "Gender",
		     visible: false,
		     sortable: true },
		   { field: "studydetail.otherPatientIDs",
		     title: "Clinic",
		     sortable: true },
		   { field: "studydetail.referringPhysicianName",
		     title: "Doctor",
		     sortable: true },
		   { field: "operator_name",
		     title: "Operator",
		     visible: true,
		     sortable: true },
		   { field: "_studygroup_assigned_id",
		     title: "Group",
		     visible: true,
		     sortable: true },
		   { field: "_studygroup_assigned_analysta",
		     title: "Analyst-A",
		     visible: true,
		     sortable: true },
		   { field: "_studygroup_assigned_analystb",
		     title: "Analyst-B",
		     visible: true,
		     sortable: true },
		   { field: "_studygroup_assigned_qcperson",
		     title: "QC",
		     visible: true,
		     sortable: true },
		   { field: "studydetail.studyDate",
		     title: "Study Date",
		     sortable: true },
		   { field: "studydetail.studyDescription",
		     title: "Study Type",
		     visible: false,
		     sortable: true },
		   { field: "status",
		     title: "Status",
		     visible: false,
		     sortable: true },
		   { field: "message",
		     title: "Message",
		     visible: false,
		     sortable: true },
		   { field: "output_dir",
		     title: "Directory",
		     visible: false,
		     sortable: true },
		   { field: "report_id",
		     title: "Report ID",
		     visible: false,
		     sortable: true },
		   { field: "num_images",
		     title: "Images",
		     visible: true,
		     sortable: true },
		   { field: "controller_id",
		     title: "Controller",
		     visible: false,
		     sortable: true },
		   { field: "_created",
		     title: "Created",
		     sortable: true,
		     formatter: (value, row, index, field) => `<span title="${row.created_at}">${value}</span>`},
		   { field: "_started",
		     title: "Started",
		     sortable: true,
		     formatter: (value, row, index, field) => `<span title="${row.started_at}">${value}</span>`},
		   { field: "_completed",
		     title: "Completed",
		     sortable: true,
		     formatter: (value, row, index, field) => `<span title="${row.completed_at}">${value}</span>`},
		   { field: "_assigned",
		     title: "Assigned",
		     visible: true,
		     sortable: true,
		     formatter: (value, row, index, field) => `<span title="${row._studygroup_assigned_assigned_at}">${value}</span>`},
		   { field: "_sgupdated",
		     title: "Updated",
		     visible: true,
		     sortable: true,
		     formatter:(value,row,index,field)=>`<span title="${row._studygroup_updated_at}">${value}</span>`},
		   { title: 'ZIP',
		     formatter: zipFormatter }];
    if ( !titlesArr ) titlesArr = columns.map(x => x.title);
    columns.forEach(item => {
	if ( titlesArr.find(title => title === item.title) ) item.visible = true
	else item.visible = false;
    });
    return [{ checkbox: true }].concat(columns);
}

function setupCompleted(columnTitlesArr)
{
    let $tableEl = $('#completed-table');
    $tableEl.data('taskQ', new TaskQueue(() => $tableEl.bootstrapTable('refresh')));
    let columns = buildColumns($tableEl, columnTitlesArr),
	updateBtn = () => $('.completed-btn').prop('disabled', $tableEl.bootstrapTable('getSelections').length == 0),
	changeBtnState = row => updateBtn();
    $tableEl.bootstrapTable({
	columns: columns,
	uniqueId: 'id',
	sidePagination: 'server',
	ajax: make_refresh_func('/api/dashboard/workqueue/status/completed', 'completed', prepare_workqueue, updateBtn),
	pagination: true,
	showColumns: true,
	clickToSelect: true,
	showColumnsSearch: true,
	showRefresh: true,
	search: true,
	showExtendedPagination: true,
	cookie: true,
	cookieIdTable: 'completed',
	cookieExpire: '7d',
	showMultiSort: true,
	sortPriority: [],
	rowStyle: (row, index) => {return { classes: 'show-completed-menu' }},
	onCheck: changeBtnState,
	onCheckAll: changeBtnState,
	onUncheck: changeBtnState,
	onUncheckAll: changeBtnState,
	onLoadSuccess: make_load_complete($tableEl),
	onAll: name => console.log('event "%O"', name),
	onSearch: make_on_search($tableEl),
	onPostBody: function() {
	    let wq_ids = $tableEl.find('tbody > tr').map((ie, el) => $(el).data('uniqueid')).get();
	    $.ajax({
		method: 'GET',
		url: '/api/dashboard/comparedata/',
		data: { wq_id: wq_ids },
		traditional: true
	    }).done(data => {
		wq_ids.forEach(wq_id => {
		    let $span = $tableEl.find(`tbody > tr[data-uniqueid=${wq_id}] span.has-legacy`);
		    if ( wq_id in data.legacy ) $span.addClass('bg-green-500 yes')
		    else if ( wq_id in data.errors ) $span.addClass('bg-red-500 no').prop('title', data.errors[wq_id])
		});
	    });
	},
    })
    const assignFn = (ev, $modal) => {
	const anaA = $modal.find('select[name="analyst-a"]').val(),
	      anaB = $modal.find('select[name="analyst-b"]').val(),
	      qc = $modal.find('select[name="qcperson"]').val(),
	      arr = $modal.find('tr[data-id]').get().map(el => parseInt($(el).data('id')));
	$modal.find('div.error-mesg').empty();
	if ( !(anaA && anaB && qc) ) {
	    return $modal
		.find('.error-mesg')
		.addClass('text-red-600')
		.text('Please pick both analysts as well as QC from the dropdown.')
	}
	if ( anaA == anaB ) {
	    return $modal
		.find('.error-mesg')
		.addClass('text-red-600')
		.text('Both analysts cannot be the same.')
	}
	$modal
	    .find('.apply-action')
	    .prop('disabled', true)
	    .append('<span> <div class="spinner-border spinner-border-sm"></div></span>');
	const doneFn = () => $modal.find('.apply-action').prop('disabled', false).find('span').remove();
	$.ajax({
	    method: 'POST',
	    url: '/api/dashboard/assignment/',
	    contentType: 'application/json',
	    data: JSON.stringify({ analysta: anaA, analystb: anaB, qcperson: qc, wq_id: arr }),
	    headers: { 'X-CSRFToken': ut.getCookieValue('csrftoken') },
	}).done(function(resp, status, jqxhr) {
	    console.log('done(%O)', arguments);
	    $('#completed-table').bootstrapTable('refresh');
	    tabTasks['assigned-tab'].push(() => $('#assigned-table').bootstrapTable('refresh'));
	    doneFn();
	    setTimeout(() => $modal.modal('hide'), 3000);
	}).fail(function(jqxhr, status) {
	    console.log('fail(%O)', arguments);
	    if ( jqxhr.status === 403 ) {
		$modal.find('div.error-mesg')
		    .empty()
		    .append(`<div class="text-red-500">Sorry, not enough permissions. [${jqxhr.statusText}]</div>`);
	    } else {
		$modal.find('div.error-mesg')
		    .empty()
		    .append(`<div class="text-red-500">${jqxhr.status} ${jqxhr.statusText}</div>`);
	    }
	    doneFn();
	})
    };
    $('#group-study').click(function(ev) {
	const selected = $('#completed-table').bootstrapTable('getSelections')
	console.log('selected: %O', selected);
	fetch('/assets/templates/assign.html')
	    .then(response => response.text())
	    .then(async function(page) {
		const analysts = await fetch('/api/dashboard/analysts/').then(response => response.json());
		const str = ut.renderString(page, { selected: selected, analysts: analysts });
		ut.doModal({
		    title: 'Assign Work',
		    message: str,
		    okRequired: true,
		    sizeClass: 'modal-lg',
		    okText: 'Assign',
		    okAction: assignFn,
		})
	    })
    });
}

$(function() {
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
