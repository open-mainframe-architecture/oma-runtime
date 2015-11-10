function refine(I) {
  "use strict";
  /*global window*/
  // I improve runtime systems of browser environments.
  var performance = window.performance;
  var uptimeOffset = I.$.$rt.getUptime() - performance.now() / 1000;
  I.refine({
    // improve on setTimeout implementation
    asap: function(closure) {
      // use window.postMessage to call closure in macrotask as soon as possible
      var data = asapPrefix + Math.random();
      window.postMessage(data, '*');
      asapCallbacks_[data] = closure;
    },
    // improve on Date.now() implementation with performance.now()
    getUptime: function() {
      // convert from milliseconds to seconds and adjust for different epochs
      return performance.now() / 1000 + uptimeOffset;
    }
  });
  // event listener for asap support
  var asapCallbacks_ = I.createTable();
  var asapPrefix = Math.random() + '/';
  window.addEventListener('message', function(event) {
    if (event.source === window) {
      var data = event.data;
      var closure = typeof data === 'string' && asapCallbacks_[data];
      if (closure) {
        delete asapCallbacks_[data];
        closure();
      }
    }
  });
}