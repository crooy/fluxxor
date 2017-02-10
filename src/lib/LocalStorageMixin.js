var fakeLocalStorage = new Map();

const LocalStorageMixin = (Sup) => class extends Sup{
  constructor(){
    super();
  }
  setItem(key, value){
    try{
      localStorage.setItem(key, JSON.stringify(value));
    }catch(e1){
      try{
        sessionStorage.setItem(key, JSON.stringify(value));
      }catch(e2){
        fakeLocalStorage.set(key, value);
      }
    }
  }
  getItem(key){
    try{
      return JSON.parse(localStorage.getItem(key));
    }catch(e1){
      try{
        return JSON.parse(sessionStorage.getItem(key));
      }catch(e2){
        return fakeLocalStorage.get(key);
      }
    }
  }
};

export default LocalStorageMixin;
