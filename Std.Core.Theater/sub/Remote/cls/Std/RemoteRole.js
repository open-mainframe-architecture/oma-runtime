'Role'.subclass({
  typespace$: 'Std.Data.Typespace'
}, (I, We) => {
  "use strict";
  We.have({
    //@{Std.Table} mapping from method name to remote signature
    remoteScenes: null
  });
  const Agent = I._.Theater._.Agent;
  We.know({
    build: function(container, key, module) {
      We.$super.build.call(this, container, key, module);
      setupRemoteScenes(this);
    },
    prepareScript: function(scriptInst, scriptMeta) {
      We.$super.prepareScript.call(this, scriptInst, scriptMeta);
      // I.remotely specifies scene method with a type signature
      scriptInst.remotely = scriptRemotely;
    },
    //@param spec {object|function} remote scene method specification
    createSceneKnowledge: function(key, spec) {
      if (!I.isClosure(spec)) {
        this.remoteScenes[key] = { inputs: spec.inputs, output: spec.output };
      }
      return We.$super.createSceneKnowledge.call(this, key, spec.method || spec);
    },
    //@ Transform input parameters of remote method.
    //@param selector {string} method name
    //@param typepace {Std.Data.Typespace} typespace marshals values
    //@param parameters {[*]} input parameters
    //@param canonical {boolean} true marshals parameters, false unmarshals parameters
    //@return {[*]} input transformations
    remoteDataIn: function(selector, typespace, parameters, canonical) {
      const signature = this.remoteScenes[selector];
      if (!signature || !signature.inputs) {
        // nothing to transform, keep parameters as they are
        return parameters;
      }
      return canonical ?
        signature.inputs.map((expression, i) => typespace.marshal(parameters[i], expression)) :
        signature.inputs.map((expression, i) => typespace.unmarshal(parameters[i], expression));
    },
    //@ Transform output result of remote method.
    //@param selector {string} method name
    //@param typepace {Std.Data.Typespace} typespace marshals values
    //@param result {*} output result
    //@param canonical {boolean} true marshals result, false unmarshals result
    //@return {*} output transformation
    remoteDataOut: function(selector, typespace, result, canonical) {
      const signature = this.remoteScenes[selector];
      if (!signature || !signature.output) {
        // nothing to transform, keep result as it is
        return result;
      }
      return canonical ?
        typespace.marshal(result, signature.output) :
        typespace.unmarshal(result, signature.output);
    },
    //@ Create remote agent.
    //@param manager {Std.Theater.Agent?} agent manager
    //@param stream {Std.Agent} stream for message transport
    //@param alternativeTypespace {Std.Data.Typespace?} nonstandard typespace or nothing
    //@return {Std.Theater.Agent} new agent
    spawnRemote: function(manager, stream, alternativeTypespace) {
      const typespace = alternativeTypespace || I.typespace$;
      const proxy = Agent._.RemoteProxy.create(stream, this, typespace);
      return this.spawnAgent(manager, proxy, this);
    }
  });
  function scriptRemotely(signature, closure) {
    const types = signature.split('=>').map(s => s.trim());
    const output = types.pop(), inputs = types[0] && types;
    return inputs || output ? { method: closure, inputs: inputs, output: output } : closure;
  }
  function setupRemoteScenes(roleClass) {
    roleClass.remoteScenes = I.createTable(roleClass.getParentBehavior().remoteScenes);
  }
  I.setup(() => setupRemoteScenes(I.$));
})