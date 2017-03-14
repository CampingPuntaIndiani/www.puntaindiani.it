/* global ComboDate, ga */
/* jshint browser:true */
/* jshint devel:true */

var ToogleSupport = function () {
    "use strict";
    Array.prototype.forEach.call(document.querySelectorAll('.nav-toggle'), function(n1){
        n1.addEventListener('click', function () {
            toggleClick(this);
        });
    });
};

var toggleClick = function (toggle) {
    "use strict";
    toggle.classList.toggle('is-active');
    Array.prototype.forEach.call(toggle.parentNode.querySelectorAll('.nav-menu'), function (n2){
        n2.classList.toggle('is-active');
    });
};


/* Handler for sticky bar */
var StickyBar = function() {
    "use strict";
    var lastScroll=0, binded=false,
        m1 = document.getElementById('menu-top'),
        m2 = document.getElementById('menu-bar'),
        scrollMin=50;

    return function() {
        // Compute actual scroll position
        var Y = (window.pageYOffset ||
                document.scrollTop ||
                document.documentElement.scrollTop ||
                document.body.scrollTop),
            mustFix = Y >= window.innerHeight;
        if (mustFix !== binded) {
            document.body.classList.toggle('fix');
            binded = !binded;
            lastScroll=0;
        }


        // (mobile) close vmenu when scrolling
        if (binded) {
            if (m2.classList.contains('is-active')) {
                if (lastScroll === 0)
                    lastScroll = Y;
                else if (Math.abs(Y-lastScroll) >= scrollMin) {
                    toggleClick(m2);
                    lastScroll=0;
                }
            }
        } else if (m1.classList.contains('is-active')){
            if (lastScroll === 0)
                lastScroll = Y;
            else if (Math.abs(Y-lastScroll) >= scrollMin) {
                toggleClick(m1);
                lastScroll=0;
            }
        } else {
            lastScroll=0;
        }
    };
}();

var GMapHack = function () {
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
};

var EnancheForm = function() {
    "use strict";
    var fix = function() {
        var arrival = new ComboDate('arrival'),
            departure = new ComboDate('departure'),
            arrival_error = document.getElementById('arrival_error'),
            departure_error = document.getElementById('departure_error');


        return function() {
            var aok = arrival.isValid(),
                dok = departure.isValid();
            if (aok && dok && arrival.getValue() >= departure.getValue()) {
                arrival.setError('Must be before then departure');
                departure.setError('Must be after then arriaval');
            }

            if (arrival.getError() !== undefined &&
                    arrival.getValueString().length == 10)
                arrival_error.innerHTML = '&nbsp;' + arrival.getError();
            if (departure.getError() !== undefined &&
                    departure.getValueString().length == 10)
                departure_error.innerHTML = '&nbsp;' + departure.getError();
        };
    }();

    document.getElementById('arrival').addEventListener('change', fix);
    document.getElementById('departure').addEventListener('change', fix);
};

var BindAccomodation = function () {
    "use strict";
    var kind = document.getElementById('kind'),
        accomodation = document.getElementById('resource'),
        optgroups = document.querySelectorAll('#resource optgroup');

    kind.addEventListener('change', function () {
        Array.prototype.forEach.call(optgroups, function(opt){
            opt.style.display = opt.dataset.kind == kind.value ?  '' : 'none';
            opt.disabled = opt.dataset.kind != kind.value;
            if (opt.dataset.kind == kind.value)
                accomodation.value = opt.children[0].value;
        });
    });
};

var fireEvent = function (node, ev) {
    "use strict";
    if (node !== undefined) {
        if ("createEvent" in document) {
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent(ev, false, true);
            node.dispatchEvent(evt);
        } else {
            node.fireEvent(ev);
        }
    }
};

var parseGet = function (val) {
    "use strict";
    var result, tmp = [];
    var items = location.search.substr(1).split("&");
    for (var index = 0; index < items.length; index++) {
        tmp = items[index].split("=");
        if (tmp[0] === val) result = decodeURIComponent(tmp[1]);
    }
    return result;
};


var cardChange = function () {
    "use strict";
    var card = document.getElementById('card'),
        kind = document.getElementById('kind');
    return function() {
        var opts = card.querySelectorAll('option[value='+card.value+']'),
        opt = opts.length === 0 ? undefined : opts[0];
        if (opt === undefined || !opt.dataset.only) {
            for (var x=0; x<kind.children.length; x++) {
                kind.children[x].style.display = '';
                kind.children[x].disabled = false;
            }
            return;
        }

        var currentKind = kind.querySelectorAll('option[value='+kind.value+']');

        var keep = opt.dataset.only.split(',');
        for (var i=0; i<kind.children.length; i++) {
            var show = false;
            for (var k=0; k<keep.length; k++)
                show = show || (kind.children[i].value === keep[k]);
            kind.children[i].style.display = show ?  '' : 'none';
            kind.children[i].disabled = !show;
        }

        // update UI, keep old if ok
        if (!currentKind.length) return;

        currentKind = currentKind[0];
        var currentKindOptGroup = currentKind.parentNode.dataset.kind;
        var isValid = false;
        for (var j=0; j<keep.length; j++)
            isValid = isValid || currentKindOptGroup === keep[j];
        if (isValid) return;

        kind.value = kind.querySelectorAll('option[value='+keep[0]+']')[0].value;
        fireEvent(kind, 'change');
    };
}();

var SetFromQuery = function () {
    "use strict";

    // Auto set kind type
    var kind = parseGet('pitch');
    if (kind !== undefined) {
        var k = document.getElementById('kind');
        k.value=kind;
        fireEvent(k, 'change');
    }

    // Enable / disable promotions
    var promotion = parseGet('promotion'),
        card = document.getElementById('card'),
        opt;

    card.addEventListener('change', cardChange);

    if (promotion !== undefined) {
        opt = card.querySelectorAll('option[data-id='+promotion+']');
        if (opt.length === 0) {
            opt = undefined;
        } else {
            opt = opt[0];
            card.value = opt.value;
            fireEvent(card, 'change');
        }
    }


    // Hide promotions
    for (var i=0; i < card.children.length; i++) {
        var optg = card.children[i];
        if (optg.dataset.show === 'always') {
            continue;
        } else {
            for (var c=0; c < optg.children.length; c++) {
                var child = optg.children[c];
                if (child.dataset.show === 'always' || child === opt) {
                    continue;
                } else {
                    optg.removeChild(child);
                    c--;
                }
            }
            if (optg.children.length === 0) {
                card.removeChild(optg);
                i--;
            }
        }
    }
};

var ModalSupport = function () {
    "use strict";
    var loadPage = function (url, success) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                success(request.responseText);
            }
            console.error(request.status);
        };

        request.onerror = function() {console.error(request.status);};
        request.send();
    };

    var
        modal = document.getElementsByClassName('modal')[0],
        modalTitle = document.getElementsByClassName('modal-card-title')[0],
        modalBody = document.getElementsByClassName('modal-card-body')[0];

    Array.prototype.forEach.call(document.querySelectorAll('a[data-modal]'), function(link){
        link.addEventListener('click', function(e) {
            e.preventDefault();
            modalTitle.innerHTML = this.dataset.modal;
            loadPage(this.href, function(txt){
                modalBody.innerHTML=txt;
                modal.classList.add('is-active');
            });
            ga('send', 'event', 'modal', 'open', this.href);
        });
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-close-modal],.modal-background'), function(btn){
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            modal.classList.remove('is-active');
        });
    });
};

var SectionChange = function(){
    "use strict";
    var md = document.getElementById('menu-desktop'),
        mm = document.getElementById('menu-mobile');

    return function(sec_id, ga_sec_id) {
        if (!sec_id) return;
        var old = md.getElementsByClassName('is-active');
        if (old.length > 0) old[0].classList.remove('is-active');
        var cur = md.querySelectorAll('a[href="#' + sec_id + '"]');
        if (cur.length > 0) cur[0].parentNode.classList.add('is-active');

        old = mm.getElementsByClassName('is-active');
        if (old.length > 0) old[0].classList.remove('is-active');
        cur = mm.querySelectorAll('a[href="#' + sec_id + '"]');
        if (cur.length > 0) cur[0].classList.add('is-active');

        ga('send', 'event', 'section', 'read', ga_sec_id ? ga_sec_id : sec_id);
    };
}();

var SectionHandler = function() {
    "use strict";
    var Sections = []; // TODO: recompute on resize
    Array.prototype.forEach.call(document.querySelectorAll('section'), function(sec){
        Sections.push({'id':sec.id, 'top':sec.offsetTop, 'gaid': sec.dataset.gaid});
    });
    Array.prototype.sort(Sections, function(a,b){return a.top-b.top;});

    var LastSec;
    window.addEventListener('scroll', function(){
        var Y = (window.pageYOffset ||
                document.scrollTop ||
                document.documentElement.scrollTop ||
                document.body.scrollTop);
        Y += window.innerHeight / 3;

        var s=0, e=1;
        while (!(Sections[s].top <= Y && Y < Sections[e].top) && e !== Sections.length-1) {
            s=e;e+=1;
        }

        var sec = Sections[s];
        if (sec.id !== LastSec) {
            LastSec = sec.id;
            SectionChange(sec.id, sec.gaid);
        }
    });
};

var LifeAnimation = function () {
    "use strict";
    // maybe bind to section change

    // suspend on mouse in
    // resume on mouse out

    window.pause=false;
    window.carousellCallback=undefined;

    var play = document.querySelectorAll('a[data-carousell="play"]')[0];
    if (play) {
        play.addEventListener('click', function(){
            this.classList.toggle('non-active');
            this.nextElementSibling.classList.toggle('non-active');
            animationStep(false, false);
        });
    }

    var pause = document.querySelectorAll('a[data-carousell="pause"]')[0];
    if (pause) {
        pause.addEventListener('click', function(){
            this.classList.toggle('non-active');
            this.previousElementSibling.classList.toggle('non-active');
            window.clearTimeout(window.carousellCallback);
        });
    }

    var next = document.querySelectorAll('a[data-carousell="next"]')[0];
    next.addEventListener('click', function(){
        window.clearTimeout(window.carousellCallback);
        animationStep(false, true);
    });

    var back = document.querySelectorAll('a[data-carousell="back"]')[0];
    back.addEventListener('click', function(){
        window.clearTimeout(window.carousellCallback);
        animationStep(true, true);
    });

    var animationStep = function(is_back, is_manual){
        var current = document.querySelectorAll('.carousell .is-active')[0];
        current.classList.remove('is-active');
        var cref = current.dataset.ref;
        if (cref) {
            var celm = document.getElementById(cref);
            celm.classList.remove('is-active');
        }
        var next;
        do {
            if (!is_back){
                next = current.nextElementSibling;
                if (!next) next = current.parentNode.children[0];
            } else {
                next = current.previousElementSibling;
                if (!next) next = current.parentNode.children[current.parentNode.children.length - 1];
            }
            current = next;
        } while (!next.classList.contains('carousell-item'))
        next.classList.add('is-active');
        var nref = next.dataset.ref;
        if (nref) {
            var nelm = document.getElementById(nref);
            nelm.classList.add('is-active');
        }
        if (!is_manual) window.carousellCallback = setTimeout(animationStep, 5000);
    };
    animationStep();
};

var BindExtraAnalitycs = function () {
    "use strict";
    var mail="mailto:info@campingpuntaindiani.it";
    Array.prototype.forEach.call(
        document.querySelectorAll('a[href="' + mail + '"]'),
        function(a) {
            a.addEventListener('click', function () {
                ga('send', 'event', 'mail', 'click', this.href);
            });
        });
};

(function(){
    "use strict";

    // We have JS!! Notify CSS (NOTE: currently not used)
    document.body.classList.remove('nojs');

    // Menu support
    window.addEventListener('scroll', StickyBar);
    StickyBar(/* Fire just in case anchor were used */);
    ToogleSupport();

    // Prevent GMap to 'stole' the scroll wheel.
    GMapHack();

    // Bootstrap booking form support
    EnancheForm();
    BindAccomodation();

    // Enable links
    SetFromQuery();

    ModalSupport();

    SectionHandler();

    LifeAnimation();

    BindExtraAnalitycs();
})();
