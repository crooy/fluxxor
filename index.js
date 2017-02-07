import Dispatcher from "./lib/dispatcher";
import Flux from "./lib/flux";
import FluxMixin from "./lib/flux_mixin";
import FluxChildMixin from "./lib/flux_child_mixin";
import StoreWatchMixin from "./lib/store_watch_mixin";
import createStore from "./lib/create_store";

const Fluxxor = {
  Dispatcher: Dispatcher,
  Flux: Flux,
  FluxMixin: FluxMixin,
  FluxChildMixin: FluxChildMixin,
  StoreWatchMixin: StoreWatchMixin,
  createStore: createStore,
  version: require("./version")
};

export default Fluxxor;
