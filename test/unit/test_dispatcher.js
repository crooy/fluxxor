import Fluxxor from "../../src";
import chai from "chai";
const expect = chai.expect;
import sinon from "sinon";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

describe("Dispatcher", () => {
  let store1;
  let store2;
  let dispatcher;

  beforeEach(() => {
    const handleActionStub = sinon.stub();
    handleActionStub.returns(true);

    store1 = { __handleAction__: handleActionStub };
    store2 = { __handleAction__: sinon.spy() };
    dispatcher = new Fluxxor.Dispatcher({Store1: store1, Store2: store2});
  });

  it("dispatches actions to every store", () => {
    const action = {type: "ACTION", payload: {val: 123}};
    dispatcher.dispatch(action);
    expect(store1.__handleAction__).to.have.been.calledWith(action);
    expect(store2.__handleAction__).to.have.been.calledWith(action);
  });

  it("does not allow cascading dispatches", done => {
    store1.__handleAction__ = () => {
      expect(() => {
        dispatcher.dispatch({type:"action2"});
      }).to.throw(/action2.*another action.*action1/);
      done();
      return true;
    };
    dispatcher.dispatch({type:"action1"});
  });

  it("allows back-to-back dispatches on the same tick", () => {
    dispatcher.dispatch({type:"action"});
    expect(() => {
      dispatcher.dispatch({type:"action"});
    }).not.to.throw();
  });

  it("gracefully handles exceptions in the action handlers", () => {
    let thrw = true;
    store1.__handleAction__ = () => {
      if (thrw) {
        throw new Error("omg");
      }
      return true;
    };

    expect(() => {
      dispatcher.dispatch({type:"action"});
    }).to.throw("omg");

    expect(() => {
      thrw = false;
      dispatcher.dispatch({type:"action"});
    }).not.to.throw();
  });

  it("throws when asked to dispatch an action with to 'type' property", () => {
    expect(() => {
      dispatcher.dispatch();
    }).to.throw(/dispatch.*type/);

    expect(() => {
      dispatcher.dispatch(false);
    }).to.throw(/dispatch.*type/);

    expect(() => {
      dispatcher.dispatch("");
    }).to.throw(/dispatch.*type/);

    expect(() => {
      dispatcher.dispatch(null);
    }).to.throw(/dispatch.*type/);

    expect(() => {
      dispatcher.dispatch({});
    }).to.throw(/dispatch.*type/);
  });

  it("allows stores to wait on other stores", () => {
    let callCount = 0;
    const Store1 = Fluxxor.createStore({
      actions: { "ACTION": "handleAction" },
      handleAction() {
        this.waitFor(["Store2"], function() {
          this.value = ++callCount;
        });
      }
    });
    const Store2 = Fluxxor.createStore({
      actions: { "ACTION": "handleAction" },
      handleAction() {
        this.value = ++callCount;
      }
    });
    store1 = new Store1();
    store2 = new Store2();
    dispatcher = new Fluxxor.Dispatcher({Store1: store1, Store2: store2});
    dispatcher.dispatch({type: "ACTION"});
    expect(store1.value).to.equal(2);
    expect(store2.value).to.equal(1);
  });

  it("does not allow stores to wait unless an action is being dispatched", () => {
    expect(() => {
      dispatcher.waitForStores();
    }).to.throw(/unless.*action.*dispatch/);
  });

  it("does not allow a store to wait on itself", () => {
    const Store = Fluxxor.createStore({
      actions: { "ACTION": "handleAction" },
      handleAction() {
        this.waitFor(["Store"], () => {
        });
      }
    });
    const store = new Store();
    dispatcher = new Fluxxor.Dispatcher({Store: store});
    expect(() => {
      dispatcher.dispatch({type: "ACTION"});
    }).to.throw(/wait.*itself/);
  });

  it("does not allow a store to wait more than once in the same loop", () => {
    const Store1 = Fluxxor.createStore({
      actions: { "ACTION": "handleAction" },
      handleAction() {
        this.waitFor(["Store2"], sinon.spy());
        this.waitFor(["Store2"], sinon.spy());
      }
    });
    const Store2 = Fluxxor.createStore({});
    store1 = new Store1();
    store2 = new Store2();
    dispatcher = new Fluxxor.Dispatcher({Store1: store1, Store2: store2});
    expect(() => {
      dispatcher.dispatch({type: "ACTION"});
    }).to.throw(/already.*waiting/);
  });

  it("allows a store to wait on a store more than once in different loops", () => {
    const Store1 = Fluxxor.createStore({
      actions: { "ACTION": "handleAction" },
      handleAction() {
        this.waitFor(["Store2"], function() {
          this.waitFor(["Store2"], function({value}) {
            this.value = value;
          });
        });
      }
    });
    const Store2 = Fluxxor.createStore({
      actions: { "ACTION": "handleAction" },
      handleAction() {
        this.value = 42;
      }
    });
    store1 = new Store1();
    store2 = new Store2();
    dispatcher = new Fluxxor.Dispatcher({Store1: store1, Store2: store2});
    dispatcher.dispatch({type: "ACTION"});
    expect(store1.value).to.equal(42);
  });

  it("does not allow waiting on non-existant stores", () => {
    const Store = Fluxxor.createStore({
      actions: { "ACTION": "handleAction" },
      handleAction() {
        this.waitFor(["StoreFake"], sinon.spy());
      }
    });
    const store = new Store();
    dispatcher = new Fluxxor.Dispatcher({Store: store});
    expect(() => {
      dispatcher.dispatch({type: "ACTION"});
    }).to.throw(/wait.*StoreFake/);
  });

  it("detects direct circular dependencies between stores", () => {
    const Store1 = Fluxxor.createStore({
      actions: { "ACTION": "handleAction" },
      handleAction() {
        this.waitFor(["Store2"], sinon.spy());
      }
    });
    const Store2 = Fluxxor.createStore({
      actions: { "ACTION": "handleAction" },
      handleAction() {
        this.waitFor(["Store1"], sinon.spy());
      }
    });
    store1 = new Store1();
    store2 = new Store2();
    dispatcher = new Fluxxor.Dispatcher({Store1: store1, Store2: store2});
    expect(() => {
      dispatcher.dispatch({type: "ACTION"});
    }).to.throw(/circular.*Store2.*Store1/i);
  });

  it("detects indirect circular dependencies between stores", () => {
    const Store1 = Fluxxor.createStore({
      actions: { "ACTION": "handleAction" },
      handleAction() {
        this.waitFor(["Store2"], sinon.spy());
      }
    });
    const Store2 = Fluxxor.createStore({
      actions: { "ACTION": "handleAction" },
      handleAction() {
        this.waitFor(["Store3"], sinon.spy());
      }
    });
    const Store3 = Fluxxor.createStore({
      actions: { "ACTION": "handleAction" },
      handleAction() {
        this.waitFor(["Store1"], sinon.spy());
      }
    });
    store1 = new Store1();
    store2 = new Store2();
    const store3 = new Store3();
    dispatcher = new Fluxxor.Dispatcher({Store1: store1, Store2: store2, Store3: store3});
    expect(() => {
      dispatcher.dispatch({type: "ACTION"});
    }).to.throw(/circular.*Store1.*Store2.*Store3/i);
  });

  describe("unhandled dispatch warnings", () => {
    let warnSpy;

    beforeEach(() => {
      warnSpy = sinon.stub(console, "warn");
    });

    afterEach(() => {
      warnSpy.restore();
    });

    it("warns if a dispatched action is not handled by any store", () => {
      /* jshint -W030 */
      const Store1 = Fluxxor.createStore({});
      const Store2 = Fluxxor.createStore({});

      store1 = new Store1();
      store2 = new Store2();
      dispatcher = new Fluxxor.Dispatcher({Store1: store1, Store2: store2});
      dispatcher.dispatch({type: "ACTION_TYPE"});

      expect(warnSpy).to.have.been.calledOnce;
      expect(warnSpy).to.have.been.calledWithMatch(/ACTION_TYPE.*no store/);
    });

    it("doesn't warn if a dispatched action is handled by any store", () => {
      /* jshint -W030 */
      const Store1 = Fluxxor.createStore({
        actions: { "ACTION_TYPE": "handleAction" },
        handleAction() {}
      });
      const Store2 = Fluxxor.createStore({});

      store1 = new Store1();
      store2 = new Store2();
      dispatcher = new Fluxxor.Dispatcher({Store1: store1, Store2: store2});
      dispatcher.dispatch({type: "ACTION_TYPE"});

      expect(warnSpy).to.have.not.been.called;
    });
  });
});
