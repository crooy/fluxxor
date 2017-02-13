import LocalStorageMixin from './LocalStorageMixin';
import Store from './store';

export class SingleValueOfflineFirstStore extends LocalStorageMixin(Store){
  constructor(name){
    super(name);
    this.name = name;
    this.isChanged = (a, b) => JSON.stringify(a) !== JSON.stringify(b);

    this.cacheKey = `${name}_cache`;
    this.loadFromStorage();
  }
  set(value){
    if (this.isChanged(value,this.value)){
      this.value = value;
      setTimeout(()=>{
        this.setItem(this.cacheKey, value);
        this.emit('cacheChange', this.cacheKey);
      })
      this.emit('change', value);
    }
  }

  loadFromStorage(){
    let fromCache = this.getItem(this.cacheKey);
    if (this.isChanged(fromCache, this.value)){
      this.value = fromCache;
      return true;
    }
    return false;
  }

  get(){
    return this.value;
  }
}


export class StringMapOfflineFirstStore extends LocalStorageMixin(Store){
  constructor(name){
    super(name);
    this.name = name;
    this.isChanged = (a, b) => JSON.stringify(a) !== JSON.stringify(b);
    this.cacheKey = `${name}_cache:`;
    this.cacheIndexKey = `${name}_Index_cache`;
    this.value = new Map();
  }
  set(key, value){
    console.log(`set key ${key}`);
    if (this.isChanged(value, this.value.get(key))){
      this.value.set(key, value);
      this.emit('change', key, value);
      setTimeout(()=>{
        // now update key
        this.setItem(this.cacheKey + key, this.value.get(key));
        this.emit('cacheChange', this.cacheKey + key);
      })
    }
  }

  loadFromStorage(key){
    let fromCache = this.getItem(this.cacheKey + key);
    let fromMem = this.value.get(key);
    if (this.isChanged(fromCache, this.value.get(fromMem))){
      this.value.set(key, fromCache);
      return true;
    }
    return false;
  }

  get(key){
    console.log(`get key ${key}`);
    if (!this.value.has(key)){
      let fromCache = this.getItem(this.cacheKey + key);
      this.value.set(key, fromCache);
    }
    return this.value.get(key);
  }
}
