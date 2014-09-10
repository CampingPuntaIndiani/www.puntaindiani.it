'use strict';

/* slick js */
/*
     _ _      _       _
 ___| (_) ___| | __  (_)___
/ __| | |/ __| |/ /  | / __|
\__ \ | | (__|   < _ | \__ \
|___/_|_|\___|_|\_(_)/ |___/
                   |__/

 Version: 1.3.7
  Author: Ken Wheeler
 Website: http://kenwheeler.github.io
    Docs: http://kenwheeler.github.io/slick
    Repo: http://github.com/kenwheeler/slick
  Issues: http://github.com/kenwheeler/slick/issues

 */

/* global window, document, define, jQuery, setInterval, clearInterval */

(function(factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(jQuery);
    }

}(function($) {
    'use strict';
    var Slick = window.Slick || {};

    Slick = (function() {

        var instanceUid = 0;

        function Slick(element, settings) {

            var _ = this,
                responsiveSettings, breakpoint;

            _.defaults = {
                accessibility: true,
                appendArrows: $(element),
                arrows: true,
                asNavFor: null,
                prevArrow: '<button type="button" data-role="none" class="slick-prev">Previous</button>',
                nextArrow: '<button type="button" data-role="none" class="slick-next">Next</button>',
                autoplay: false,
                autoplaySpeed: 3000,
                centerMode: false,
                centerPadding: '50px',
                cssEase: 'ease',
                customPaging: function(slider, i) {
                    return '<button type="button" data-role="none">' + (i + 1) + '</button>';
                },
                dots: false,
                dotsClass: 'slick-dots',
                draggable: true,
                easing: 'linear',
                fade: false,
                focusOnSelect: false,
                infinite: true,
                lazyLoad: 'ondemand',
                onBeforeChange: null,
                onAfterChange: null,
                onInit: null,
                onReInit: null,
                pauseOnHover: true,
                pauseOnDotsHover: false,
                responsive: null,
                rtl: false,
                slide: 'div',
                slidesToShow: 1,
                slidesToScroll: 1,
                speed: 300,
                swipe: true,
                touchMove: true,
                touchThreshold: 5,
                useCSS: true,
                vertical: false,
                waitForAnimate: true
            };

            _.initials = {
                animating: false,
                dragging: false,
                autoPlayTimer: null,
                currentSlide: 0,
                currentLeft: null,
                direction: 1,
                $dots: null,
                listWidth: null,
                listHeight: null,
                loadIndex: 0,
                $nextArrow: null,
                $prevArrow: null,
                slideCount: null,
                slideWidth: null,
                $slideTrack: null,
                $slides: null,
                sliding: false,
                slideOffset: 0,
                swipeLeft: null,
                $list: null,
                touchObject: {},
                transformsEnabled: false
            };

            $.extend(_, _.initials);

            _.activeBreakpoint = null;
            _.animType = null;
            _.animProp = null;
            _.breakpoints = [];
            _.breakpointSettings = [];
            _.cssTransitions = false;
            _.paused = false;
            _.positionProp = null;
            _.$slider = $(element);
            _.$slidesCache = null;
            _.transformType = null;
            _.transitionType = null;
            _.windowWidth = 0;
            _.windowTimer = null;

            _.options = $.extend({}, _.defaults, settings);

            _.originalSettings = _.options;
            responsiveSettings = _.options.responsive || null;

            if (responsiveSettings && responsiveSettings.length > -1) {
                for (breakpoint in responsiveSettings) {
                    if (responsiveSettings.hasOwnProperty(breakpoint)) {
                        _.breakpoints.push(responsiveSettings[
                            breakpoint].breakpoint);
                        _.breakpointSettings[responsiveSettings[
                            breakpoint].breakpoint] =
                            responsiveSettings[breakpoint].settings;
                    }
                }
                _.breakpoints.sort(function(a, b) {
                    return b - a;
                });
            }

            _.autoPlay = $.proxy(_.autoPlay, _);
            _.autoPlayClear = $.proxy(_.autoPlayClear, _);
            _.changeSlide = $.proxy(_.changeSlide, _);
            _.selectHandler = $.proxy(_.selectHandler, _);
            _.setPosition = $.proxy(_.setPosition, _);
            _.swipeHandler = $.proxy(_.swipeHandler, _);
            _.dragHandler = $.proxy(_.dragHandler, _);
            _.keyHandler = $.proxy(_.keyHandler, _);
            _.autoPlayIterator = $.proxy(_.autoPlayIterator, _);

            _.instanceUid = instanceUid++;

            // A simple way to check for HTML strings
            // Strict HTML recognition (must start with <)
            // Extracted from jQuery v1.11 source
            _.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/;

            _.init();

        }

        return Slick;

    }());

    Slick.prototype.addSlide = function(markup, index, addBefore) {

        var _ = this;

        if (typeof(index) === 'boolean') {
            addBefore = index;
            index = null;
        } else if (index < 0 || (index >= _.slideCount)) {
            return false;
        }

        _.unload();

        if (typeof(index) === 'number') {
            if (index === 0 && _.$slides.length === 0) {
                $(markup).appendTo(_.$slideTrack);
            } else if (addBefore) {
                $(markup).insertBefore(_.$slides.eq(index));
            } else {
                $(markup).insertAfter(_.$slides.eq(index));
            }
        } else {
            if (addBefore === true) {
                $(markup).prependTo(_.$slideTrack);
            } else {
                $(markup).appendTo(_.$slideTrack);
            }
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slides.each(function(index, element) {
            $(element).attr("index",index);
        });

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.animateSlide = function(targetLeft, callback) {

        var animProps = {}, _ = this;

        if (_.options.rtl === true && _.options.vertical === false) {
            targetLeft = -targetLeft;
        }
        if (_.transformsEnabled === false) {
            if (_.options.vertical === false) {
                _.$slideTrack.animate({
                    left: targetLeft
                }, _.options.speed, _.options.easing, callback);
            } else {
                _.$slideTrack.animate({
                    top: targetLeft
                }, _.options.speed, _.options.easing, callback);
            }

        } else {

            if (_.cssTransitions === false) {

                $({
                    animStart: _.currentLeft
                }).animate({
                    animStart: targetLeft
                }, {
                    duration: _.options.speed,
                    easing: _.options.easing,
                    step: function(now) {
                        if (_.options.vertical === false) {
                            animProps[_.animType] = 'translate(' +
                                now + 'px, 0px)';
                            _.$slideTrack.css(animProps);
                        } else {
                            animProps[_.animType] = 'translate(0px,' +
                                now + 'px)';
                            _.$slideTrack.css(animProps);
                        }
                    },
                    complete: function() {
                        if (callback) {
                            callback.call();
                        }
                    }
                });

            } else {

                _.applyTransition();

                if (_.options.vertical === false) {
                    animProps[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
                } else {
                    animProps[_.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';
                }
                _.$slideTrack.css(animProps);

                if (callback) {
                    setTimeout(function() {

                        _.disableTransition();

                        callback.call();
                    }, _.options.speed);
                }

            }

        }

    };

    Slick.prototype.applyTransition = function(slide) {

        var _ = this,
            transition = {};

        if (_.options.fade === false) {
            transition[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ' + _.options.cssEase;
        } else {
            transition[_.transitionType] = 'opacity ' + _.options.speed + 'ms ' + _.options.cssEase;
        }

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.autoPlay = function() {

        var _ = this;

        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }

        if (_.slideCount > _.options.slidesToShow && _.paused !== true) {
            _.autoPlayTimer = setInterval(_.autoPlayIterator,
                _.options.autoplaySpeed);
        }

    };

    Slick.prototype.autoPlayClear = function() {

        var _ = this;

        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }

    };

    Slick.prototype.autoPlayIterator = function() {

        var _ = this;
        var asNavFor = _.options.asNavFor != null ? $(_.options.asNavFor).getSlick() : null;

        if (_.options.infinite === false) {

            if (_.direction === 1) {

                if ((_.currentSlide + 1) === _.slideCount -
                    1) {
                    _.direction = 0;
                }

                _.slideHandler(_.currentSlide + _.options.slidesToScroll);
                if(asNavFor != null) asNavFor.slideHandler(asNavFor.currentSlide + asNavFor.options.slidesToScroll);

            } else {

                if ((_.currentSlide - 1 === 0)) {

                    _.direction = 1;

                }

                _.slideHandler(_.currentSlide - _.options.slidesToScroll);
                if(asNavFor != null) asNavFor.slideHandler(asNavFor.currentSlide - asNavFor.options.slidesToScroll);

            }

        } else {

            _.slideHandler(_.currentSlide + _.options.slidesToScroll);
            if(asNavFor != null) asNavFor.slideHandler(asNavFor.currentSlide + asNavFor.options.slidesToScroll);

        }

    };

    Slick.prototype.buildArrows = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow = $(_.options.prevArrow);
            _.$nextArrow = $(_.options.nextArrow);

            if (_.htmlExpr.test(_.options.prevArrow)) {
                _.$prevArrow.appendTo(_.options.appendArrows);
            }

            if (_.htmlExpr.test(_.options.nextArrow)) {
                _.$nextArrow.appendTo(_.options.appendArrows);
            }

            if (_.options.infinite !== true) {
                _.$prevArrow.addClass('slick-disabled');
            }

        }

    };

    Slick.prototype.buildDots = function() {

        var _ = this,
            i, dotString;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            dotString = '<ul class="' + _.options.dotsClass + '">';

            for (i = 0; i <= _.getDotCount(); i += 1) {
                dotString += '<li>' + _.options.customPaging.call(this, _, i) + '</li>';
            }

            dotString += '</ul>';

            _.$dots = $(dotString).appendTo(
                _.$slider);

            _.$dots.find('li').first().addClass(
                'slick-active');

        }

    };

    Slick.prototype.buildOut = function() {

        var _ = this;

        _.$slides = _.$slider.children(_.options.slide +
            ':not(.slick-cloned)').addClass(
            'slick-slide');
        _.slideCount = _.$slides.length;

        _.$slides.each(function(index, element) {
            $(element).attr("index",index);
        });

        _.$slidesCache = _.$slides;

        _.$slider.addClass('slick-slider');

        _.$slideTrack = (_.slideCount === 0) ?
            $('<div class="slick-track"/>').appendTo(_.$slider) :
            _.$slides.wrapAll('<div class="slick-track"/>').parent();

        _.$list = _.$slideTrack.wrap(
            '<div class="slick-list"/>').parent();
        _.$slideTrack.css('opacity', 0);

        if (_.options.centerMode === true) {
            _.options.slidesToScroll = 1;
            if (_.options.slidesToShow % 2 === 0) {
                _.options.slidesToShow = 3;
            }
        }

        $('img[data-lazy]', _.$slider).not('[src]').addClass('slick-loading');

        _.setupInfinite();

        _.buildArrows();

        _.buildDots();

        _.updateDots();

        if (_.options.accessibility === true) {
            _.$list.prop('tabIndex', 0);
        }

        _.setSlideClasses(typeof this.currentSlide === 'number' ? this.currentSlide : 0);

        if (_.options.draggable === true) {
            _.$list.addClass('draggable');
        }

    };

    Slick.prototype.checkResponsive = function() {

        var _ = this,
            breakpoint, targetBreakpoint;

        if (_.originalSettings.responsive && _.originalSettings
            .responsive.length > -1 && _.originalSettings.responsive !== null) {

            targetBreakpoint = null;

            for (breakpoint in _.breakpoints) {
                if (_.breakpoints.hasOwnProperty(breakpoint)) {
                    if ($(window).width() < _.breakpoints[
                        breakpoint]) {
                        targetBreakpoint = _.breakpoints[
                            breakpoint];
                    }
                }
            }

            if (targetBreakpoint !== null) {
                if (_.activeBreakpoint !== null) {
                    if (targetBreakpoint !== _.activeBreakpoint) {
                        _.activeBreakpoint =
                            targetBreakpoint;
                        _.options = $.extend({}, _.options,
                            _.breakpointSettings[
                                targetBreakpoint]);
                        _.refresh();
                    }
                } else {
                    _.activeBreakpoint = targetBreakpoint;
                    _.options = $.extend({}, _.options,
                        _.breakpointSettings[
                            targetBreakpoint]);
                    _.refresh();
                }
            } else {
                if (_.activeBreakpoint !== null) {
                    _.activeBreakpoint = null;
                    _.options = $.extend({}, _.options,
                        _.originalSettings);
                    _.refresh();
                }
            }

        }

    };

    Slick.prototype.changeSlide = function(event) {

        var _ = this,
            $target = $(event.target);
        var asNavFor = _.options.asNavFor != null ? $(_.options.asNavFor).getSlick() : null;

        // If target is a link, prevent default action.
        $target.is('a') && event.preventDefault();

        switch (event.data.message) {

            case 'previous':
                if (_.slideCount > _.options.slidesToShow) {
                  _.slideHandler(_.currentSlide - _.options
                    .slidesToScroll);
                if(asNavFor != null) asNavFor.slideHandler(asNavFor.currentSlide - asNavFor.options.slidesToScroll);
                }
                break;

            case 'next':
                if (_.slideCount > _.options.slidesToShow) {
                  _.slideHandler(_.currentSlide + _.options
                    .slidesToScroll);
                if(asNavFor != null)  asNavFor.slideHandler(asNavFor.currentSlide + asNavFor.options.slidesToScroll);
                }
                break;

            case 'index':
                var index = $(event.target).parent().index() * _.options.slidesToScroll;
                _.slideHandler(index);
                if(asNavFor != null)  asNavFor.slideHandler(index);                break;

            default:
                return false;
        }

    };

    Slick.prototype.destroy = function() {

        var _ = this;

        _.autoPlayClear();

        _.touchObject = {};

        $('.slick-cloned', _.$slider).remove();
        if (_.$dots) {
            _.$dots.remove();
        }
        if (_.$prevArrow) {
            _.$prevArrow.remove();
            _.$nextArrow.remove();
        }
        if (_.$slides.parent().hasClass('slick-track')) {
            _.$slides.unwrap().unwrap();
        }
        _.$slides.removeClass(
            'slick-slide slick-active slick-visible').removeAttr('style');
        _.$slider.removeClass('slick-slider');
        _.$slider.removeClass('slick-initialized');

        _.$list.off('.slick');
        $(window).off('.slick-' + _.instanceUid);
        $(document).off('.slick-' + _.instanceUid);

    };

    Slick.prototype.disableTransition = function(slide) {

        var _ = this,
            transition = {};

        transition[_.transitionType] = "";

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.fadeSlide = function(slideIndex, callback) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).css({
                zIndex: 1000
            });

            _.$slides.eq(slideIndex).animate({
                opacity: 1
            }, _.options.speed, _.options.easing, callback);

        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 1,
                zIndex: 1000
            });

            if (callback) {
                setTimeout(function() {

                    _.disableTransition(slideIndex);

                    callback.call();
                }, _.options.speed);
            }

        }

    };

    Slick.prototype.filterSlides = function(filter) {

        var _ = this;

        if (filter !== null) {

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.filter(filter).appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.getCurrent = function() {

        var _ = this;

        return _.currentSlide;

    };

    Slick.prototype.getDotCount = function() {

        var _ = this,
            breaker = 0,
            dotCounter = 0,
            dotCount = 0,
            dotLimit;

        dotLimit = _.options.infinite === true ? _.slideCount + _.options.slidesToShow - _.options.slidesToScroll : _.slideCount;

        while (breaker < dotLimit) {
            dotCount++;
            dotCounter += _.options.slidesToScroll;
            breaker = dotCounter + _.options.slidesToShow;
        }

        return dotCount;

    };

    Slick.prototype.getLeft = function(slideIndex) {

        var _ = this,
            targetLeft,
            verticalHeight,
            verticalOffset = 0;

        _.slideOffset = 0;
        verticalHeight = _.$slides.first().outerHeight();

        if (_.options.infinite === true) {
            if (_.slideCount > _.options.slidesToShow) {
                _.slideOffset = (_.slideWidth * _.options.slidesToShow) * -1;
                verticalOffset = (verticalHeight * _.options.slidesToShow) * -1;
            }
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                    _.slideOffset = ((_.slideCount % _.options.slidesToShow) * _.slideWidth) * -1;
                    verticalOffset = ((_.slideCount % _.options.slidesToShow) * verticalHeight) * -1;
                }
            }
        } else {
            if (_.slideCount % _.options.slidesToShow !== 0) {
                if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                    _.slideOffset = (_.options.slidesToShow * _.slideWidth) - ((_.slideCount % _.options.slidesToShow) * _.slideWidth);
                    verticalOffset = ((_.slideCount % _.options.slidesToShow) * verticalHeight);
                }
            }
        }

        if (_.options.centerMode === true && _.options.infinite === true) {
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
        } else if (_.options.centerMode === true) {
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2);
        }

        if (_.options.vertical === false) {
            targetLeft = ((slideIndex * _.slideWidth) * -1) + _.slideOffset;
        } else {
            targetLeft = ((slideIndex * verticalHeight) * -1) + verticalOffset;
        }

        return targetLeft;

    };

    Slick.prototype.init = function() {

        var _ = this;

        if (!$(_.$slider).hasClass('slick-initialized')) {

            $(_.$slider).addClass('slick-initialized');
            _.buildOut();
            _.setProps();
            _.startLoad();
            _.loadSlider();
            _.initializeEvents();
            _.checkResponsive();
        }

        if (_.options.onInit !== null) {
            _.options.onInit.call(this, _);
        }

    };

    Slick.prototype.initArrowEvents = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow.on('click.slick', {
                message: 'previous'
            }, _.changeSlide);
            _.$nextArrow.on('click.slick', {
                message: 'next'
            }, _.changeSlide);
        }

    };

    Slick.prototype.initDotEvents = function() {

        var _ = this;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            $('li', _.$dots).on('click.slick', {
                message: 'index'
            }, _.changeSlide);
        }

        if (_.options.dots === true && _.options.pauseOnDotsHover === true && _.options.autoplay === true) {
            $('li', _.$dots)
                .on('mouseenter.slick', _.autoPlayClear)
                .on('mouseleave.slick', _.autoPlay);
        }

    };

    Slick.prototype.initializeEvents = function() {

        var _ = this;

        _.initArrowEvents();

        _.initDotEvents();

        _.$list.on('touchstart.slick mousedown.slick', {
            action: 'start'
        }, _.swipeHandler);
        _.$list.on('touchmove.slick mousemove.slick', {
            action: 'move'
        }, _.swipeHandler);
        _.$list.on('touchend.slick mouseup.slick', {
            action: 'end'
        }, _.swipeHandler);
        _.$list.on('touchcancel.slick mouseleave.slick', {
            action: 'end'
        }, _.swipeHandler);

        if (_.options.pauseOnHover === true && _.options.autoplay === true) {
            _.$list.on('mouseenter.slick', _.autoPlayClear);
            _.$list.on('mouseleave.slick', _.autoPlay);
        }

        if(_.options.accessibility === true) {
            _.$list.on('keydown.slick', _.keyHandler);
        }

        if(_.options.focusOnSelect === true) {
            $(_.options.slide, _.$slideTrack).on('click.slick', _.selectHandler);
        }

        $(window).on('orientationchange.slick.slick-' + _.instanceUid, function() {
            _.checkResponsive();
            _.setPosition();
        });

        $(window).on('resize.slick.slick-' + _.instanceUid, function() {
            if ($(window).width() !== _.windowWidth) {
                clearTimeout(_.windowDelay);
                _.windowDelay = window.setTimeout(function() {
                    _.windowWidth = $(window).width();
                    _.checkResponsive();
                    _.setPosition();
                }, 50);
            }
        });

        $(window).on('load.slick.slick-' + _.instanceUid, _.setPosition);
        $(document).on('ready.slick.slick-' + _.instanceUid, _.setPosition);

    };

    Slick.prototype.initUI = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.show();
            _.$nextArrow.show();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.show();

        }

        if (_.options.autoplay === true) {

            _.autoPlay();

        }

    };

    Slick.prototype.keyHandler = function(event) {

        var _ = this;

        if (event.keyCode === 37) {
            _.changeSlide({
                data: {
                    message: 'previous'
                }
            });
        } else if (event.keyCode === 39) {
            _.changeSlide({
                data: {
                    message: 'next'
                }
            });
        }

    };

    Slick.prototype.lazyLoad = function() {

        var _ = this,
            loadRange, cloneRange, rangeStart, rangeEnd;

        function loadImages(imagesScope) {
            $('img[data-lazy]', imagesScope).each(function() {
                var image = $(this),
                    imageSource = $(this).attr('data-lazy') + "?" + new Date().getTime();

                image
                  .load(function() { image.animate({ opacity: 1 }, 200); })
                  .css({ opacity: 0 })
                  .attr('src', imageSource)
                  .removeAttr('data-lazy')
                  .removeClass('slick-loading');
            });
        }

        if (_.options.centerMode === true) {
            if (_.options.infinite === true) {
                rangeStart = _.currentSlide + (_.options.slidesToShow/2 + 1);
                rangeEnd = rangeStart + _.options.slidesToShow + 2;
            } else {
                rangeStart = Math.max(0, _.currentSlide - (_.options.slidesToShow/2 + 1));
                rangeEnd = 2 + (_.options.slidesToShow/2 + 1) + _.currentSlide;
            }
        } else {
            rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;
            rangeEnd = rangeStart + _.options.slidesToShow;
            if (_.options.fade === true ) {
                if(rangeStart > 0) rangeStart--;
                if(rangeEnd <= _.slideCount) rangeEnd++;
            }
        }

        loadRange = _.$slider.find('.slick-slide').slice(rangeStart, rangeEnd);
        loadImages(loadRange);

          if (_.slideCount == 1){
              cloneRange = _.$slider.find('.slick-slide')
              loadImages(cloneRange)
          }else
        if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-cloned').slice(0, _.options.slidesToShow);
            loadImages(cloneRange)
        } else if (_.currentSlide === 0) {
            cloneRange = _.$slider.find('.slick-cloned').slice(_.options.slidesToShow * -1);
            loadImages(cloneRange);
        }

    };

    Slick.prototype.loadSlider = function() {

        var _ = this;

        _.setPosition();

        _.$slideTrack.css({
            opacity: 1
        });

        _.$slider.removeClass('slick-loading');

        _.initUI();

        if (_.options.lazyLoad === 'progressive') {
            _.progressiveLazyLoad();
        }

    };

    Slick.prototype.postSlide = function(index) {

        var _ = this;

        if (_.options.onAfterChange !== null) {
            _.options.onAfterChange.call(this, _, index);
        }

        _.animating = false;

        _.setPosition();

        _.swipeLeft = null;

        if (_.options.autoplay === true && _.paused === false) {
            _.autoPlay();
        }

    };

    Slick.prototype.progressiveLazyLoad = function() {

        var _ = this,
            imgCount, targetImage;

        imgCount = $('img[data-lazy]').length;

        if (imgCount > 0) {
            targetImage = $('img[data-lazy]', _.$slider).first();
            targetImage.attr('src', targetImage.attr('data-lazy')).removeClass('slick-loading').load(function() {
                targetImage.removeAttr('data-lazy');
                _.progressiveLazyLoad();
            });
        }

    };

    Slick.prototype.refresh = function() {

        var _ = this,
            currentSlide = _.currentSlide;

        _.destroy();

        $.extend(_, _.initials);

        _.currentSlide = currentSlide;
        _.init();

    };

    Slick.prototype.reinit = function() {

        var _ = this;

        _.$slides = _.$slideTrack.children(_.options.slide).addClass(
            'slick-slide');

        _.slideCount = _.$slides.length;

        if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
            _.currentSlide = _.currentSlide - _.options.slidesToScroll;
        }

        _.setProps();

        _.setupInfinite();

        _.buildArrows();

        _.updateArrows();

        _.initArrowEvents();

        _.buildDots();

        _.updateDots();

        _.initDotEvents();

        if(_.options.focusOnSelect === true) {
            $(_.options.slide, _.$slideTrack).on('click.slick', _.selectHandler);
        }

        _.setSlideClasses(0);

        _.setPosition();

        if (_.options.onReInit !== null) {
            _.options.onReInit.call(this, _);
        }

    };

    Slick.prototype.removeSlide = function(index, removeBefore) {

        var _ = this;

        if (typeof(index) === 'boolean') {
            removeBefore = index;
            index = removeBefore === true ? 0 : _.slideCount - 1;
        } else {
            index = removeBefore === true ? --index : index;
        }

        if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
            return false;
        }

        _.unload();

        _.$slideTrack.children(this.options.slide).eq(index).remove();

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.setCSS = function(position) {

        var _ = this,
            positionProps = {}, x, y;

        if (_.options.rtl === true) {
            position = -position;
        }
        x = _.positionProp == 'left' ? position + 'px' : '0px';
        y = _.positionProp == 'top' ? position + 'px' : '0px';

        positionProps[_.positionProp] = position;

        if (_.transformsEnabled === false) {
            _.$slideTrack.css(positionProps);
        } else {
            positionProps = {};
            if (_.cssTransitions === false) {
                positionProps[_.animType] = 'translate(' + x + ', ' + y + ')';
                _.$slideTrack.css(positionProps);
            } else {
                positionProps[_.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';
                _.$slideTrack.css(positionProps);
            }
        }

    };

    Slick.prototype.setDimensions = function() {

        var _ = this;

        if (_.options.vertical === false) {
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: ('0px ' + _.options.centerPadding)
                });
            }
        } else {
            _.$list.height(_.$slides.first().outerHeight(true) * _.options.slidesToShow);
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: (_.options.centerPadding + ' 0px')
                });
            }
        }

        _.listWidth = _.$list.width();
        _.listHeight = _.$list.height();


        if(_.options.vertical === false) {
            _.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);
            _.$slideTrack.width(Math.ceil((_.slideWidth * _.$slideTrack.children('.slick-slide').length)));

        } else {
            _.slideWidth = Math.ceil(_.listWidth);
            _.$slideTrack.height(Math.ceil((_.$slides.first().outerHeight(true) * _.$slideTrack.children('.slick-slide').length)));

        }

        var offset = _.$slides.first().outerWidth(true) - _.$slides.first().width();
        _.$slideTrack.children('.slick-slide').width(_.slideWidth - offset);

    };

    Slick.prototype.setFade = function() {

        var _ = this,
            targetLeft;

        _.$slides.each(function(index, element) {
            targetLeft = (_.slideWidth * index) * -1;
            $(element).css({
                position: 'relative',
                left: targetLeft,
                top: 0,
                zIndex: 800,
                opacity: 0
            });
        });

        _.$slides.eq(_.currentSlide).css({
            zIndex: 900,
            opacity: 1
        });

    };

    Slick.prototype.setPosition = function() {

        var _ = this;

        _.setDimensions();

        if (_.options.fade === false) {
            _.setCSS(_.getLeft(_.currentSlide));
        } else {
            _.setFade();
        }

    };

    Slick.prototype.setProps = function() {

        var _ = this,
            bodyStyle = document.body.style;

        _.positionProp = _.options.vertical === true ? 'top' : 'left';

        if (_.positionProp === 'top') {
            _.$slider.addClass('slick-vertical');
        } else {
            _.$slider.removeClass('slick-vertical');
        }

        if (bodyStyle.WebkitTransition !== undefined ||
            bodyStyle.MozTransition !== undefined ||
            bodyStyle.msTransition !== undefined) {
            if(_.options.useCSS === true) {
                _.cssTransitions = true;
            }
        }

        if (bodyStyle.OTransform !== undefined) {
            _.animType = 'OTransform';
            _.transformType = "-o-transform";
            _.transitionType = 'OTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.MozTransform !== undefined) {
            _.animType = 'MozTransform';
            _.transformType = "-moz-transform";
            _.transitionType = 'MozTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.MozPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.webkitTransform !== undefined) {
            _.animType = 'webkitTransform';
            _.transformType = "-webkit-transform";
            _.transitionType = 'webkitTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.msTransform !== undefined) {
            _.animType = 'msTransform';
            _.transformType = "-ms-transform";
            _.transitionType = 'msTransition';
            if (bodyStyle.msTransform === undefined) _.animType = false;
        }
        if (bodyStyle.transform !== undefined && _.animType !== false) {
            _.animType = 'transform';
            _.transformType = "transform";
            _.transitionType = 'transition';
        }
        _.transformsEnabled = (_.animType !== null && _.animType !== false);

    };


    Slick.prototype.setSlideClasses = function(index) {

        var _ = this,
            centerOffset, allSlides, indexOffset, remainder;

        _.$slider.find('.slick-slide').removeClass('slick-active').removeClass('slick-center');
        allSlides = _.$slider.find('.slick-slide');

        if (_.options.centerMode === true) {

            centerOffset = Math.floor(_.options.slidesToShow / 2);

            if(_.options.infinite === true) {

                if (index >= centerOffset && index <= (_.slideCount - 1) - centerOffset) {
                    _.$slides.slice(index - centerOffset, index + centerOffset + 1).addClass('slick-active');
                } else {
                    indexOffset = _.options.slidesToShow + index;
                    allSlides.slice(indexOffset - centerOffset + 1, indexOffset + centerOffset + 2).addClass('slick-active');
                }

                if (index === 0) {
                    allSlides.eq(allSlides.length - 1 - _.options.slidesToShow).addClass('slick-center');
                } else if (index === _.slideCount - 1) {
                    allSlides.eq(_.options.slidesToShow).addClass('slick-center');
                }

            }

            _.$slides.eq(index).addClass('slick-center');

        } else {

            if (index >= 0 && index <= (_.slideCount - _.options.slidesToShow)) {
                _.$slides.slice(index, index + _.options.slidesToShow).addClass('slick-active');
            } else if ( allSlides.length <= _.options.slidesToShow ) {
                allSlides.addClass('slick-active');
            } else {
                remainder = _.slideCount%_.options.slidesToShow;
                indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;
                if(_.options.slidesToShow == _.options.slidesToScroll && (_.slideCount - index) < _.options.slidesToShow) {
                    allSlides.slice(indexOffset-(_.options.slidesToShow-remainder), indexOffset + remainder).addClass('slick-active');
                } else {
                    allSlides.slice(indexOffset, indexOffset + _.options.slidesToShow).addClass('slick-active');
                }
            }

        }

        if (_.options.lazyLoad === 'ondemand') {
            _.lazyLoad();
        }

    };

    Slick.prototype.setupInfinite = function() {

        var _ = this,
            i, slideIndex, infiniteCount;

        if (_.options.fade === true || _.options.vertical === true) {
            _.options.centerMode = false;
        }

        if (_.options.infinite === true && _.options.fade === false) {

            slideIndex = null;

            if (_.slideCount > _.options.slidesToShow) {

                if (_.options.centerMode === true) {
                    infiniteCount = _.options.slidesToShow + 1;
                } else {
                    infiniteCount = _.options.slidesToShow;
                }

                for (i = _.slideCount; i > (_.slideCount -
                    infiniteCount); i -= 1) {
                    slideIndex = i - 1;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '').prependTo(
                        _.$slideTrack).addClass('slick-cloned');
                }
                for (i = 0; i < infiniteCount; i += 1) {
                    slideIndex = i;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '').appendTo(
                        _.$slideTrack).addClass('slick-cloned');
                }
                _.$slideTrack.find('.slick-cloned').find('[id]').each(function() {
                    $(this).attr('id', '');
                });

            }

        }

    };

    Slick.prototype.selectHandler = function(event) {

        var _ = this;
        var asNavFor = _.options.asNavFor != null ? $(_.options.asNavFor).getSlick() : null;
        var index = parseInt($(event.target).parent().attr("index"));
        if(!index) index = 0;

        if(_.slideCount <= _.options.slidesToShow){
            return;
        }
        _.slideHandler(index);

        if(asNavFor != null){
            if(asNavFor.slideCount <= asNavFor.options.slidesToShow){
                return;
            }
            asNavFor.slideHandler(index);
        }
    };

    Slick.prototype.slideHandler = function(index) {

        var targetSlide, animSlide, slideLeft, unevenOffset, targetLeft = null,
            _ = this;

        if (_.animating === true && _.options.waitForAnimate === true) {
            return false;
        }

        targetSlide = index;
        targetLeft = _.getLeft(targetSlide);
        slideLeft = _.getLeft(_.currentSlide);

        unevenOffset = _.slideCount % _.options.slidesToScroll !== 0 ? _.options.slidesToScroll : 0;

        _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;

        if (_.options.infinite === false && _.options.centerMode === false && (index < 0 || index > (_.slideCount - _.options.slidesToShow + unevenOffset))) {
            if(_.options.fade === false) {
                targetSlide = _.currentSlide;
                _.animateSlide(slideLeft, function() {
                    _.postSlide(targetSlide);
                });
            }
            return false;
        } else if (_.options.infinite === false && _.options.centerMode === true && (index < 0 || index > (_.slideCount - _.options.slidesToScroll))) {
            if(_.options.fade === false) {
                targetSlide = _.currentSlide;
                _.animateSlide(slideLeft, function() {
                    _.postSlide(targetSlide);
                });
            }
            return false;
        }

        if (_.options.autoplay === true) {
            clearInterval(_.autoPlayTimer);
        }

        if (targetSlide < 0) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = _.slideCount - (_.slideCount % _.options.slidesToScroll);
            } else {
                animSlide = _.slideCount - _.options.slidesToScroll;
            }
        } else if (targetSlide > (_.slideCount - 1)) {
            animSlide = 0;
        } else {
            animSlide = targetSlide;
        }

        _.animating = true;

        if (_.options.onBeforeChange !== null && index !== _.currentSlide) {
            _.options.onBeforeChange.call(this, _, _.currentSlide, animSlide);
        }

        _.currentSlide = animSlide;

        _.setSlideClasses(_.currentSlide);

        _.updateDots();
        _.updateArrows();

        if (_.options.fade === true) {
            _.fadeSlide(animSlide, function() {
                _.postSlide(animSlide);
            });
            return false;
        }

        _.animateSlide(targetLeft, function() {
            _.postSlide(animSlide);
        });

    };

    Slick.prototype.startLoad = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.hide();
            _.$nextArrow.hide();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.hide();

        }

        _.$slider.addClass('slick-loading');

    };

    Slick.prototype.swipeDirection = function() {

        var xDist, yDist, r, swipeAngle, _ = this;

        xDist = _.touchObject.startX - _.touchObject.curX;
        yDist = _.touchObject.startY - _.touchObject.curY;
        r = Math.atan2(yDist, xDist);

        swipeAngle = Math.round(r * 180 / Math.PI);
        if (swipeAngle < 0) {
            swipeAngle = 360 - Math.abs(swipeAngle);
        }

        if ((swipeAngle <= 45) && (swipeAngle >= 0)) {
            return 'left';
        }
        if ((swipeAngle <= 360) && (swipeAngle >= 315)) {
            return 'left';
        }
        if ((swipeAngle >= 135) && (swipeAngle <= 225)) {
            return 'right';
        }

        return 'vertical';

    };

    Slick.prototype.swipeEnd = function(event) {

        var _ = this;
        var asNavFor = _.options.asNavFor != null ? $(_.options.asNavFor).getSlick() : null;

        _.dragging = false;

        if (_.touchObject.curX === undefined) {
            return false;
        }

        if (_.touchObject.swipeLength >= _.touchObject.minSwipe) {
            $(event.target).on('click.slick', function(event) {
                event.stopImmediatePropagation();
                event.stopPropagation();
                event.preventDefault();
                $(event.target).off('click.slick');
            });

            switch (_.swipeDirection()) {
                case 'left':
                    _.slideHandler(_.currentSlide + _.options.slidesToScroll);
                    if(asNavFor != null) asNavFor.slideHandler(asNavFor.currentSlide + asNavFor.options.slidesToScroll);
                    _.touchObject = {};
                    break;

                case 'right':
                    _.slideHandler(_.currentSlide - _.options.slidesToScroll);
                    if(asNavFor != null) asNavFor.slideHandler(asNavFor.currentSlide - asNavFor.options.slidesToScroll);
                    _.touchObject = {};
                    break;
            }
        } else {
            if(_.touchObject.startX !== _.touchObject.curX) {
                _.slideHandler(_.currentSlide);
                if(asNavFor != null) asNavFor.slideHandler(asNavFor.currentSlide);
                _.touchObject = {};
            }
        }

    };

    Slick.prototype.swipeHandler = function(event) {

        var _ = this;

        if ((_.options.swipe === false) || ('ontouchend' in document && _.options.swipe === false)) {
           return;
        } else if ((_.options.draggable === false) || (_.options.draggable === false && !event.originalEvent.touches)) {
           return;
        }

        _.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ?
            event.originalEvent.touches.length : 1;

        _.touchObject.minSwipe = _.listWidth / _.options
            .touchThreshold;

        switch (event.data.action) {

            case 'start':
                _.swipeStart(event);
                break;

            case 'move':
                _.swipeMove(event);
                break;

            case 'end':
                _.swipeEnd(event);
                break;

        }

    };

    Slick.prototype.swipeMove = function(event) {

        var _ = this,
            curLeft, swipeDirection, positionOffset, touches;

        touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;

        curLeft = _.getLeft(_.currentSlide);

        if (!_.dragging || touches && touches.length !== 1) {
            return false;
        }

        _.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
        _.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;

        _.touchObject.swipeLength = Math.round(Math.sqrt(
            Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));

        swipeDirection = _.swipeDirection();

        if (swipeDirection === 'vertical') {
            return;
        }

        if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
            event.preventDefault();
        }

        positionOffset = _.touchObject.curX > _.touchObject.startX ? 1 : -1;

        if (_.options.vertical === false) {
            _.swipeLeft = curLeft + _.touchObject.swipeLength * positionOffset;
        } else {
            _.swipeLeft = curLeft + (_.touchObject
                .swipeLength * (_.$list.height() / _.listWidth)) * positionOffset;
        }

        if (_.options.fade === true || _.options.touchMove === false) {
            return false;
        }

        if (_.animating === true) {
            _.swipeLeft = null;
            return false;
        }

        _.setCSS(_.swipeLeft);

    };

    Slick.prototype.swipeStart = function(event) {

        var _ = this,
            touches;

        if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {
            _.touchObject = {};
            return false;
        }

        if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
            touches = event.originalEvent.touches[0];
        }

        _.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
        _.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;

        _.dragging = true;

    };

    Slick.prototype.unfilterSlides = function() {

        var _ = this;

        if (_.$slidesCache !== null) {

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.unload = function() {

        var _ = this;

        $('.slick-cloned', _.$slider).remove();
        if (_.$dots) {
            _.$dots.remove();
        }
        if (_.$prevArrow) {
            _.$prevArrow.remove();
            _.$nextArrow.remove();
        }
        _.$slides.removeClass(
            'slick-slide slick-active slick-visible').removeAttr('style');

    };

    Slick.prototype.updateArrows = function() {

        var _ = this;

        if (_.options.arrows === true && _.options.infinite !==
            true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow.removeClass('slick-disabled');
            _.$nextArrow.removeClass('slick-disabled');
            if (_.currentSlide === 0) {
                _.$prevArrow.addClass('slick-disabled');
                _.$nextArrow.removeClass('slick-disabled');
            } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
                _.$nextArrow.addClass('slick-disabled');
                _.$prevArrow.removeClass('slick-disabled');
            }
        }

    };

    Slick.prototype.updateDots = function() {

        var _ = this;

        if (_.$dots !== null) {

            _.$dots.find('li').removeClass('slick-active');
            _.$dots.find('li').eq(Math.floor(_.currentSlide / _.options.slidesToScroll)).addClass('slick-active');

        }

    };

    $.fn.slick = function(options) {
        var _ = this;
        return _.each(function(index, element) {

            element.slick = new Slick(element, options);

        });
    };

    $.fn.slickAdd = function(slide, slideIndex, addBefore) {
        var _ = this;
        return _.each(function(index, element) {

            element.slick.addSlide(slide, slideIndex, addBefore);

        });
    };

    $.fn.slickCurrentSlide = function() {
        var _ = this;
        return _.get(0).slick.getCurrent();
    };

    $.fn.slickFilter = function(filter) {
        var _ = this;
        return _.each(function(index, element) {

            element.slick.filterSlides(filter);

        });
    };

    $.fn.slickGoTo = function(slide) {
        var _ = this;
        return _.each(function(index, element) {

            var asNavFor = element.slick.options.asNavFor != null ? $(element.slick.options.asNavFor) : null;
            if(asNavFor != null) asNavFor.slickGoTo(slide);
            element.slick.slideHandler(slide);

        });
    };

    $.fn.slickNext = function() {
        var _ = this;
        return _.each(function(index, element) {

            element.slick.changeSlide({
                data: {
                    message: 'next'
                }
            });

        });
    };

    $.fn.slickPause = function() {
        var _ = this;
        return _.each(function(index, element) {

            element.slick.autoPlayClear();
            element.slick.paused = true;

        });
    };

    $.fn.slickPlay = function() {
        var _ = this;
        return _.each(function(index, element) {

            element.slick.paused = false;
            element.slick.autoPlay();

        });
    };

    $.fn.slickPrev = function() {
        var _ = this;
        return _.each(function(index, element) {

            element.slick.changeSlide({
                data: {
                    message: 'previous'
                }
            });

        });
    };

    $.fn.slickRemove = function(slideIndex, removeBefore) {
        var _ = this;
        return _.each(function(index, element) {

            element.slick.removeSlide(slideIndex, removeBefore);

        });
    };

    $.fn.slickGetOption = function(option) {
        var _ = this;
        return _.get(0).slick.options[option];
    };

    $.fn.slickSetOption = function(option, value, refresh) {
        var _ = this;
        return _.each(function(index, element) {

            element.slick.options[option] = value;

            if (refresh === true) {
                element.slick.unload();
                element.slick.reinit();
            }

        });
    };

    $.fn.slickUnfilter = function() {
        var _ = this;
        return _.each(function(index, element) {

            element.slick.unfilterSlides();

        });
    };

    $.fn.unslick = function() {
        var _ = this;
        return _.each(function(index, element) {

          if (element.slick) {
            element.slick.destroy();
          }

        });
    };

    $.fn.getSlick = function() {
        var s = null;
        var _ = this;
        _.each(function(index, element) {
            s = element.slick;
        });

        return s;
    };

}));

/* blueimg-gallery */
!function(a){"function"==typeof define&&define.amd?define(["./blueimp-helper"],a):(window.blueimp=window.blueimp||{},window.blueimp.Gallery=a(window.blueimp.helper||window.jQuery))}(function(a){function b(a,c){return void 0===document.body.style.maxHeight?null:this&&this.options===b.prototype.options?a&&a.length?(this.list=a,this.num=a.length,this.initOptions(c),void this.initialize()):void this.console.log("blueimp Gallery: No or empty list provided as first argument.",a):new b(a,c)}return a.extend(b.prototype,{options:{container:"#blueimp-gallery",slidesContainer:"div",titleElement:"h3",displayClass:"blueimp-gallery-display",controlsClass:"blueimp-gallery-controls",singleClass:"blueimp-gallery-single",leftEdgeClass:"blueimp-gallery-left",rightEdgeClass:"blueimp-gallery-right",playingClass:"blueimp-gallery-playing",slideClass:"slide",slideLoadingClass:"slide-loading",slideErrorClass:"slide-error",slideContentClass:"slide-content",toggleClass:"toggle",prevClass:"prev",nextClass:"next",closeClass:"close",playPauseClass:"play-pause",typeProperty:"type",titleProperty:"title",urlProperty:"href",displayTransition:!0,clearSlides:!0,stretchImages:!1,toggleControlsOnReturn:!0,toggleSlideshowOnSpace:!0,enableKeyboardNavigation:!0,closeOnEscape:!0,closeOnSlideClick:!0,closeOnSwipeUpOrDown:!0,emulateTouchEvents:!0,stopTouchEventsPropagation:!1,hidePageScrollbars:!0,disableScroll:!0,carousel:!1,continuous:!0,unloadElements:!0,startSlideshow:!1,slideshowInterval:5e3,index:0,preloadRange:2,transitionSpeed:400,slideshowTransitionSpeed:void 0,event:void 0,onopen:void 0,onopened:void 0,onslide:void 0,onslideend:void 0,onslidecomplete:void 0,onclose:void 0,onclosed:void 0},carouselOptions:{hidePageScrollbars:!1,toggleControlsOnReturn:!1,toggleSlideshowOnSpace:!1,enableKeyboardNavigation:!1,closeOnEscape:!1,closeOnSlideClick:!1,closeOnSwipeUpOrDown:!1,disableScroll:!1,startSlideshow:!0},console:window.console&&"function"==typeof window.console.log?window.console:{log:function(){}},support:function(b){var c={touch:void 0!==window.ontouchstart||window.DocumentTouch&&document instanceof DocumentTouch},d={webkitTransition:{end:"webkitTransitionEnd",prefix:"-webkit-"},MozTransition:{end:"transitionend",prefix:"-moz-"},OTransition:{end:"otransitionend",prefix:"-o-"},transition:{end:"transitionend",prefix:""}},e=function(){var a,d,e=c.transition;document.body.appendChild(b),e&&(a=e.name.slice(0,-9)+"ransform",void 0!==b.style[a]&&(b.style[a]="translateZ(0)",d=window.getComputedStyle(b).getPropertyValue(e.prefix+"transform"),c.transform={prefix:e.prefix,name:a,translate:!0,translateZ:!!d&&"none"!==d})),void 0!==b.style.backgroundSize&&(c.backgroundSize={},b.style.backgroundSize="contain",c.backgroundSize.contain="contain"===window.getComputedStyle(b).getPropertyValue("background-size"),b.style.backgroundSize="cover",c.backgroundSize.cover="cover"===window.getComputedStyle(b).getPropertyValue("background-size")),document.body.removeChild(b)};return function(a,c){var d;for(d in c)if(c.hasOwnProperty(d)&&void 0!==b.style[d]){a.transition=c[d],a.transition.name=d;break}}(c,d),document.body?e():a(document).on("DOMContentLoaded",e),c}(document.createElement("div")),requestAnimationFrame:window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame,initialize:function(){return this.initStartIndex(),this.initWidget()===!1?!1:(this.initEventListeners(),this.onslide(this.index),this.ontransitionend(),void(this.options.startSlideshow&&this.play()))},slide:function(a,b){window.clearTimeout(this.timeout);var c,d,e,f=this.index;if(f!==a&&1!==this.num){if(b||(b=this.options.transitionSpeed),this.support.transition){for(this.options.continuous||(a=this.circle(a)),c=Math.abs(f-a)/(f-a),this.options.continuous&&(d=c,c=-this.positions[this.circle(a)]/this.slideWidth,c!==d&&(a=-c*this.num+a)),e=Math.abs(f-a)-1;e;)e-=1,this.move(this.circle((a>f?a:f)-e-1),this.slideWidth*c,0);a=this.circle(a),this.move(f,this.slideWidth*c,b),this.move(a,0,b),this.options.continuous&&this.move(this.circle(a-c),-(this.slideWidth*c),0)}else a=this.circle(a),this.animate(f*-this.slideWidth,a*-this.slideWidth,b);this.onslide(a)}},getIndex:function(){return this.index},getNumber:function(){return this.num},prev:function(){(this.options.continuous||this.index)&&this.slide(this.index-1)},next:function(){(this.options.continuous||this.index<this.num-1)&&this.slide(this.index+1)},play:function(a){var b=this;window.clearTimeout(this.timeout),this.interval=a||this.options.slideshowInterval,this.elements[this.index]>1&&(this.timeout=this.setTimeout(!this.requestAnimationFrame&&this.slide||function(a,c){b.animationFrameId=b.requestAnimationFrame.call(window,function(){b.slide(a,c)})},[this.index+1,this.options.slideshowTransitionSpeed],this.interval)),this.container.addClass(this.options.playingClass)},pause:function(){window.clearTimeout(this.timeout),this.interval=null,this.container.removeClass(this.options.playingClass)},add:function(a){var b;for(a.concat||(a=Array.prototype.slice.call(a)),this.list.concat||(this.list=Array.prototype.slice.call(this.list)),this.list=this.list.concat(a),this.num=this.list.length,this.num>2&&null===this.options.continuous&&(this.options.continuous=!0,this.container.removeClass(this.options.leftEdgeClass)),this.container.removeClass(this.options.rightEdgeClass).removeClass(this.options.singleClass),b=this.num-a.length;b<this.num;b+=1)this.addSlide(b),this.positionSlide(b);this.positions.length=this.num,this.initSlides(!0)},resetSlides:function(){this.slidesContainer.empty(),this.slides=[]},handleClose:function(){var a=this.options;this.destroyEventListeners(),this.pause(),this.container[0].style.display="none",this.container.removeClass(a.displayClass).removeClass(a.singleClass).removeClass(a.leftEdgeClass).removeClass(a.rightEdgeClass),a.hidePageScrollbars&&(document.body.style.overflow=this.bodyOverflowStyle),this.options.clearSlides&&this.resetSlides(),this.options.onclosed&&this.options.onclosed.call(this)},close:function(){var a=this,b=function(c){c.target===a.container[0]&&(a.container.off(a.support.transition.end,b),a.handleClose())};this.options.onclose&&this.options.onclose.call(this),this.support.transition&&this.options.displayTransition?(this.container.on(this.support.transition.end,b),this.container.removeClass(this.options.displayClass)):this.handleClose()},circle:function(a){return(this.num+a%this.num)%this.num},move:function(a,b,c){this.translateX(a,b,c),this.positions[a]=b},translate:function(a,b,c,d){var e=this.slides[a].style,f=this.support.transition,g=this.support.transform;e[f.name+"Duration"]=d+"ms",e[g.name]="translate("+b+"px, "+c+"px)"+(g.translateZ?" translateZ(0)":"")},translateX:function(a,b,c){this.translate(a,b,0,c)},translateY:function(a,b,c){this.translate(a,0,b,c)},animate:function(a,b,c){if(!c)return void(this.slidesContainer[0].style.left=b+"px");var d=this,e=(new Date).getTime(),f=window.setInterval(function(){var g=(new Date).getTime()-e;return g>c?(d.slidesContainer[0].style.left=b+"px",d.ontransitionend(),void window.clearInterval(f)):void(d.slidesContainer[0].style.left=(b-a)*(Math.floor(g/c*100)/100)+a+"px")},4)},preventDefault:function(a){a.preventDefault?a.preventDefault():a.returnValue=!1},stopPropagation:function(a){a.stopPropagation?a.stopPropagation():a.cancelBubble=!0},onresize:function(){this.initSlides(!0)},onmousedown:function(a){a.which&&1===a.which&&"VIDEO"!==a.target.nodeName&&(a.preventDefault(),(a.originalEvent||a).touches=[{pageX:a.pageX,pageY:a.pageY}],this.ontouchstart(a))},onmousemove:function(a){this.touchStart&&((a.originalEvent||a).touches=[{pageX:a.pageX,pageY:a.pageY}],this.ontouchmove(a))},onmouseup:function(a){this.touchStart&&(this.ontouchend(a),delete this.touchStart)},onmouseout:function(b){if(this.touchStart){var c=b.target,d=b.relatedTarget;(!d||d!==c&&!a.contains(c,d))&&this.onmouseup(b)}},ontouchstart:function(a){this.options.stopTouchEventsPropagation&&this.stopPropagation(a);var b=(a.originalEvent||a).touches[0];this.touchStart={x:b.pageX,y:b.pageY,time:Date.now()},this.isScrolling=void 0,this.touchDelta={}},ontouchmove:function(a){this.options.stopTouchEventsPropagation&&this.stopPropagation(a);var b,c,d=(a.originalEvent||a).touches[0],e=(a.originalEvent||a).scale,f=this.index;if(!(d.length>1||e&&1!==e))if(this.options.disableScroll&&a.preventDefault(),this.touchDelta={x:d.pageX-this.touchStart.x,y:d.pageY-this.touchStart.y},b=this.touchDelta.x,void 0===this.isScrolling&&(this.isScrolling=this.isScrolling||Math.abs(b)<Math.abs(this.touchDelta.y)),this.isScrolling)this.options.closeOnSwipeUpOrDown&&this.translateY(f,this.touchDelta.y+this.positions[f],0);else for(a.preventDefault(),window.clearTimeout(this.timeout),this.options.continuous?c=[this.circle(f+1),f,this.circle(f-1)]:(this.touchDelta.x=b/=!f&&b>0||f===this.num-1&&0>b?Math.abs(b)/this.slideWidth+1:1,c=[f],f&&c.push(f-1),f<this.num-1&&c.unshift(f+1));c.length;)f=c.pop(),this.translateX(f,b+this.positions[f],0)},ontouchend:function(a){this.options.stopTouchEventsPropagation&&this.stopPropagation(a);var b,c,d,e,f,g=this.index,h=this.options.transitionSpeed,i=this.slideWidth,j=Number(Date.now()-this.touchStart.time)<250,k=j&&Math.abs(this.touchDelta.x)>20||Math.abs(this.touchDelta.x)>i/2,l=!g&&this.touchDelta.x>0||g===this.num-1&&this.touchDelta.x<0,m=!k&&this.options.closeOnSwipeUpOrDown&&(j&&Math.abs(this.touchDelta.y)>20||Math.abs(this.touchDelta.y)>this.slideHeight/2);this.options.continuous&&(l=!1),b=this.touchDelta.x<0?-1:1,this.isScrolling?m?this.close():this.translateY(g,0,h):k&&!l?(c=g+b,d=g-b,e=i*b,f=-i*b,this.options.continuous?(this.move(this.circle(c),e,0),this.move(this.circle(g-2*b),f,0)):c>=0&&c<this.num&&this.move(c,e,0),this.move(g,this.positions[g]+e,h),this.move(this.circle(d),this.positions[this.circle(d)]+e,h),g=this.circle(d),this.onslide(g)):this.options.continuous?(this.move(this.circle(g-1),-i,h),this.move(g,0,h),this.move(this.circle(g+1),i,h)):(g&&this.move(g-1,-i,h),this.move(g,0,h),g<this.num-1&&this.move(g+1,i,h))},ontouchcancel:function(a){this.touchStart&&(this.ontouchend(a),delete this.touchStart)},ontransitionend:function(a){var b=this.slides[this.index];a&&b!==a.target||(this.interval&&this.play(),this.setTimeout(this.options.onslideend,[this.index,b]))},oncomplete:function(b){var c,d=b.target||b.srcElement,e=d&&d.parentNode;d&&e&&(c=this.getNodeIndex(e),a(e).removeClass(this.options.slideLoadingClass),"error"===b.type?(a(e).addClass(this.options.slideErrorClass),this.elements[c]=3):this.elements[c]=2,d.clientHeight>this.container[0].clientHeight&&(d.style.maxHeight=this.container[0].clientHeight),this.interval&&this.slides[this.index]===e&&this.play(),this.setTimeout(this.options.onslidecomplete,[c,e]))},onload:function(a){this.oncomplete(a)},onerror:function(a){this.oncomplete(a)},onkeydown:function(a){switch(a.which||a.keyCode){case 13:this.options.toggleControlsOnReturn&&(this.preventDefault(a),this.toggleControls());break;case 27:this.options.closeOnEscape&&this.close();break;case 32:this.options.toggleSlideshowOnSpace&&(this.preventDefault(a),this.toggleSlideshow());break;case 37:this.options.enableKeyboardNavigation&&(this.preventDefault(a),this.prev());break;case 39:this.options.enableKeyboardNavigation&&(this.preventDefault(a),this.next())}},handleClick:function(b){var c=this.options,d=b.target||b.srcElement,e=d.parentNode,f=function(b){return a(d).hasClass(b)||a(e).hasClass(b)};f(c.toggleClass)?(this.preventDefault(b),this.toggleControls()):f(c.prevClass)?(this.preventDefault(b),this.prev()):f(c.nextClass)?(this.preventDefault(b),this.next()):f(c.closeClass)?(this.preventDefault(b),this.close()):f(c.playPauseClass)?(this.preventDefault(b),this.toggleSlideshow()):e===this.slidesContainer[0]?(this.preventDefault(b),c.closeOnSlideClick?this.close():this.toggleControls()):e.parentNode&&e.parentNode===this.slidesContainer[0]&&(this.preventDefault(b),this.toggleControls())},onclick:function(a){return this.options.emulateTouchEvents&&this.touchDelta&&(Math.abs(this.touchDelta.x)>20||Math.abs(this.touchDelta.y)>20)?void delete this.touchDelta:this.handleClick(a)},updateEdgeClasses:function(a){a?this.container.removeClass(this.options.leftEdgeClass):this.container.addClass(this.options.leftEdgeClass),a===this.num-1?this.container.addClass(this.options.rightEdgeClass):this.container.removeClass(this.options.rightEdgeClass)},handleSlide:function(a){this.options.continuous||this.updateEdgeClasses(a),this.loadElements(a),this.options.unloadElements&&this.unloadElements(a),this.setTitle(a)},onslide:function(a){this.index=a,this.handleSlide(a),this.setTimeout(this.options.onslide,[a,this.slides[a]])},setTitle:function(a){var b=this.slides[a].firstChild.title,c=this.titleElement;c.length&&(this.titleElement.empty(),b&&c[0].appendChild(document.createTextNode(b)))},setTimeout:function(a,b,c){var d=this;return a&&window.setTimeout(function(){a.apply(d,b||[])},c||0)},imageFactory:function(b,c){var d,e,f,g=this,h=this.imagePrototype.cloneNode(!1),i=b,j=this.options.stretchImages,k=function(b){if(!d){if(b={type:b.type,target:e},!e.parentNode)return g.setTimeout(k,[b]);d=!0,a(h).off("load error",k),j&&"load"===b.type&&(e.style.background='url("'+i+'") center no-repeat',e.style.backgroundSize=j),c(b)}};return"string"!=typeof i&&(i=this.getItemProperty(b,this.options.urlProperty),f=this.getItemProperty(b,this.options.titleProperty)),j===!0&&(j="contain"),j=this.support.backgroundSize&&this.support.backgroundSize[j]&&j,j?e=this.elementPrototype.cloneNode(!1):(e=h,h.draggable=!1),f&&(e.title=f),a(h).on("load error",k),h.src=i,e},createElement:function(b,c){var d=b&&this.getItemProperty(b,this.options.typeProperty),e=d&&this[d.split("/")[0]+"Factory"]||this.imageFactory,f=b&&e.call(this,b,c);return f||(f=this.elementPrototype.cloneNode(!1),this.setTimeout(c,[{type:"error",target:f}])),a(f).addClass(this.options.slideContentClass),f},loadElement:function(b){this.elements[b]||(this.slides[b].firstChild?this.elements[b]=a(this.slides[b]).hasClass(this.options.slideErrorClass)?3:2:(this.elements[b]=1,a(this.slides[b]).addClass(this.options.slideLoadingClass),this.slides[b].appendChild(this.createElement(this.list[b],this.proxyListener))))},loadElements:function(a){var b,c=Math.min(this.num,2*this.options.preloadRange+1),d=a;for(b=0;c>b;b+=1)d+=b*(b%2===0?-1:1),d=this.circle(d),this.loadElement(d)},unloadElements:function(a){var b,c,d;for(b in this.elements)this.elements.hasOwnProperty(b)&&(d=Math.abs(a-b),d>this.options.preloadRange&&d+this.options.preloadRange<this.num&&(c=this.slides[b],c.removeChild(c.firstChild),delete this.elements[b]))},addSlide:function(a){var b=this.slidePrototype.cloneNode(!1);b.setAttribute("data-index",a),this.slidesContainer[0].appendChild(b),this.slides.push(b)},positionSlide:function(a){var b=this.slides[a];b.style.width=this.slideWidth+"px",this.support.transition&&(b.style.left=a*-this.slideWidth+"px",this.move(a,this.index>a?-this.slideWidth:this.index<a?this.slideWidth:0,0))},initSlides:function(b){var c,d;for(b||(this.positions=[],this.positions.length=this.num,this.elements={},this.imagePrototype=document.createElement("img"),this.elementPrototype=document.createElement("div"),this.slidePrototype=document.createElement("div"),a(this.slidePrototype).addClass(this.options.slideClass),this.slides=this.slidesContainer[0].children,c=this.options.clearSlides||this.slides.length!==this.num),this.slideWidth=this.container[0].offsetWidth,this.slideHeight=this.container[0].offsetHeight,this.slidesContainer[0].style.width=this.num*this.slideWidth+"px",c&&this.resetSlides(),d=0;d<this.num;d+=1)c&&this.addSlide(d),this.positionSlide(d);this.options.continuous&&this.support.transition&&(this.move(this.circle(this.index-1),-this.slideWidth,0),this.move(this.circle(this.index+1),this.slideWidth,0)),this.support.transition||(this.slidesContainer[0].style.left=this.index*-this.slideWidth+"px")},toggleControls:function(){var a=this.options.controlsClass;this.container.hasClass(a)?this.container.removeClass(a):this.container.addClass(a)},toggleSlideshow:function(){this.interval?this.pause():this.play()},getNodeIndex:function(a){return parseInt(a.getAttribute("data-index"),10)},getNestedProperty:function(a,b){return b.replace(/\[(?:'([^']+)'|"([^"]+)"|(\d+))\]|(?:(?:^|\.)([^\.\[]+))/g,function(b,c,d,e,f){var g=f||c||d||e&&parseInt(e,10);b&&a&&(a=a[g])}),a},getDataProperty:function(b,c){if(b.getAttribute){var d=b.getAttribute("data-"+c.replace(/([A-Z])/g,"-$1").toLowerCase());if("string"==typeof d){if(/^(true|false|null|-?\d+(\.\d+)?|\{[\s\S]*\}|\[[\s\S]*\])$/.test(d))try{return a.parseJSON(d)}catch(e){}return d}}},getItemProperty:function(a,b){var c=a[b];return void 0===c&&(c=this.getDataProperty(a,b),void 0===c&&(c=this.getNestedProperty(a,b))),c},initStartIndex:function(){var a,b=this.options.index,c=this.options.urlProperty;if(b&&"number"!=typeof b)for(a=0;a<this.num;a+=1)if(this.list[a]===b||this.getItemProperty(this.list[a],c)===this.getItemProperty(b,c)){b=a;break}this.index=this.circle(parseInt(b,10)||0)},initEventListeners:function(){var b=this,c=this.slidesContainer,d=function(a){var c=b.support.transition&&b.support.transition.end===a.type?"transitionend":a.type;b["on"+c](a)};a(window).on("resize",d),a(document.body).on("keydown",d),this.container.on("click",d),this.support.touch?c.on("touchstart touchmove touchend touchcancel",d):this.options.emulateTouchEvents&&this.support.transition&&c.on("mousedown mousemove mouseup mouseout",d),this.support.transition&&c.on(this.support.transition.end,d),this.proxyListener=d},destroyEventListeners:function(){var b=this.slidesContainer,c=this.proxyListener;a(window).off("resize",c),a(document.body).off("keydown",c),this.container.off("click",c),this.support.touch?b.off("touchstart touchmove touchend touchcancel",c):this.options.emulateTouchEvents&&this.support.transition&&b.off("mousedown mousemove mouseup mouseout",c),this.support.transition&&b.off(this.support.transition.end,c)},handleOpen:function(){this.options.onopened&&this.options.onopened.call(this)},initWidget:function(){var b=this,c=function(a){a.target===b.container[0]&&(b.container.off(b.support.transition.end,c),b.handleOpen())};return this.container=a(this.options.container),this.container.length?(this.slidesContainer=this.container.find(this.options.slidesContainer).first(),this.slidesContainer.length?(this.titleElement=this.container.find(this.options.titleElement).first(),1===this.num&&this.container.addClass(this.options.singleClass),this.options.onopen&&this.options.onopen.call(this),this.support.transition&&this.options.displayTransition?this.container.on(this.support.transition.end,c):this.handleOpen(),this.options.hidePageScrollbars&&(this.bodyOverflowStyle=document.body.style.overflow,document.body.style.overflow="hidden"),this.container[0].style.display="block",this.initSlides(),void this.container.addClass(this.options.displayClass)):(this.console.log("blueimp Gallery: Slides container not found.",this.options.slidesContainer),!1)):(this.console.log("blueimp Gallery: Widget container not found.",this.options.container),!1)},initOptions:function(b){this.options=a.extend({},this.options),(b&&b.carousel||this.options.carousel&&(!b||b.carousel!==!1))&&a.extend(this.options,this.carouselOptions),a.extend(this.options,b),this.num<3&&(this.options.continuous=this.options.continuous?null:!1),this.support.transition||(this.options.emulateTouchEvents=!1),this.options.event&&this.preventDefault(this.options.event)}}),b}),function(a){"function"==typeof define&&define.amd?define(["./blueimp-helper","./blueimp-gallery"],a):a(window.blueimp.helper||window.jQuery,window.blueimp.Gallery)}(function(a,b){a.extend(b.prototype.options,{fullScreen:!1});var c=b.prototype.initialize,d=b.prototype.close;return a.extend(b.prototype,{getFullScreenElement:function(){return document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement||document.msFullscreenElement},requestFullScreen:function(a){a.requestFullscreen?a.requestFullscreen():a.webkitRequestFullscreen?a.webkitRequestFullscreen():a.mozRequestFullScreen?a.mozRequestFullScreen():a.msRequestFullscreen&&a.msRequestFullscreen()},exitFullScreen:function(){document.exitFullscreen?document.exitFullscreen():document.webkitCancelFullScreen?document.webkitCancelFullScreen():document.mozCancelFullScreen?document.mozCancelFullScreen():document.msExitFullscreen&&document.msExitFullscreen()},initialize:function(){c.call(this),this.options.fullScreen&&!this.getFullScreenElement()&&this.requestFullScreen(this.container[0])},close:function(){this.getFullScreenElement()===this.container[0]&&this.exitFullScreen(),d.call(this)}}),b}),function(a){"function"==typeof define&&define.amd?define(["./blueimp-helper","./blueimp-gallery"],a):a(window.blueimp.helper||window.jQuery,window.blueimp.Gallery)}(function(a,b){a.extend(b.prototype.options,{indicatorContainer:"ol",activeIndicatorClass:"active",thumbnailProperty:"thumbnail",thumbnailIndicators:!0});var c=b.prototype.initSlides,d=b.prototype.addSlide,e=b.prototype.resetSlides,f=b.prototype.handleClick,g=b.prototype.handleSlide,h=b.prototype.handleClose;return a.extend(b.prototype,{createIndicator:function(b){var c,d,e=this.indicatorPrototype.cloneNode(!1),f=this.getItemProperty(b,this.options.titleProperty),g=this.options.thumbnailProperty;return this.options.thumbnailIndicators&&(d=b.getElementsByTagName&&a(b).find("img")[0],d?c=d.src:g&&(c=this.getItemProperty(b,g)),c&&(e.style.backgroundImage='url("'+c+'")')),f&&(e.title=f),e},addIndicator:function(a){if(this.indicatorContainer.length){var b=this.createIndicator(this.list[a]);b.setAttribute("data-index",a),this.indicatorContainer[0].appendChild(b),this.indicators.push(b)}},setActiveIndicator:function(b){this.indicators&&(this.activeIndicator&&this.activeIndicator.removeClass(this.options.activeIndicatorClass),this.activeIndicator=a(this.indicators[b]),this.activeIndicator.addClass(this.options.activeIndicatorClass))},initSlides:function(a){a||(this.indicatorContainer=this.container.find(this.options.indicatorContainer),this.indicatorContainer.length&&(this.indicatorPrototype=document.createElement("li"),this.indicators=this.indicatorContainer[0].children)),c.call(this,a)},addSlide:function(a){d.call(this,a),this.addIndicator(a)},resetSlides:function(){e.call(this),this.indicatorContainer.empty(),this.indicators=[]},handleClick:function(a){var b=a.target||a.srcElement,c=b.parentNode;if(c===this.indicatorContainer[0])this.preventDefault(a),this.slide(this.getNodeIndex(b));else{if(c.parentNode!==this.indicatorContainer[0])return f.call(this,a);this.preventDefault(a),this.slide(this.getNodeIndex(c))}},handleSlide:function(a){g.call(this,a),this.setActiveIndicator(a)},handleClose:function(){this.activeIndicator&&this.activeIndicator.removeClass(this.options.activeIndicatorClass),h.call(this)}}),b}),function(a){"function"==typeof define&&define.amd?define(["./blueimp-helper","./blueimp-gallery"],a):a(window.blueimp.helper||window.jQuery,window.blueimp.Gallery)}(function(a,b){a.extend(b.prototype.options,{videoContentClass:"video-content",videoLoadingClass:"video-loading",videoPlayingClass:"video-playing",videoPosterProperty:"poster",videoSourcesProperty:"sources"});var c=b.prototype.handleSlide;return a.extend(b.prototype,{handleSlide:function(a){c.call(this,a),this.playingVideo&&this.playingVideo.pause()},videoFactory:function(b,c,d){var e,f,g,h,i,j=this,k=this.options,l=this.elementPrototype.cloneNode(!1),m=a(l),n=[{type:"error",target:l}],o=d||document.createElement("video"),p=this.getItemProperty(b,k.urlProperty),q=this.getItemProperty(b,k.typeProperty),r=this.getItemProperty(b,k.titleProperty),s=this.getItemProperty(b,k.videoPosterProperty),t=this.getItemProperty(b,k.videoSourcesProperty);if(m.addClass(k.videoContentClass),r&&(l.title=r),o.canPlayType)if(p&&q&&o.canPlayType(q))o.src=p;else for(;t&&t.length;)if(f=t.shift(),p=this.getItemProperty(f,k.urlProperty),q=this.getItemProperty(f,k.typeProperty),p&&q&&o.canPlayType(q)){o.src=p;break}return s&&(o.poster=s,e=this.imagePrototype.cloneNode(!1),a(e).addClass(k.toggleClass),e.src=s,e.draggable=!1,l.appendChild(e)),g=document.createElement("a"),g.setAttribute("target","_blank"),d||g.setAttribute("download",r),g.href=p,o.src&&(o.controls=!0,(d||a(o)).on("error",function(){j.setTimeout(c,n)}).on("pause",function(){h=!1,m.removeClass(j.options.videoLoadingClass).removeClass(j.options.videoPlayingClass),i&&j.container.addClass(j.options.controlsClass),delete j.playingVideo,j.interval&&j.play()}).on("playing",function(){h=!1,m.removeClass(j.options.videoLoadingClass).addClass(j.options.videoPlayingClass),j.container.hasClass(j.options.controlsClass)?(i=!0,j.container.removeClass(j.options.controlsClass)):i=!1}).on("play",function(){window.clearTimeout(j.timeout),h=!0,m.addClass(j.options.videoLoadingClass),j.playingVideo=o}),a(g).on("click",function(a){j.preventDefault(a),h?o.pause():o.play()}),l.appendChild(d&&d.element||o)),l.appendChild(g),this.setTimeout(c,[{type:"load",target:l}]),l}}),b}),function(a){"function"==typeof define&&define.amd?define(["./blueimp-helper","./blueimp-gallery-video"],a):a(window.blueimp.helper||window.jQuery,window.blueimp.Gallery)}(function(a,b){if(!window.postMessage)return b;a.extend(b.prototype.options,{vimeoVideoIdProperty:"vimeo",vimeoPlayerUrl:"//player.vimeo.com/video/VIDEO_ID?api=1&player_id=PLAYER_ID",vimeoPlayerIdPrefix:"vimeo-player-",vimeoClickToPlay:!0});var c=b.prototype.textFactory||b.prototype.imageFactory,d=function(a,b,c,d){this.url=a,this.videoId=b,this.playerId=c,this.clickToPlay=d,this.element=document.createElement("div"),this.listeners={}},e=0;return a.extend(d.prototype,{canPlayType:function(){return!0},on:function(a,b){return this.listeners[a]=b,this},loadAPI:function(){for(var b,c,d=this,e="//"+("https"===location.protocol?"secure-":"")+"a.vimeocdn.com/js/froogaloop2.min.js",f=document.getElementsByTagName("script"),g=f.length,h=function(){!c&&d.playOnReady&&d.play(),c=!0};g;)if(g-=1,f[g].src===e){b=f[g];break}b||(b=document.createElement("script"),b.src=e),a(b).on("load",h),f[0].parentNode.insertBefore(b,f[0]),/loaded|complete/.test(b.readyState)&&h()},onReady:function(){var a=this;this.ready=!0,this.player.addEvent("play",function(){a.hasPlayed=!0,a.onPlaying()}),this.player.addEvent("pause",function(){a.onPause()}),this.player.addEvent("finish",function(){a.onPause()}),this.playOnReady&&this.play()},onPlaying:function(){this.playStatus<2&&(this.listeners.playing(),this.playStatus=2)},onPause:function(){this.listeners.pause(),delete this.playStatus},insertIframe:function(){var a=document.createElement("iframe");a.src=this.url.replace("VIDEO_ID",this.videoId).replace("PLAYER_ID",this.playerId),a.id=this.playerId,this.element.parentNode.replaceChild(a,this.element),this.element=a},play:function(){var a=this;this.playStatus||(this.listeners.play(),this.playStatus=1),this.ready?!this.hasPlayed&&(this.clickToPlay||window.navigator&&/iP(hone|od|ad)/.test(window.navigator.platform))?this.onPlaying():this.player.api("play"):(this.playOnReady=!0,window.$f?this.player||(this.insertIframe(),this.player=$f(this.element),this.player.addEvent("ready",function(){a.onReady()})):this.loadAPI())},pause:function(){this.ready?this.player.api("pause"):this.playStatus&&(delete this.playOnReady,this.listeners.pause(),delete this.playStatus)}}),a.extend(b.prototype,{VimeoPlayer:d,textFactory:function(a,b){var f=this.options,g=this.getItemProperty(a,f.vimeoVideoIdProperty);return g?(void 0===this.getItemProperty(a,f.urlProperty)&&(a[f.urlProperty]="//vimeo.com/"+g),e+=1,this.videoFactory(a,b,new d(f.vimeoPlayerUrl,g,f.vimeoPlayerIdPrefix+e,f.vimeoClickToPlay))):c.call(this,a,b)}}),b}),function(a){"function"==typeof define&&define.amd?define(["./blueimp-helper","./blueimp-gallery-video"],a):a(window.blueimp.helper||window.jQuery,window.blueimp.Gallery)}(function(a,b){if(!window.postMessage)return b;a.extend(b.prototype.options,{youTubeVideoIdProperty:"youtube",youTubePlayerVars:{wmode:"transparent"},youTubeClickToPlay:!0});var c=b.prototype.textFactory||b.prototype.imageFactory,d=function(a,b,c){this.videoId=a,this.playerVars=b,this.clickToPlay=c,this.element=document.createElement("div"),this.listeners={}};return a.extend(d.prototype,{canPlayType:function(){return!0},on:function(a,b){return this.listeners[a]=b,this},loadAPI:function(){var a,b=this,c=window.onYouTubeIframeAPIReady,d="//www.youtube.com/iframe_api",e=document.getElementsByTagName("script"),f=e.length;for(window.onYouTubeIframeAPIReady=function(){c&&c.apply(this),b.playOnReady&&b.play()};f;)if(f-=1,e[f].src===d)return;a=document.createElement("script"),a.src=d,e[0].parentNode.insertBefore(a,e[0])},onReady:function(){this.ready=!0,this.playOnReady&&this.play()},onPlaying:function(){this.playStatus<2&&(this.listeners.playing(),this.playStatus=2)},onPause:function(){b.prototype.setTimeout.call(this,this.checkSeek,null,2e3)},checkSeek:function(){(this.stateChange===YT.PlayerState.PAUSED||this.stateChange===YT.PlayerState.ENDED)&&(this.listeners.pause(),delete this.playStatus)},onStateChange:function(a){switch(a.data){case YT.PlayerState.PLAYING:this.hasPlayed=!0,this.onPlaying();break;case YT.PlayerState.PAUSED:case YT.PlayerState.ENDED:this.onPause()}this.stateChange=a.data},onError:function(a){this.listeners.error(a)},play:function(){var a=this;this.playStatus||(this.listeners.play(),this.playStatus=1),this.ready?!this.hasPlayed&&(this.clickToPlay||window.navigator&&/iP(hone|od|ad)/.test(window.navigator.platform))?this.onPlaying():this.player.playVideo():(this.playOnReady=!0,window.YT&&YT.Player?this.player||(this.player=new YT.Player(this.element,{videoId:this.videoId,playerVars:this.playerVars,events:{onReady:function(){a.onReady()},onStateChange:function(b){a.onStateChange(b)},onError:function(b){a.onError(b)}}})):this.loadAPI())},pause:function(){this.ready?this.player.pauseVideo():this.playStatus&&(delete this.playOnReady,this.listeners.pause(),delete this.playStatus)}}),a.extend(b.prototype,{YouTubePlayer:d,textFactory:function(a,b){var e=this.options,f=this.getItemProperty(a,e.youTubeVideoIdProperty);return f?(void 0===this.getItemProperty(a,e.urlProperty)&&(a[e.urlProperty]="//www.youtube.com/watch?v="+f),void 0===this.getItemProperty(a,e.videoPosterProperty)&&(a[e.videoPosterProperty]="//img.youtube.com/vi/"+f+"/maxresdefault.jpg"),this.videoFactory(a,b,new d(f,e.youTubePlayerVars,e.youTubeClickToPlay))):c.call(this,a,b)}}),b}),function(a){"function"==typeof define&&define.amd?define(["jquery","./blueimp-gallery"],a):a(window.jQuery,window.blueimp.Gallery)}(function(a,b){a(document).on("click","[data-gallery]",function(c){var d=a(this).data("gallery"),e=a(d),f=e.length&&e||a(b.prototype.options.container),g={onopen:function(){f.data("gallery",this).trigger("open")},onopened:function(){f.trigger("opened")},onslide:function(){f.trigger("slide",arguments)},onslideend:function(){f.trigger("slideend",arguments)},onslidecomplete:function(){f.trigger("slidecomplete",arguments)},onclose:function(){f.trigger("close")},onclosed:function(){f.trigger("closed").removeData("gallery")}},h=a.extend(f.data(),{container:f[0],index:this,event:c},g),i=a('[data-gallery="'+d+'"]');return h.filter&&(i=i.filter(h.filter)),new b(i,h)})});

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
        map: map,
        draggable: false,
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
        if (window.last_cmap_size === img_map.width()) {
            return;
        }
        window.last_cmap_size = img_map.width();

        var selected = $('#cmap-points div[selected]');
        $('#cmap-points').html(build_points());
        if (selected.length == 0) {
            selected = $('#cmap-points div:first-child').click();
        } else {
            $('#' + selected.attr('id')).attr('selected', 'selected');
        }
    });

    $('#cmap').load(function(){
            $(window).resize();
        });

    $('#cmap-points').delegate('div', 'click', click);
}

/* gallery */
function init_gallery() {
    $('section.gallery-album > figure > a').on('click', function (e) {
        e.preventDefault();
        var links = $(e.target).parents('section').find('figure > a'),
            options = {
                index: $(e.target).parents('a').get(0),
                event: e,
                slideshowInterval: 4000,
                enableKeyboardNavigation: true,
                toggleControlsOnReturn: false,
                startSlideshow: true,
                thumbnailIndicators: true,
            };
        window.blueimp.Gallery(links, options);
    })
}

var slide_k = {};
function init_headers() {
    $('#header-slide-show').slick({
        infinite: true,
        autoplay: true,
        autoplaySpeed: 4000
    });

    $('#news').slick({
        infinite: true,
        autoplay: true,
        autoplaySpeed: 4000
    });

    $('.pitch-slide').slick({
        infinite: true,
        autoplay: true,
        autoplaySpeed: 4000
    });
}

/* main */
$(function(){
    init_headers();

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

    /* gallery */
    if ($('section.gallery-album').length > 0) {
        init_gallery();
    }
});
