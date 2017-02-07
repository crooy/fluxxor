
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

      storeNames.forEach((store) =>{
        flux.store(store).on("change", this._setStateFromFlux);
      });
    },

    componentWillUnmount() {
      const flux = this.props.flux || this.context.flux;
      this.mounted = false;
      storeNames.forEach((store) =>{
        flux.store(store).removeListener("change", this._setStateFromFlux);
      });
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
