'super'.subclass({
  $extra: 'Std.Theater.Extra'
}, function(I) {
  "use strict";
  I.know({
    play: function(immobile) {
      var job = I.$extra.performScene(this);
      return immobile ? job : job.running();
    }
  });
})