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