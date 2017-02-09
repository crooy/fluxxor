"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventemitter = require("eventemitter3");

var _lodash = require("lodash.isobject");

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require("lodash.isfunction");

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