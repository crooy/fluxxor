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