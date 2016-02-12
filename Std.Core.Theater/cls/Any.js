function refine(I) {
  "use strict";
  I.share({
    //@{Rt.Table} convenient access to subroutines from Std.Event package
    When: I._.Std._.Event._,
    //@ Fulfill or reject a promised result when intermediate result is available.
    //@param intermediate {any} JavaScript object or value
    //@param onFulfillment {Rt.Closure} called with intermediate success
    //@param onRejection {Rt.Closure} called with intermediate error/failure
    //@return {any} promised result
    promised: function (intermediate, onFulfillment, onRejection) {
      var handler = I.isError(intermediate) ? onRejection : onFulfillment;
      return handler ? handler(intermediate) : intermediate;
    }
  });
}