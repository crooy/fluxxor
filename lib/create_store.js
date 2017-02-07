import Store from "./store";
import inherits from "./util/inherits";

const RESERVED_KEYS = ["flux", "waitFor"];

const createStore = function(spec){
  RESERVED_KEYS.forEach(key => {
    if (spec[key]) {
      throw new Error(`Reserved key '${key}' found in store definition`);
    }
  });

  return class StoreImpl extends Store{
    constructor(options){
      super();
      for (const key in spec) {
        if (key === "actions") {
          this.bindActions(spec[key]);
        } else if (key === "initialize") {
          // do nothing
        } else if (typeof spec[key] === 'function') {
          this[key] = spec[key].bind(this);
        } else {
          this[key] = spec[key];
        }
      }
      if (spec.initialize) {
        spec.initialize.call(this, options);
      }
    }
  }
};

export default createStore;
