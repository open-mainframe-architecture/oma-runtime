//@ Improve runtime system implementation in web browser or worker environment.
function refine(I) {
  "use strict";
  /*global MessageChannel*/
  I.refine({
    //@ Replace setTimeout implementation with MessageChannel.
    asap: function (closure) {
      // use postMessage of message channel to call closure in macrotask as soon as possible
      var data = String(++asapSequence);
      asapChannel.port2.postMessage(data);
      asapCallbacks_[data] = closure;
    }
  });
  var asapChannel = new MessageChannel();
  var asapSequence = 0;
  var asapCallbacks_ = I.createTable();
  asapChannel.port1.onmessage = function (event) {
    var data = event.data, closure = asapCallbacks_[data];
    delete asapCallbacks_[data];
    closure();
  };
}