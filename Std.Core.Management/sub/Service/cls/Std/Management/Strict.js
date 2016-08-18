//@ Strict management kills actors after they cause an error.
'Role'.subclass(I => {
  "use strict";
  I.know({
    repairDamage: I.repairStrict
  });
})