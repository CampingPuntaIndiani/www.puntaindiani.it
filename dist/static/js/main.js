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

/* maps - route */
function init_gmap() {
    var map, marker;
    var point = new google.maps.LatLng(46.027988, 11.232662);

    var mapOptions = {
        zoom: 14,
        center: point,
        scrollwheel: false,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        },
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('map'),
        mapOptions);
    marker = new google.maps.Marker({
        map:map,
        draggable:false,
        animation: google.maps.Animation.DROP,
        position: point,
        raiseOnDrag: true,
        title: "Camping Punta Indiani",
    });

    // support resize
    window.last_map_size = $('#map').width();
    $(window).on('resize', function(map, center) {
        return function() {
            if (window.last_map_size == $('#map').width()) {
                return;
            }
            window.last_map_size = $('#map').width();
            map.setCenter(center);
        };
    }(map, point));

    // animation
    function toggleBounce() {
        if (marker.getAnimation() != null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
        }
    }
    google.maps.event.addListener(marker, 'click', toggleBounce);
}

/* main */
$(function(){
    $('a[data-mode=modal]').click(open_modal);
    $('#modal').click(close_modal);

    /* gmap - route */
    if ($('#map').length == 1) {
        google.maps.event.addDomListener(window, 'load', init_gmap);
    }
});

