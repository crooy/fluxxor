import _each from "lodash/collection/forEach";
import _isFunction from "lodash/lang/isFunction";
import Store from "./store";
import inherits from "./util/inherits";

const RESERVED_KEYS = ["flux", "waitFor"];

const createStore = spec => {
  _each(RESERVED_KEYS, key => {
    if (spec[key]) {
      throw new Error(`Reserved key '${key}' found in store definition`);
    }
  });

  const constructor = function(options) {
    options = options || {};
    Store.call(this);

    for (const key in spec) {
      if (key === "actions") {
        this.bindActions(spec[key]);
      } else if (key === "initialize") {
        // do nothing
      } else if (_isFunction(spec[key])) {
        this[key] = spec[key].bind(this);
      } else {
        this[key] = spec[key];
      }
    }

    if (spec.initialize) {
      spec.initialize.call(this, options);
    }
  };

  inherits(constructor, Store);
  return constructor;
};

export default createStore;
