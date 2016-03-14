//@ Loose supervision allows actor to work after they cause an error.
'BaseObject+Manager'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false,
    Service: true
  });
  I.know({
    assessDamage: I._.Damage._.returnMinimal
  });
})