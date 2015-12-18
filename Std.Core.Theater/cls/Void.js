function refine(I) {
  "use strict";
  I.share({
    // expose subroutines to create events
    When: I._.Std._.Event._,
    // fulfill or reject a promised result when intermediate result is available
    promised: function (intermediate, onFulfillment, onRejection) {
      var handler = I.isError(intermediate) ? onRejection : onFulfillment;
      return handler ? handler(intermediate) : intermediate;
    }
  });
}