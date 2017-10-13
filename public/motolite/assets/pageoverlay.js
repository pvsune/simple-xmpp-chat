/**
* Pageoverlay.
*
* Based on Lightbox v2.04 (see below), stripped-down to the overlay feature
*
* @fileoverview  Page overlay
*
* @package   ADAC
* @author    Murat Purc <m.purc@edelweiss72.de>
* @requires  Prototype JavaScript Framework
* @version   $Id: pageoverlay.js 3249 2010-03-22 13:08:04Z m.purc $
*
* Encodingtest: äöüß
*/

// -----------------------------------------------------------------------------------
//
//
//
//
//	Lightbox v2.04
//	by Lokesh Dhakar - http://www.lokeshdhakar.com
//	Last Modification: 2/9/08
//
//	For more information, visit:
//	http://lokeshdhakar.com/projects/lightbox2/
//
//	Licensed under the Creative Commons Attribution 2.5 License - http://creativecommons.org/licenses/by/2.5/
//  	- Free for use in both personal and commercial projects
//		- Attribution requires leaving author name, author link, and the license info intact.
//
//  Thanks: Scott Upton(uptonic.com), Peter-Paul Koch(quirksmode.com), and Thomas Fuchs(mir.aculo.us) for ideas, libs, and snippets.
//  		Artemy Tregubenko (arty.name) for cleanup and help in updating to latest ver of proto-aculous.
//
// -----------------------------------------------------------------------------------


/**
* Page overlay configuration
*
* @class
*/
PageOverlayOptions = Object.extend({

    /**
    * Enable elements visibility handler.
    *
    * Disable this, if you are using a own handler function, which controls the visibility status
    * of select, object and embed tags.
    *
    * @type {Boolean}
    */
    enableVisibilityHandler: false,

    /**
    * Background color
    * @type {String}
    */
    bgColor: "#ffffff",

    /**
    * Controls transparency of shadow overlay
    * @type {Float}
    */
    overlayOpacity: 0.8,

    /**
    * Toggles resizing animations
    * @type {Boolean}
    */
    animate: true,

    /**
    * z-index of overlay
    * @type {Integer}
    */
    zIndex: 1100

}, window.PageOverlayOptions || {});


// #############################################################################


/**
* Page overlay callback class.
*
* Usage:
* <code>
* // Register a callback function with one parameter
* var param = "foobar";
* var callback = new PageOverlayCallback("myCallbackFunction", param);
* var res = callback.execute();
* alert(res);
* function myCallbackFunction(text){
*     return "Argument: " + text;
* }
*
* // Register a callback function with multiple parameter
* var param = { someValue: "foo", anotherValue: "bar" };
* var callback = new PageOverlayCallback("myOtherCallbackFunction", param);
* var res = callback.execute();
* alert(res);
* function myOtherCallbackFunction(param){
*     return "Argument: " + param.someValue + param.anotherValue;
* }
* </code>
*
* @class
*/
PageOverlayCallback = Class.create({
    /** @lends PageOverlayCallback */

    /**
    * Callback function name
    * @type {String}
    */
    _function: null,

    /**
    * Parameter to pass to callback function
    * @type {Mixed}
    */
    _parameter: null,


    /**
    * Constructor of PageOverlayCallback, sets some properties
    *
    * @constructs
    *
    * @param {String}  func   callback function to register
    * @param {Object}  param  Parameter to pass to the callback function (optional)
    */
    initialize: function (func, param) {
        if (!window[func] || typeof window[func] != "function") {
            throw ("PageOverlayCallback: Callbackfunction '" + func + "' is not available");
        }

        // store obj and callback function
        this._function = func;

        if (typeof param !== "undefined") {
            this._parameter = param;
        }
    },


    /**
    * Executes the callbackfunction and returns the result of it.
    * @returns  {Mixed}
    */
    execute: function () {
        if (this._function == null) {
            return;
        }
        if (this._parameter !== null) {
            return window[this._function](this._parameter);
        } else {
            return window[this._function]();
        }
    }

});


// #############################################################################


/**
* Page overlay class
*
* @class
*/
PageOverlay = Class.create({
    /** @lends PageOverlay */

    _overlayDuration: null,

    _zIndex: 1,

    _active: null,

    _startCallback: null,

    _resizeCallback: null,

    _endCallback: null,

    _enableVisibilityHandler: false,

    _elementsVisibilityCache: [],

    _pageSizesCache: null,


    /**
    * Constructor runs on completion of the DOM loading.
    *
    * @constructs
    */
    initialize: function () {

        this._enableVisibilityHandler = PageOverlayOptions.enableVisibilityHandler;

        var ua = navigator.userAgent.toLowerCase();
        if (ua.indexOf("msie 6.") > -1 && ua.indexOf("msie 7.") == -1 && ua.indexOf("msie 8.") == -1) {
            this._enableVisibilityHandler = true;
        }
        this._overlayDuration = PageOverlayOptions.animate ? 0.4 : 0; // shadow fade in/out duration

        this._zIndex = PageOverlayOptions.zIndex;

        this._active = false; // flag about overlay active status

        // Code inserts html at the bottom of the page that looks similar to this:
        //  <div id="overlay"></div>
        var objBody = $$('body')[0];
        if (document.getElementById('ModalContent') && document.getElementById('FBK')) {
            objBody = $$('form')[0];
        }
        var overlay = $(Builder.node('div', { id: 'overlay' }));
        objBody.appendChild(overlay);

        //		this._overlay = $("overlay");
        //		this._overlay = $(overlay.id);
        this._overlay = overlay;

        // initial overlay styles (could also be outsourced to css a file)
        this._overlay.setStyle({
            display: "none",
            backgroundColor: PageOverlayOptions.bgColor,
            zIndex: PageOverlayOptions.zIndex,
            position: "absolute",
            top: "0px",
            left: "0px"
        });
    },


    /**
    * Set start callback handler
    *
    * @param {PageOverlayCallback} callback
    */
    setStartCallback: function (callback) {
        this._startCallback = callback;
        return this;
    },


    /**
    * Set resize callback handler
    *
    * @param {PageOverlayCallback} callback
    */
    setResizeCallback: function (callback) {
        this._resizeCallback = callback;
        return this;
    },


    /**
    * Set end callback handler
    *
    * @param {PageOverlayCallback} callback
    */
    setEndCallback: function (callback) {
        this._endCallback = callback;
        return this;
    },


    /**
    * Returns the overlay active status.
    *
    * @returns  {Boolean}
    */
    getActive: function () {
        return this._active;
    },


    /**
    * Shows the overlay
    */
    start: function () {
        this._elementsVisibilityHandler(false);

        // stretch overlay to fill page and fade in
        this.setDimensions(false);

        var that = this;
        new Effect.Appear(this._overlay, {
            duration: this._overlayDuration,
            from: 0.0,
            to: PageOverlayOptions.overlayOpacity,
            afterFinish: function () {
                that._active = true; // set active status after effect has finished, bcause of triggered window resize event in IE
                if (that._startCallback !== null) {
                    return that._startCallback.execute();
                }
            }
        });
    },


    /**
    * Sets the dimensions of page overlay.
    *
    * @param {Boolean}  isResize  Flag about invoke by window resize handler
    */
    setDimensions: function (isResize) {
        // stretch overlay to fill page
        var aPageSize = this._getPageSize();

        if (!this._pageSizesCache) {
            // initial storage of page size
            this._pageSizesCache = aPageSize;
        } else {
            var widthDiff = this._pageSizesCache[0] - aPageSize[0];
            var heightDiff = this._pageSizesCache[1] - aPageSize[1];
            if (widthDiff < 3 && widthDiff > -3 && heightDiff < 3 && heightDiff > -3) {
                // minimal resize, do nothing
                return;
            }
        }

        if (isResize == false) {
            $("overlay").setOpacity(0.0);
        }
        if (navigator.userAgent.indexOf('MSIE') > -1) {
            $("overlay").setStyle({
                width: aPageSize[0] + 'px',
                height: aPageSize[1] + 50 + 'px'
            });
        } else {

            $("overlay").setStyle({
                width: aPageSize[0] + 'px',
                height: aPageSize[1] + 'px'
            });
        }
        if (isResize == true) {
            if (this._resizeCallback !== null) {
                return this._resizeCallback.execute();
            }
        }
    },


    /**
    * Closes the overlay.
    */
    end: function () {
        this._active = false;
        var that = this;
        new Effect.Fade(this._overlay, {
            duration: this._overlayDuration,
            beforeStart: function () {
                if (that._endCallback !== null) {
                    return that._endCallback.execute();
                }
            },
            afterFinish: function () {
                that._elementsVisibilityHandler(true);
            }
        });
    },


    /**
    * Returns the actual page size
    *
    * @private
    * @returns  {Array}  Page size array (arr[0]=pageWidth and arr[1]=pageHeight)
    */
    _getPageSize: function () {
        var xScroll, yScroll;

        if (window.innerHeight && window.scrollMaxY) {
            xScroll = window.innerWidth + window.scrollMaxX;
            yScroll = window.innerHeight + window.scrollMaxY;
        } else if (document.body.scrollHeight > document.body.offsetHeight) { // all but Explorer Mac
            xScroll = document.body.scrollWidth;
            yScroll = document.body.scrollHeight;
        } else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
            xScroll = document.body.offsetWidth;
            yScroll = document.body.offsetHeight;
        }
        //console.log("xScroll", xScroll);
        //console.log("yScroll", yScroll);

        var windowWidth, windowHeight;

        if (self.innerHeight) {	// all except Explorer
            windowWidth = (document.documentElement.clientWidth) ? document.documentElement.clientWidth : self.innerWidth;
            windowHeight = self.innerHeight;
        } else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
            windowWidth = document.documentElement.clientWidth;
            windowHeight = document.documentElement.clientHeight;
        } else if (document.body) { // other Explorers
            windowWidth = document.body.clientWidth;
            windowHeight = document.body.clientHeight;
        }
        //console.log("windowWidth", windowWidth);

        // for small pages with total height less then height of the viewport
        pageHeight = (yScroll < windowHeight) ? windowHeight : yScroll;

        // for small pages with total width less then width of the viewport
        pageWidth = (xScroll < windowWidth) ? windowWidth : xScroll;

        return [pageWidth, pageHeight];
    },


    /**
    * Elements visibility handler. Used to hide or display several elements such
    * as select, object and embed during overlay process.
    *
    * @private
    * @param  {Boolean}  showThem
    */
    _elementsVisibilityHandler: function (showThem) {
        if (this._enableVisibilityHandler) {
            var style = (showThem) ? "visible" : "hidden";
            $$("#content select", "#content object", "#content embed").each(function (elem) {
                elem.style.visibility = style;
            });
        }
    }

});


ADAC.pageOverlay = null;

$(document).observe("dom:loaded", function () {
    ADAC.pageOverlay = new PageOverlay();
});


Event.observe(window, "resize", function () {
    if (ADAC.pageOverlay !== null && ADAC.pageOverlay.getActive()) {
        ADAC.pageOverlay.setDimensions(true);
    }
});
