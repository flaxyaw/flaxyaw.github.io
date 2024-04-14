function post() {
    var args = arguments;
    var headers = {isAjax: 1, Accept: '*/*'};

    let postData = arguments[1];
    let ajaxSessings = {
        headers: headers,
        type: "POST",
        url: arguments[0],
        data: postData,
        complete: function (jqxhr, txt_status) {
            loaderSmallHide();
            redirect = jqxhr.getResponseHeader("X-Redirect");
            if (jqxhr.status == 301 || jqxhr.status == 302) {
                location.href = redirect;
            }
            return false;
        },
        success: function (data, textStatus, xhr) {
            loaderSmallHide();
            if (typeof args[2] == 'function') {
                args[2](data);
            }
        },
        error: function (xhr, textStatus, data) {
            loaderSmallHide();
            if (typeof (xhr.response) != 'undefined') {
                if (typeof args[3] == 'function') {
                    args[3](xhr.response);
                } else if (typeof args[2] == 'function') {
                    args[2](xhr.response);
                }
            }
        }
    };

    loaderSmallShow();

    $.ajax(ajaxSessings);
}


function postJSON() {
    var args = arguments;
    var headers = {isAjax: 1, Accept: '*/*'};

    let postData = arguments[1];
    let ajaxSessings = {
        headers: headers,
        type: "POST",
        url: arguments[0],
        dataType: 'json',
        data: postData,
        complete: function (jqxhr, txt_status) {
            loaderSmallHide();
            redirect = jqxhr.getResponseHeader("X-Redirect");
            if (jqxhr.status == 301 || jqxhr.status == 302) {
                location.href = redirect;
            }
            return false;
        },
        success: function (data, textStatus, xhr) {
            loaderSmallHide();
            if (typeof args[2] == 'function') {
                args[2](data);
            }
        },
        error: function (xhr, textStatus, data) {
            loaderSmallHide();
            if(typeof(xhr.response) != 'undefined') {
                if (typeof args[2] == 'function') {
                    args[2](xhr.response);
                }
            }
        }
    };

    loaderSmallShow();
    $.ajax(ajaxSessings);
}

$().ready(function(){
    $(document).ajaxStart(function () {
        console.log('loading');
    });
    $(document).ajaxStop(function () {
        console.log('stop loading');
    });
    $(document).ajaxError(function () {
        console.log('error loading');
    });
});


function loaderSmallShow()
{
    if($('#loading_global')) {
        $('#loading_global').show();
    }
}

function loaderSmallHide()
{
    if($('#loading_global')) {
        $('#loading_global').hide();
    }
}