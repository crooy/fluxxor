(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Fluxxor"] = factory();
	else
		root["Fluxxor"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 13);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultDispatchInterceptor = function defaultDispatchInterceptor(action, dispatch) {
  dispatch(action);
};

var hasOverlap = function hasOverlap(a, b) {
  return a.find(function (x) {
    return b.indexOf(x) !== -1;
  });
};

var Dispatcher = function () {
  function Dispatcher(stores) {
    _classCallCheck(this, Dispatcher);

    this.stores = {};
    this.currentDispatch = null;
    this.currentActionType = null;
    this.waitingToDispatch = [];
    this.dispatchInterceptor = defaultDispatchInterceptor;
    this._boundDispatch = this._dispatch.bind(this);

    for (var key in stores) {
      if (stores.hasOwnProperty(key)) {
        this.addStore(key, stores[key]);
      }
    }
  }

  _createClass(Dispatcher, [{
    key: "addStore",
    value: function addStore(name, store) {
      store.dispatcher = this;
      this.stores[name] = store;
    }
  }, {
    key: "dispatch",
    value: function dispatch(action) {
      this.dispatchInterceptor(action, this._boundDispatch);
    }
  }, {
    key: "_dispatch",
    value: function _dispatch(action) {
      var _this = this;

      if (!action || !action.type) {
        throw new Error("Can only dispatch actions with a 'type' property");
      }

      if (this.currentDispatch) {
        var complaint = "Cannot dispatch an action ('" + action.type + "') while another action ('" + this.currentActionType + "') is being dispatched";
        throw new Error(complaint);
      }

      this.waitingToDispatch = _extends({}, this.stores);

      this.currentActionType = action.type;

      this.currentDispatch = {};
      Object.keys(this.stores).forEach(function (k) {
        _this.currentDispatch[k] = {
          resolved: false,
          waitingOn: [],
          waitCallback: null
        };
      });

      try {
        this.doDispatchLoop(action);
      } finally {
        this.currentActionType = null;
        this.currentDispatch = null;
      }
    }
  }, {
    key: "doDispatchLoop",
    value: function doDispatchLoop(action) {
      var _this2 = this;

      var dispatch = void 0;
      var canBeDispatchedTo = void 0;
      var wasHandled = false;
      var removeFromDispatchQueue = [];
      var dispatchedThisLoop = [];

      Object.keys(this.waitingToDispatch).forEach(function (key) {
        dispatch = _this2.currentDispatch[key];
        canBeDispatchedTo = !dispatch.waitingOn.length || !hasOverlap(dispatch.waitingOn, Object.keys(_this2.waitingToDispatch));

        if (canBeDispatchedTo) {
          if (dispatch.waitCallback) {
            var stores = dispatch.waitingOn.map(function (keyVal) {
              return _this2.stores[keyVal];
            });
            var fn = dispatch.waitCallback;
            dispatch.waitCallback = null;
            dispatch.waitingOn = [];
            dispatch.resolved = true;
            fn.apply(undefined, _toConsumableArray(stores));
            wasHandled = true;
          } else {
            dispatch.resolved = true;
            var handled = _this2.stores[key].__handleAction__(action);
            if (handled) {
              wasHandled = true;
            }
          }

          dispatchedThisLoop.push(key);

          if (_this2.currentDispatch[key].resolved) {
            removeFromDispatchQueue.push(key);
          }
        }
      });

      if (Object.keys(this.waitingToDispatch).length && !dispatchedThisLoop.length) {
        var storesWithCircularWaits = Object.keys(this.waitingToDispatch).join(", ");
        throw new Error("Indirect circular wait detected among: " + storesWithCircularWaits);
      }

      removeFromDispatchQueue.forEach(function (key) {
        delete _this2.waitingToDispatch[key];
      });

      if (Object.keys(this.waitingToDispatch).length) {
        this.doDispatchLoop(action);
      }

      if (!wasHandled && console && console.warn) {
        console.warn("An action of type " + action.type + " was dispatched, but no store handled it");
      }
    }
  }, {
    key: "waitForStores",
    value: function waitForStores(store, stores, fn) {
      var _this3 = this;

      if (!this.currentDispatch) {
        throw new Error("Cannot wait unless an action is being dispatched");
      }

      var waitingStoreName = Object.keys(this.stores).find(function (k) {
        return _this3.stores[k] === store;
      });

      if (stores.indexOf(waitingStoreName) > -1) {
        throw new Error("A store cannot wait on itself");
      }

      var dispatch = this.currentDispatch[waitingStoreName];

      if (dispatch.waitingOn.length) {
        throw new Error(waitingStoreName + " already waiting on stores");
      }

      stores.forEach(function (storeName) {
        var storeDispatch = _this3.currentDispatch[storeName];
        if (!_this3.stores[storeName]) {
          throw new Error("Cannot wait for non-existent store " + storeName);
        }
        if (storeDispatch.waitingOn.indexOf(waitingStoreName) > -1) {
          throw new Error("Circular wait detected between " + waitingStoreName + " and " + storeName);
        }
      });

      dispatch.resolved = false;
      var newStores = stores.filter(function (x) {
        return dispatch.waitingOn.indexOf(x) === -1;
      });
      dispatch.waitingOn = dispatch.waitingOn.concat(newStores);
      dispatch.waitCallback = fn;
    }
  }, {
    key: "setDispatchInterceptor",
    value: function setDispatchInterceptor(fn) {
      if (fn) {
        this.dispatchInterceptor = fn;
      } else {
        this.dispatchInterceptor = defaultDispatchInterceptor;
      }
    }
  }]);

  return Dispatcher;
}();

exports.default = Dispatcher;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var has = Object.prototype.hasOwnProperty
  , prefix = '~';

/**
 * Constructor to create a storage for our `EE` objects.
 * An `Events` instance is a plain object whose properties are event names.
 *
 * @constructor
 * @api private
 */
function Events() {}

//
// We try to not inherit from `Object.prototype`. In some engines creating an
// instance in this way is faster than calling `Object.create(null)` directly.
// If `Object.create(null)` is not supported we prefix the event names with a
// character to make sure that the built-in object properties are not
// overridden or used as an attack vector.
//
if (Object.create) {
  Events.prototype = Object.create(null);

  //
  // This hack is needed because the `__proto__` property is still inherited in
  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
  //
  if (!new Events().__proto__) prefix = false;
}

/**
 * Representation of a single event listener.
 *
 * @param {Function} fn The listener function.
 * @param {Mixed} context The context to invoke the listener with.
 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
 * @constructor
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() {
  this._events = new Events();
  this._eventsCount = 0;
}

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @api public
 */
EventEmitter.prototype.eventNames = function eventNames() {
  var names = []
    , events
    , name;

  if (this._eventsCount === 0) return names;

  for (name in (events = this._events)) {
    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
};

/**
 * Return the listeners registered for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Boolean} exists Only check if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event
    , available = this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Calls each of the listeners registered for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @returns {Boolean} `true` if the event had listeners, else `false`.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if (listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Add a listener for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Function} fn The listener function.
 * @param {Mixed} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this)
    , evt = prefix ? prefix + event : event;

  if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;
  else if (!this._events[evt].fn) this._events[evt].push(listener);
  else this._events[evt] = [this._events[evt], listener];

  return this;
};

/**
 * Add a one-time listener for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Function} fn The listener function.
 * @param {Mixed} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true)
    , evt = prefix ? prefix + event : event;

  if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;
  else if (!this._events[evt].fn) this._events[evt].push(listener);
  else this._events[evt] = [this._events[evt], listener];

  return this;
};

/**
 * Remove the listeners of a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Function} fn Only remove the listeners that match this function.
 * @param {Mixed} context Only remove the listeners that have this context.
 * @param {Boolean} once Only remove one-time listeners.
 * @returns {EventEmitter} `this`.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return this;
  if (!fn) {
    if (--this._eventsCount === 0) this._events = new Events();
    else delete this._events[evt];
    return this;
  }

  var listeners = this._events[evt];

  if (listeners.fn) {
    if (
         listeners.fn === fn
      && (!once || listeners.once)
      && (!context || listeners.context === context)
    ) {
      if (--this._eventsCount === 0) this._events = new Events();
      else delete this._events[evt];
    }
  } else {
    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
      if (
           listeners[i].fn !== fn
        || (once && !listeners[i].once)
        || (context && listeners[i].context !== context)
      ) {
        events.push(listeners[i]);
      }
    }

    //
    // Reset the array, or remove it completely if we have no more listeners.
    //
    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
    else if (--this._eventsCount === 0) this._events = new Events();
    else delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners, or those of the specified event.
 *
 * @param {String|Symbol} [event] The event name.
 * @returns {EventEmitter} `this`.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  var evt;

  if (event) {
    evt = prefix ? prefix + event : event;
    if (this._events[evt]) {
      if (--this._eventsCount === 0) this._events = new Events();
      else delete this._events[evt];
    }
  } else {
    this._events = new Events();
    this._eventsCount = 0;
  }

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Allow `EventEmitter` to be imported as module namespace.
//
EventEmitter.EventEmitter = EventEmitter;

//
// Expose the module.
//
if (true) {
  module.exports = EventEmitter;
}


/***/ }),
/* 2 */
/***/ (function(module, exports) {

/**
 * lodash 3.0.8 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8 which returns 'object' for typed array constructors, and
  // PhantomJS 1.9 which returns 'function' for `NodeList` instances.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = isFunction;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _store = __webpack_require__(9);

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RESERVED_KEYS = ["flux", "waitFor"];

var createStore = function createStore(spec) {
  RESERVED_KEYS.forEach(function (key) {
    if (spec[key]) {
      throw new Error("Reserved key '" + key + "' found in store definition");
    }
  });

  return function (_Store) {
    _inherits(StoreImpl, _Store);

    function StoreImpl(options) {
      _classCallCheck(this, StoreImpl);

      var _this = _possibleConstructorReturn(this, (StoreImpl.__proto__ || Object.getPrototypeOf(StoreImpl)).call(this));

      for (var key in spec) {
        if (key === "actions") {
          _this.bindActions(spec[key]);
        } else if (key === "initialize") {
          // do nothing
        } else if (typeof spec[key] === 'function') {
          _this[key] = spec[key].bind(_this);
        } else {
          _this[key] = spec[key];
        }
      }
      if (spec.initialize) {
        spec.initialize.call(_this, options);
      }
      return _this;
    }

    return StoreImpl;
  }(_store2.default);
};

exports.default = createStore;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventemitter = __webpack_require__(1);

var _objectPath = __webpack_require__(12);

var _objectPath2 = _interopRequireDefault(_objectPath);

var _dispatcher = __webpack_require__(0);

var _dispatcher2 = _interopRequireDefault(_dispatcher);

var _lodash = __webpack_require__(2);

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = __webpack_require__(11);

var _lodash4 = _interopRequireDefault(_lodash3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var findLeaves = function findLeaves(obj, path, callback) {
  path = path || [];

  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      if ((0, _lodash2.default)(obj[key])) {
        callback(path.concat(key), obj[key]);
      } else {
        findLeaves(obj[key], path.concat(key), callback);
      }
    }
  }
};

var Flux = function (_EventEmitter) {
  _inherits(Flux, _EventEmitter);

  function Flux(stores, actions) {
    _classCallCheck(this, Flux);

    var _this = _possibleConstructorReturn(this, (Flux.__proto__ || Object.getPrototypeOf(Flux)).call(this));

    _this.dispatcher = new _dispatcher2.default(stores);
    _this.actions = {};
    _this.stores = {};

    var dispatcher = _this.dispatcher;
    var flux = _this;
    _this.dispatchBinder = {
      flux: flux,
      dispatch: function dispatch(type, payload) {
        try {
          flux.emit("dispatch", type, payload);
        } finally {
          dispatcher.dispatch({ type: type, payload: payload });
        }
      }
    };

    _this.addActions(actions);
    _this.addStores(stores);
    return _this;
  }

  _createClass(Flux, [{
    key: "addActions",
    value: function addActions(actions) {
      findLeaves(actions, [], this.addAction.bind(this));
    }

    // addAction has two signatures:
    // 1: string[, string, string, string...], actionFunction
    // 2: arrayOfStrings, actionFunction

  }, {
    key: "addAction",
    value: function addAction() {
      var _this2 = this;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (arguments.length < 2) {
        throw new Error("addAction requires at least two arguments, a string (or array of strings) and a function");
      }

      if (!(0, _lodash2.default)(args[args.length - 1])) {
        throw new Error("The last argument to addAction must be a function");
      }

      var func = args.pop().bind(this.dispatchBinder);

      if (!(0, _lodash4.default)(args[0])) {
        args = args[0];
      }

      var _args = args,
          _args2 = _toArray(_args),
          head = _args2[0],
          tail = _args2.slice(1);

      var leadingPaths = tail.reduce(function (acc, next) {
        var nextPath = acc[acc.length - 1].concat([next]);
        return acc.concat([nextPath]);
      }, [[head]]);

      // Detect trying to replace a function at any point in the path
      leadingPaths.forEach(function (path) {
        if ((0, _lodash2.default)(_objectPath2.default.get(_this2.actions, path))) {
          throw new Error("An action named " + args.join(".") + " already exists");
        }
      });

      // Detect trying to replace a namespace at the final point in the path
      if (_objectPath2.default.withInheritedProps.get(this.actions, args)) {
        throw new Error("A namespace named " + args.join(".") + " already exists");
      }

      _objectPath2.default.set(this.actions, args, func);
    }
  }, {
    key: "store",
    value: function store(name) {
      return this.stores[name];
    }
  }, {
    key: "getAllStores",
    value: function getAllStores() {
      return this.stores;
    }
  }, {
    key: "addStore",
    value: function addStore(name, store) {
      if (name in this.stores) {
        throw new Error("A store named '" + name + "' already exists");
      }
      store.flux = this;
      this.stores[name] = store;
      this.dispatcher.addStore(name, store);
      store.dispatcher = this.dispatcher;
    }
  }, {
    key: "addStores",
    value: function addStores(stores) {
      for (var key in stores) {
        if (stores.hasOwnProperty(key)) {
          this.addStore(key, stores[key]);
        }
      }
    }
  }, {
    key: "setDispatchInterceptor",
    value: function setDispatchInterceptor(fn) {
      this.dispatcher.setDispatchInterceptor(fn);
    }
  }]);

  return Flux;
}(_eventemitter.EventEmitter);

exports.default = Flux;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var FluxChildMixin = function FluxChildMixin(_ref) {
  var PropTypes = _ref.PropTypes;
  return {
    componentWillMount: function componentWillMount() {
      if (console && console.warn) {
        var namePart = this.constructor.displayName ? " in " + this.constructor.displayName : "";
        var message = "Fluxxor.FluxChildMixin was found in use" + namePart + ", but has been deprecated. Use Fluxxor.FluxMixin instead.";
        console.warn(message);
      }
    },


    contextTypes: {
      flux: PropTypes.object
    },

    getFlux: function getFlux() {
      return this.context.flux;
    }
  };
};

FluxChildMixin.componentWillMount = function () {
  throw new Error("Fluxxor.FluxChildMixin is a function that takes React as a " + "parameter and returns the mixin, e.g.: mixins[Fluxxor.FluxChildMixin(React)]");
};

exports.default = FluxChildMixin;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var FluxMixin = function FluxMixin(_ref) {
  var PropTypes = _ref.PropTypes;
  return {
    componentWillMount: function componentWillMount() {
      if (!this.props.flux && (!this.context || !this.context.flux)) {
        var namePart = this.constructor.displayName ? " of " + this.constructor.displayName : "";
        throw new Error("Could not find flux on this.props or this.context" + namePart);
      }
    },


    childContextTypes: {
      flux: PropTypes.object
    },

    contextTypes: {
      flux: PropTypes.object
    },

    getChildContext: function getChildContext() {
      return {
        flux: this.getFlux()
      };
    },
    getFlux: function getFlux() {
      return this.props.flux || this.context && this.context.flux;
    }
  };
};

FluxMixin.componentWillMount = function () {
  throw new Error("Fluxxor.FluxMixin is a function that takes React as a " + "parameter and returns the mixin, e.g.: mixins: [Fluxxor.FluxMixin(React)]");
};

exports.default = FluxMixin;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var StoreWatchMixin = function StoreWatchMixin() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var storeNames = Array.prototype.slice.call(args);
  return {
    componentDidMount: function componentDidMount() {
      var _this = this;

      var flux = this.props.flux || this.context.flux;
      this.mounted = true;

      // No autobinding in ES6 classes
      this._setStateFromFlux = function () {
        if (_this.mounted) {
          _this.setState(_this.getStateFromFlux());
        }
      };

      storeNames.forEach(function (store) {
        flux.store(store).on("change", _this._setStateFromFlux);
      });
    },
    componentWillUnmount: function componentWillUnmount() {
      var _this2 = this;

      var flux = this.props.flux || this.context.flux;
      this.mounted = false;
      storeNames.forEach(function (store) {
        flux.store(store).removeListener("change", _this2._setStateFromFlux);
      });
    },
    getInitialState: function getInitialState() {
      return this.getStateFromFlux();
    }
  };
};

StoreWatchMixin.componentWillMount = function () {
  throw new Error("Fluxxor.StoreWatchMixin is a function that takes one or more " + "store names as parameters and returns the mixin, e.g.: " + "mixins: [Fluxxor.StoreWatchMixin(\"Store1\", \"Store2\")]");
};

exports.default = StoreWatchMixin;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = "1.7.3";

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventemitter = __webpack_require__(1);

var _lodash = __webpack_require__(10);

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = __webpack_require__(2);

var _lodash4 = _interopRequireDefault(_lodash3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Store = function (_EventEmitter) {
  _inherits(Store, _EventEmitter);

  function Store() {
    _classCallCheck(this, Store);

    var _this = _possibleConstructorReturn(this, (Store.__proto__ || Object.getPrototypeOf(Store)).call(this));

    _this.__actions__ = {};
    return _this;
  }

  _createClass(Store, [{
    key: "__handleAction__",
    value: function __handleAction__(_ref) {
      var type = _ref.type,
          payload = _ref.payload;

      var handler = void 0;
      handler = this.__actions__[type];
      if (handler) {
        if ((0, _lodash4.default)(handler)) {
          handler.call(this, payload, type);
        } else if (handler && (0, _lodash4.default)(this[handler])) {
          this[handler].call(this, payload, type);
        } else {
          throw new Error("The handler for action type " + type + " is not a function");
        }
        return true;
      } else {
        return false;
      }
    }
  }, {
    key: "bindActions",
    value: function bindActions() {
      var _this2 = this;

      for (var _len = arguments.length, actions = Array(_len), _key = 0; _key < _len; _key++) {
        actions[_key] = arguments[_key];
      }

      if (actions.length > 1 && actions.length % 2 !== 0) {
        throw new Error("bindActions must take an even number of arguments.");
      }

      var bindAction = function bindAction(type, handler) {
        if (!handler) {
          throw new Error("The handler for action type " + type + " is falsy");
        }

        _this2.__actions__[type] = handler;
      };

      if (actions.length === 1 && (0, _lodash2.default)(actions[0])) {
        actions = actions[0];
        for (var key in actions) {
          if (actions.hasOwnProperty(key)) {
            bindAction(key, actions[key]);
          }
        }
      } else {
        for (var i = 0; i < actions.length; i += 2) {
          var type = actions[i];
          var handler = actions[i + 1];

          if (!type) {
            throw new Error("Argument " + (i + 1) + " to bindActions is a falsy value");
          }

          bindAction(type, handler);
        }
      }
    }
  }, {
    key: "waitFor",
    value: function waitFor(stores, fn) {
      this.dispatcher.waitForStores(this, stores, fn.bind(this));
    }
  }]);

  return Store;
}(_eventemitter.EventEmitter);

exports.default = Store;

/***/ }),
/* 10 */
/***/ (function(module, exports) {

/**
 * lodash 3.0.2 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = isObject;


/***/ }),
/* 11 */
/***/ (function(module, exports) {

/**
 * lodash 4.0.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var stringTag = '[object String]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @type Function
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isString('abc');
 * // => true
 *
 * _.isString(1);
 * // => false
 */
function isString(value) {
  return typeof value == 'string' ||
    (!isArray(value) && isObjectLike(value) && objectToString.call(value) == stringTag);
}

module.exports = isString;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (root, factory){
  'use strict';

  /*istanbul ignore next:cant test*/
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else if (true) {
    // AMD. Register as an anonymous module.
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {
    // Browser globals
    root.objectPath = factory();
  }
})(this, function(){
  'use strict';

  var toStr = Object.prototype.toString;
  function hasOwnProperty(obj, prop) {
    if(obj == null) {
      return false
    }
    //to handle objects with null prototypes (too edge case?)
    return Object.prototype.hasOwnProperty.call(obj, prop)
  }

  function isEmpty(value){
    if (!value) {
      return true;
    }
    if (isArray(value) && value.length === 0) {
        return true;
    } else if (typeof value !== 'string') {
        for (var i in value) {
            if (hasOwnProperty(value, i)) {
                return false;
            }
        }
        return true;
    }
    return false;
  }

  function toString(type){
    return toStr.call(type);
  }

  function isObject(obj){
    return typeof obj === 'object' && toString(obj) === "[object Object]";
  }

  var isArray = Array.isArray || function(obj){
    /*istanbul ignore next:cant test*/
    return toStr.call(obj) === '[object Array]';
  }

  function isBoolean(obj){
    return typeof obj === 'boolean' || toString(obj) === '[object Boolean]';
  }

  function getKey(key){
    var intKey = parseInt(key);
    if (intKey.toString() === key) {
      return intKey;
    }
    return key;
  }

  function factory(options) {
    options = options || {}

    var objectPath = function(obj) {
      return Object.keys(objectPath).reduce(function(proxy, prop) {
        if(prop === 'create') {
          return proxy;
        }

        /*istanbul ignore else*/
        if (typeof objectPath[prop] === 'function') {
          proxy[prop] = objectPath[prop].bind(objectPath, obj);
        }

        return proxy;
      }, {});
    };

    function getShallowProperty(obj, prop) {
      if (options.includeInheritedProps || (typeof prop === 'number' && Array.isArray(obj)) || hasOwnProperty(obj, prop)) {
        return obj[prop];
      }
    }

    function set(obj, path, value, doNotReplace){
      if (typeof path === 'number') {
        path = [path];
      }
      if (!path || path.length === 0) {
        return obj;
      }
      if (typeof path === 'string') {
        return set(obj, path.split('.').map(getKey), value, doNotReplace);
      }
      var currentPath = path[0];
      var currentValue = getShallowProperty(obj, currentPath);
      if (path.length === 1) {
        if (currentValue === void 0 || !doNotReplace) {
          obj[currentPath] = value;
        }
        return currentValue;
      }

      if (currentValue === void 0) {
        //check if we assume an array
        if(typeof path[1] === 'number') {
          obj[currentPath] = [];
        } else {
          obj[currentPath] = {};
        }
      }

      return set(obj[currentPath], path.slice(1), value, doNotReplace);
    }

    objectPath.has = function (obj, path) {
      if (typeof path === 'number') {
        path = [path];
      } else if (typeof path === 'string') {
        path = path.split('.');
      }

      if (!path || path.length === 0) {
        return !!obj;
      }

      for (var i = 0; i < path.length; i++) {
        var j = getKey(path[i]);

        if((typeof j === 'number' && isArray(obj) && j < obj.length) ||
          (options.includeInheritedProps ? (j in Object(obj)) : hasOwnProperty(obj, j))) {
          obj = obj[j];
        } else {
          return false;
        }
      }

      return true;
    };

    objectPath.ensureExists = function (obj, path, value){
      return set(obj, path, value, true);
    };

    objectPath.set = function (obj, path, value, doNotReplace){
      return set(obj, path, value, doNotReplace);
    };

    objectPath.insert = function (obj, path, value, at){
      var arr = objectPath.get(obj, path);
      at = ~~at;
      if (!isArray(arr)) {
        arr = [];
        objectPath.set(obj, path, arr);
      }
      arr.splice(at, 0, value);
    };

    objectPath.empty = function(obj, path) {
      if (isEmpty(path)) {
        return void 0;
      }
      if (obj == null) {
        return void 0;
      }

      var value, i;
      if (!(value = objectPath.get(obj, path))) {
        return void 0;
      }

      if (typeof value === 'string') {
        return objectPath.set(obj, path, '');
      } else if (isBoolean(value)) {
        return objectPath.set(obj, path, false);
      } else if (typeof value === 'number') {
        return objectPath.set(obj, path, 0);
      } else if (isArray(value)) {
        value.length = 0;
      } else if (isObject(value)) {
        for (i in value) {
          if (hasOwnProperty(value, i)) {
            delete value[i];
          }
        }
      } else {
        return objectPath.set(obj, path, null);
      }
    };

    objectPath.push = function (obj, path /*, values */){
      var arr = objectPath.get(obj, path);
      if (!isArray(arr)) {
        arr = [];
        objectPath.set(obj, path, arr);
      }

      arr.push.apply(arr, Array.prototype.slice.call(arguments, 2));
    };

    objectPath.coalesce = function (obj, paths, defaultValue) {
      var value;

      for (var i = 0, len = paths.length; i < len; i++) {
        if ((value = objectPath.get(obj, paths[i])) !== void 0) {
          return value;
        }
      }

      return defaultValue;
    };

    objectPath.get = function (obj, path, defaultValue){
      if (typeof path === 'number') {
        path = [path];
      }
      if (!path || path.length === 0) {
        return obj;
      }
      if (obj == null) {
        return defaultValue;
      }
      if (typeof path === 'string') {
        return objectPath.get(obj, path.split('.'), defaultValue);
      }

      var currentPath = getKey(path[0]);
      var nextObj = getShallowProperty(obj, currentPath)
      if (nextObj === void 0) {
        return defaultValue;
      }

      if (path.length === 1) {
        return nextObj;
      }

      return objectPath.get(obj[currentPath], path.slice(1), defaultValue);
    };

    objectPath.del = function del(obj, path) {
      if (typeof path === 'number') {
        path = [path];
      }

      if (obj == null) {
        return obj;
      }

      if (isEmpty(path)) {
        return obj;
      }
      if(typeof path === 'string') {
        return objectPath.del(obj, path.split('.'));
      }

      var currentPath = getKey(path[0]);
      var currentVal = getShallowProperty(obj, currentPath);
      if(currentVal == null) {
        return currentVal;
      }

      if(path.length === 1) {
        if (isArray(obj)) {
          obj.splice(currentPath, 1);
        } else {
          delete obj[currentPath];
        }
      } else {
        if (obj[currentPath] !== void 0) {
          return objectPath.del(obj[currentPath], path.slice(1));
        }
      }

      return obj;
    }

    return objectPath;
  }

  var mod = factory();
  mod.create = factory;
  mod.withInheritedProps = factory({includeInheritedProps: true})
  return mod;
});


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dispatcher = __webpack_require__(0);

var _dispatcher2 = _interopRequireDefault(_dispatcher);

var _flux = __webpack_require__(4);

var _flux2 = _interopRequireDefault(_flux);

var _flux_mixin = __webpack_require__(6);

var _flux_mixin2 = _interopRequireDefault(_flux_mixin);

var _flux_child_mixin = __webpack_require__(5);

var _flux_child_mixin2 = _interopRequireDefault(_flux_child_mixin);

var _store_watch_mixin = __webpack_require__(7);

var _store_watch_mixin2 = _interopRequireDefault(_store_watch_mixin);

var _create_store = __webpack_require__(3);

var _create_store2 = _interopRequireDefault(_create_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Fluxxor = {
  Dispatcher: _dispatcher2.default,
  Flux: _flux2.default,
  FluxMixin: _flux_mixin2.default,
  FluxChildMixin: _flux_child_mixin2.default,
  StoreWatchMixin: _store_watch_mixin2.default,
  createStore: _create_store2.default,
  version: __webpack_require__(8)
};

exports.default = Fluxxor;

/***/ })
/******/ ]);
});
//# sourceMappingURL=fluxxor.js.map