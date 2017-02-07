import Fluxxor from "../../";
import chai from "chai";
const expect = chai.expect;
import sinon from "sinon";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

describe("Store", () => {
  it("passes one object from constructor to initialize", done => {
    /* jshint expr:true */
    const Store = Fluxxor.createStore({
      initialize(opt, nothing) {
        expect(opt).to.equal(42);
        expect(nothing).to.be.undefined;
        done();
      }
    });
    new Store(42, 100);
  });

  it("copies properties from the spec", () => {
    const Store = Fluxxor.createStore({
      answer: {is: 42}
    });
    const store = new Store();
    expect(store.answer).to.eql({is: 42});
  });

  it("disallows reserved property names", () => {
    expect(() => {
      Fluxxor.createStore({
        flux: true
      });
    }).to.throw(/reserved.*flux/i);

    expect(() => {
      Fluxxor.createStore({
        waitFor: true
      });
    }).to.throw(/reserved.*waitFor/i);
  });

  it("allows registering actions via an actions hash", () => {
    const Store = Fluxxor.createStore({
      actions: {
        "ACTION": "handleAction"
      },

      handleAction() {}
    });
    const store = new Store();
    store.handleAction = sinon.spy();
    const payload = {val: 42};
    store.__handleAction__({type: "ACTION", payload: payload});
    expect(store.handleAction).to.have.been.calledWith(payload, "ACTION");
  });

  describe("#bindActions", () => {
    it("allows registering actions via an argument list", () => {
      // also tests that methods are autobound to the store instance
      const Store = Fluxxor.createStore({
        actions: {
          "ACTION": "handleAction"
        },

        initialize() {
          this.bindActions("ACTION2", "handleAction2",
                          "ACTION3", this.handleAction3);
        },

        handleAction() {},
        handleAction2() {},
        handleAction3() {
          this.value = 42;
        }
      });
      const store = new Store();
      store.handleAction = sinon.spy();
      store.handleAction2 = sinon.spy();
      const payload = {val: 42};
      store.__handleAction__({type: "ACTION", payload: payload});
      expect(store.handleAction).to.have.been.calledWith(payload, "ACTION");
      store.__handleAction__({type: "ACTION2", payload: payload});
      expect(store.handleAction2).to.have.been.calledWith(payload, "ACTION2");
      store.__handleAction__({type: "ACTION3", payload: payload});
      expect(store.value).to.equal(42);
    });

    it("allows registering actions via a hash", () => {
      const Store = Fluxxor.createStore({
        actions: {
          "ACTION": "handleAction"
        },

        initialize() {
          this.bindActions({
            "ACTION2": "handleAction2",
            "ACTION3": this.handleAction3
          });
        },

        handleAction() {},
        handleAction2() {},
        handleAction3() {
          this.value = 42;
        }
      });

      const store = new Store();
      store.handleAction = sinon.spy();
      store.handleAction2 = sinon.spy();

      const payload = {val: 42};
      store.__handleAction__({type: "ACTION", payload: payload});
      expect(store.handleAction).to.have.been.calledWith(payload, "ACTION");
      store.__handleAction__({type: "ACTION2", payload: payload});
      expect(store.handleAction2).to.have.been.calledWith(payload, "ACTION2");
      store.__handleAction__({type: "ACTION3", payload: payload});
      expect(store.value).to.equal(42);
    });
  });

  it("throws when binding to a falsy action type", () => {
    const Store = Fluxxor.createStore({
      initialize() {
        this.bindActions(
          "TYPE_ONE", "handleOne",
          null, "handleTwo"
        );
      }
    });

    expect(() => {
      new Store();
    }).to.throw(/Argument 3.*bindActions.*falsy/);
  });

  it("throws when using a non-function action handler", () => {
    const Store = Fluxxor.createStore({
      actions: {
        "ACTION": "handleAction"
      }
    });

    const store = new Store();
    expect(() => {
      store.__handleAction__({type: "ACTION"});
    }).to.throw(/handler.*type ACTION.*not.*function/);

    expect(() => {
      store.__handleAction__({type: "ACTION2"});
    }).not.to.throw();
  });

  it("throws when binding an action type to a falsy handler", function() {
    const Store = Fluxxor.createStore({
      actions: {
        "ACTION": this.handleAction
      },

      handleAction() {}
    });

    expect(() => {
      new Store();
    }).to.throw(/handler.*type ACTION.*falsy/);
  });
});
