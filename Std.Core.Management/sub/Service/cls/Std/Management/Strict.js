//@ Strict supervision kills actors after they cause an error.
'BaseObject+Manager'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false,
    Service: true
  });
  I.know({
    assessDamage: I._.Damage._.returnLethal
  });
})