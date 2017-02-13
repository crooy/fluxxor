import LocalStorageMixin from './LocalStorageMixin';
import Store from './store';

export class SingleValueOfflineFirstStore extends LocalStorageMixin(Store){
  constructor(name){
    super(name);
    this.cacheKey = `${name}_cache`;
    this.value = this.getItem(this.cacheKey);
  }
  set(value){
    if (JSON.stringify(value) !== JSON.stringify(this.value)){
      this.value = value;
      setTimeout(()=>{
        this.setItem(this.cacheKey, value);
      })
      this.emit('change', value);
    }
  }
  get(){
    return this.value;
  }
}


export class StringMapOfflineFirstStore extends LocalStorageMixin(Store){
  constructor(name){
    super(name);
    this.cacheKey = `${name}_cache:`;
    this.cacheIndexKey = `${name}_Index_cache`;

    this.value = new Map();
  }
  set(key, value){

    if (JSON.stringify(value) !== JSON.stringify(this.value.get(key))){

      setTimeout(()=>{
        //first update index
        let list = this.getItem(this.cacheIndexKey);
        let index = Array.isArray(list) ? new Set(list) : new Set();
        index.add(key);
        this.setItem(this.cacheIndexKey, index.entries());
        // now update key
        this.setItem(this.cacheKey + key, this.value.get(key));
      }

      this.value.set(key, value);
      this.emit('change', key, value);
    }
  }
  clear(){
    let index = new Set(this.getItem(this.cacheIndexKey));
    index.entries().forEach(k => localStorage.removeItem(this.cacheKey + k));
    localStorage.removeItem(this.cacheIndexKey);
  }

  get(key, orElse){
    console.log(`get key ${key}`);
    return this.value.get(key) || this.getItem(this.cacheKey + key) || orElse;
  }
}
