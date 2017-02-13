import Fluxxor from "../../src";
import chai from "chai";
const expect = chai.expect;
// import sinon from "sinon";
import sinonChai from "sinon-chai";

import {fakeLocalStorage} from '../../src/lib/LocalStorageMixin';

chai.use(sinonChai);

describe("offlineFirststores", () => {
  describe("SingleValueOfflineFirstStore", () => {
    it("works in the empty case ", () => {
      fakeLocalStorage.clear();
      let tested = new Fluxxor.SingleValueOfflineFirstStore();

      expect(tested.get()).to.be.undefined;
    });

    it("can store a value", () => {
      fakeLocalStorage.clear();
      let tested = new Fluxxor.SingleValueOfflineFirstStore();
      let given = {
        a: 2,
        b: {
          c: 3
        }
      };
      tested.set(given);

      expect(tested.get()).to.equal(given);
    });

    it("can store a value, which is shared among same named stores", (done) => {
      fakeLocalStorage.clear();
      let given = {
        a: 2,
        b: {
          c: 3
        }
      };

      let tested = new Fluxxor.SingleValueOfflineFirstStore("Test3");
      tested.set(given);
      expect(tested.get()).to.equal(given);

      tested.on("change", () => {
        let tested2 = new Fluxxor.SingleValueOfflineFirstStore("Test3");
        expect(tested2.get()).to.not.equal(given);
      });

      tested.on("cacheChange", (key) => {
        let tested2 = new Fluxxor.SingleValueOfflineFirstStore("Test3");
        expect(key).to.equal(tested2.cacheKey);
        expect(tested2.get()).to.equal(given);
        done();
      });
    });
  });
  describe("StringMapOfflineFirstStore", () => {
    it("works in the empty case ", () => {
      fakeLocalStorage.clear();
      let tested = new Fluxxor.StringMapOfflineFirstStore();

      expect(tested.get("fakekey")).to.be.undefined;
    });

    it("can store a value", () => {
      fakeLocalStorage.clear();
      let tested = new Fluxxor.StringMapOfflineFirstStore();
      let given = {
        a: 2,
        b: {
          c: 3
        }
      };
      tested.set("keyname4",given);

      expect(tested.get("keyname4")).to.equal(given);
    });

    it("can store a value, which is shared among same named stores", (done) => {
      fakeLocalStorage.clear();
      let given = {
        a: 2,
        b: {
          c: 3
        }
      };
      let givenKey = "keyname4";

      let tested = new Fluxxor.StringMapOfflineFirstStore("Test3");
      tested.set(givenKey, given);
      expect(tested.get(givenKey)).to.equal(given);

      tested.on("change", () => {
        let tested2 = new Fluxxor.StringMapOfflineFirstStore("Test3");
        expect(tested2.get(givenKey)).to.equal(given);
      });

      tested.on("cacheChange", (key) => {
        let tested2 = new Fluxxor.StringMapOfflineFirstStore("Test3");
        expect(key).to.equal("Test3_cache:keyname4");
        expect(tested2.get(givenKey)).to.equal(given);
        done();
      });
    });
  });
});
