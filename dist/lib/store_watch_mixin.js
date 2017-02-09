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