$(function () {

    'use strict';

    let token = sessionStorage.getItem('token');

	$(document).ready(function(){

        loadMyProfile();
    
        //update my password
        $('#security-settings').on('submit', function(e){
            e.preventDefault();
            updatePassword();
        });

        //update my account
        $('#profile-settings').on('submit', function(e){
            e.preventDefault();
            updateAccount();
        });
    });

    //internal function to update user password
    function updatePassword() 
    {
        swal({
            title: "Attention",
            text: "Are you sure you want to update your password?",
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
                var form = $('#security-settings'); //form
                var currentPassword = form.find('#current_password').val();
                var newPassword = form.find('#new_password').val();
                var rePassword = form.find('#re_password').val();
                var fields = form.find('input.required, select.required');         

                blockUI();

                for(var i=0;i<fields.length;i++)
                {
                    if(fields[i].value == "")
                    {
                        /*alert(fields[i].id)*/
                        unblockUI();
                        showSimpleMessage("Attention", `${fields[i].name} is required`, "error");
                        $('#'+fields[i].id).focus();
                        return false;
                    }
                }
            
                if(newPassword !== rePassword)
                {
                    //user image is more than 500kb
                    unblockUI();
                    $("#new_password").focus();
                    showSimpleMessage("Attention", "Passwords don't match", "error");
                    return false;
                }
                else
                {
                    $.ajax({
                        type: 'POST',
                        url: API_URL_ROOT+'/password-update',
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
                                form.get(0).reset();
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
                            showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.statusText, "error");
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

    //internal function to update my account
    function updateAccount() 
    {
        swal({
            title: "Attention",
            text: "Are you sure you want to update your profile?",
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
                var form = $('#profile-settings'); //form
                var email = $("#user_email").val(); //User email from form
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
            
                if(!validateEmail(email))
                {
                    //email format is invalid
                    unblockUI();
                    $("#user_email").focus();
                    showSimpleMessage("Attention", "Please provide a valid user email address", "error");
                    return false;   
                }

                $.ajax({
                    type: 'PUT',
                    url: API_URL_ROOT+'/account-update',
                    data: new FormData(form[0]),
                    dataType: 'json',
                    contentType: false,
                    processData: false,
                    cache: false,
                    headers:{'x-access-token':token},
                    success: function(response)
                    {
                        if(response.error == false)
                        {
                            var newToken = response.token;
                            sessionStorage.removeItem('token');
                            sessionStorage.setItem('token', newToken);

                            loadMyProfile();

                            unblockUI();
                            showSimpleMessage("Success", response.message, "success");

                            window.location.reload();
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

    //load my profile
    function loadMyProfile()
    {
        var form = $('#profile-settings');
        
        $('.user-fullname').text(`${payloadClaim(token, 'user_firstname')} ${payloadClaim(token, 'user_lastname')}`);
        $('.user-email').text(payloadClaim(token, 'user_email'));
        $('.user-email-link').attr('href', 'mailto:'+payloadClaim(token, 'user_email'));
        $('.user-phone').text(payloadClaim(token, 'user_phone'));
        $('.user-role').text(payloadClaim(token, 'user_role'));
        $('.user-info').find('img').attr({src:payloadClaim(token, 'user_image_url'), alt:payloadClaim(token, 'user_firstname'), width:'200', height:'200'});

        //form settings
        form.find('#user_firstname').val(payloadClaim(token, 'user_firstname'));
        form.find('#user_lastname').val(payloadClaim(token, 'user_lastname'));
        form.find('#user_email').val(payloadClaim(token, 'user_email'));
        form.find('#user_phone').val(payloadClaim(token, 'user_phone'));
    }
}); 