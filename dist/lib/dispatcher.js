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