export const fakeLocalStorage = new Map();

const LocalStorageMixin = (Sup) => class extends Sup{
  constructor(name){
    super(name);
    this.stateToString = JSON.stringify;
    this.stateFromString = JSON.parse;
  }

  setItem(key, value){
    try{
      localStorage.setItem(key, this.stateToString(value));
    }catch(e1){
      console.log(e1);
      try{
        sessionStorage.setItem(key, this.stateToString(value));
      }catch(e2){
        console.log(e2);
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
      let val = localStorage.getItem(key);      
      return this.stateFromString(val);
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
