"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _store = require("./store");

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