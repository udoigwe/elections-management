 //return payload claim
function payloadClaim(token, param)
{
    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var payload = JSON.parse(window.atob(base64));
    var claim = payload[param];

    return claim;
}

function loggedinCheck()
{        
	//Instantiate access token
    var token = sessionStorage.getItem('token');

    //check if the access token is empty
    if(token)
    {
        var role = payloadClaim(token, "user_role"); //the user role from access token
        var folder = role == 'Super Admin' ? 'sa' : role.toLowerCase();

        //redirect to user's dashboard
        window.location = folder+'/';
    }
} 

//not logged in check
function notLoggedInCheck()
{
    //Instantiate access token
    var token = sessionStorage.getItem('token');

    //check if the access token is empty
    if(!token)
    {
        //redirect to the login page
        window.location = '../login';
    }
}

//remember me
function rememberMe()
{
    if (localStorage.getItem('chkbx') && localStorage.getItem('chkbx') !== '') 
    {
        $('#remember-me').attr('checked', 'checked');
        $('#email').val(localStorage.getItem('email'));
        $('#password').val(localStorage.getItem('password'));
    } 
    else 
    {
        $('#remember-me').removeAttr('checked');
        $('#email').val('');
        $('#password').val('');
    }
}

//set remember me cookie
function setRememberMe()
{
    if ($('#remember-me').is(':checked')) 
    {
        // save email and password in computer's hardrive
        localStorage.removeItem('email');
        localStorage.removeItem('password');
        localStorage.removeItem('chkbx');
        localStorage.setItem('email', $('#email').val());
        localStorage.setItem('password', $('#password').val());
        localStorage.setItem('chkbx', $('#remember-me').val());
    } 
    else 
    {
        //remove login details from computer's hardrivve
        localStorage.removeItem('email');
        localStorage.removeItem('password');
        localStorage.removeItem('chkbx');
    }
}

function activateLinks()
{
    //current page url
    var pgUrl = window.location.href.substr(window.location.href.lastIndexOf("/") + 1);

    $('#sidebar a').each(function(){
        var $this = $(this);
        //if current path is like link, make it active
        if($this.attr('href') == pgUrl)
        {
            if($this.hasClass('dropdown-toggle'))
            {
                $this.attr('data-active', 'true');
                $this.attr('aria-expanded', 'true');
            }
            else
            {
                $this.parent('li').addClass('active').closest('ul').addClass('show');
                $this.parents('.menu').find('.dropdown-toggle').attr('aria-expanded', 'true');
                $this.parents('.menu').find('.dropdown-toggle').attr('data-active', 'true');
            }
            
        }
    });
}

//signOut current user
function signOut()
{
    var token = sessionStorage.getItem('token'); //access token
    blockUI();

    //clear all stored sessions
    sessionStorage.clear();
    
    //redirect to login screeen
    window.location = '/signin';
}

//display user profile
function displayUserProfile()
{
    var token = sessionStorage.getItem('token'); //access token

    if(token !== null && token !== "")
    {
        var userImageUrl = payloadClaim(token, 'user_image_url')

        $(".user-profile-dropdown").find('img').attr({src:userImageUrl, width:'40', height:'40'});
    }
}

//show welcome message for first timers
//show sign out dialogue
function showWelcomeMessage() 
{
    //Instantiate access token
    var token = sessionStorage.getItem('token');
    var firstname = payloadClaim(token, 'user_firstname');

    var title = "Hi!!! "+firstname;
    var text = `
        <hr>
        <div style="font-size:13px">
            <p>Welcome to PHOTOMAN office</p>
        </div>
    `;

    swal({
        title: title,
        html: text,
        type: 'info',
        confirmButtonText: "Close",
        showLoaderOnConfirm: false,
        animation: true,
        padding: '2em'
    }); 

    sessionStorage.setItem('welcomemessage', 'shown'); //set access token       
}

//show sign out dialogue
function showSignOutMessage() {
    swal({
        title: "Sign Out?",
        text: "Are you sure you want to sign out this user?",
        type: "warning",
        showCancelButton: true,
        padding: '2em'
        //closeOnConfirm: false,
        //showLoaderOnConfirm: true,
    }).then(function(result) {
        if(result.value)
        {
            signOut();
        }
    });
}

//Show simple message
function showSimpleMessage(title, text, type) {
    swal({
        title: title,
        text: text,
        type: type,
        confirmButtonText: "Close",
        showLoaderOnConfirm: false,
        padding: '2em'
    });
}

function showHtmlMessageWithCustomIcon(title, text, imageUrl) {
    swal({
        title: title,
        text: text,
        imageUrl: imageUrl,
        html: true
    });
}

function showHtmlMessage() {
    swal({
        title: "HTML <small>Title</small>!",
        text: "A custom <span style=\"color: #CC0000\">html<span> message.",
        html: true
    });
}

function markRead(title, text, imageUrl, msgID, tableID, callback) {

    var token = sessionStorage.getItem('token'); //access token
    var rowCount = $('#'+tableID).find('tbody tr').length;

    swal({
        title: title,
        text: text,
        imageUrl: imageUrl,
        html: true
    }, function (isConfirm) {
        
        if(isConfirm)
        {
            $.ajax({
                url: '../../api/public?call=messages',
                type: 'POST',
                data: {action:'markRead', msgID:msgID, token:token},
                dataType: 'json',
                success: function(response)
                {
                    if(response.error === false)
                    {
                        rowCount > 0 ? $('#'+tableID).DataTable().ajax.reload(null, false) : callback;
                    }
                    else
                    {
                        showSimpleMessage("Attention", response.message, "error");
                    }
                },
                error: function(req, status, error)
                {
                    console.log(req.responseText);
                }
            });
        }
    });
}

function newRequestsNotification() {

    var token = sessionStorage.getItem('token'); //access token

    $.ajax({
        url:API_URL_ROOT + '/requests/count/Unassigned',
        type:'GET',
        dataType:'json',
        headers:{'x-access-token':token},
        success:function(response)
        {
            if(response.error === false)
            {
                var unassignedCount = response.request_count;
                unassignedCount == 0 ? $('#notificationDropdown').find('.indicator').css('display', 'none') : $('#notificationDropdown').find('.indicator').css('display', 'inline-block');
            }
            else
            {
                showSimpleMessage("Attention", response.message, "error");
            }
        },
        error: function(req, status, error)
        {
            console.log(req.responseText);
        }
    });
}

function newTasksNotification()
{
    var token = sessionStorage.getItem('token'); //access token
    var staffID = payloadClaim(token, 'user_id');
    let assigned = 0;

    $.ajax({
        url:API_URL_ROOT + '/tasks/filter/all?staffID='+staffID,
        type:'GET',
        dataType:'json',
        headers:{'x-access-token':token},
        success:function(response)
        {
            var tasks = response.result.tasks;

            for(var i = 0; i < tasks.length; i++)
            {
                if(tasks[i].request_status == "Assigned")
                {
                    assigned++;
                }
            }

            assigned == 0 ? $('#notificationDropdown').find('.indicator').css('display', 'none') : $('#notificationDropdown').find('.indicator').css('display', 'inline-block');
        },
        error:function(req, status, error)
        {
            showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.statusText, "error");
        }
    });
}

function readMessage(title, text, imageUrl) 
{
    swal({
        title: title,
        html: text,
        imageUrl: imageUrl,
        confirmButtonText: "Close",
        showLoaderOnConfirm: false,
        imageWidth: 100,
        imageHeight: 200,
        imageAlt: 'Custom image',
        animation: true,
        padding: '2em'
    });
}

function markRead2(title, text, imageUrl) 
{
    swal({
        title: title,
        imageUrl: imageUrl,
        html: `<div style="text-align:justify; color:white">${text}</div>`,
        imageWidth: 100,
        imageHeight: 200,
        imageAlt: 'Custom image',
        animation: true,
        padding: '2em'
    })
}

//Open Unread message
function openUnreadMessage() {

    var token = sessionStorage.getItem('token'); //access token

    $('.notification-scroll').on('click', '.unread', function(){
        var messageID = $(this).attr('message-id');
        var table = $('#inbox');

        $.ajax({
            type: 'GET',
            url: `${API_URL_ROOT}/messages/${messageID}`,
            dataType: 'json',
            headers: {'x-access-token':token},
            success: function(response)
            {
                if(response.error == false)
                {
                    var msg = response.message;

                    notifications();

                    markRead2(msg.subject, msg.message, '../assets/img/envelope.png'); 

                    if(table)
                    {
                        table.DataTable().ajax.reload(null, false)
                    }

                }
                else
                {
                    showSimpleMessage("Attention", response.message, "error");
                }
            },
            error: function(req, status, error)
            {
                showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.statusText, "error");
            }
        });
    });
}

function imagepreview(input, tempImgID)
{
    if(input.files && input.files[0]){
        var filerd = new FileReader();
        filerd.onload = function(e){
            $('#'+tempImgID).attr('src', e.target.result).width(200).height(200);
        };
        filerd.readAsDataURL(input.files[0]);  
    }
}

function validateEmail(email)
{
    var filter = /^[\w-.+]+@[a-zA-Z0-9.-]+.[a-zA-Z0-9]{2,4}$/;

    if(filter.test(email))
    {
        return true;
    }
    else 
    {
        return false;
    }
}

function showError(formID)
{
    $('#'+formID).find('input.required').each(function(index, element){
        if($(this).val() == "") 
        {
            $(this).parent('div').addClass('error');
            //$("span#"+$(this).attr('id')+"-error-message").text("Required").show();
        }
        else
        {
            $(this).parent('div').removeClass('error');
            //$("span#"+$(this).attr('id')+"-error-message").text("").hide(); 
        }
    });

    $('#'+formID).find('select.required').each(function(index, element){
        if($(this).val() == "" || $(this).val() == null)
        {
            $(this).parent('div').addClass('error');
            //$("span#"+$(this).attr('id')+"-error-message").text("Please Select An Option").show();
        }
        else
        {
            $(this).parent('div').removeClass('error');
            //$("span#"+$(this).attr('id')+"-error-message").text("").hide();
        }
    });

    if($('.error:visible').length > 0)
    {
        $('html, body').animate({
            scrollTop: ($('.error:visible').first().offset().top)
        }, 10); 
    }
    
    $('input.required').on('keyup change', function(){
        if($(this).val().length > 0)
        {
            $(this).parent('div').removeClass('error');
            //$("span#"+$(this).attr('id')+"-error-message").text("").hide(); 
        }
        else
        {
            $(this).parent('div').addClass('error');
            //$("span#"+$(this).attr('id')+"-error-message").text("Required").show(); 
        }
    }); 
}

function getUrlParameter(sParam)
{
    var sPageUrl = window.location.search.substring(1),
        sURLVariables = sPageUrl.split('&'),
        sParameterName,
        i;

    for(i=0; i<sURLVariables.length; i++)
    {
        sParameterName = sURLVariables[i].split('=');

        if(sParameterName[0] === sParam)
        {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
}

function getQueryParam(param)
{
    var count = 0;

    window.location.search.substr(1).split("&").forEach(function(item){
        
        if(param == item.split("=")[0])
        {
            count++;
        }
    });

    if(count > 0)
    {
        return true;
    }
    else
    {
        return false;
    }
}

function getQueryParameter(param)
{
    var found

    window.location.search.substr(1).split("&").forEach(function(item){
        
        if(param == item.split("=")[0])
        {
            found = decodeURIComponent(item.split("=")[1]);
        }
    });

    return found;
}

function checkParamAvailability(params)
{
    //var found = false;

    for(i=0; i<params.length; i++)
    {
        if(getQueryParam(params[i]) === false)
        {
            window.location = '404';
        }
    }

    return true;
}

function dataTableAlertPrevent(tableClass)
{
    $.fn.DataTable.ext.errMode = 'none';

    $('.'+tableClass).on('error.dt', function(e, settings, techNote, message){
        console.log('An error has been reported by DataTables: ', message);
    });
        
}

function validateAvatar(avatarID, imgprevID, imgID)
{
    //validate user avatar on change
    $('#'+avatarID).on('change', function(){

        //Get uploaded file extension
        var extension = $(this).val().split('.').pop().toLowerCase();
        //Create array with the file extensions that we wish to upload
        var validFileExtensions = ['jpeg', 'jpg', 'png'];
        //Check file extension in the array. if -1, that means the file extension is not in the list
        if($.inArray(extension, validFileExtensions) == -1)
        {
            showSimpleMessage("Attention", "Invalid file selected", "error");
            $(this).parent('div').addClass('error');
            $('#'+imgprevID).slideUp(1000);
        }
        else if($(this).get(0).files[0].size > (1024 * 200))
        {
            showSimpleMessage("Attention", "Avatar must not be more than 200KB in size", "error");
            $('#'+imgprevID).slideUp(1000);
        }
        else
        {
            $('#'+imgprevID).slideUp(1000);
            $('#'+imgprevID).slideDown(1000);
            imagepreview(this, imgID);
        }
    });
}

function printDiv(divName)
{
    var printContents = document.getElementById(divName).innerHTML;
    var originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;

    window.print();

    document.body.innerHTML = originalContents;
}

String.prototype.toUpperCaseWords = function()
{
    return this.replace(/\w+/g, function(a){
        return a.charAt(0).toUpperCase() + a.slice(1).toLowerCase();
    });
}

//forceNumeric() plug-in implementation
jQuery.fn.forceNumeric = function(){

    return this.each(function(){
        $(this).keydown(function(e){
            var key = e.which || e.keyCode;

            if(!e.shiftKey && !e.altKey && !e.ctrlKey &&
            //numbers
                key >= 48 && key <= 57 ||
            //Numeric keypad
                key >= 96 && key <= 105 ||
            //Backspace and Tab and Enter
                key == 8 || key == 9 || key == 13 ||
            //left and right arrow keys
                key == 37 || key == 39 ||
            //Del and ins
                key == 46 || key == 45)
                return true;

            return false;
        });
    });
} 

function notifications()
{
    var token = sessionStorage.getItem('token'); //access token

    $.ajax({
        type: "GET",
        url: `${API_URL_ROOT}/messages?message_status=Unread`,
        dataType: 'json',
        headers: {'x-access-token':token},
        success: function(response)
        {
            if(response.error == false)
            {
                var messages = response.data;

                var html = '';

                if(messages.length > 0)
                {
                    for(var i=0; i < messages.length; i++)
                    {

                        html += `
                            <div class="dropdown-item unread" message-id="`+messages[i].message_id+`" style="cursor:pointer">
                                <div class="media">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-mail"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                    <div class="media-body">
                                        <div class="notification-para" onclick="openUnreadMessage();" title="${messages[i].subject}">
                                            <span class="user-name">${truncateString(messages[i].subject, 10)}</span><br>
                                            <span>${moment.unix(messages[i].message_created_at).fromNow()}<span><br>
                                            <span><i>${messages[i].sender}</i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }

                    $('.notification-scroll').html(html);
                    $('.indicator').css('display', 'block');
                }
                else
                {
                    $('.notification-scroll').html('<div class="notification-para" style="color:white; text-align:center"><span class="user-name">No</span> New Messages</div>');
                    $('.indicator').css('display', 'none');
                } 
            }
            else
            {
                $('.notification-scroll').html('<div class="notification-para" style="color:white; text-align:center"><span class="user-name">No</span> New Messages</div>');
                $('.indicator').css('display', 'none');
            }
        },
        error: function(req, status, error)
        {
            showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.responseText, "error");
        }
    });
}

function fileNotifications()
{
    var token = sessionStorage.getItem('token'); //access token
    var role = payloadClaim(token, 'role');

    if(role == "Assistant Chief Registrar")
    {
        var fileNotifications = $('.acr-file-notification');
        var countLabel = fileNotifications.find('.label-count');

        fileNotifications.css('display', 'block');

        $.ajax({
            type: "GET",
            url: API_URL_ROOT+'v1/acr/processes/unassessed/count',
            dataType: 'json',
            headers: {Authorization:'Bearer '+token},
            success: function(response)
            {
                if(response.error == false)
                {
                    var count = response.count;

                    if(count > 0)
                    {
                        countLabel.text(count);
                        countLabel.css('display', 'block');
                    }
                    else
                    {
                        countLabel.css('display', 'none');
                    }
                }
                else
                {
                    countLabel.text('');
                    countLabel.css('display', 'none');
                }
            },
            error: function(req, status, error)
            {
                showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.statusText, "error");
            }
        });

        setInterval(function()
        {
            $.ajax({
                type: "GET",
                url: API_URL_ROOT+'v1/acr/processes/unassessed/count',
                dataType: 'json',
                headers: {Authorization:'Bearer '+token},
                success: function(response)
                {
                    if(response.error == false)
                    {
                        var count = response.count;

                        if(count > 0)
                        {
                            countLabel.text(count);
                            countLabel.css('display', 'block');
                        }
                        else
                        {
                            countLabel.css('display', 'none');
                        }
                    }
                    else
                    {
                        countLabel.text('');
                        countLabel.css('display', 'none');
                    }
                },
                error: function(req, status, error)
                {
                    showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.statusText, "error");
                }
            });
        }, 10000);
    }
}

function currentSignatureSeal()
{
    var token = sessionStorage.getItem('token');

    //seals
    $.ajax({
        type: 'GET',
        url: API_URL_ROOT+'v1/auth-images/seal/current',
        dataType: 'json',
        headers: {Authorization:'Bearer '+token},
        success: function(response)
        {
            if(response.error == false)
            {
                var seal = response.file;
                $('.seal-url').text(API_URL_ROOT+'assets/images/seals/'+seal.filename);
            }
        },
        error: function(req, status, error)
        {
            showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.statusText, "error");
        }
    });

    //signatures
    $.ajax({
        type: 'GET',
        url: API_URL_ROOT+'v1/auth-images/signature/current',
        dataType: 'json',
        headers: {Authorization:'Bearer '+token},
        success: function(response)
        {
            if(response.error == false)
            {
                var signature = response.file;
                $('.signature-url').text(API_URL_ROOT+'assets/images/signatures/'+signature.filename);
            }
        },
        error: function(req, status, error)
        {
            showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.statusText, "error");
        }
    });
}

function help()
{
    $('.formselect').formSelect();
    $('.collapsible').collapsible();
}

function truncateString(str, num) {
  // If the length of str is less than or equal to num
  // just return str--don't truncate it.
  if (str.length <= num) {
    return str
  }
  // Return str truncated with '...' concatenated to the end of str.
  return str.slice(0, num) + '...'
}

function toTimestamp(strDate){
 var datum = Date.parse(strDate);
 return datum/1000;
}

function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

//countdown timer
function countDownTimer(timestamp, transactionCode, transactionTable, transactionType)
{
    var token = sessionStorage.getItem('token');
    var Timestamp = timestamp * 1000;

    //update the count down every 1 second
    var x = setInterval(function(){

        var now = new Date().getTime();

        //find the distance between now and the count down date
        var distance = Timestamp - now;

        //time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if(distance <= 0)
        {
            clearInterval(x);

            //return notice
            //$('#pending-transactions tbody').find('tr[transaction-code="'+transactionCode+'"]').find('.count-down').text("Defaulted");

            //withdrawal defaulted
            //block payer's account
            $.ajax({
                url: API_URL_ROOT+'v1/transaction/block-user/'+transactionTable+'/'+transactionCode,
                type: 'GET',
                dataType: 'json',
                headers: {Authorization:'Bearer '+token},
                success: function(response)
                {
                    if(response.error == false)
                    {
                        if(transactionType == "payment")
                        {
                            signOut();
                        }
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
            var timerID = setTimeout(
            $.ajax({
                url: API_URL_ROOT+'v1/transaction/transaction-status/'+transactionTable+'/'+transactionCode,
                type:'GET',
                dataType: 'json',
                headers:{Authorization:'Bearer '+token},
                success: function(response)
                {
                    if(response.error == false)
                    {
                        var status = response.status;

                        if(status == "Confirmed")
                        {
                            clearInterval(x);
                            clearTimeout(timerID);

                            $('#pending-transactions tbody').find('tr[transaction-code="'+transactionCode+'"]').find('.transaction-status').html(`<span class="badge outline-badge-success">Confirmed</span>`);
                            $('#pending-transactions tbody').find('tr[transaction-code="'+transactionCode+'"]').find('.actions').html('');

                            if(transactionTable == "activation_fee_payments" && transactionType == "payment")
                            {
                                signOut();
                            }
                        }
                    }
                },
                error: function(req, status, error)
                {
                    showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.statusText, "error");
                }
            }), 60000);

            $('#pending-transactions tbody').find('tr[transaction-code="'+transactionCode+'"]').find('.count-down').text(days + ` Days: ` + hours + ` Hours: ` + minutes + ` Minutes: ` + seconds + ` Seconds`);
        }
    }, 1000);
}

//system countdown timer
function systemCountDownTimer(timestamp, transactionCode, transactionTable, transactionID)
{
    var token = sessionStorage.getItem('token');
    var Timestamp = timestamp * 1000;

    //update the count down every 1 second
    var x = setInterval(function(){

        var now = new Date().getTime();

        //find the distance between now and the count down date
        var distance = Timestamp - now;

        //time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if(distance <= 0)
        {
            clearInterval(x);

            //return notice
            $('#system-transactions tbody').find('tr[id="'+transactionID+'"]').find('.count-down').text("Defaulted");
        }
        else
        {
            var timerID = setTimeout(
            $.ajax({
                url: API_URL_ROOT+'v1/transaction/transaction-status/'+transactionTable+'/'+transactionCode,
                type:'GET',
                dataType: 'json',
                headers:{Authorization:'Bearer '+token},
                success: function(response)
                {
                    if(response.error == false)
                    {
                        var status = response.status;

                        if(status == "Confirmed")
                        {
                            clearInterval(x);
                            clearTimeout(timerID);

                            $('#system-transactions tbody').find('tr[transaction-code="'+transactionCode+'"]').find('.transaction-status').html(`<span class="badge outline-badge-success">Confirmed</span>`);
                            $('#system-transactions tbody').find('tr[transaction-code="'+transactionCode+'"]').find('.actions').html(`<button class="btn btn-dark mb-2 mr-2 rounded-circle btn-view" title="View Proof Of Payment" data-toggle="modal" data-target="#sliderModal"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-zoom-in"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                            </button>`);
                        }
                    }
                },
                error: function(req, status, error)
                {
                    showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.statusText, "error");
                }
            }), 60000);

            $('#system-transactions tbody').find('tr[transaction-code="'+transactionCode+'"]').find('.count-down').text(days + ` Days: ` + hours + ` Hours: ` + minutes + ` Minutes: ` + seconds + ` Seconds`);
        }
    }, 1000);
}

function systemCountDownTimer1(timestamp, transactionCode, transactionTable, transactionID)
{
    var token = sessionStorage.getItem('token');
    var Timestamp = timestamp * 1000;

    //update the count down every 1 second
    var x = setInterval(function(){

        var now = new Date().getTime();

        //find the distance between now and the count down date
        var distance = Timestamp - now;

        //time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if(distance <= 0)
        {
            clearInterval(x);

            //return notice
            $('#system-activations tbody').find('tr[id="'+transactionID+'"]').find('.count-down').text("Defaulted");
        }
        else
        {
            var timerID = setTimeout(
            $.ajax({
                url: API_URL_ROOT+'v1/transaction/transaction-status/'+transactionTable+'/'+transactionCode,
                type:'GET',
                dataType: 'json',
                headers:{Authorization:'Bearer '+token},
                success: function(response)
                {
                    if(response.error == false)
                    {
                        var status = response.status;

                        if(status == "Confirmed")
                        {
                            clearInterval(x);
                            clearTimeout(timerID);

                            $('#system-activations tbody').find('tr[transaction-code="'+transactionCode+'"]').find('.transaction-status').html(`<span class="badge outline-badge-success">Confirmed</span>`);
                            $('#system-activations tbody').find('tr[transaction-code="'+transactionCode+'"]').find('.actions').html(`<button class="btn btn-dark mb-2 mr-2 rounded-circle btn-view" title="View Proof Of Payment" data-toggle="modal" data-target="#sliderModal"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-zoom-in"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                            </button>`);
                        }
                    }
                },
                error: function(req, status, error)
                {
                    showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.statusText, "error");
                }
            }), 60000);
            
            $('#system-activations tbody').find('tr[transaction-code="'+transactionCode+'"]').find('.count-down').text(days + ` Days: ` + hours + ` Hours: ` + minutes + ` Minutes: ` + seconds + ` Seconds`);
        }
    }, 1000);
}

//block ui
function blockUI()
{
    $.blockUI({
        message: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-loader spin"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>',
        fadeIn: 800, 
        //timeout: 2000, //unblock after 2 seconds
        overlayCSS: {
            backgroundColor: '#191e3a',
            opacity: 0.8,
            zIndex: 1200,
            cursor: 'wait'
        },
        css: {
            border: 0,
            color: '#25d5e4',
            zIndex: 1201,
            padding: 0,
            backgroundColor: 'transparent'
        }
    });
}

function unblockUI()
{
    $.unblockUI();
}

function returnHumanReadableTime(timestamp, format)
{
    var miliseconds = timestamp * 1000;
    var dateObject = new Date(miliseconds);
    var weekDay = dateObject.toLocaleString("en-US", {weekday: "long"});
    var month = dateObject.toLocaleString("en-US", {month: "long"});
    var day = dateObject.toLocaleString("en-US", {day: "2-digit"});
    var year = dateObject.toLocaleString("en-US", {year: "numeric"});
    var hour = dateObject.toLocaleString("en-US", {hour: "numeric"});
    var minute = dateObject.toLocaleString("en-US", {minute: "numeric"});
    var second = dateObject.toLocaleString("en-US", {second: "numeric"});
    var fullTime = dateObject.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit', second: '2-digit'});

    switch(format)
    {
        case 'weekday': 
    
            return weekDay; //Monday


        case 'month': 

            return month; //December


        case 'day': 

            return day; //9


        case 'year': 

            return year; //2019


        case 'hour': 

            return hour; //10 AM


        case 'minute': 

            return minute; //30


        case 'second': 

            return second; //15


        case 'full':

            return weekDay+ ', ' + month + ' ' + day + ' ' + year + ' ' + fullTime;


        case 'full-time':

            return fullTime;


        case 'full-day':

            return weekDay+ ', ' + month + ' ' + day + ' ' + year;


        default: return weekDay+ ', ' + month + ' ' + day + ' ' + year + ' ' + fullTime;

    }
}

$.fn.serializeObject = function () {
  var formData = {};
  var formArray = this.serializeArray();

  for(var i = 0, n = formArray.length; i < n; ++i)
    formData[formArray[i].name] = formArray[i].value;

  return formData;
};

function displayWelcomeMessage()
{
    var welcomeMessageStatus = sessionStorage.getItem('welcomemessage');

    if(!welcomeMessageStatus)
    {
        showWelcomeMessage();
    }
}

//sum of multiple arrays
function sum_array(arr) {
  
  // store our final answer
  var sum = 0;
  
  // loop through entire array
  for (var i = 0; i < arr.length; i++) {
    
    // loop through each inner array
    for (var j = 0; j < arr[i].length; j++) {
      
      // add this number to the current final sum
      sum += arr[i][j];
      
    }
    
  }

  return sum;
}

function checkAll(elementID, tableID)
{
    $("#"+elementID).change(function(){
        $("#"+tableID).find("input:checkbox").prop('checked', $(this).prop("checked"));
    });
}

const formatter = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
});
