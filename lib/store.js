import EventEmitter from "eventemitter3";
import inherits from "./util/inherits";
import _isFunction from "lodash/lang/isFunction";
import _isObject from "lodash/lang/isObject";

class Store {
  constructor(dispatcher) {
    this.dispatcher = dispatcher;
    this.__actions__ = {};
    EventEmitter.call(this);
  }

  __handleAction__({type, payload}) {
    let handler;
    if (!!(handler = this.__actions__[type])) {
      if (_isFunction(handler)) {
        handler.call(this, payload, type);
      } else if (handler && _isFunction(this[handler])) {
        this[handler].call(this, payload, type);
      } else {
        throw new Error(`The handler for action type ${type} is not a function`);
      }
      return true;
    } else {
      return false;
    }
  }

  bindActions(...args) {
    let actions = Array.prototype.slice.call(args);

    if (actions.length > 1 && actions.length % 2 !== 0) {
      throw new Error("bindActions must take an even number of arguments.");
    }

    const bindAction = (type, handler) => {
      if (!handler) {
        throw new Error(`The handler for action type ${type} is falsy`);
      }

      this.__actions__[type] = handler;
    };

    if (actions.length === 1 && _isObject(actions[0])) {
      actions = actions[0];
      for (const key in actions) {
        if (actions.hasOwnProperty(key)) {
          bindAction(key, actions[key]);
        }
      }
    } else {
      for (let i = 0; i < actions.length; i += 2) {
        const type = actions[i];
        const handler = actions[i+1];

        if (!type) {
          throw new Error(`Argument ${i+1} to bindActions is a falsy value`);
        }

        bindAction(type, handler);
      }
    }
  }

  waitFor(stores, fn) {
    this.dispatcher.waitForStores(this, stores, fn.bind(this));
  }
}

inherits(Store, EventEmitter);

export default Store;
