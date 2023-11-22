$(function () {

    'use strict';

    let token = sessionStorage.getItem('token');

	$(document).ready(function(){

        loadElections();
        loadCandidates();
        dataTableAlertPrevent('table');

        //force numeric plugin
        $('.integersonly').forceNumeric();

        $('#candidates').on('click', '.btn-edit', function(){
            var candidateID = $(this).parents('tr').attr('id');
            var editModal = $('#editModal');

            //fetch election details
            $.ajax({
                url: API_URL_ROOT+'/candidates/'+candidateID,
                type: 'GET',
                dataType: 'json',
                headers:{'x-access-token':token},
                success: function(response)
                {
                    if(response.error == false)
                    {
                        var candidate = response.candidate;
                        
                        editModal.find('.modal-title').text(candidate.candidate_fullname);
                        editModal.find('.election_id').val(candidate.election_id);
                        editModal.find('.candidate_fullname').val(candidate.candidate_fullname);
                        editModal.find('.candidate_status').val(candidate.candidate_status);
                        editModal.find('.candidate_party').val(candidate.candidate_party);
                        editModal.find('.candidate_id').val(candidate.candidate_id);
                        editModal.find('.selectpicker').selectpicker('refresh');
                    }
                    else
                    {
                        showSimpleMessage("Attention", response.message, "error");   
                    }
                },
                error: function(req, status, error)
                {
                    showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.responseText, "error");
                }
            });
        }); 

        $('#candidates').on('click', '.btn-delete', function(){
            var candidateID = $(this).parents('tr').attr('id');
            deleteCandidate(candidateID);  
        }); 

        //submit new candidate
        $('#new-candidate').on('submit', function(e){
            e.preventDefault();
            newCandidate();
        });

        //edit candidate
        $('#updateCandidate').on('submit', function(e){
            e.preventDefault();
            updateCandidate();
        });
    });

    //internal function to register new candidate
    function newCandidate() 
    {
        swal({
            title: "Attention",
            text: "Are you sure you want to add this candidate?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes!",
            cancelButtonText: "No!"
            /*closeOnConfirm: false,
            closeOnCancel: false*/
        }).then(function(result){

            if (result.value) 
            {
                //name vairables
                var form = $('#new-candidate'); //form
                var table = $('#candidates').DataTable();
                var fields = form.find('input.required, select.required');

                blockUI();         

                for(var i=0;i<fields.length;i++)
                {
                    if(fields[i].value == "")
                    {
                        /*alert(fields[i].id);*/
                        unblockUI();  
                        showSimpleMessage("Attention", `${fields[i].name} is required`, "error");
                        $('#'+fields[i].id).focus();
                        return false;
                    }
                }

                $.ajax({
                    type: 'POST',
                    url: API_URL_ROOT+'/candidates',
                    data: JSON.stringify(form.serializeObject()),
                    dataType:'json',
                    contentType:'application/json',
                    headers:{'x-access-token':token},
                    success: function(response)
                    {
                        if(response.error === false)
                        {
                            unblockUI(); 
                            showSimpleMessage("Success", response.message, "success");
                            form.get(0).reset();
                            $('.selectpicker').selectpicker('refresh');
                            table.ajax.reload(null, false);
                        }
                        else
                        {
                            unblockUI();   
                            showSimpleMessage("Attention", response.message, "error");
                        }
                    },
                    error: function(req, status, error)
                    {
                        unblockUI();  
                        showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.responseText, "error");
                    }
                });   
            } 
            else 
            {
                showSimpleMessage('Canceled', 'Process Abborted', 'error');
            }
        });
    }

    //internal function to update canidates
    function updateCandidate() 
    {
        swal({
            title: "Attention",
            text: "Are you sure you want to update this candidate?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes!",
            cancelButtonText: "No!"
            /*closeOnConfirm: false,
            closeOnCancel: false*/
        }).then(function(result){

            if (result.value) 
            {
                //name vairables
                var form = $('#updateCandidate'); //form
                var candidateID = form.find('.candidate_id').val();
                var table = $('#candidates').DataTable();
                var fields = form.find('input.required, select.required');

                blockUI();

                for(var i=0;i<fields.length;i++)
                {
                    if(fields[i].value == "")
                    {
                        /*alert(fields[i].id);*/
                        unblockUI();  
                        showSimpleMessage("Attention", `${fields[i].name} is required`, "error");
                        $('#'+fields[i].id).focus();
                        return false;
                    }
                }

                $.ajax({
                    type: 'PUT',
                    url: `${API_URL_ROOT}/candidates/${candidateID}`,
                    data: JSON.stringify(form.serializeObject()),
                    dataType:'json',
                    contentType:'application/json',
                    headers:{'x-access-token':token},
                    success: function(response)
                    {
                        if(response.error == false)
                        {
                            unblockUI();
                            showSimpleMessage("Success", response.message, "success");
                            table.ajax.reload(null, false);
                            $('#editModal').find('.close').click();
                        }
                        else
                        {
                            unblockUI();
                            showSimpleMessage("Attention", response.message, "error");
                        }   
                    },
                    error: function(req, status, error)
                    {
                        unblockUI();
                        showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.responseText, "error");
                    }
                });
            } 
            else 
            {
                showSimpleMessage('Canceled', 'Process Abborted', 'error');
            }
        });
    }

    //internal function to delete candidate
    function deleteCandidate(candidateID) 
    {
        swal({
            title: "Attention",
            text: "Are you sure you want to delete this candidate?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes!",
            cancelButtonText: "No!"
            /*closeOnConfirm: false,
            closeOnCancel: false*/
        }).then(function(result){

            if (result.value) 
            {
                //name vairables
                var table = $('#candidates');
                
                blockUI();         

                $.ajax({
                    type: 'DELETE',
                    url: API_URL_ROOT+'/candidates/'+candidateID,
                    dataType: 'json',
                    headers: {'x-access-token':token},
                    success: function(response)
                    {
                        if(response.error == false)
                        {
                            unblockUI();
                            showSimpleMessage("Success", response.message, "success");
                            table.DataTable().ajax.reload(null, false);  
                        }
                        else
                        {
                            unblockUI();
                            showSimpleMessage("Attention", response.message, "error");
                        }
                    },
                    error: function(req, status, error)
                    {
                        showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.statusText, "error");
                    }
                });
            } 
            else 
            {
                showSimpleMessage('Canceled', 'Process Abborted', 'error');
            }
        });
    }

    //load candidates
    function loadCandidates()
    {
        var table = $('#candidates');

        table.DataTable({
            dom: `<"row"<"col-md-12"<"row"<"col-md-4"l><"col-md-4"B><"col-md-4"f>>><"col-md-12"rt><"col-md-12"<"row"<"col-md-5"i><"col-md-7"p>>>>`,
            buttons: {
                buttons: [
                    { extend: 'copy', className: 'btn' },
                    { extend: 'csv', className: 'btn' },
                    { extend: 'excel', className: 'btn' },
                    { extend: 'print', className: 'btn' }
                ]
            },
            oLanguage: {
                oPaginate: { 
                    sPrevious: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>', "sNext": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>' 
                },
                sInfo: "Showing _START_ to _END_ of _TOTAL_ entries",
                sSearch: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
                sSearchPlaceholder: "Search...",
               sLengthMenu: "Results :  _MENU_",
            },
            lengthMenu: [7, 10, 20, 50, 100, 500, 1000],
            stripeClasses: [],
            drawCallback: function () { $('.dataTables_paginate > .pagination').addClass(' pagination-style-13 pagination-bordered mb-5'); },
            language: {
                infoEmpty: "<span style='color:red'><b>No records found</b></span>"
            },
            processing: true,
            serverSide: true,
            destroy: true,
            autoWidth: false,
            pageLength: 100,
            ajax: {
                type: 'GET',
                url: API_URL_ROOT+'/candidates/datatable/fetch',
                dataType: 'json',
                headers:{'x-access-token':token},
                complete: function()
                {
                    //$("#loadingScreen").hide();
                    //$('.panel-refresh').click();
                },
                async: true,
                error: function(xhr, error, code)
                {
                    console.log(xhr);
                    console.log(code);
                }
            },
            columnDefs: [
                { orderable: false, targets: [1, 2, 3, 4, 5, 6, 7] }
            ],
            order: [[0, "desc"]],
            columns: [
                {
                    data: 'candidate_id',
                    render: function (data, type, row, meta) 
                    {
                        return meta.row + meta.settings._iDisplayStart + 1;
                    }
                },
                {data: 'candidate_fullname'},
                {data: 'election_title'},
                {data: 'election_category'},
                {data: 'candidate_party'},
                {
                    data: 'candidate_created_at',
                    render: function(data, type, row, meta)
                    {
                        var createdAt = moment.unix(data).format('MMMM Do YYYY, h:mm:ss a');
                        return createdAt;
                    }
                },
                {
                    data: 'candidate_status',
                    render: function(data, type, row, meta)
                    {
                        var candidateStatus = data == "Active" ? `<span class="badge outline-badge-success">${data}</span>` : `<span class="badge outline-badge-danger">${data}</span>`;
                        return candidateStatus;
                    }
                },
                {
                    data: 'candidate_id',
                    render: function(data, type, row, meta)
                    {
                        var actions = `
                            <button class="btn btn-dark mb-2 mr-2 rounded-circle btn-delete" title="Delete Candidate"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                            <button class="btn btn-dark mb-2 mr-2 rounded-circle btn-edit" title="Edit Candidate" data-toggle="modal" data-target="#editModal"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit-2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                            </button>
                        `;

                        return actions;
                    }
                }
            ] 
        });
    }

    //load elections
    function loadElections()
    {
        blockUI();

        $.ajax({
            type:'GET',
            url: API_URL_ROOT+'/elections?election_status=Active',
            dataType: 'json',
            headers:{ 'x-access-token':token},
            success: function(response)
            {
                if(response.error == false)
                {
                    var elections = response.data;
                    var html = '';

                    for(var i = 0; i < elections.length; i++)
                    {
                        html += `
                            <option value="${elections[i].election_id}">${elections[i].election_title}</option>
                        `
                    }

                    $("select.election_id").append(html);
                    $('.selectpicker').selectpicker('refresh');
                    unblockUI();
                }
                else
                {
                    unblockUI();
                    showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.statusText, "error");       
                }
            },
            error:function(req, status, error)
            {
                unblockUI();
                showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.statusText, "error");
            }
        })
    }
});  