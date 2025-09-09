/******/ (() => { // webpackBootstrap
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other entry modules.
(() => {
/*!******************************************************!*\
  !*** ./storelocator/static/storelocator/js/index.js ***!
  \******************************************************/
// smokeshop/storelocator/static/storelocator/js/index.js

// --------------------
// Age Verification Modal
// --------------------
document.addEventListener('DOMContentLoaded', function () {
  var ageModal = document.getElementById('age-modal');
  var ageYes = document.getElementById('ageYes');
  var ageNo = document.getElementById('ageNo');
  var pageContent = document.getElementById('page-content'); // Reference to the page content

  if (ageModal) {
    ageModal.style.display = 'flex';
    document.body.classList.add('modal-active');

    // Add the 'no-animations' class to pause animations
    if (pageContent) {
      pageContent.classList.add('no-animations');
    }
    ageYes === null || ageYes === void 0 || ageYes.addEventListener('click', function () {
      ageModal.style.display = 'none';
      document.body.classList.remove('modal-active');

      // Remove the 'no-animations' class to enable animations
      if (pageContent) {
        pageContent.classList.remove('no-animations');
      }
    });
    ageNo === null || ageNo === void 0 || ageNo.addEventListener('click', function () {
      window.location.href = 'https://www.google.com';
    });
  }
});
document.addEventListener("DOMContentLoaded", function () {
  var navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", function () {
    if (window.scrollY > 50) {
      // adjust threshold if needed
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
});

// --------------------
// Theme Toggle Functionality
// --------------------
function initializeThemeToggle() {
  var themeToggleCheckbox = document.getElementById("theme-toggle");
  var root = document.documentElement;
  var notification = document.getElementById("theme-notification");
  var notificationText = document.getElementById("notification-text");
  if (themeToggleCheckbox) {
    var setTheme = function setTheme(theme) {
      root.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);

      // Show theme notification
      if (notification && notificationText) {
        notificationText.textContent = "Theme changed to ".concat(theme, " mode");
        notification.style.opacity = "1";
        notification.style.transform = "translateX(0)";
        notification.style.pointerEvents = "auto";

        // Hide notification after 3 seconds
        setTimeout(function () {
          notification.style.opacity = "0";
          notification.style.transform = "translateX(30px)";
          notification.style.pointerEvents = "none";
        }, 3000);
      }
    };
    var savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    themeToggleCheckbox.checked = savedTheme === "dark";
    themeToggleCheckbox.addEventListener("change", function () {
      var newTheme = themeToggleCheckbox.checked ? "dark" : "light";
      setTheme(newTheme);
    });
  }
}
document.addEventListener('DOMContentLoaded', initializeThemeToggle);

// --------------------
// Update CSS Variable for Header Height
// --------------------
function updateHeaderHeight() {
  var header = document.querySelector('header');
  if (header) {
    var headerHeight = header.offsetHeight;
    document.documentElement.style.setProperty('--header-height', "".concat(headerHeight, "px"));
  }
}
window.addEventListener('resize', updateHeaderHeight);
document.addEventListener('DOMContentLoaded', updateHeaderHeight);

// --------------------
// Thumbnail gallery functionality
// --------------------
document.addEventListener('DOMContentLoaded', function () {
  var thumbnails = document.querySelectorAll('.cigar-thumbnail');
  var featuredImage = document.querySelector('.featured-cigar');

  // Store original featured image for reset
  var originalFeatured = featuredImage ? featuredImage.src : '';
  if (thumbnails.length > 0 && featuredImage) {
    // Function to handle thumbnail selection
    var selectThumbnail = function selectThumbnail(thumbnail) {
      // Remove active class from all thumbnails
      thumbnails.forEach(function (t) {
        return t.classList.remove('active');
      });

      // Add active class to clicked thumbnail
      thumbnail.classList.add('active');

      // Swap images with animation
      featuredImage.style.opacity = '0';
      setTimeout(function () {
        featuredImage.src = thumbnail.src;
        featuredImage.style.opacity = '1';
      }, 300);
    }; // Click event for thumbnails
    thumbnails.forEach(function (thumbnail) {
      thumbnail.addEventListener('click', function () {
        selectThumbnail(this);
      });

      // Keyboard accessibility
      thumbnail.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectThumbnail(this);
        }
      });
    });

    // Preload images for smoother transitions
    thumbnails.forEach(function (thumbnail) {
      var img = new Image();
      img.src = thumbnail.src;
    });
  }
});
})();

// This entry needs to be wrapped in an IIFE because it needs to be isolated against other entry modules.
(() => {
/*!****************************************************!*\
  !*** ./storelocator/static/storelocator/js/map.js ***!
  \****************************************************/
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
// smokeshop/storelocator/static/storelocator/js/map.js

// Global variables
var map;
var markers = [];
var storesDataGlobal = [];
var currentStoreId = null;
var currentInfoWindow = null;
function createAdvancedMarker(store, AdvancedMarkerElement, map) {
  var markerContent = document.createElement("div");
  markerContent.className = "advanced-marker";
  var icon = document.createElement("i");
  icon.className = "fa fa-map-marker-alt marker-icon"; // Your icon
  icon.setAttribute("aria-hidden", "true");
  icon.alt = store.name;
  markerContent.appendChild(icon);
  var marker = new AdvancedMarkerElement({
    position: {
      lat: parseFloat(store.latitude),
      lng: parseFloat(store.longitude)
    },
    map: map,
    title: store.name,
    content: markerContent
  });

  // Store properties for later lookup.
  marker.storeId = store.id;
  marker.storeData = store;

  // 🔑 Make marker clickable
  markerContent.style.cursor = "pointer"; // Show pointer cursor
  markerContent.addEventListener("click", function () {
    map.setCenter(marker.position);
    stepZoomWithCallback(19, 250, function () {
      currentStoreId = store.id;
      openInfoWindow(marker);
    });
  });
  return marker;
}

// Discrete step-based zoom that accepts a callback.
function stepZoomWithCallback(targetZoom) {
  var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 150;
  var callback = arguments.length > 2 ? arguments[2] : undefined;
  var currentZoom = map.getZoom();
  if (currentZoom === targetZoom) {
    if (callback) callback();
    return;
  }
  var step = targetZoom > currentZoom ? 1 : -1;
  map.setZoom(currentZoom + step);
  setTimeout(function () {
    return stepZoomWithCallback(targetZoom, delay, callback);
  }, delay);
}
function openInfoWindow(marker) {
  if (currentInfoWindow) {
    currentInfoWindow.close();
  }
  setTimeout(function () {
    var store = marker.storeData;
    var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    var directionsUrl = isMobile ? "https://maps.apple.com/?daddr=".concat(store.latitude, ",").concat(store.longitude, "&dirflg=d") : "https://www.google.com/maps/dir/?api=1&destination=".concat(store.latitude, ",").concat(store.longitude);
    var contentString = "\n            <div class=\"info-window fade-in\">\n                <h3>".concat(store.name, "</h3>\n                <p class=\"info-address\">").concat(store.address, "</p>\n                <p class=\"info-city\">").concat(store["city__name"], ", ").concat(store.city__state__abbreviation, " ").concat(store.zip_code, "</p>\n                <p class=\"info-phone\"><b>Phone:</b> ").concat(store.phone_number, "</p>\n                <p class=\"info-email\"><b>Email:</b> ").concat(store.email, "</p>\n                <p class=\"info-hours\"><b>Hours:</b> ").concat(store.opening_hour, " - ").concat(store.closing_hour, " </p>\n                <a href=\"").concat(directionsUrl, "\" target=\"_blank\" class=\"get-directions\">Get Directions</a>\n            </div>\n        ");
    currentInfoWindow = new google.maps.InfoWindow({
      content: contentString
    });
    currentInfoWindow.open(map, marker);
  }, 150); // brief pause
}
function zoomToStore(storeId) {
  // Close any existing info window immediately.
  if (currentInfoWindow) {
    currentInfoWindow.close();
  }
  var marker = markers.find(function (m) {
    return m.storeId == storeId;
  });
  if (marker) {
    // If a store is already selected and it differs from the newly requested store,
    // zoom out to a default level first (e.g., 12) then re-center and zoom in.
    if (currentStoreId !== null && currentStoreId !== storeId) {
      stepZoomWithCallback(12, 250, function () {
        // After zooming out, center on the new marker and zoom in.
        map.setCenter(marker.position);
        stepZoomWithCallback(19, 300, function () {
          currentStoreId = storeId;
          openInfoWindow(marker);
        });
      });
    } else {
      // If no store is currently selected, or if the same store is selected,
      // just center on it and zoom in.
      map.setCenter(marker.position);
      stepZoomWithCallback(19, 250, function () {
        currentStoreId = storeId;
        openInfoWindow(marker);
      });
    }
  }
}
function initMap() {
  return _initMap.apply(this, arguments);
}
function _initMap() {
  _initMap = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
    var _yield$google$maps$im, Map, _yield$google$maps$im2, AdvancedMarkerElement, center;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return google.maps.importLibrary("maps");
        case 2:
          _yield$google$maps$im = _context.sent;
          Map = _yield$google$maps$im.Map;
          _context.next = 6;
          return google.maps.importLibrary("marker");
        case 6:
          _yield$google$maps$im2 = _context.sent;
          AdvancedMarkerElement = _yield$google$maps$im2.AdvancedMarkerElement;
          // Default center (adjust as needed)
          center = {
            lat: 28.28562,
            lng: -81.63381
          };
          map = new Map(document.getElementById("map"), {
            zoom: 10.5,
            center: center,
            mapTypeId: "hybrid",
            mapId: "map"
          });

          // Parse store data once and create markers.
          storesDataGlobal = JSON.parse(document.getElementById("stores-data").textContent);
          storesDataGlobal.forEach(function (store) {
            if (store.latitude && store.longitude) {
              var marker = createAdvancedMarker(store, AdvancedMarkerElement, map);
              markers.push(marker);
            }
          });
        case 12:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return _initMap.apply(this, arguments);
}
function getDirections(storeAddress) {
  var isAppleDevice = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  var baseUrl = isAppleDevice ? "https://maps.apple.com/?daddr=" : "https://www.google.com/maps/dir/?api=1&destination=";
  var encodedAddress = encodeURIComponent(storeAddress);
  window.open(baseUrl + encodedAddress, '_blank');
}

// Place this in a JS file that loads on your page (after the DOM is ready)
document.addEventListener("DOMContentLoaded", function () {
  var addressForm = document.getElementById("address-form");
  addressForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent page reload

    var formData = new FormData(this);
    var params = new URLSearchParams(formData);
    var indexUrl = addressForm.getAttribute("data-url");
    fetch(indexUrl + "?" + params.toString(), {
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      }
    }).then(function (response) {
      return response.json();
    }).then(function (data) {
      if (data.closest_store) {
        zoomToStore(data.closest_store.id);
      } else if (data.errors) {
        alert("Error: " + JSON.stringify(data.errors));
      } else {
        alert("No store found or geocoding failed.");
      }
    })["catch"](function (error) {
      console.error("Error:", error);
    });
  });
});

// --------------------
// Expose Global Functions for API Callbacks
// --------------------
window.initMap = initMap;
window.zoomToStore = zoomToStore;
// Expose the function globally
window.getDirections = getDirections;
})();

/******/ })()
;
//# sourceMappingURL=bundle.js.map