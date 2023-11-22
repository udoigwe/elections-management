$(function () {

    'use strict';

	$(document).ready(function($) {

        //check if user is already logged in
        loggedinCheck();

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

        $('#forgot-password').on('submit', function(e){
            e.preventDefault();
            var form = $(this);
            var email = $("#email").val();
            var submitButton = $('#submit');

            submitButton.addClass('running');
            submitButton.attr('disabled', 'disabled');
            $("#btn-text").html("<span><i class='fa fa-cogs'></i> Please Wait...</span>");
            
            if(email == "")
            {
               //alert("All fields are required");
               showSimpleMessage("Attention", "All fields are required", "error");
               submitButton.removeClass('running');
               submitButton.removeAttr('disabled');
               $("#btn-text").html("Submit!");
               return false;
            }
            else if(!validateEmail(email))
            {
                //alert("All fields are required");
               showSimpleMessage("Attention", "Please provide a valid email address", "error");
               submitButton.removeClass('running');
               submitButton.removeAttr('disabled');
               $("#btn-text").html("Submit!");
               return false;
            }
            else
            {
                $.ajax({
                    type: 'POST',
                    url: API_URL_ROOT+'v1/password-recovery',
                    data: form.serialize(),
                    dataType: 'json',
                    success: function(response)
                    {
                        if(response.error == false)
                        {
                            showSimpleMessage("Success", response.message, "success");
                            submitButton.removeClass('running');
                            submitButton.removeAttr('disabled');
                            $("#btn-text").html("Submit!");
                        }
                        else
                        {
                            showSimpleMessage("Attention", response.message, "error");
                            submitButton.removeClass('running');
                            submitButton.removeAttr('disabled');
                            $("#btn-text").html("Submit!");
                        }
                    },
                    error: function(req, status, err)
                    {
                        showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.statusText, "error");
                        submitButton.removeClass('running');
                        submitButton.removeAttr('disabled');
                        $("#btn-text").html("Submit!");
                    }
                });
            }
        });
    });
}); 