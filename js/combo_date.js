/* Expected component's id tree layout:
 * - base
 * + - base_year
 * + - base_month
 * + - base_day
 *
 * If base_day is a <select>, non valid options will be disabled:
 * e.g.: base_month == Feb, base_day.(29,30,31)
 *
 * Supported validation attributes (on base):
 * - date-min, date-max (inclusive)
 * - required
 *
 * It fires onchange event on base when the date changes.
 */

/* exported ComboDate */
/* jshint browser:true */
/* jshint devel:true */


function ComboDate(base_id) {
    "use strict";

    // Internal state
    this.error = '';

    // Bind item
    this.base_id = base_id;
    this.base = document.getElementById(this.base_id);
    this.base_year = document.getElementById(this.base_id + '_year');
    this.base_month = document.getElementById(this.base_id + '_month');
    this.base_day = document.getElementById(this.base_id + '_day');

    this.getValueString = function() {
        return this.base_year.value + '-' +
                (this.base_month.value.length == 1 ? '0' : '') + this.base_month.value + '-' +
                (this.base_day.value.length == 1 ? '0' : '') + this.base_day.value;
    };

    // Define basic function
    // Return JavaScript Date object
    this.getValue = function() {
        return new Date(this.getValueString());
    };

    // Set the date, require Date object.
    this.setValue = function(value) {
        this.base_year.value = value.getFullYear();
        this.base_month.value = value.getMonth() + 1;
        this.base_day.value = value.getDate();
    };

    this.setError = function(error) {
        this.error = error;
    };

    this.getError = function(){
        return this.error;
    };

    // True if it is a valid Data and respects the constraints.
    // False otherwise.
    //    Set this.error.
    this.isValid = function() {
        // Check if the date it self is valid
        var current = this.getValue();
        if (isNaN(current.getTime())) {
            this.setError('Not a valid data');
            return false;
        }

        // Check constraint, if any.
        var max = this.getMax();
        if (max !== undefined && !isNaN(max) && current > max) {
            this.setError('Unacceptable date: too late.');
            return false;
        }

        var min = this.getMin();
        if (min !== undefined && !isNaN(min) && current < min) {
            this.setError('Unacceptable date: too early.');
            return false;
        }

        this.setError('');
        return true;
    };

    this.getMax = function() {
        var max_str =
            this.base.dataset.max !== undefined ?
            this.base.dataset.max : this.base.getAttribute('max'), max;
        if (max_str !== undefined) {
            max = new Date(max_str);
            if (isNaN(max)) console.error(this.base.attr.id, "Max date is not valid.", max);
        }
        return max;
    };

    this.getMin = function() {
        var min_str =
            this.base.dataset.min !== undefined ?
            this.base.dataset.min : this.base.getAttribute('min'), min;
        if (min_str !== undefined) {
            min = new Date(min_str);
            if (isNaN(min)) console.error(this.base.attr.id, "Min date is not valid.", min);
        }
        return min;
    };

    var removeNode = function(node) {
        node.parentNode.removeChild(node);
    };

    this.resetDays = function(that, month, year) {
        var days = ['<option></option>'],
            old_value = that.base_day.value;
        for (var d=1; d <= 31; d++)
            days.push('<option value="' + d + '"> ' + d + '</option>');
        that.base_day.innerHTML=days.join(', ');
        that.base_day.value = old_value;

        /* Apply gregorian if month is set */
        if (month !== undefined && !isNaN(month) &&
            year !== undefined && !isNaN(year)) {
            var hide = [];
            for (var h=31; h > that.daysInMonth(month, year); h--)
                hide.push('option[value="' + h + '"]');
            if (hide.length > 0)
                Array.prototype.forEach.call(
                    that.base_day.querySelectorAll(hide.join(', ')),
                    removeNode);
        }
    };

    this.daysInMonth = function(month,year) {
        return new Date(year, month, 0).getDate();
    };

    this.on_month_change = function() {
        var that = this;
        return function () {
            console.log("here 1");
            var year = parseInt(that.base_year.value),
            month = parseInt(that.base_month.value);

            that.resetDays(that, month, year);

            // Check precondition
            if (!isNaN(year) && !isNaN(month)) {
                // Respect constraint
                var hiding_days = [], min = that.getMin(), max = that.getMax();

                // Min
                if (min !== undefined && !isNaN(min) && month == (min.getMonth() + 1)) {
                    for (var l=1; l < min.getDate(); l++)
                        hiding_days.push('option[value="' + l + '"]');
                }

                // Max & max #days in month
                var dmax = new Date(year, month, 0).getDate(); // max = day_in_month
                if (max !== undefined && !isNaN(max) && month == (max.getMonth() + 1)) {
                    dmax = Math.min(dmax, max.getDate());
                }
                for (var u=31; u > dmax; u--)
                    hiding_days.push('option[value="' + u + '"]');

                console.log("here 2", hiding_days);
                if (hiding_days.length) {
                    Array.prototype.forEach.call(
                        that.base_day.querySelectorAll(hiding_days.join(', ')),
                        removeNode);
                }
            }

            // If selected day is not valid for new month reset it
            if (that.base_day.querySelector('option[value="'+that.base_day.value+'"]') === undefined) {
                that.base_day.value = '';
            }

            that.trigger();

            return;
        };
    };

    this.trigger = function() {
        if (this.base !== undefined) {
            //if (this.base.onchange instanceof Function)
            //    this.base.onchange();

            if ("createEvent" in document) {
                var evt = document.createEvent("HTMLEvents");
                evt.initEvent("change", false, true);
                this.base.dispatchEvent(evt);
            } else {
                this.base.fireEvent("onchange");
            }
        }
    };

    this.init = function() {
        this.resetDays(this);
        this.base_year.onchange = this.on_month_change();
        this.base_month.onchange = this.on_month_change();
        this.base_day.onchange = function(context){
            var that = context;
            return function(){
                that.trigger();
            };
        }(this);
    };

    this.init();
    return this;
}
