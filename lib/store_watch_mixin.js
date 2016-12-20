import _each from "lodash/collection/forEach";

const StoreWatchMixin = function(...args) {
  const storeNames = Array.prototype.slice.call(args);
  return {
    componentDidMount() {
      const flux = this.props.flux || this.context.flux;
      this.mounted = true;

      // No autobinding in ES6 classes
      this._setStateFromFlux = () => {
        if(this.mounted) {
          this.setState(this.getStateFromFlux());
        }
      };

      _each(storeNames, function(store) {
        flux.store(store).on("change", this._setStateFromFlux);
      }, this);
    },

    componentWillUnmount() {
      const flux = this.props.flux || this.context.flux;
      this.mounted = false;
      _each(storeNames, function(store) {
        flux.store(store).removeListener("change", this._setStateFromFlux);
      }, this);
    },

    getInitialState() {
      return this.getStateFromFlux();
    }
  };
};

StoreWatchMixin.componentWillMount = () => {
  throw new Error("Fluxxor.StoreWatchMixin is a function that takes one or more " +
    "store names as parameters and returns the mixin, e.g.: " +
    "mixins: [Fluxxor.StoreWatchMixin(\"Store1\", \"Store2\")]");
};

export default StoreWatchMixin;
