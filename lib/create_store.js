import Store from "./store";
import inherits from "./util/inherits";

const RESERVED_KEYS = ["flux", "waitFor"];

const createStore = function(spec){
  RESERVED_KEYS.forEach(key => {
    if (spec[key]) {
      throw new Error(`Reserved key '${key}' found in store definition`);
    }
  });

  return function(options = {}){
    const s = new Store();
    for (const key in spec) {
      if (key === "actions") {
        s.bindActions(spec[key]);
      } else if (key === "initialize") {
        // do nothing
      } else if (typeof spec[key] === 'function') {
        s[key] = spec[key].bind(s);
      } else {
        s[key] = spec[key];
      }
    }

    if (spec.initialize) {
      spec.initialize.call(s, options);
    }
  }
};

export default createStore;
