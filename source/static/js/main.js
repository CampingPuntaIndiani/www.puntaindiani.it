/* jshint strict: true */
/* jshint browser: true */

(function(){
    "use strict";
    var sticky_bar = function() {
        var body = document.getElementsByTagName('body')[0];
        return function() {
            var fix = body.scrollTop > window.innerHeight,
                current = body.classList.contains('fix');
            if (fix !== current)
                body.classList.toggle('fix');
        };
    }();
    window.addEventListener('scroll', sticky_bar);
    sticky_bar(/* Fire just in case anchor were used */);

    console.log("Init completed");
})();
