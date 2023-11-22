$(function () {

    'use strict';

	$(document).ready(function($) {

        checkParamAvailability(new Array('email', 'token'));
        togglePassword();
        validateToken();

        $('.simpleslide100').each(function(){
            var delay = 7000;
            var speed = 1000;
            var itemSlide = $(this).find('.simpleslide100-item');
            var nowSlide = 0;

            $(itemSlide).hide();
            $(itemSlide[nowSlide]).show();
            nowSlide++;
            if(nowSlide >= itemSlide.length) {nowSlide = 0;}

            setInterval(function(){
                $(itemSlide).fadeOut(speed);
                $(itemSlide[nowSlide]).fadeIn(speed);
                nowSlide++;
                if(nowSlide >= itemSlide.length) {nowSlide = 0;}
            },delay);
        });

        $('#password-reset').on('submit', function(e){
            e.preventDefault();
            var form = $(this);
            var email = $("#email").val();
            var password = $("#password").val();
            var repassword = $("#re-password").val();
            var submitButton = $('#submit');
            var fields = form.find('input.required, select.required');

            submitButton.addClass('running');
            submitButton.attr('disabled', 'disabled');
            $("#btn-text").html("<span><i class='fa fa-cogs'></i> Please Wait...</span>");

            for(var i=0;i<fields.length;i++)
            {
                if(fields[i].value == "")
                {
                    /*alert(fields[i].id)*/
                    showSimpleMessage("Attention", "All fields are required", "error");
                    submitButton.removeClass('running');
                    submitButton.removeAttr('disabled');
                    $("#btn-text").html("Reset Password!");
                    $('#'+fields[i].id).focus();
                    return false;
                }
            }
            
            if(!validateEmail(email))
            {
                //alert("All fields are required");
               showSimpleMessage("Attention", "Please provide a valid email address", "error");
               submitButton.removeClass('running');
               submitButton.removeAttr('disabled');
               $("#btn-text").html("Reset Password!");
               return false;
            }
            else if(password !== repassword)
            {
                showSimpleMessage("Attention", "Passwords dont match", "error");
                submitButton.removeClass('running');
                submitButton.removeAttr('disabled');
                $("#btn-text").html("Reset Password!");
                return false;
            }
            else
            {
                // Create a new element input, this will be our hashed password field. 
                $('<input>').attr({type: 'hidden', id: 'pass_hash', name: 'encPass', value: hex_sha512(password),}).appendTo(form);

                $.ajax({
                    type: 'POST',
                    url: API_URL_ROOT+'v1/reset-password',
                    data: form.serialize(),
                    dataType: 'json',
                    success: function(response)
                    {
                        if(response.error == false)
                        {
                            showSimpleMessage("Success", response.message, "success");
                            submitButton.removeClass('running');
                            submitButton.removeAttr('disabled');
                            $("#btn-text").html("Reset Password!");

                            setTimeout(window.location = 'login', 5000);
                        }
                        else
                        {
                            showSimpleMessage("Attention", response.message, "error");
                            submitButton.removeClass('running');
                            submitButton.removeAttr('disabled');
                            $("#btn-text").html("Reset Password!");
                        }
                    },
                    error: function(req, status, err)
                    {
                        showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.statusText, "error");
                        submitButton.removeClass('running');
                        submitButton.removeAttr('disabled');
                        $("#btn-text").html("Reset Password!");
                    }
                });
            }
        });
    });

    function validateToken()
    {
        var email = getUrlParameter('email');
        var token = getUrlParameter('token');

        $.ajax({
            url: API_URL_ROOT+'v1/password-recovery/validate-token/'+email+'/'+token,
            type: 'GET',
            dataType: 'json',
            success: function(response)
            {
                if(response.error == false)
                {
                    var user = response.user;
                    $('.welcome-user').text('Hello '+user.firstname+'!!!');
                    $('#email').val(email);
                    $('#token').val(token);
                }
                else
                {
                    showSimpleMessage("Attention", response.message, "error");
                    window.location = 'login';
                }
            },
            error: function(req, status, error)
            {
                showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.statusText, "error");
            }
        });
    }

    function togglePassword()
    {
        var togglePassword = document.getElementById("toggle-password");
        var togglePassword1 = document.getElementById("toggle-password1");

        if (togglePassword) {
            togglePassword.addEventListener('click', function() {
              var x = document.getElementById("password");
              if (x.type === "password") {
                x.type = "text";
              } else {
                x.type = "password";
              }
            });
        }

        if (togglePassword1) {
            togglePassword1.addEventListener('click', function() {
              var x = document.getElementById("re-password");
              if (x.type === "password") {
                x.type = "text";
              } else {
                x.type = "password";
              }
            });
        }
    }
}); 