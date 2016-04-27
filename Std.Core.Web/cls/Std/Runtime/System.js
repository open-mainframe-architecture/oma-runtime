//@ Improve runtime system implementation in web browser or worker environment.
function refine(I) {
  "use strict";
  /*global MessageChannel*/
  const SIGNALS = new MessageChannel(), TASKS = [];
  // execute macro tasks when they become available
  SIGNALS.port1.addEventListener('message', () => { TASKS.shift()(); });
  SIGNALS.port1.start();
  I.refine({
    //@ Replace setTimeout implementation with MessageChannel.
    asap: function(closure) {
      // post message to signal availability of macro task
      SIGNALS.port2.postMessage(null);
      TASKS.push(closure);
    }
  });
}