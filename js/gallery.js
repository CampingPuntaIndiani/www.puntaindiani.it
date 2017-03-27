// main.js::GMapHack
(function () {
    "use strict";
    Array.prototype.forEach.call(document.getElementsByClassName('gmap'),
    function(gmap){
        var wrapper = gmap.parentNode,
            cls = 'scrollOff';
        gmap.classList.add(cls);
        wrapper.addEventListener('click', function () {
            gmap.classList.remove(cls);
        });

        wrapper.addEventListener('mouseleave', function () {
            gmap.classList.add(cls);
        });
    });
})();

// Modal
(function () {
    "use strict";
    var modal = document.getElementById('modal'),
        img = document.getElementById('modal_img'),
        source = undefined;

    Array.prototype.forEach.call(document.querySelectorAll('.album img'),
    function(album){
        album.addEventListener('click', function (e) {
            source = e.currentTarget.id;
            img.src = e.currentTarget.src.replace('_small', '');
            modal.classList.add('is-active');
        });
    });

    // Close
    Array.prototype.forEach.call(document.querySelectorAll('.modal-close,.modal-background'), function(btn){
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            modal.classList.remove('is-active');
        });
    });

    // Prev - Next
    function move(is_back) {
        var current = document.getElementById(source).parentNode, // img -> picture
            next;
        if (!is_back){
            next = current.nextElementSibling;
            if (!next) { // if not next picture
                var nextAlbum = current.parentNode.nextElementSibling;
                if (!nextAlbum) { // restart gallery
                    nextAlbum = current.parentNode.parentNode.children[0]
                }
                next = nextAlbum.children[0];
            }
        } else {
            next = current.previousElementSibling;
            if (!next) { // if not prev picture
                var nextAlbum = current.parentNode.previousElementSibling;
                if (!nextAlbum) { // restart gallery (from end)
                    nextAlbum = current.parentNode.parentNode.children[
                        current.parentNode.parentNode.children.length - 1];
                }
                next = nextAlbum.children[nextAlbum.children.length - 1];
            }
        }
        next = next.children[0] // picture -> img
        source = next.id;
        img.src = next.src.replace('_small', '');
    };

    // Icons
    document.querySelector('#modal .left').addEventListener('click', function(e) {move(true);});
    document.querySelector('#modal .right').addEventListener('click', function(e) {move(false);});
    // keyboard
    document.onkeydown = function(e) {
        if (!modal.classList.contains('is-active')) return;
        e.preventDefault()
        switch (e.keyCode) {
            case 39: // right
            case 32: // spacebar
                move(false);
                break;
            case 37: //left
                move(true);
                break;
            case 27: // esc
                modal.classList.remove('is-active');
                break
            default:
                // Do nothing
        }
    }

})();

