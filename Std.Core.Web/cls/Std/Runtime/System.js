//@ Improve runtime system implementation in web browser or worker environment.
function refine(I) {
  "use strict";
  /*global MessageChannel*/
  // 'extra instance state' of runtime system singleton is confined to this script
  const signals = new MessageChannel(), tasks = [];
  I.refine({
    //@ Replace setTimeout implementation with MessageChannel.
    asap: function(closure) {
      signals.port2.postMessage(null);
      tasks.push(closure);
    }
  });
  I.setup(() => {
    // execute macro tasks when they become available
    signals.port1.addEventListener('message', () => { tasks.shift()(); });
    signals.port1.start();
  });
}