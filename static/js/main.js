/* jshint strict: true */
/* jshint browser: true */

(function(){
    "use strict";
	var sticky_bar = function() {
        var lastScroll=0, binded=false;
		return function(e) {
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

            if (binded) {
                var scrollMin = 50,
                    menuToggle = document.getElementById('menu-toggle');
                if (menuToggle.checked) {
                    if (lastScroll === 0)
                        lastScroll = Y;
                     else if (Math.abs(Y-lastScroll) >= scrollMin)
                        document.getElementById('menu-toggle').checked=false;
                }
            } else {
                lastScroll=0;
            }
		};
	}();
    window.addEventListener('scroll', sticky_bar);
    sticky_bar(/* Fire just in case anchor were used */);

    // Prevent GMap to 'stole' the scroll wheel.
    (function () {
        var wrapper = document.getElementById('find-us'),
            gmap = document.getElementById('gmap'),
            cls = 'scrollOff';
        gmap.classList.add(cls);
        wrapper.addEventListener('click', function () {
            gmap.classList.remove(cls);
        });

        wrapper.addEventListener('mouseleave', function () {
            gmap.classList.add(cls);
        });
    })();
})();
