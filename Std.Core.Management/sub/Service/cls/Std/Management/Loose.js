//@ Loose management allows actor to work after they cause an error.
'Role'.subclass(I => {
  "use strict";
  I.know({
    repairDamage: I.repairLoose
  });
})