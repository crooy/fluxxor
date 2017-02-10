const FluxChildMixin = ({PropTypes}) => ({
  componentWillMount() {
    if (console && console.warn) {
      const namePart = this.constructor.displayName ? ` in ${this.constructor.displayName}` : "";
      const message = `Fluxxor.FluxChildMixin was found in use${namePart}, but has been deprecated. Use Fluxxor.FluxMixin instead.`;
      console.warn(message);
    }
  },

  contextTypes: {
    flux: PropTypes.object
  },

  getFlux() {
    return this.context.flux;
  }
});

FluxChildMixin.componentWillMount = () => {
  throw new Error("Fluxxor.FluxChildMixin is a function that takes React as a " +
    "parameter and returns the mixin, e.g.: mixins[Fluxxor.FluxChildMixin(React)]");
};

export default FluxChildMixin;
