;(function (w, $, undefined) {

  var methods = {} // external method api
    , supports3D = true // set during vendorPrefix determination
    , slideAnimators = {} // map of animation effect objects
    , defaults = { // default required settings
        speed: 800
      , timeout: 5000
      , autoScroll: false
      , pauseOnHover: false
      , effect: 'scrollVert3d'
      , perspective: 1000
    };

  w.jqBoxSlider = methods; // Global alias for easy extension

  // API methods ---------------------------------------------------------------

  // sets up all selected boxes with applied options
  methods.init = function (opts) {
    var defaultSettings = $.extend({}, defaults, opts)
      , animator = methods.slideAnimator(defaultSettings.effect);

    return this.each(function () {
      var $this = $(this)
        , $slides = $this.children()
        , settings = $.extend({}, defaultSettings);

      $this.data('bssettings', settings);
      settings.slideAnimator = animator;
      settings.slideAnimator.initialize($this, $slides, settings);
      setupControls($this, settings);

      if (settings.autoScroll) {
        settings.autointv = setInterval(function () {
          showNextSlide($this);
        }, settings.timeout + settings.speed);

        if (settings.pauseOnHover) {
          $this.on('hover', togglePlayPause);
        }
      }
    });
  };

  // toggles the autoplay state for each slider
  methods.playPause = function () {
    return this.each(function (i, el) {
      togglePlayPause.call($(this));
    });
  };

  // show the slide at the given index
  methods.showSlide = function (index) {
    index = parseInt(index, 10);
    return this.each(function () {
      var $box = $(this);

      resetAutoScroll($box);
      showNextSlide($box, index);
    });
  };
  
  // moves the slider to the next slide
  methods.next = function () {
    return this.each(function () {
      var $box = $(this);
      
      showNextSlide($box);
    });
  };
  
  // moves the slider to the previous slide
  methods.prev = function () {
    return this.each(function () {
      var $box = $(this);
      
      showNextSlide($box, null, true);
    });
  };

  // registers and configures a slide animator
  methods.registerAnimator = function (names, animator) {
    $.each(names.split(','), function (i, name) {
      slideAnimators[name] = animator;
    });

    animator._cacheOriginalCSS = cacheCSS;

    if (typeof animator.configure === 'function') {
      animator.configure(supports3D, vendorPrefix);
    }
  };

  // returns a slide animation adaptor
  methods.slideAnimator = function (effect) {
    if (typeof slideAnimators[effect] === 'object') {
      return slideAnimators[effect];
    }
    throw new Error(
      'The slide animator for the ' + effect +
      ' effect has not been registered'
    );
  };

  // sets or gets an option for the set of matched sliders
  methods.option = function (setting, newValue) {
    if (typeof newValue === 'undefined') {
      return (this.data('bssettings') || {})[setting];
    }

    return this.each(function (i, el) {
      var $box = $(this)
        , settings = $box.data('bssettings') || {};

      settings[setting] = newValue;
      resetAutoScroll($box, settings);

      if (setting === 'effect') {
        settings.slideAnimator.destroy($box, settings);
        settings.slideAnimator = methods.slideAnimator(newValue);
        settings._slideFilter = null;
        settings.bsfaceindex = 0;
        settings.slideAnimator.initialize($box, $box.children(), settings);
        return;
      }

      if (typeof settings.slideAnimator.reset === 'function') {
        settings.slideAnimator.reset($box, settings);
      }
    });
  };

  // destroy the plugin for the selected sliders
  methods.destroy = function () {
    return this.each(function () {
      var $box = $(this)
        , data = $box.data() || {}
        , settings = data.bssettings;

      if (settings && typeof settings.slideAnimator === 'object') {
        if (settings.autointv) {
          clearInterval(settings.autointv);
        }
        // ----------------------------------------------------------- TODO unbind control event listeners
        settings.slideAnimator.destroy($box, settings);
      }
    });
  };

  // Event listeners and controls ----------------------------------------------

  // initialise controls for $box
  var setupControls = function ($box, settings) {
    var $controls = $();

    if (settings.next != null) {
      $controls = $controls.add($(settings.next).on(
        'click', { reverse: false }, nextSlideListener
      ));
    }

    if (settings.prev != null) {
      $controls = $controls.add($(settings.prev).on(
        'click', { reverse: true }, nextSlideListener
      ));
    }

    if (settings.pause != null) {
      $controls = $controls.add($(settings.pause).on(
        'click', playPauseListener
      ));
    }

    $controls.data('bsbox', $box);
  };

  // event listener for a next button
  var nextSlideListener = function (ev) {
    var $box = $(this).data('bsbox');

    resetAutoScroll($box);
    showNextSlide($box, undefined, ev.data.reverse);
    ev.preventDefault();
  };

  // event listener for play pause button
  var playPauseListener = function (ev) {
    var $this = $(this)
      , $box = $this.data('bsbox');

    togglePlayPause.call($box);
    $this.toggleClass('paused');
    ev.preventDefault();
  };

  // event listener for pause on hover
  var togglePlayPause = function (ev, reset, settings) {
    var $box = $(this)
      , playing;

    settings || (settings = $box.data('bssettings'));
    playing = settings.autointv != null;

    if (typeof settings.onplaypause === 'function') {
      settings.onplaypause.call($box, playing ? 'pause' : 'play');
    }

    if (playing || reset) {
      settings.autointv = clearInterval(settings.autointv);
      if (!reset) return;
    }

    settings.autointv = setInterval(function () {
      showNextSlide($box);
    }, settings.timeout + settings.speed);
  };

  // moves the slider to the next or previous slide
  var showNextSlide = function ($box, index, reverse) {
    var settings = $box.data('bssettings')
      , $slides = $box.children()
      , currIndex
      , nextIndex
      , $currSlide
      , $nextSlide;

    // apply slide filter so we only have the content slides
    if (settings._slideFilter != null) {
      if (typeof settings._slideFilter === 'function') {
        $slides = $slides.filter(function (index) {
          return settings._slideFilter.call($slides, index, settings);
        });
      }
      else {
        $slides = $slides.filter(settings.slideFilter);
      }
    }

    currIndex = settings.bsfaceindex || 0;
    nextIndex = calculateIndex(currIndex, $slides.length, reverse, index);

    // only go forward if not already in motion
    // and user defined index is not out of bounds
    if ($box.hasClass('jbs-in-motion') || nextIndex === -1) return;

    $currSlide = $slides.eq(currIndex);
    $nextSlide = $slides.eq(nextIndex);
    $box.addClass('jbs-in-motion'); // stops user clunking through faces ----- FIXME: queue user clicks and keep rotating the box

    if (typeof settings.onbefore === 'function') {
      settings.onbefore.call($box, $currSlide, $nextSlide, currIndex, nextIndex);
    }

    // add additional settings for the transition and
    // call the slide animation
    $.extend(settings, settings.slideAnimator.transition($.extend({
        $box: $box
      , $slides: $slides
      , $currSlide: $currSlide
      , $nextSlide: $nextSlide
      , reverse: reverse
      , currIndex: currIndex
      , nextIndex: nextIndex
    }, settings)));

    setTimeout( // remove the active flag class once transition is complete
        function () {
          $box.removeClass('jbs-in-motion');
          if (typeof settings.onafter === 'function') {
            settings.onafter.call($box, $currSlide, $nextSlide, currIndex, nextIndex);
          }
        }
      , settings.speed
    );

    // cache settings for next transition
    settings.bsfaceindex = nextIndex;
  };

  // if the box is autoscrolling it is reset
  var resetAutoScroll = function ($box, settings) {
    settings || (settings = $box.data('bssettings') || {});

    if (settings.autoScroll) {
      togglePlayPause.call($box, undefined, true, settings);
    }
  };

  // get the next slides index
  var calculateIndex = function (currIndex, slidesLen, reverse, index) {
    var nextIndex = index;

    if (nextIndex == null) { // came from next button click
      if (reverse) {
        nextIndex = currIndex - 1 < 0 ? slidesLen - 1 : currIndex - 1;
      }
      else {
        nextIndex = currIndex + 1 < slidesLen ? currIndex + 1 : 0;
      }
    }

    if ( // already on selected slide or incorrect index
      nextIndex === currIndex ||
      nextIndex >= slidesLen ||
      nextIndex < 0
    ) { return -1; }

    return nextIndex;
  };

  // caches the desired css for reapplying the original styling when
  // the plugin is destroyed or reset
  var cacheCSS = function ($el, name, settings, extraAtts) {
    var attributes = [
      'position',   'top',    'left',   'display',  'overflow',
      'width',      'height'
    ].concat(extraAtts || []);
    settings.origCSS || (settings.origCSS = {});
    settings.origCSS[name] || (settings.origCSS[name] = {});

    $.each(attributes, function (i, att) {
      settings.origCSS[name][att] = $el.css(att);
    });
  };

  // set the correct vendor prefix for the css properties
  var vendorPrefix = (function () {
    var bs = document.body.style
      , prefix = '';

    if ('webkitTransition' in bs) {
      prefix = '-webkit-';
    }

    if ('MozTransition' in bs) {
      prefix = '-moz-';
    }

    supports3D = (
      'webkitPerspective' in bs ||
      'MozPerspective' in bs ||
      'perspective' in bs
    );
    return prefix;
  }());


  $.fn.boxSlider = function (m) {
    if (typeof m === 'string' && typeof methods[m] === 'function') {
      return methods[m].apply(this, Array.prototype.slice.call(arguments, 1));
    }

    return methods.init.apply(this, arguments);
  };

}(window, jQuery || Zepto));


/* Modernizr 2.5.3 (Custom Build) | MIT & BSD
 * Build: http://www.modernizr.com/download/#-shiv-load
 */
;window.Modernizr=function(a,b,c){function t(a){i.cssText=a}function u(a,b){return t(prefixes.join(a+";")+(b||""))}function v(a,b){return typeof a===b}function w(a,b){return!!~(""+a).indexOf(b)}function x(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:v(f,"function")?f.bind(d||b):f}return!1}var d="2.5.3",e={},f=b.documentElement,g="modernizr",h=b.createElement(g),i=h.style,j,k={}.toString,l={},m={},n={},o=[],p=o.slice,q,r={}.hasOwnProperty,s;!v(r,"undefined")&&!v(r.call,"undefined")?s=function(a,b){return r.call(a,b)}:s=function(a,b){return b in a&&v(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=p.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(p.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(p.call(arguments)))};return e});for(var y in l)s(l,y)&&(q=y.toLowerCase(),e[q]=l[y](),o.push((e[q]?"":"no-")+q));return t(""),h=j=null,function(a,b){function g(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function h(){var a=k.elements;return typeof a=="string"?a.split(" "):a}function i(a){var b={},c=a.createElement,e=a.createDocumentFragment,f=e();a.createElement=function(a){var e=(b[a]||(b[a]=c(a))).cloneNode();return k.shivMethods&&e.canHaveChildren&&!d.test(a)?f.appendChild(e):e},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+h().join().replace(/\w+/g,function(a){return b[a]=c(a),f.createElement(a),'c("'+a+'")'})+");return n}")(k,f)}function j(a){var b;return a.documentShived?a:(k.shivCSS&&!e&&(b=!!g(a,"article,aside,details,figcaption,figure,footer,header,hgroup,nav,section{display:block}audio{display:none}canvas,video{display:inline-block;*display:inline;*zoom:1}[hidden]{display:none}audio[controls]{display:inline-block;*display:inline;*zoom:1}mark{background:#FF0;color:#000}")),f||(b=!i(a)),b&&(a.documentShived=b),a)}var c=a.html5||{},d=/^<|^(?:button|form|map|select|textarea)$/i,e,f;(function(){var a=b.createElement("a");a.innerHTML="<xyz></xyz>",e="hidden"in a,f=a.childNodes.length==1||function(){try{b.createElement("a")}catch(a){return!0}var c=b.createDocumentFragment();return typeof c.cloneNode=="undefined"||typeof c.createDocumentFragment=="undefined"||typeof c.createElement=="undefined"}()})();var k={elements:c.elements||"abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video",shivCSS:c.shivCSS!==!1,shivMethods:c.shivMethods!==!1,type:"default",shivDocument:j};a.html5=k,j(b)}(this,b),e._version=d,e}(this,this.document),function(a,b,c){function d(a){return o.call(a)=="[object Function]"}function e(a){return typeof a=="string"}function f(){}function g(a){return!a||a=="loaded"||a=="complete"||a=="uninitialized"}function h(){var a=p.shift();q=1,a?a.t?m(function(){(a.t=="c"?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){a!="img"&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l={},o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};y[c]===1&&(r=1,y[c]=[],l=b.createElement(a)),a=="object"?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),a!="img"&&(r||y[c]===2?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i(b=="c"?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),p.length==1&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=a.opera&&o.call(a.opera)=="[object Opera]",l=!!b.attachEvent&&!l,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return o.call(a)=="[object Array]"},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,i){var j=b(a),l=j.autoCallback;j.url.split(".").pop().split("?").shift(),j.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("/").pop().split("?")[0]]||h),j.instead?j.instead(a,e,f,g,i):(y[j.url]?j.noexec=!0:y[j.url]=1,f.load(j.url,j.forceCSS||!j.forceJS&&"css"==j.url.split(".").pop().split("?").shift()?"c":c,j.noexec,j.attrs,j.timeout),(d(e)||d(l))&&f.load(function(){k(),e&&e(j.origUrl,i,g),l&&l(j.origUrl,i,g),y[j.url]=2})))}function i(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var j,l,m=this.yepnope.loader;if(e(a))g(a,0,m,0);else if(w(a))for(j=0;j<a.length;j++)l=a[j],e(l)?g(l,0,m,0):w(l)?B(l):Object(l)===l&&i(l,m);else Object(a)===a&&i(a,m)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,b.readyState==null&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}}(this,document),Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0))}; 