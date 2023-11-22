$(function () {

    'use strict';

	$(document).ready(function($) {

        //check for param availability
        checkParamAvailability(new Array('email', 'token'));

        //check if user is already logged in
        loggedinCheck();

        //verify account
        verifyAccount();
        
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
    });

    //verify account
    function verifyAccount()
    {
        var email = getUrlParameter('email');
        var token = getUrlParameter('token');

        $.ajax({
            type: 'POST',
            url: API_URL_ROOT+'v1/verify-email',
            data: {email:email, token:token},
            dataType: 'json',
            success: function(response)
            {
                if(response.error == false)
                {
                    showSimpleMessage("Success", response.message, "success");
                    window.location = 'login';
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
                window.location = 'login';
            }
        });
    }
}); 