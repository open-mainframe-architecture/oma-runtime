function refine(I) {
  "use strict";
  I.share({
    //@{Std.Table} convenient access to subroutines from Std.Data.Typespace package
    Data: I._.Std._.Data._.Typespace._
  });
}