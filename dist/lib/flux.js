"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventemitter = require("eventemitter3");

var _objectPath = require("object-path");

var _objectPath2 = _interopRequireDefault(_objectPath);

var _dispatcher = require("./dispatcher");

var _dispatcher2 = _interopRequireDefault(_dispatcher);

var _lodash = require("lodash.isfunction");

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require("lodash.isstring");

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