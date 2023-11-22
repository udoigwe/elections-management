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

        $('#register').on('submit', function(e){
            e.preventDefault();
            var form = $(this);
            var email = $("#user_email").val();
            var password = $("#password").val();
            var repassword = $("#re-password").val();
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
            
            if(!validateEmail(email))
            {
                //alert("All fields are required");
               showSimpleMessage("Attention", "Please provide a valid email address", "error");
               unblockUI();
               return false;
            }

            if(repassword !== password)
            {
                showSimpleMessage("Attention", "Passwords dont match", "error");
               unblockUI();
               return false;
            }
            
            $.ajax({
                type: 'POST',
                url: API_URL_ROOT+'/sign-up',
                data: JSON.stringify(form.serializeObject()),
                dataType: 'json',
                contentType: 'application/json',
                success: function(response)
                {
                    if(response.error == false)
                    {
                        showSimpleMessage("Success", response.message, "success");
                        unblockUI();
                        form.get(0).reset();
                        window.location = '/signin';
                        return false;
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