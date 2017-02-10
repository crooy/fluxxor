import Fluxxor from "../../src";
import jsdom from "jsdom";
import chai from "chai";
const expect = chai.expect;

const Store = Fluxxor.createStore({
  actions: {
    "ACTIVATE": "handleActivate",
    "LOAD_INITIAL_VALUE": "handleLoadInitialValue"
  },

  initialize() {
    this.activated = false;
    this.value = null;
  },

  handleActivate() {
    this.activated = true;
    this.emit("change");
  },

  handleLoadInitialValue() {
    this.value = "testing";
    this.emit("change");
  }
});

const actions = {
  activate(callback) {
    setTimeout(() => {
      try {
        this.dispatch("ACTIVATE");
        callback();
      } catch (ex) {
        if (ex instanceof chai.AssertionError) {
          throw ex;
        } else {
          callback(ex);
        }
      }
    });
  },

  loadInitialValue() {
    this.dispatch("LOAD_INITIAL_VALUE");
  }
};

describe("Dispatch interceptor", () => {
  let React;
  let TestUtils;
  let flux;
  let App;
  let ComponentA;
  let ComponentB;

  beforeEach(() => {
    const doc = jsdom.jsdom("<html><body></body></html>");
    global.window = doc.defaultView;
    global.document = window.document;
    global.navigator = window.navigator;
    React = require("react/addons");
    TestUtils = React.addons.TestUtils;

    flux = new Fluxxor.Flux({store: new Store()}, actions);

    App = React.createFactory(React.createClass({
      displayName: "App",
      mixins: [Fluxxor.FluxMixin(React), Fluxxor.StoreWatchMixin("store")],

      getStateFromFlux() {
        return {
          activated: this.getFlux().store("store").activated
        };
      },

      render() {
        return React.DOM.div({}, this.renderChild());
      },

      renderChild() {
        if (!this.state.activated) {
          return ComponentA();
        } else {
          return ComponentB();
        }
      }
    }));

    ComponentA = React.createFactory(React.createClass({
      displayName: "ComponentA",
      mixins: [
        Fluxxor.FluxMixin(React)
      ],

      render() {
        return React.DOM.div();
      }
    }));

    ComponentB = React.createFactory(React.createClass({
      displayName: "ComponentB",
      mixins: [
        Fluxxor.FluxMixin(React),
        Fluxxor.StoreWatchMixin("store")
      ],

      getStateFromFlux() {
        return {
          value: this.getFlux().store("store").value
        };
      },

      componentWillMount() {
        this.getFlux().actions.loadInitialValue();
      },

      render() {
        return React.DOM.div();
      },
    }));
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
    delete global.navigator;
    for (const i in require.cache) {
      if (require.cache.hasOwnProperty(i)) {
        delete require.cache[i]; // ugh react why
      }
    }
  });

  it("doesn't intercept by default", done => {
    /* jshint expr:true */
    TestUtils.renderIntoDocument(App({flux: flux}));
    flux.actions.activate(err => {
      expect(err).to.match(/dispatch.*another action/);
      done();
    });
  });

  it("allows intercepting", done => {
    /* jshint expr:true */
    flux.setDispatchInterceptor((action, dispatch) => {
      React.addons.batchedUpdates(() => {
        dispatch(action);
      });
    });

    TestUtils.renderIntoDocument(App({flux: flux}));
    flux.actions.activate(err => {
      expect(err).to.be.undefined;
      done();
    });
  });

  it("allows nested interceptors", done => {
    let dispatches = 0;
    /* jshint expr:true */
    flux.setDispatchInterceptor((action, dispatch) => {
      dispatches++;
      React.addons.batchedUpdates(() => {
        dispatch(action);
      });
    });

    TestUtils.renderIntoDocument(App({flux: flux}));
    flux.actions.activate(err => {
      expect(err).to.be.undefined;
      expect(dispatches).to.eql(2);
      done();
    });
  });

  it("allows completely custom interceptors", done => {
    let dispatches = 0;
    /* jshint expr:true */
    flux.setDispatchInterceptor(() => {
      dispatches++;
    });

    TestUtils.renderIntoDocument(App({flux: flux}));
    flux.actions.activate(err => {
      expect(err).to.be.defined;
      expect(dispatches).to.eql(1);
      done();
    });
  });
});
