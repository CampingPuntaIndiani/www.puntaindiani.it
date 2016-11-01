/* jshint strict: true */
/* jshint browser: true */

(function(){
    "use strict";
	var sticky_bar = function() {
		return function() {
			// Compute actual scroll position
			var Y = (window.pageYOffset ||
					document.scrollTop ||
					document.documentElement.scrollTop ||
					document.body.scrollTop),
				mustFix = Y > window.innerHeight,
				current = document.body.classList.contains('fix');
			if (mustFix !== current) document.body.classList.toggle('fix');
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
