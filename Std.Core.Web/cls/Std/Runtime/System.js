//@ Improve runtime system implementation in web browser or worker environment.
function refine(I) {
  "use strict";
  /*global MessageChannel*/
  // 'extra instance state' of runtime system singleton is confined to this script
  const signals = new MessageChannel(), macrotasks = [];
  I.refine({
    //@ Replace setTimeout implementation with MessageChannel.
    asap: function(callback) {
      signals.port2.postMessage(null);
      macrotasks.push(callback);
    }
  });
  I.setup(() => {
    // a macrotask should run after control has been given back to the global event loop
    signals.port1.addEventListener('message', () => { macrotasks.shift()(); });
    signals.port1.start();
  });
}