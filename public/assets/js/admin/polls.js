$(function () {

    'use strict';

    let token = sessionStorage.getItem('token');

	$(document).ready(function(){

        loadElections();
        loadStates();
        loadLocalGovernments();
        loadWards();
        loadPollingUnits();
        loadCandidates();
        dataTableAlertPrevent('table');

        //force numeric plugin
        $('.integersonly').forceNumeric();

        //filter polls submit
        $('#filter-polls').on('submit', function(e){
            e.preventDefault();
            filterPolls();
        });
    });

    //internal function to filter polls
    function filterPolls() 
    {
        //name vairables
        var form = $('#filter-polls'); //form
        var electionID = form.find('select.election_id option:selected').val();
        var stateName = form.find('select.state option:selected').val();
        var LGA = form.find('select.local_government option:selected').val();
        var ward = form.find('select.ward option:selected').val();
        var pollingUnitID = form.find('select.polling_unit_id option:selected').val();
        var candidateID = form.find('select.candidate_id option:selected').val();
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

        loadPolls(electionID, stateName, LGA, ward, pollingUnitID, candidateID);
        unblockUI();
    }

    function submitScoreSheet()
    {
        swal({
            title: "Attention",
            text: "Are you sure you want to submit this score sheet?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes!",
            cancelButtonText: "No!"
        }).then(function(result){

            if (result.value) 
            {
                //name vairables
                var rowCount = $('#score-sheet tbody tr').length;
                var table = $('#score-sheet').DataTable();  

                blockUI();     

                if(rowCount == 0)
                {
                    unblockUI();
                    showSimpleMessage("Attention", "No records found", "error");                     
                }
                else
                {
                    var data = $("#score-sheet tbody").find('.poll').map(function(){
                        const poll = $(this).val();
                        const candidateID = $(this).attr('data-candidate-id');
                        const electionID = $(this).attr('data-election-id');
                        const pollingUnitID = $(this).attr('data-polling-unit-id');

                        const candidate = {
                            candidate_id: candidateID,
                            election_id: electionID,
                            polling_unit_id: pollingUnitID,
                            poll: poll || 0
                        }
                        return candidate;
                    }).get();

                    console.log(JSON.stringify({data}))

                    $.ajax({
                        type: "POST",
                        url: `${API_URL_ROOT}/polls`,
                        dataType:'json',
                        data:JSON.stringify({data}),
                        contentType:'application/json',
                        headers:{ 'x-access-token':token },
                        success: function(response)
                        {
                            if(response.error == false)
                            {
                                unblockUI();
                                showSimpleMessage("Success", response.message, "success");
                                table.ajax.reload(null, true);
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
            } 
            else 
            {
                showSimpleMessage('Canceled', 'Process Abborted', 'error');
            }
        }); 
    }

    //load polls
    function loadPolls(electionID, stateName="", LGA="", ward="", pollingStationID="", candidateID="")
    {
        var table = $('#polls');

        table.DataTable({
            dom: `<"row"<"col-md-12"<"row"<"col-md-4"l><"col-md-4"B><"col-md-4"f>>><"col-md-12"rt><"col-md-12"<"row"<"col-md-5"i><"col-md-7"p>>>>`,
            buttons: {
                buttons: [
                    { extend: 'copy', className: 'btn' },
                    { extend: 'csv', className: 'btn' },
                    { extend: 'excel', className: 'btn' },
                    { extend: 'print', className: 'btn' },
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
                url: `${API_URL_ROOT}/polls/datatable/fetch?election_id=${electionID}&state=${stateName}&local_government=${LGA}&ward=${ward}&polling_station_id=${pollingStationID}&candidate_id=${candidateID}`,
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
                { orderable: false, targets: [1, 2, 3, 4, 5, 6] }
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
                { data: 'total_polls'},
                { 
                    data: 'total_observed_polls',
                    render: function (data, type, row, meta) 
                    {
                        return data || 0
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
                    showSimpleMessage("Attention", response.message, "error");       
                }
            },
            error:function(req, status, error)
            {
                unblockUI();
                showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.statusText, "error");
            }
        })
    }

    //load polling units
    function loadPollingUnits()
    {
        //blockUI();
        $("select.state, select.local_government, select.ward").on("change", function(){
            var val = $(this).find("option:selected").val();
            var url = $(this).attr("data-location-type") === "state" ? `${API_URL_ROOT}/polling-units?state=${val}` : $(this).attr("data-location-type") === "LGA" ? `${API_URL_ROOT}/polling-units?local_government=${val}` : $(this).attr("data-location-type") === "ward" ? `${API_URL_ROOT}/polling-units?ward=${val}` : `${API_URL_ROOT}/polling-units`;

            if(val)
            {
                blockUI();
    
                $.ajax({
                    type:'GET',
                    url,
                    dataType: 'json',
                    headers:{ 'x-access-token':token},
                    success: function(response)
                    {
                        if(response.error == false)
                        {
                            var stations = response.data;
                            var html = '<option value="">All</option>';
        
                            for(var i = 0; i < stations.length; i++)
                            {
                                html += `
                                    <option value="${stations[i].polling_id}">${stations[i].polling_station}</option>
                                `
                            }
        
                            $("select.polling_unit_id").html(html);
                            $('.selectpicker').selectpicker('refresh');
                            unblockUI();
                        }
                        else
                        {
                            unblockUI();
                            showSimpleMessage("Attention", response.message, "error");       
                        }
                    },
                    error:function(req, status, error)
                    {
                        unblockUI();
                        showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.statusText, "error");
                    }
                })
            }
            else
            {
                $('select.polling_unit_id').html(`<option value="">All</option>`);
                $('.selectpicker').selectpicker('refresh');
            }
        })

    }

    //load states
    function loadStates()
    {
        blockUI();

        $.ajax({
            type:'GET',
            url: API_URL_ROOT+'/states',
            dataType: 'json',
            headers:{ 'x-access-token':token},
            success: function(response)
            {
                if(response.error == false)
                {
                    var states = response.data;
                    var html = '';

                    for(var i = 0; i < states.length; i++)
                    {
                        html += `
                            <option value="${states[i].state_name}">${states[i].state_name}</option>
                        `
                    }

                    $("select.state").append(html);
                    $('.selectpicker').selectpicker('refresh');
                    unblockUI();
                }
                else
                {
                    unblockUI();
                    showSimpleMessage("Attention", response.message, "error");       
                }
            },
            error:function(req, status, error)
            {
                unblockUI();
                showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.statusText, "error");
            }
        })
    }

    //load local governments
    function loadLocalGovernments()
    {
        //blockUI();
        $("select.state").on("change", function(){
            var val = $(this).find("option:selected").val();

            if(val)
            {
                blockUI();
    
                $.ajax({
                    type:'GET',
                    url: `${API_URL_ROOT}/local-governments?state_name=${val}`,
                    dataType: 'json',
                    headers:{ 'x-access-token':token},
                    success: function(response)
                    {
                        if(response.error == false)
                        {
                            var LGAs = response.data;
                            var html = '<option value="">All</option>';
        
                            for(var i = 0; i < LGAs.length; i++)
                            {
                                html += `
                                    <option value="${LGAs[i].local_government}">${LGAs[i].local_government}</option>
                                `
                            }
        
                            $("select.local_government").html(html);
                            $('.selectpicker').selectpicker('refresh');
                            unblockUI();
                        }
                        else
                        {
                            unblockUI();
                            showSimpleMessage("Attention", response.message, "error");       
                        }
                    },
                    error:function(req, status, error)
                    {
                        unblockUI();
                        showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.statusText, "error");
                    }
                })
            }
            else
            {
                $('select.local_government').html(`<option value="">All</option>`);
                $('.selectpicker').selectpicker('refresh');
            }
        })

    }

    //load wards
    function loadWards()
    {
        //blockUI();
        $("select.state, select.local_government").on("change", function(){
            var val = $(this).find("option:selected").val();
            var url = $(this).attr("data-location-type") === "state" ? `${API_URL_ROOT}/wards?state_name=${val}` : $(this).attr("data-location-type") === "LGA" ? `${API_URL_ROOT}/wards?local_government_name=${val}` : `${API_URL_ROOT}/wards`;

            if(val)
            {
                blockUI();
    
                $.ajax({
                    type:'GET',
                    url,
                    dataType: 'json',
                    headers:{ 'x-access-token':token},
                    success: function(response)
                    {
                        if(response.error == false)
                        {
                            var wards = response.data;
                            var html = '<option value="">All</option>';
        
                            for(var i = 0; i < wards.length; i++)
                            {
                                html += `
                                    <option value="${wards[i].ward_name}">${wards[i].ward_name}</option>
                                `
                            }
        
                            $("select.ward").html(html);
                            $('.selectpicker').selectpicker('refresh');
                            unblockUI();
                        }
                        else
                        {
                            unblockUI();
                            showSimpleMessage("Attention", response.message, "error");       
                        }
                    },
                    error:function(req, status, error)
                    {
                        unblockUI();
                        showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.statusText, "error");
                    }
                })
            }
            else
            {
                $('select.ward').html(`<option value="">All</option>`);
                $('.selectpicker').selectpicker('refresh');
            }
        })

    }

    //load candidates
    function loadCandidates()
    {
        //blockUI();
        $("select.election_id").on("change", function(){
            var val = $(this).find("option:selected").val();

            if(val)
            {
                blockUI();
    
                $.ajax({
                    type:'GET',
                    url: `${API_URL_ROOT}/candidates?election_id=${val}&candidate_status=Active`,
                    dataType: 'json',
                    headers:{ 'x-access-token':token},
                    success: function(response)
                    {
                        if(response.error == false)
                        {
                            var candidates = response.data;
                            var html = '<option value="">All</option>';
        
                            for(var i = 0; i < candidates.length; i++)
                            {
                                html += `
                                    <option value="${candidates[i].candidate_id}">${candidates[i].candidate_fullname}</option>
                                `
                            }
        
                            $("select.candidate_id").html(html);
                            $('.selectpicker').selectpicker('refresh');
                            unblockUI();
                        }
                        else
                        {
                            unblockUI();
                            showSimpleMessage("Attention", response.message, "error");       
                        }
                    },
                    error:function(req, status, error)
                    {
                        unblockUI();
                        showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.statusText, "error");
                    }
                })
            }
            else
            {
                $('select.candidate_id').html(`<option value="">All</option>`);
                $('.selectpicker').selectpicker('refresh');
            }
        })

    }
});  