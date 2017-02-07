import Fluxxor from "../../";
const StoreWatchMixin = Fluxxor.StoreWatchMixin;
import jsdom from "jsdom";
import chai from "chai";
const expect = chai.expect;

describe("StoreWatchMixin", () => {
  let SwappedComponent;
  let createComponent;
  let React;
  let TestUtils;
  let Comp;
  let FluxMixin;
  let flux;

  beforeEach(() => {

    const doc = jsdom.jsdom('<html><body></body></html>');
    global.window = doc.defaultView;
    global.document = window.document;
    global.navigator = window.navigator;
    for (const i in require.cache) {
      if (require.cache.hasOwnProperty(i)) {
        delete require.cache[i];
      }
    }
    React = require("react/addons");
    TestUtils = React.addons.TestUtils;
    FluxMixin = Fluxxor.FluxMixin(React);

    SwappedComponent = React.createFactory(React.createClass({
      mixins: [FluxMixin, StoreWatchMixin("Store1")],

      getStateFromFlux() {
        return {
          store1state: this.getFlux().store("Store1").getState(),
        };
      },

      render() {
        return React.DOM.div(null, [
          React.DOM.span({key: 1}, String(this.state.store1state.value)),
        ]);
      }
    }));

    createComponent = function createComponent(React) {
      const Component = React.createFactory(React.createClass({
        mixins: [FluxMixin, StoreWatchMixin("Store1", "Store2")],

        getStateFromFlux() {
          this.getStateCalls = this.getStateCalls || 0;
          this.getStateCalls++;
          return {
            store1state: this.getFlux().store("Store1").getState(),
            store2state: this.getFlux().store("Store2").getState()
          };
        },

        render() {
          if(this.state.store1state.value === 0) {
            return React.DOM.div(null, SwappedComponent());
          }
          return React.DOM.div(null, [
            React.DOM.span({key: 1}, String(this.state.store1state.value)),
            React.DOM.span({key: 2}, String(this.state.store2state.value))
          ]);
        }
      }));

      return Component;
    };

    const Store = Fluxxor.createStore({
      actions: {
        "ACTION": "handleAction"
      },

      initialize() {
        this.value = 0;
      },

      handleAction() {
        this.value++;
        this.emit("change");
      },

      getState() {
        return { value: this.value };
      }
    });

    const stores = {
      Store1: new Store(),
      Store2: new Store()
    };
    const actions = {
      act() {
        this.dispatch("ACTION", {});
      }
    };

    flux = new Fluxxor.Flux(stores, actions);

    Comp = createComponent(React);
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
    delete global.navigator;
  });

  it("watches for store change events until the component is unmounted", done => {
    const tree = TestUtils.renderIntoDocument(Comp({flux: flux}));
    expect(tree.getStateCalls).to.eql(1);
    expect(tree.state).to.eql({store1state: {value: 0}, store2state: {value: 0}});
    flux.actions.act();
    expect(tree.getStateCalls).to.eql(3);
    expect(tree.state).to.eql({store1state: {value: 1}, store2state: {value: 1}});
    React.unmountComponentAtNode(tree.getDOMNode().parentNode);
    setTimeout(() => {
      flux.actions.act();
      expect(tree.getStateCalls).to.eql(3);
      expect(tree.state).to.eql({store1state: {value: 1}, store2state: {value: 1}});
      done();
    });
  });

  it("throws when attempting to mix in the function directly", () => {
    expect(() => {
      React.createFactory(React.createClass({
        mixins: [Fluxxor.StoreWatchMixin],
        render() { return React.DOM.div(); }
      }));
    }).to.throw(/attempting to use a component class as a mixin/);
  });
});
