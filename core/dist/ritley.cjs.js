'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var $adapter = null;

var normalizeUrl = function normalizeUrl(path) {
  return path ? path : "";
};

var AbstractResource = function () {
  function AbstractResource(_uri) {
    _classCallCheck(this, AbstractResource);

    this.$uri = _uri;
    this.adapter = $adapter;
    this.adapter.register(this);
  }

  AbstractResource.prototype.shouldHandle = function shouldHandle(req, base) {
    var matchingUrl = normalizeUrl(base) + normalizeUrl(this.$uri);
    return req.url.startsWith(matchingUrl);
  };

  AbstractResource.prototype.onRequest = function onRequest(req, res) {
    var methodName = req.method.toLowerCase();
    if (typeof this[methodName] !== "function") return console.warn("unhandled '" + methodName + "' request on " + this.$uri + " resource");
    this[methodName](req, res);
  };

  AbstractResource.prototype.mergeTasks = function mergeTasks() {
    var _this = this;

    for (var _len = arguments.length, tasks = Array(_len), _key = 0; _key < _len; _key++) {
      tasks[_key] = arguments[_key];
    }

    return {
      args: function args() {
        for (var _len2 = arguments.length, initialArgs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          initialArgs[_key2] = arguments[_key2];
        }

        return new Promise(function (resolve) {
          var caller = function caller(args) {
            var task = tasks.shift();
            if (task) task.apply(_this, args).then(function (result) {
              return caller(args.concat(result));
            }, function () {});else resolve(args.pop());
          };
          caller(initialArgs);
        });
      }
    };
  };

  return AbstractResource;
}();

var BaseAdapter = function () {
  function BaseAdapter(config) {
    _classCallCheck(this, BaseAdapter);

    this.listeners = [];
    if (config) this.config = config;else this.config = { base: "" };
    $adapter = this;
  }

  BaseAdapter.prototype.handle = function handle(req, res) {
    var timeout = setTimeout(this.timeout, 0, res);
    for (var i = 0; i < this.listeners.length; i++) {
      var instance = this.listeners[i];
      if (instance.shouldHandle(req, this.config.base)) {
        instance.onRequest(req, res);
        clearTimeout(timeout);
      }
    }
  };

  BaseAdapter.prototype.register = function register(resourceInstance) {
    this.listeners.push(resourceInstance);
  };

  BaseAdapter.prototype.timeout = function timeout(res) {
    res.statusCode = 404;
    res.end();
  };

  return BaseAdapter;
}();

module.exports = { BaseAdapter: BaseAdapter, AbstractResource: AbstractResource };

exports.BaseAdapter = BaseAdapter;
