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
      this.setItem(this.cacheKey, value);
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
      //first update index
      let index = new Set(this.getItem(this.cacheIndexKey));
      index.add(key);
      this.setItem(this.cacheIndexKey, index.entries());

      // now update key
      this.value.set(key, value);
      this.setItem(this.cacheKey + key, this.value);

      this.emit('change', key, value);
    }
  }
  get(key, orElse){
    console.log(`get key ${key}`);
    return this.value.get(key) || this.getItem(this.cacheKey + key) || orElse;
  }
}
