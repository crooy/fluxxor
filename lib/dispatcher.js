import _uniq from "lodash.uniq";

const defaultDispatchInterceptor = (action, dispatch) => {
  dispatch(action);
};

const hasOverlap = (a, b)=>{
  return a.find( x => b.indexOf(x) !== -1);
};

class Dispatcher {
  constructor(stores) {
    this.stores = {};
    this.currentDispatch = null;
    this.currentActionType = null;
    this.waitingToDispatch = [];
    this.dispatchInterceptor = defaultDispatchInterceptor;
    this._boundDispatch = this._dispatch.bind(this);

    for (const key in stores) {
      if (stores.hasOwnProperty(key)) {
        this.addStore(key, stores[key]);
      }
    }
  }

  addStore(name, store) {
    store.dispatcher = this;
    this.stores[name] = store;
  }

  dispatch(action) {
    this.dispatchInterceptor(action, this._boundDispatch);
  }

  _dispatch(action) {
    if (!action || !action.type) {
      throw new Error("Can only dispatch actions with a 'type' property");
    }

    if (this.currentDispatch) {
      const complaint = `Cannot dispatch an action ('${action.type}') while another action ('${this.currentActionType}') is being dispatched`;
      throw new Error(complaint);
    }

    this.waitingToDispatch = { ...this.stores };

    this.currentActionType = action.type;

    this.currentDispatch={};
    Object.keys(this.stores).forEach((k)=>{
      this.currentDispatch[k] = {
        resolved: false,
        waitingOn: [],
        waitCallback: null
      };
    });

    try {
      this.doDispatchLoop(action);
    } finally {
      this.currentActionType = null;
      this.currentDispatch = null;
    }
  }

  doDispatchLoop(action) {
    let dispatch;
    let canBeDispatchedTo;
    let wasHandled = false;
    const removeFromDispatchQueue = [];
    const dispatchedThisLoop = [];

    Object.keys(this.waitingToDispatch).forEach((key) =>{
      dispatch = this.currentDispatch[key];
      canBeDispatchedTo = !dispatch.waitingOn.length ||
        !hasOverlap(dispatch.waitingOn, Object.keys(this.waitingToDispatch));

      if (canBeDispatchedTo) {
        if (dispatch.waitCallback) {
          const stores = dispatch.waitingOn.map((keyVal) =>{
            return this.stores[keyVal];
          });
          const fn = dispatch.waitCallback;
          dispatch.waitCallback = null;
          dispatch.waitingOn = [];
          dispatch.resolved = true;
          fn(...stores);
          wasHandled = true;
        } else {
          dispatch.resolved = true;
          const handled = this.stores[key].__handleAction__(action);
          if (handled) {
            wasHandled = true;
          }
        }

        dispatchedThisLoop.push(key);

        if (this.currentDispatch[key].resolved) {
          removeFromDispatchQueue.push(key);
        }
      }
    });

    if (Object.keys(this.waitingToDispatch).length && !dispatchedThisLoop.length) {
      const storesWithCircularWaits = Object.keys(this.waitingToDispatch).join(", ");
      throw new Error(`Indirect circular wait detected among: ${storesWithCircularWaits}`);
    }

    removeFromDispatchQueue.forEach((key) =>{
      delete this.waitingToDispatch[key];
    });

    if (Object.keys(this.waitingToDispatch).length) {
      this.doDispatchLoop(action);
    }

    if (!wasHandled && console && console.warn) {
      console.warn(`An action of type ${action.type} was dispatched, but no store handled it`);
    }
  }

  waitForStores(store, stores, fn) {
    if (!this.currentDispatch) {
      throw new Error("Cannot wait unless an action is being dispatched");
    }

    const waitingStoreName = Object.keys(this.stores)
      .find(k => this.stores[k] === store);

    if (stores.indexOf(waitingStoreName) > -1) {
      throw new Error("A store cannot wait on itself");
    }

    const dispatch = this.currentDispatch[waitingStoreName];

    if (dispatch.waitingOn.length) {
      throw new Error(`${waitingStoreName} already waiting on stores`);
    }

    stores.forEach((storeName) => {
      const storeDispatch = this.currentDispatch[storeName];
      if (!this.stores[storeName]) {
        throw new Error(`Cannot wait for non-existent store ${storeName}`);
      }
      if (storeDispatch.waitingOn.indexOf(waitingStoreName) > -1) {
        throw new Error(`Circular wait detected between ${waitingStoreName} and ${storeName}`);
      }
    });

    dispatch.resolved = false;
    dispatch.waitingOn = _uniq(dispatch.waitingOn.concat(stores));
    dispatch.waitCallback = fn;
  }

  setDispatchInterceptor(fn) {
    if (fn) {
      this.dispatchInterceptor = fn;
    } else {
      this.dispatchInterceptor = defaultDispatchInterceptor;
    }
  }
}

export default Dispatcher;
