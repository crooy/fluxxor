"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dispatcher = require("./lib/dispatcher");

var _dispatcher2 = _interopRequireDefault(_dispatcher);

var _flux = require("./lib/flux");

var _flux2 = _interopRequireDefault(_flux);

var _flux_mixin = require("./lib/flux_mixin");

var _flux_mixin2 = _interopRequireDefault(_flux_mixin);

var _flux_child_mixin = require("./lib/flux_child_mixin");

var _flux_child_mixin2 = _interopRequireDefault(_flux_child_mixin);

var _store_watch_mixin = require("./lib/store_watch_mixin");

var _store_watch_mixin2 = _interopRequireDefault(_store_watch_mixin);

var _create_store = require("./lib/create_store");

var _create_store2 = _interopRequireDefault(_create_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Fluxxor = {
  Dispatcher: _dispatcher2.default,
  Flux: _flux2.default,
  FluxMixin: _flux_mixin2.default,
  FluxChildMixin: _flux_child_mixin2.default,
  StoreWatchMixin: _store_watch_mixin2.default,
  createStore: _create_store2.default,
  version: require("./version")
};

exports.default = Fluxxor;