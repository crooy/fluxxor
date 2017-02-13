export const fakeLocalStorage = new Map();

const LocalStorageMixin = (Sup) => class extends Sup{
  constructor(){
    super();
    if (!this.stateToString) throw new Error("missing stateToString(value)");
    if (!this.stateFromString) throw new Error("missing stateFromString(value)");
  }

  stateToString(v){return JSON.stringify(v);}
  stateFromString(v){return JSON.parse(v);}

  setItem(key, value){
    try{
      localStorage.setItem(key, this.stateToString(value));
    }catch(e1){
      try{
        sessionStorage.setItem(key, this.stateToString(value));
      }catch(e2){
        fakeLocalStorage.set(key, value);
      }
    }
  }
  removeItem(key){
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
    fakeLocalStorage.delete(key);
  }
  getItem(key){
    try{
      return this.stateFromString(localStorage.getItem(key));
    }catch(e1){
      try{
        return this.stateFromString(sessionStorage.getItem(key));
      }catch(e2){
        return fakeLocalStorage.get(key);
      }
    }
  }
};

export default LocalStorageMixin;
