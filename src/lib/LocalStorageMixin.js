export const fakeLocalStorage = new Map();

const LocalStorageMixin = (Sup) => class extends Sup{
  constructor(){
    super();
    if (!this.stateToString) throw new Error("missing stateToString(value)");
    if (!this.stateFromString) throw new Error("missing stateFromString(value)");
  }

  stateToString(v){return JSON.stringify(v);}
  stateFromString(v){return JSON.parse(v);}

  setItem(key, value, serializer = this.stateToString){
    try{
      localStorage.setItem(key, serializer(value));
    }catch(e1){
      try{
        sessionStorage.setItem(key, serializer(value));
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
  getItem(key, deserializer = this.stateFromString){
    try{
      return deserializer(localStorage.getItem(key));
    }catch(e1){
      try{
        return deserializer(sessionStorage.getItem(key));
      }catch(e2){
        return fakeLocalStorage.get(key);
      }
    }
  }
};

export default LocalStorageMixin;
