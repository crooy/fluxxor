import Fluxxor from "../../";
import jsdom from "jsdom";
import chai from "chai";
const expect = chai.expect;

function createComponent(React, FluxMixin, FluxChildMixin) {
  const Parent = React.createClass({
    displayName: "Parent",
    mixins: [FluxMixin],

    render() {
      return React.createElement(Child);
    }
  });

  var Child = React.createClass({
    displayName: "Child",
    render() {
      return React.createElement(Grandchild);
    }
  });

  var Grandchild = React.createClass({
    displayName: "Grandchild",
    mixins: [FluxChildMixin],

    render() {
      return React.createElement(GreatGrandchild);
    }
  });

  var GreatGrandchild = React.createClass({
    displayName: "GreatGrandchild",
    mixins: [FluxMixin],

    render() {
      return React.DOM.div();
    }
  });

  return {
    Parent: Parent,
    Child: Child,
    Grandchild: Grandchild,
    GreatGrandchild: GreatGrandchild
  };
}

describe("FluxMixin", () => {
  let React;
  let TestUtils;
  let FluxMixin;
  let FluxChildMixin;
  let Parent;
  let Child;
  let Grandchild;
  let GreatGrandchild;
  let flux;
  let objs;

  beforeEach(() => {
    console._warn = console.warn;
    console.warn = () => {};

    const doc = jsdom.jsdom('<html><body></body></html>');
    global.window = doc.defaultView;
    global.document = window.document;
    global.navigator = window.navigator;
    React = require("react/addons");
    TestUtils = React.addons.TestUtils;
    FluxMixin = Fluxxor.FluxMixin(React);
    FluxChildMixin = Fluxxor.FluxChildMixin(React);
    objs = createComponent(React, FluxMixin, FluxChildMixin);
    Parent = objs.Parent;
    Child = objs.Child;
    Grandchild = objs.Grandchild;
    GreatGrandchild = objs.GreatGrandchild;
    flux = new Fluxxor.Flux({}, {});
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
    delete global.navigator;
    console.warn = console._warn;
  });

  it("passes flux via getFlux() to descendants who ask for it", () => {
    /* jshint expr:true */
    const tree = TestUtils.renderIntoDocument(React.createElement(Parent, {flux: flux}));
    expect(tree.getFlux()).to.equal(flux);
    const child = TestUtils.findRenderedComponentWithType(tree, Child);
    expect(child.getFlux).to.be.undefined;
    const grandchild = TestUtils.findRenderedComponentWithType(tree, Grandchild);
    expect(grandchild.getFlux()).to.equal(flux);
    const greatGrandchild = TestUtils.findRenderedComponentWithType(tree, GreatGrandchild);
    expect(greatGrandchild.getFlux()).to.equal(flux);
  });

  it("throws when it can't find flux on the props or context", () => {
    const Comp = React.createFactory(React.createClass({
      displayName: "TestComponent",
      mixins: [Fluxxor.FluxMixin(React)],
      render() { return React.DOM.div(); }
    }));
    expect(() => {
      React.renderToString(Comp());
    }).to.throw(/Could not find flux.*TestComponent/);
  });

  it("throws when attempting to mix in the function directly", () => {
    expect(() => {
      React.createClass({
        mixins: [Fluxxor.FluxMixin],
        render() { return React.DOM.div(); }
      });
    }).to.throw(/attempting to use a component class as a mixin/);
  });

  it("gives a deprecation warning when using FluxChildMixin", () => {
    let warned = false;
    console.warn = text => {
      if (text.match(/FluxChildMixin.*CompName.*deprecated/)) {
        warned = true;
      } else {
        console._warn(text);
      }
    };

    const Comp = React.createFactory(React.createClass({
      mixins: [Fluxxor.FluxChildMixin(React)],
      displayName: "CompName",
      render() { return React.DOM.div(); }
    }));
    React.renderToString(Comp());
    expect(warned).to.equal(true);
  });

  it("throws when attempting to mix in the child function directly", () => {
    expect(() => {
      React.createClass({
        mixins: [Fluxxor.FluxChildMixin],
        render() { return React.DOM.div(); }
      });
    }).to.throw(/attempting to use a component class as a mixin/);
  });
});
