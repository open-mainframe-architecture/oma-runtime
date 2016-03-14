function refine(I) {
  "use strict";
  I.share({
    //@{Std.Table} convenient access to subroutines from Std.Data.AbstractValue package
    Data: I._.Std._.Data._.AbstractValue._
  });
}