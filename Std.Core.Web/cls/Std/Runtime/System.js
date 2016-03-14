//@ Improve runtime system implementation in web browser or worker environment.
function refine(I) {
  "use strict";
  /*global MessageChannel*/
  I.refine({
    //@ Replace setTimeout implementation with MessageChannel.
    asap: function(closure) {
      // use postMessage of message channel to call closure in macrotask as soon as possible
      asapChannel.port2.postMessage(null);
      asapQueue.push(closure);
    }
  });
  I.setup(function() {
    asapChannel.port1.addEventListener('message', function() {
      var closure = asapQueue.shift();
      closure();
    });
    asapChannel.port1.start();
  });
  var asapChannel = new MessageChannel(), asapQueue = [];
}