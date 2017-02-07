import Fluxxor from "../../";
import chai from "chai";
const expect = chai.expect;
import sinon from "sinon";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

describe("Flux", () => {
  it("allows retrieval of stores added by constructor", () => {
    const store1 = {};
    const store2 = {};
    const stores = { Store1: store1, Store2: store2 };
    const flux = new Fluxxor.Flux(stores, {});
    expect(flux.store("Store1")).to.equal(store1);
    expect(flux.store("Store2")).to.equal(store2);
  });

  it("allows retrieval of stores added by addStores", () => {
    const store1 = {};
    const store2 = {};
    const stores = { Store1: store1, Store2: store2 };
    const flux = new Fluxxor.Flux();
    flux.addStores(stores);
    expect(flux.store("Store1")).to.equal(store1);
    expect(flux.store("Store2")).to.equal(store2);
  });

  it("allows retrieval of stores added by addStore", () => {
    const store1 = {};
    const store2 = {};
    const flux = new Fluxxor.Flux();
    flux.addStore("Store1", store1);
    flux.addStore("Store2", store2);
    expect(flux.store("Store1")).to.equal(store1);
    expect(flux.store("Store2")).to.equal(store2);
  });

  it("allows retrieval of all stores", () => {
    const store1 = {};
    const store2 = {};
    const store3 = {};
    const flux = new Fluxxor.Flux({store1: store1, store2: store2, store3: store3});
    expect(flux.getAllStores()).to.eql({store1: store1, store2: store2, store3: store3});
  });

  it("does not allow duplicate stores", () => {
    const store1 = {};
    const flux = new Fluxxor.Flux();
    flux.addStore("Store1", store1);
    expect(() => {
      flux.addStore("Store1", {});
    }).to.throw(/store.*Store1.*already exists/);
    expect(flux.store("Store1")).to.equal(store1);
  });

  it("sets a 'flux' property on stores", () => {
    const store1 = {};
    const store2 = {};
    const stores = { Store1: store1, Store2: store2 };
    const flux = new Fluxxor.Flux(stores, {});
    expect(store1.flux).to.equal(flux);
    expect(store2.flux).to.equal(flux);
  });

  it("binds actions' `this.dispatch` to the dispatcher", () => {
    const actions = {
      act() { this.dispatch("ABC", {val: 123}); }
    };
    const flux = new Fluxxor.Flux({}, actions);
    flux.dispatcher.dispatch = sinon.spy();
    flux.actions.act();
    const action = {type: "ABC", payload: {val: 123}};
    expect(flux.dispatcher.dispatch).to.have.been.calledWith(action);
  });

  it("binds actions' `this.flux` to the flux instance", done => {
    let flux;

    const actions = {
      act() {
        expect(this.flux).to.equal(flux);
        done();
      }
    };

    flux = new Fluxxor.Flux({}, actions);
    flux.actions.act();
  });

  it("allows namespaced actions", () => {
    const actions = {
      a: {
        b: {
          c() { this.dispatch("action", {name: "a.b.c"}); }
        },
        d() { this.dispatch("action", {name: "a.d"}); }
      },
      e() { this.dispatch("action", {name: "e"}); }
    };
    const flux = new Fluxxor.Flux({}, actions);
    flux.dispatcher.dispatch = sinon.spy();
    flux.actions.e();
    expect(flux.dispatcher.dispatch).to.have.been.calledWith({type: "action", payload: {name: "e"}});
    flux.actions.a.d();
    expect(flux.dispatcher.dispatch).to.have.been.calledWith({type: "action", payload: {name: "a.d"}});
    flux.actions.a.b.c();
    expect(flux.dispatcher.dispatch).to.have.been.calledWith({type: "action", payload: {name: "a.b.c"}});
  });

  it("allows adding actions after Flux creation via addActions", () => {
    const actions = {
      a: {
        b: {
          c() { this.dispatch("action", {name: "a.b.c"}); }
        },
        d() { this.dispatch("action", {name: "a.d"}); }
      },
      e() { this.dispatch("action", {name: "e"}); }
    };
    const flux = new Fluxxor.Flux();
    flux.addActions(actions);
    flux.dispatcher.dispatch = sinon.spy();
    flux.actions.e();
    expect(flux.dispatcher.dispatch).to.have.been.calledWith({type: "action", payload: {name: "e"}});
    flux.actions.a.d();
    expect(flux.dispatcher.dispatch).to.have.been.calledWith({type: "action", payload: {name: "a.d"}});
    flux.actions.a.b.c();
    expect(flux.dispatcher.dispatch).to.have.been.calledWith({type: "action", payload: {name: "a.b.c"}});
  });

  it("allows adding actions after Flux creation via addAction", () => {
    const actions = {
      a: {
        b: {
          c() { this.dispatch("action", {name: "a.b.c"}); }
        },
        d() { this.dispatch("action", {name: "a.d"}); }
      },
      e() { this.dispatch("action", {name: "e"}); }
    };
    const flux = new Fluxxor.Flux({}, actions);
    flux.addAction("f", function() { this.dispatch("action", {name: "f"}); });
    flux.addAction("a", "b", "g", function() { this.dispatch("action", {name: "a.b.g"}); });
    flux.addAction("h", "i", "j", function() { this.dispatch("action", {name: "h.i.j"}); });
    flux.addAction(["k", "l", "m"], function() { this.dispatch("action", {name: "k.l.m"}); });
    flux.dispatcher.dispatch = sinon.spy();

    flux.actions.f();
    expect(flux.dispatcher.dispatch).to.have.been.calledWith({type: "action", payload: {name: "f"}});
    flux.actions.a.b.g();
    expect(flux.dispatcher.dispatch).to.have.been.calledWith({type: "action", payload: {name: "a.b.g"}});
    flux.actions.h.i.j();
    expect(flux.dispatcher.dispatch).to.have.been.calledWith({type: "action", payload: {name: "h.i.j"}});
    flux.actions.k.l.m();
    expect(flux.dispatcher.dispatch).to.have.been.calledWith({type: "action", payload: {name: "k.l.m"}});
  });

  it("does not allow replacing namespaces with actions", () => {
    const actions = {
      a: {
        b() { this.dispatch("action", {name: "a.b"}); }
      }
    };
    const flux = new Fluxxor.Flux({}, actions);
    expect(() => {
      flux.addAction("a", function() { this.dispatch("action", {name: "a.z"}); });
    }).to.throw(/namespace.*a.*already exists/);

    flux.dispatcher.dispatch = sinon.spy();
    flux.actions.a.b();
    expect(flux.dispatcher.dispatch).to.have.been.calledWith({type: "action", payload: {name: "a.b"}});
  });

  it("does not allow replacing actions", () => {
    const actions = {
      a: {
        b() { this.dispatch("action", {name: "a.b"}); }
      }
    };
    const flux = new Fluxxor.Flux({}, actions);
    expect(() => {
      flux.addAction("a", "b", "c", function() { this.dispatch("action", {name: "a.b.c"}); });
    }).to.throw(/action.*a\.b.*already exists/);

    flux.dispatcher.dispatch = sinon.spy();
    flux.actions.a.b();
    expect(flux.dispatcher.dispatch).to.have.been.calledWith({type: "action", payload: {name: "a.b"}});
  });

  it("does not allow replacing actions 2", () => {
    const actions = {
      a: {
        b() { this.dispatch("action", {name: "a.b"}); }
      }
    };
    const flux = new Fluxxor.Flux({}, actions);

    expect(() => {
      flux.addAction("a", "b", function() { this.dispatch("action", {name: "a.b.c"}); });
    }).to.throw(/An action named a.b already exists/);

    flux.dispatcher.dispatch = sinon.spy();
    flux.actions.a.b();
    expect(flux.dispatcher.dispatch).to.have.been.calledWith({type: "action", payload: {name: "a.b"}});
  });

  it("deeply merges with existing actions", () => {
    const actions = {
      a: {
        b() { this.dispatch("action", {name: "a.b"}); },
        c: {
          d() { this.dispatch("action", {name: "a.c.d"}); },
        }
      }
    };
    const flux = new Fluxxor.Flux({}, actions);

    flux.addAction("a", "c", "e", function() { this.dispatch("action", {name: "a.c.e"}); });

    flux.dispatcher.dispatch = sinon.spy();
    flux.actions.a.c.e();
    expect(flux.dispatcher.dispatch).to.have.been.calledWith({type: "action", payload: {name: "a.c.e"}});
  });

  it("throws when using addAction incorrectly", () => {
    const flux = new Fluxxor.Flux();

    expect(() => {
      flux.addAction();
    }).to.throw(/two arguments/);

    expect(() => {
      flux.addAction("a");
    }).to.throw(/two arguments/);

    expect(() => {
      flux.addAction("a", "b");
    }).to.throw(/last argument.*function/);

    expect(() => {
      flux.addAction("a", () => {}, "b");
    }).to.throw(/last argument.*function/);
  });

  describe("emitting dispatching", () => {
    beforeEach(() => {
      sinon.stub(console, "warn");
    });

    afterEach(() => {
      console.warn.restore();
    });

    it("emits an event when dispatching an action", () => {
      /* jshint -W030 */
      const payload1 = {payload: "1", thing: [1, 2, 3]};

      const payload2 = {payload: "2", thing: [1, 2, 3]};
      const payload3 = {payload: "3", thing: [1, 2, 3]};

      const actions = {
        a() { this.dispatch("ACTION_1", payload1); },
        b() { this.dispatch("ACTION_2", payload2); },
        c() { this.dispatch("ACTION_3", payload3); }
      };

      const spy1 = sinon.spy();
      const spy2 = sinon.spy();
      const spy3 = sinon.spy();

      const callback = (type, payload) => {
        if (type === "ACTION_1") { spy1(payload); }
        if (type === "ACTION_2") { spy2(payload); }
        if (type === "ACTION_3") { throw "ACTION_3"; }
      };

      const store = {
        __handleAction__(action) {
          spy3(action);
        }
      };

      const flux = new Fluxxor.Flux({store: store}, actions);

      flux.on("dispatch", callback);

      flux.actions.a();
      expect(spy1).to.have.been.calledWith(payload1);
      expect(spy2).not.to.have.been.called;
      flux.actions.b();
      expect(spy1).to.have.been.calledOnce;
      expect(spy2).to.have.been.calledWith(payload2);
      expect(() => {
        flux.actions.c();
      }).to.throw;
      expect(spy3).to.have.been.called;
    });
  });
});
