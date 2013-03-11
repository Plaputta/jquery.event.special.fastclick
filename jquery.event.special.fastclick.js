/*
 * jQuery Mobile Plugin: jQuery.Event.Special.Fastclick
 * http://nischenspringer.de/jquery/fastclick
 *
 * Copyright 2013 Tobias Plaputta
 * Released under the MIT license.
 * http://nischenspringer.de/license
 *
 */

(function ($) {
    var $contexts = $([]),
        ghostDuration = 800,
        ghostRange = 30,
        moveRange = 10,
        ghosts = [],
        fastclick = {};


    // If the browser triggers a click event after we've already done stuff in our fastclick -> kill it
    var killGhost = function (event) {
        var i, l;
        for (i = 0, l = ghosts.length; i < l; i++) {
            if (Math.abs(event.pageX - ghosts[i].x) < ghostRange && Math.abs(event.pageY - ghosts[i].y) < ghostRange) {
                event.stopImmediatePropagation();
                event.stopPropagation();
                event.preventDefault();
            }
        }
    };

    // remove first ghost from list
    var freeGhost = function () {
        ghosts.splice(0, 1);
    };

    // the special fastclick event
    $.event.special.fastclick = {
        touchstart: function (event) {
            // If you're experiencing problems, use stopPropagation here - but this will kill touch scroll scripts
            //event.stopPropagation();

            fastclick.startX = event.originalEvent.touches[0].pageX;
            fastclick.startY = event.originalEvent.touches[0].pageY;

            fastclick.hasMoved = false;

            // bind touchmove event to track movements
            $(this).on('touchmove', $.event.special.fastclick.touchmove);
        },

        touchmove: function (event) {
            if (Math.abs(event.originalEvent.touches[0].pageX - fastclick.startX) > moveRange || Math.abs(event.originalEvent.touches[0].pageX - fastclick.startY) > moveRange) {
                // moved too far, event must not be called
                fastclick.hasMoved = true;
                // false already, no need to track movement anymore
                $(this).off('touchmove', $.event.special.fastclick.touchmove);
            }
        },

        add: function (obj) {
            // before jquery 1.4.2 the function needed to be returned, now the handler needs to be replaced!
            var $this = $(this);
            $this.data('objHandlers')[obj.guid] = obj;

            var handler = obj.handler;
            obj.handler = function (event) {
                // handler is triggered - we don't need to track touchmove anymore
                $this.off('touchmove', $.event.special.fastclick.touchmove);
                // did we move? if not, trigger handler
                if (!fastclick.hasMoved) {

                    ghosts.push({x: fastclick.startX, y: fastclick.startY});
                    window.setTimeout(freeGhost, ghostDuration);

                    var self = this;
                    var $elements = $([]);
                    var args = arguments;
                    $.each($this.data('objHandlers'), function () {
                        // setup without delegation? check on element itself
                        // or: used delegation? grab all children matching the selector and check against each
                        if (!this.selector) {
                            if ($this[0] == event.target || $this.has(event.target).length > 0) handler.apply($this, args);
                        } else {
                            $(this.selector, $this).each(function () {
                                if (this == event.target  || $(this).has(event.target).length > 0) handler.apply(this, args);
                            });
                        }
                    });
                }
            };
        },

        setup: function (data, namespaces, eventHandle) {
            // adding context
            var $this = $(this);
            $contexts = $contexts.add($this);
            if (!$this.data('objHandlers')) {
                // setup data container and touchstart and touchend/touchcancel triggers (to be replaced by touchstart and touchend+touchcancel)
                $this.data('objHandlers', {});
                $this.on('touchstart', $.event.special.fastclick.touchstart);
                $this.on('touchend touchcancel', $.event.special.fastclick.handler);
            }
            // first setup? call ghostbuster for support ;)
            if (!fastclick.ghostbuster) {
                $(document).on('click vclick', killGhost);
                fastclick.ghostbuster = true;
            }
        },

        teardown: function (obj) {
            // unbind stuff
            var $this = $(this);
            $contexts = $contexts.not($this);
            $this.off('touchstart', $.event.special.fastclick.touchstart);
            $this.off('touchmove', $.event.special.fastclick.touchmove);
            $this.off('touchend touchcancel', $.event.special.fastclick.handler);
            // nothing bound? ghostbuster can rest...
            if ($contexts.length == 0) {
                $(document).off('click vclick', killGhost);
                fastclick.ghostbuster = false;
            }
        },

        remove: function (obj) {
            var $this = $(this);
            delete $this.data('objHandlers')[obj.guid];
        },

        handler: function (event) {
            event.type = 'fastclick';

            // before 1.9 your could use:
            //$.event.handle.apply( this, arguments );

            // this does not work:
            //$(this).triggerHandler("fastclick", arguments);

            // from 1.9 (also tested working with 1.8.2):
            $.event.trigger.call(this, event, {}, this, true);

        }
    };
})(jQuery);