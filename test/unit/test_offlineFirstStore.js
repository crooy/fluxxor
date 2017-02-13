import Fluxxor from "../../src";
import chai from "chai";
const expect = chai.expect;
// import sinon from "sinon";
import sinonChai from "sinon-chai";

import {fakeLocalStorage} from '../../src/lib/LocalStorageMixin';

chai.use(sinonChai);

describe("offlineFirststores", () => {
  describe("SingleValueOfflineFirstStore", () => {

    afterEach(() => {
        localStorage.clear();
    // remove callback
        localStorage.itemInsertionCallback = null;
    });

    it("works in the empty case ", () => {
      fakeLocalStorage.clear();
      let tested = new Fluxxor.SingleValueOfflineFirstStore();

      expect(tested.get()).to.be.null;
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
      expect(tested.get()).to.eql(given);

      tested.on("change", () => {
        let tested2 = new Fluxxor.SingleValueOfflineFirstStore("Test3");
        expect(tested2.get()).to.not.eql(given);
      });

      tested.on("cacheChange", (key) => {
        let tested2 = new Fluxxor.SingleValueOfflineFirstStore("Test3");
        expect(key).to.equal(tested2.cacheKey);
        expect(typeof tested2.get()).to.not.equal('string');
        expect(tested2.get()).to.eql(given);
        done();
      });
    });
  });

  describe("StringMapOfflineFirstStore", () => {

    afterEach(() => {
      localStorage.clear();
    // remove callback
        localStorage.itemInsertionCallback = null;
    });

    it("works in the empty case ", () => {
      fakeLocalStorage.clear();
      let tested = new Fluxxor.StringMapOfflineFirstStore();

      expect(tested.get("fakekey")).to.be.null;
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
      setTimeout(()=>{
        fakeLocalStorage.clear();
        let given = {
          a: 2,
          b: {
            c: 3
          }
        };
        let givenKey = "keyname4";

        let tested = new Fluxxor.StringMapOfflineFirstStore("Test3");        

        tested.on("cacheChange", (key) => {
          let tested2 = new Fluxxor.StringMapOfflineFirstStore("Test3");
          expect(key).to.equal("Test3_cache:keyname4");
          expect(tested2.get(givenKey)).to.eql(given);
          setTimeout(()=>{
            done();
          },200);
        });

        tested.set(givenKey, given);
        expect(tested.get(givenKey)).to.eql(given);
      },100);
    });
  });
});
