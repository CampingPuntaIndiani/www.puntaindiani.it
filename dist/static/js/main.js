//noinspection JSLint
'use strict';

var $ = window.$ || window.jQuery;

/* Modal support */
function open_modal(e) {
    console.log(e.target);
    e.preventDefault();
    var page_url = $(e.target).attr('href');
    console.log(page_url);
    $.get(page_url, function (data, status) {
        if (['success', 'notmodified'].indexOf(status) === -1) {
            console.error("Error " + status + " loading " + page_url);
            return;
        }
        $('#modal section[modal-content]').html(data);
        $('#modal').addClass('active');
    });
}

function close_modal(e) {
    e.preventDefault();
    if (e.target === $('#modal').get(0) || e.target === $('#modal a[data-action=close]').get(0)) {
        $('#modal').removeClass('active');
    }
}

/* maps - route */
function init_gmap() {
    var map,
        marker,
        point = new google.maps.LatLng(46.027988, 11.232662),
        mapOptions = {
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
        title: "Camping Punta Indiani"
    });

    // support resize
    window.last_map_size = $('#map').width();
    $(window).on('resize', (function (map, center) {
        return function () {
            if (window.last_map_size === $('#map').width()) {
                return;
            }
            window.last_map_size = $('#map').width();
            map.setCenter(center);
        };
    }(map, point)));

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

/* interactive map */
function init_cmap() {
    var org_w = 1278,
        org_h = 1578,
        id_prefix = "map_elm_",
        id_prefix_len = id_prefix.length,
        img_url_base = '../static/img/cmap/view/',
        view = $('#cmap-view'),
        img_map = $('#cmap'),
        map_points = [{"x": 249,"y": 1019,"id":"3"},{"x":203,"y":1159,"id":"5s"},{"x":463,"y":1110,"id":"casa"},{"x":26,"y":967,"id":"entrata"},{"x":888,"y":1062,"id":"48"},{"x":809,"y":1029,"id":"rio"},{"x":1079,"y":986,"id":"ew"},{"x":1154,"y":1049,"id":"ews"},{"x":316,"y":888,"id":"66"},{"x":349,"y":848,"id":"70"},{"x":339,"y":677,"id":"78"},{"x":535,"y":542,"id":"105"},{"x":523,"y":315,"id":"111"},{"x":915,"y":1343,"id":"ponte"},{"x":692,"y":1447,"id":"33s"},{"x":1034,"y":1387,"id":"42s"},{"x":1024,"y":1258,"id":"pontee"}];

    function build_points () {
        var w = parseInt(img_map.css('width'), 10),
            h = parseInt(img_map.css('height'), 10);

        return $.map(map_points,  function (p) {
            return ['<div style="left:',
                Math.round(w * p.x / org_w - 20),
                'px; top:',
                Math.round(h * p.y / org_h - 20),
                'px;" id="',
                id_prefix,
                p.id,
                '" />'].join('');
        }).join('\r');

    }

    function click (ev) {
        var e = $(ev.target),
            id = e.attr('id'),
            img_url = id.substr(id_prefix_len),
            selected = $('#cmap-points div[selected]');

        if (!selected || selected.attr('id') === e.attr('id')) {
            return;
        }

        view.removeAttr('src');
        selected.removeAttr('selected');
        e.attr('selected', 'selected');
        view.attr('src', img_url_base + img_url + '.jpg');
    }

    window.last_cmap_size = 0;
    $(window).on('resize', function () {
        if (window.last_cmap_size === $('#cmap').width()) {
            return;
        }
        window.last_cmap_size = $('#cmap').width();

        var selected = $('#cmap-points div[selected]');
        $('#cmap-points').html(build_points());
        if (selected.length == 0) {
            selected = $('#cmap-points div:first-child').click();
        } else {
            $('#' + selected.attr('id')).attr('selected', 'selected');
        }
    });

    $('#cmap').load(function(){
            console.log('load');
            $(window).resize();
        });

    $('#cmap-points').delegate('div', 'click', click);
}


/* main */
$(function(){
    $('a[data-mode=modal]').click(open_modal);
    $('#modal').click(close_modal);

    /* gmap - route */
    if ($('#map').length == 1) {
        google.maps.event.addDomListener(window, 'load', init_gmap);
    }

    /* cmap */
    if ($('#cmap-wrapper').length == 1) {
        init_cmap();
    }
});

