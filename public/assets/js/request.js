$(function () {

    'use strict';

	$(document).ready(function($) {

        loadCategories();
        loadSubCategories();
        displayFileUpload();

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

        $('#request-form').on('submit', function(e){
            e.preventDefault();
            submitRequest();
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

    //check for referrer ID
    function referrerID()
    {
        var referrerID = getUrlParameter('refID');

        //fix ref ID in form
        $('#referrer_id').val(referrerID);
    }

    function submitRequest() 
    {
        swal({
            title: "Attention",
            text: "Are you sure you want to send this request?",
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
                var form = $("#request-form");
                var sender_email = $("#sender_email").val();
                var attachment = $("#attachment").val();

                var fields = form.find('input.required, select.required, textarea.required'); 

                blockUI();

                for(var i=0;i<fields.length;i++)
                {
                    if(fields[i].value == "")
                    {
                        /*alert(fields[i].id)*/
                        showSimpleMessage("Attention", "All fields are required", "error");
                        unblockUI();
                        $('#'+fields[i].id).focus();
                        return false;
                    }
                }
                
                if(!validateEmail(sender_email))
                {
                    //invalid email provided
                    $("#sender_email").focus();
                    showSimpleMessage("Attention", "Please provide a valid email address", "error");
                    unblockUI();
                    return false;
                }
                else
                {
                    if(attachment == "" || attachment == null)
                    {
                        $.ajax({
                            type: 'POST',
                            url: API_URL_ROOT+'/requests',
                            data: JSON.stringify(form.serializeObject()), 
                            dataType: 'json',
                            contentType: 'application/json',
                            success: function(response)
                            {
                                if(response.error == false)
                                {
                                    $('.swal2-content').css('color', '#28a745');
                                    showSimpleMessage("Success", response.message, "success");
                                    unblockUI();          
                                    form.get(0).reset();
                                    $('#req-file-uploads').slideUp(1000);
                                }
                                else
                                {
                                    showSimpleMessage("Attention", response.message, "error");
                                    unblockUI();
                                }   
                            },
                            error: function(req, status, error)
                            {
                                showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.responseText, "error");
            
                                unblockUI();
                            }
                        });
                    }
                    else
                    {
                        var extension = attachment.split('.').pop().toLowerCase();
                        //Create array with the file extensions that we wish to upload
                        var validFileExtensions = ['jpeg', 'jpg', 'png', 'pdf', 'xls', 'xlsx', 'doc', 'docx', 'ppt', 'pptx'];
                        var file_length = $("#attachment").get(0).files.length;

                        if($.inArray(extension, validFileExtensions) == -1)
                        {
                            //invalid avatar format
                            unblockUI();
                            $("#attachment").focus();
                            showSimpleMessage("Attention", "File attachment must be a jpeg, jpg, png, gif file formats", "error");
                            return false;
                        } 
                        else if($("#attachment").get(0).files[0].size > (1024 * 1000)) 
                        {
                            //user image is more than 1MB
                            unblockUI();
                            $("#attachment").focus();
                            showSimpleMessage("Attention", "File attachment must not be more than 1MB in size", "error");
                            return false;
                        } 
                        else
                        {
                            $.ajax({
                                type: 'POST',
                                url: API_URL_ROOT+'/requests',
                                data: new FormData(form[0]),
                                dataType: 'json',
                                contentType: false,
                                processData: false,
                                cache: false,
                                success: function(response)
                                {
                                    if(response.error == false)
                                    {
                                        unblockUI();
                                        $('.swal2-content').css('color', '#28a745');
                                        showSimpleMessage("Success", response.message, "success");
                                        form.get(0).reset();
                                        $('#req-file-uploads').slideUp(1000);
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
                    
                }
            }
            else
            {
                showSimpleMessage('Canceled', 'Process Abborted', 'error');
            }
        }); 
    }

    function loadCategories()
    {
        $.ajax({
            type:'GET',
            url: API_URL_ROOT+'/request-categories',
            dataType:'json',
            success: function(response)
            {
                var categories = response.result.categories;
                var html = '<option value="">Please select</option>';

                for(var i = 0; i < categories.length; i++)
                {
                    html += `
                        <option value="${categories[i].request_category_id}">${categories[i].request_category_name}</option>
                    `;
                }

                $('#request_category_id').html(html);
            },
            error: function(req, status, error)
            {
                showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.responseText, "error");
            }
        })
    }

    function loadSubCategories()
    {
        $('#request_category_id').on('change', function() {

            var requestCategoryID = $(this).val();
            var html = '<option value="">Please select</option>';

            blockUI();

            if(requestCategoryID !== null && requestCategoryID !== "")
            {
                $.ajax({
                    url:API_URL_ROOT + '/request-sub-categories/by-category-id/'+requestCategoryID,
                    type:'GET',
                    dataType:'json',
                    success:function(response)
                    {
                        var subCategories = response.result.subcategories;

                        for(var i = 0; i < subCategories.length; i++)
                        {
                            html += `
                                <option value="${subCategories[i].request_sub_category_id}">${subCategories[i].request_sub_category_name}</option>
                            `
                        }

                        $('#request_sub_category_id').html(html);
                        unblockUI();
                    },
                    error:function(req, status, error)
                    {
                        unblockUI();
                        showSimpleMessage("Attention", "ERROR - "+req.status+" : "+req.responseText, "error");
                    }
                })
            }
            else
            {
                unblockUI();
                $('#request_sub_category_id').html('<option value="">Please select</option>');
            }
        });
    }

    function displayFileUpload()
    {
        $('#request_sub_category_id').on('change', function() {

            var requestSubCategoryID = $(this).val();

            blockUI();

            if(requestSubCategoryID !== null && requestSubCategoryID !== "")
            {
                $.ajax({
                    url:API_URL_ROOT + '/request-sub-categories/'+requestSubCategoryID,
                    type:'GET',
                    dataType:'json',
                    success:function(response)
                    {
                        unblockUI();

                        var subCategory = response.subcategory;

                        if(subCategory.file_uploads == 'Active')
                        {
                            $('#req-file-uploads').slideDown(1000);
                        }
                        else
                        {
                            $('#req-file-uploads').slideUp(1000);
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
                unblockUI();
                $('#req-file-uploads').slideUp(1000);
            }
        });
    }
}); 
