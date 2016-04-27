function refine(I) {
  "use strict";
  I.refine({
    prepareScript: function(scriptInst, scriptMeta) {
      I.$former.prepareScript.call(this, scriptInst, scriptMeta);
      // I.remotely specifies scene method with a type signature
      scriptInst.remotely = scriptRemotely;
    }
  });
  I.know({
    //@ Transform input parameters of remote method.
    //@param selector {string} method name
    //@param typepace {Std.Data.Typespace} typespace marshals values
    //@param parameters {[any]} input parameters
    //@param canonical {boolean} true marshals parameters, false unmarshals parameters
    //@return {[any]} input transformations
    remoteDataIn: function(selector, typespace, parameters, canonical) {
      const specialties = this.findSpecialties(selector);
      if (!specialties || !specialties.inputs) {
        // nothing to transform, keep parameters as they are
        return parameters;
      }
      const transform = canonical ? typespace.marshal : typespace.unmarshal;
      return specialties.inputs.map((expr, i) => transform.call(typespace, parameters[i], expr));
    },
    //@ Transform output result of remote method.
    //@param selector {string} method name
    //@param typepace {Std.Data.Typespace} typespace marshals values
    //@param result {any} output result
    //@param canonical {boolean} true marshals result, false unmarshals result
    //@return {any} output transformation
    remoteDataOut: function(selector, typespace, result, canonical) {
      const specialties = this.findSpecialties(selector);
      if (!specialties || !specialties.output) {
        // nothing to transform, keep result as it is
        return result;
      }
      const expr = specialties.output;
      return canonical ? typespace.marshal(result, expr) : typespace.unmarshal(result, expr);
    }
  });
  function scriptRemotely(inputs, output, closure) {
    return closure ? { inputs: inputs, output: output, method: closure } :
      !output ? inputs || I.doNothing :
        Array.isArray(inputs) ? { inputs: inputs, method: output } :
          { inputs: [], output: inputs, method: output };
  }
}