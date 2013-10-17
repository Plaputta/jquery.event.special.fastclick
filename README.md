# jQuery Plugin: jQuery.Event.Special.Fastclick

This plugin is designed to make clicks on mobile devices more responsive.

Mobile browsers wait about 300ms after touchend before triggering click events, by using fastclick this delay is removed.

To prevent ghost clicks (because the browser still does trigger the click event after fastclick was triggered), any clicks on that area in a defined amount of time are cancelled.

This version has been tested on iOS browsers and in Google Chrome. 

If you have [Modernizr](http://modernizr.com/) included, binding `fastclick` will fallback on jQuery's `click` when the browser doesn't support touch.

## Usage

You can use fastclick just like any normal jQuery event.

Example:

    $('#myButton').on('fastclick', function() { alert("hello world"); });

Delegation/live events are also supported, just use:

    $('#myButtonSet').on('fastclick', '.aButton', function() { alert($(this).text()); });

## Demo

Take a look at [the demo](http://nischenspringer.de/jquery/fastclick/demo.html) using a mobile browser.

Copyright 2013 Tobias Plaputta

Released under the MIT license. http://nischenspringer.de/license