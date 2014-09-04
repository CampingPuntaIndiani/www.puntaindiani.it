/* Modal support */

function open_modal(e) {
    console.log(e.target);
    e.preventDefault();
    var page_url = $(e.target).attr('href');
    console.log(page_url);
    $.get(page_url, function(data, status){
        if (!status in ['success', 'notmodified']){
            console.error("Error "+status+" loading "+page_url)
            return
        }
        $('#modal section[modal-content]').html(data);
        $('#modal').addClass('active')
    });
}

function close_modal(e) {
    e.preventDefault()
    console.log(e.target);
    console.log($('#modal').get(0));
    console.log($('#modal').get(0) == e.target);
    if (e.target == $('#modal').get(0) ||
        e.target == $('#modal a[data-action=close]').get(0)) {
        $('#modal').removeClass('active')
    }
}

$(function(){
    $('a[data-mode=modal]').click(open_modal);
    $('#modal').click(close_modal);
});