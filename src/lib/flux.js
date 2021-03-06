import { EventEmitter } from 'eventemitter3';
import objectPath from "object-path";
import Dispatcher from "./dispatcher";
import _isFunction from "lodash.isfunction";
import _isString from "lodash.isstring";

const findLeaves = (obj, path, callback) => {
  path = path || [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (_isFunction(obj[key])) {
        callback(path.concat(key), obj[key]);
      } else {
        findLeaves(obj[key], path.concat(key), callback);
      }
    }
  }
};

class Flux extends EventEmitter{
  constructor(stores, actions) {
    super();
    this.dispatcher = new Dispatcher(stores);
    this.actions = {};
    this.stores = {};

    const dispatcher = this.dispatcher;
    const flux = this;
    this.dispatchBinder = {
      flux: flux,
      dispatch(type, payload) {
        try {
          flux.emit("dispatch", type, payload);
        } finally {
          dispatcher.dispatch({type: type, payload: payload});
        }
      }
    };

    this.addActions(actions);
    this.addStores(stores);
  }

  addActions(actions) {
    findLeaves(actions, [], this.addAction.bind(this));
  }

  // addAction has two signatures:
  // 1: string[, string, string, string...], actionFunction
  // 2: arrayOfStrings, actionFunction
  addAction(...args) {
    if (arguments.length < 2) {
      throw new Error("addAction requires at least two arguments, a string (or array of strings) and a function");
    }

    if (!_isFunction(args[args.length - 1])) {
      throw new Error("The last argument to addAction must be a function");
    }

    const func = args.pop().bind(this.dispatchBinder);

    if (!_isString(args[0])) {
      args = args[0];
    }

    const [head, ...tail] = args;
    const leadingPaths = tail.reduce((acc, next) => {
      const nextPath = acc[acc.length - 1].concat([next]);
      return acc.concat([nextPath]);
    }, [[head]]);


    // Detect trying to replace a function at any point in the path
    leadingPaths.forEach((path)=>{
      if (_isFunction(objectPath.get(this.actions, path))) {
        throw new Error(`An action named ${args.join(".")} already exists`);
      }
    });

    // Detect trying to replace a namespace at the final point in the path
    if (objectPath.withInheritedProps.get(this.actions, args)) {
      throw new Error(`A namespace named ${args.join(".")} already exists`);
    }

    objectPath.set(this.actions, args, func);
  }

  store(name) {
    return this.stores[name];
  }

  getAllStores() {
    return this.stores;
  }

  addStore(name, store) {
    if (name in this.stores) {
      throw new Error(`A store named '${name}' already exists`);
    }
    store.flux = this;
    this.stores[name] = store;
    this.dispatcher.addStore(name, store);
    store.dispatcher = this.dispatcher;
  }

  addStores(stores) {
    for (const key in stores) {
      if (stores.hasOwnProperty(key)) {
        this.addStore(key, stores[key]);
      }
    }
  }

  setDispatchInterceptor(fn) {
    this.dispatcher.setDispatchInterceptor(fn);
  }
}

export default Flux;
