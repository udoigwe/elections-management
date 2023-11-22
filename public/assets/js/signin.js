$(function () {

    'use strict';

	$(document).ready(function($) {

        //check if user is already logged in
        loggedinCheck();
        //remember me
        rememberMe();
        //toggle password field function
        togglePassword();

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

        $('#login').on('submit', function(e){
            e.preventDefault();
            var form = $(this);
            var email = $("#email").val();
            var password = $("#password").val();
            var fields = form.find('input.required, select.required');
            var authorizedRoles = ['Admin', 'Visitor', 'Observer'];
            
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
            
            if(!validateEmail(email))
            {
                //alert("All fields are required");
               showSimpleMessage("Attention", "Please provide a valid email address", "error");
               unblockUI();
               return false;
            }
            else
            {
                $.ajax({
                    type: 'POST',
                    url: API_URL_ROOT+'/login',
                    data: JSON.stringify(form.serializeObject()),
                    dataType: 'json',
                    contentType: 'application/json',
                    success: function(response)
                    {
                        if(response.error == false)
                        {
                            var token = response.token; //generated access token from request
                            var role = payloadClaim(token, "user_role"); //the user role from access token
                            var module = role.toLowerCase();

                            if(authorizedRoles.indexOf(role) < 0)
                            {
                                showSimpleMessage("Attention", 'Sorry!!! You are not authorized to use this system. Please contact admin', "error");
                                unblockUI();       
                                return false;
                            }

                            setRememberMe(); //store login details to hardrive if any
                            sessionStorage.setItem('token', token); //set access token

                            //redirect to the user's dashboard
                            window.location = module+'/dashboard';
                        }
                        else
                        {
                            showSimpleMessage("Attention", response.message, "error");
                            unblockUI();
                        }
                    },
                    error: function(req, status, err)
                    {
                        showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.responseText, "error");
                        unblockUI();
                    }
                });
            }
        });
    });

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