import LocalStorageMixin from './LocalStorageMixin';
import Store from './store';

export class SingleValueOfflineFirstStore extends LocalStorageMixin(Store){
  constructor(name){
    super(name);
    this.cacheKey = `${name}_cache`;
    this.loadFromStorage();
  }
  set(value){
    if (JSON.stringify(value) !== JSON.stringify(this.value)){
      this.value = value;
      setTimeout(()=>{
        this.setItem(this.cacheKey, value);
        this.emit('cacheChange', key);
      })
      this.emit('change', value);
    }
  }

  loadFromStorage(){
    let fromCache = this.getItem(this.cacheKey);
    if (JSON.stringify(this.value) !== JSON.stringify(fromCache)){
      this.value = fromCache;
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
    let list = this.getItem(this.cacheIndexKey);
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
        this.emit('cacheChange', key);
      })
      this.value.set(key, value);
      this.emit('change', key, value);
    }
  }
  clear(){
    let index = new Set(this.getItem(this.cacheIndexKey));
    index.entries().forEach(k => localStorage.removeItem(this.cacheKey + k));
    localStorage.removeItem(this.cacheIndexKey);
  }

  loadFromStorage(key){
    let fromCache = this.getItem(this.cacheKey + key);
    let fromMem = this.value.get(key);
    if (JSON.stringify(fromMem) !== JSON.stringify(fromCache)){
      this.value.set(key, fromCache);
    }
  }

  get(key, orElse){
    console.log(`get key ${key}`);
    if (!this.value.get(key)){
      this.loadFromStorage(key);
    }
    return this.value.get(key) || orElse;
  }
}
