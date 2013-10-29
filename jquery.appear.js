/*
 * jQuery appear plugin
 *
 * Copyright (c) 2012 Andrey Sidorov
 * licensed under MIT license.
 *
 * https://github.com/morr/jquery.appear/
 *
 * Version: 0.3.3
 */
(function($) {
  var selectors = [];

  var check_binded = false;
  var check_lock = false;
  var $window = $(window);
  var defaults = {
    interval: 250,
    force_process: false,
    scrolling_parent: $window
  }

  var $prior_appeared;
  var scrolling_parent;

  function process() {
    check_lock = false;
    for (var index = 0; index < selectors.length; index++) {
      var $appeared = $(selectors[index]).filter(function() {
        return $(this).is(':appeared');
      });

      $appeared.trigger('appear', [$appeared]);

      if ($prior_appeared) {
        var $disappeared = $prior_appeared.not($appeared);
        $disappeared.trigger('disappear', [$disappeared]);
      }
      $prior_appeared = $appeared;
    }
  }

  // "appeared" custom filter
  $.expr[':']['appeared'] = function(element) {
    var $element = $(element);
    if (!$element.is(':visible')) {
      return false;
    }

    var offset = $element.offset();
    // calculate pos of element relative to the visible part of the scrolling_parent
    var left = offset.left - scrolling_parent.offset().left;
    var top = offset.top - scrolling_parent.offset().top;

    if ((top + $element.height() >= 0) &&
        (top - ($element.data('appear-top-offset') || 0) <= scrolling_parent.height()) &&
        (left + $element.width() >= 0) &&
        (left - ($element.data('appear-left-offset') || 0) <= scrolling_parent.width())) {
      return true;
    } else {
      return false;
    }
  }

  $.fn.extend({
    // watching for element's appearance in browser viewport
    appear: function(options) {
      var opts = $.extend({}, defaults, options || {});
      var selector = this.selector || this;
      if (!check_binded) {
        var on_check = function() {
          if (check_lock) {
            return;
          }
          check_lock = true;

          setTimeout(process, opts.interval);
        };

        scrolling_parent = opts.scrolling_parent;
        scrolling_parent.scroll(on_check);
        // resize event is only triggered for $window so no point setting it on scrolling_parent
        // if scrolling_parent is resizeable you should make sure your resizing code calls .resize()
        $window.resize(on_check);

        check_binded = true;
      }

      if (opts.force_process) {
        setTimeout(process, opts.interval);
      }
      selectors.push(selector);
      return $(selector);
    }
  });

  $.extend({
    // force elements's appearance check
    force_appear: function() {
      if (check_binded) {
        process();
        return true;
      };
      return false;
    }
  });
})(jQuery);
