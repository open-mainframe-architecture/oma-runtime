//@ A Uniform Resource Identifier.
'Object'.subclass(I => {
  "use strict";
  I.have({
    //@{string} URI scheme, e.g. http or ftp or about
    uriScheme: null,
    //@{string} user name if credentials are important
    uriUser: null,
    //@{string} 'hidden' password of user
    uriPassword: null,
    //@{string} host name
    uriHost: null,
    //@{string} port number
    uriPort: null,
    //@{[string]?} array with path elements
    uriPath: null,
    //@{[[string]]?} array with parameters where each parameter is array with name and value
    uriQuery: null,
    //@{string} fragment is only significant for browsers
    uriFragment: null
  });
  // hoist global functions
  const encodeString = encodeURIComponent, decodeString = decodeURIComponent;
  // hoist utility function
  const encodeParameter = pair => `${encodeString(pair[0])}=${encodeString(pair[1])}`;
  const decodeParameter = parameter => parameter.split('=').map(decodeString);
  I.know({
    //@param scheme {string?} URI scheme
    //@param user {string?} user name
    //@param password {string?} user password
    //@param host {string?} host name
    //@param port {string?} host port
    //@param path {[string]?} path elements
    //@param query {[[string]]?} parameter names and values
    //@param fragment {string?} URI fragment
    build: function(scheme, user, password, host, port, path, query, fragment) {
      I.$super.build.call(this);
      this.uriScheme = scheme && scheme.toLowerCase() || '';
      this.uriUser = host && user || '';
      this.uriPassword = host && user && password || '';
      this.uriHost = host && host.toLowerCase() || '';
      this.uriPort = host && port || '';
      this.uriPath = path || null;
      this.uriQuery = query || null;
      this.uriFragment = fragment || '';
    },
    //@ Compute encoded representation of this URI.
    //@return {string} string of encoded URI
    encode: function() {
      const output = [];
      if (this.uriScheme) {
        output.push(encodeString(this.uriScheme), ':');
      }
      if (this.uriScheme || this.uriHost) {
        output.push('//');
      }
      if (this.uriHost) {
        if (this.uriUser) {
          output.push(encodeString(this.uriUser), '@');
        }
        output.push(encodeString(this.uriHost), this.uriPort ? ':' : '', this.uriPort);
      }
      if (this.uriPath) {
        output.push(this.uriPath.map(encodeString).join('/'));
      }
      if (this.uriQuery) {
        output.push('?', this.uriQuery.map(encodeParameter).join('&'));
      }
      if (this.uriFragment) {
        output.push('#', this.uriFragment);
      }
      return output.join('');
    },
    //@ Get filename from last path element.
    //@return {string} filename or empty string if path is empty
    getFilename: function() {
      const path = this.uriPath;
      return path ? path[path.length - 1] : '';
    },
    //@ Get URI fragment.
    //@return {string} fragment, possible empty
    getFragment: function() {
      return this.uriFragment;
    },
    //@ Get host name or address.
    //@return {string} host, possible empty
    getHost: function() {
      return this.uriHost;
    },
    //@ Get user password.
    //@return {string} password, possible empty
    getPassword: function() {
      return this.uriPassword;
    },
    //@ Get port number on host.
    //@return {string} port number, possible empty
    getPort: function() {
      return this.uriPort;
    },
    //@ Get URI scheme.
    //@return {string} scheme, possible empty
    getScheme: function() {
      return this.uriScheme;
    },
    //@ Get user name.
    //@return {string?} name, possible empty
    getUser: function() {
      return this.uriUser;
    },
    //@ Is the path of this URI nonempty?
    //@return {boolean} true if path is nonempty, otherwise false for empty path
    hasPath: function() {
      return !!this.uriPath;
    },
    //@ Is the path of this URI absolute?
    //@return {boolean} true if path is absolute, otherwise false for relative path
    isAbsolute: function() {
      return !!this.uriPath && !this.uriPath[0];
    },
    //@ Iterate over URI parameter pairs.
    //@return {iterable} iterable parameter pairs (each pair is array with name and value)
    iterateParameters: function() {
      return this.uriQuery ? this.uriQuery[Symbol.iterator]() : I.Loop.Empty;
    },
    //@ Iterate over path elements.
    //@return {iterable} iterable path elements
    iteratePath: function() {
      const path = this.uriPath;
      if (!path) {
        return I.Loop.Empty;
      }
      const iterable = path[Symbol.iterator]();
      if (!path[0]) {
        // skip empty header element of absolute paths
        iterable.next();
      }
      return iterable;
    },
    //@ Clone this URI without credentials, i.e. without user and password.
    //@return {Std.HTTP.URI} this or a new URI
    withoutCredentials: function() {
      if (this.uriUser) {
        const scheme = this.uriScheme, host = this.uriHost, port = this.uriPort;
        const path = this.uriPath, query = this.uriQuery, fragment = this.uriFragment;
        return I.$.create(scheme, '', '', host, port, path, query, fragment);
      }
      return this;
    },
    //@ Clone this URI except without the fragment part.
    //@return {Std.HTTP.URI} this or a new URI
    withoutFragment: function() {
      if (this.uriFragment) {
        const user = this.uriUser, password = this.uriPassword;
        const scheme = this.uriScheme, host = this.uriHost, port = this.uriPort;
        const path = this.uriPath, query = this.uriQuery;
        return I.$.create(scheme, user, password, host, port, path, query);
      }
      return this;
    }
  });
  // regular expression to match URI scheme, authority, path, query and fragment
  const TopPattern = /^(?:([^:/?#]+):)?(?:\/\/([^/?#]*))?([^?#]+)?(?:\?([^#]*))?(?:#(.*))?$/;
  // regular expression to match user, password, host and port in nonempty URI authority
  const NestedPattern = /^(?:([^:]+)(?::(.*))@)?([^:]+)(?::([0-9]{1,5}))?$/;
  I.share({
    //@ Try to decode URI.
    //@param input {string} string of encoded URI
    //@return {Std.HTTP.URI?} decoded URI or nothing
    //@more https://url.spec.whatwg.org, https://tools.ietf.org/html/rfc3986#appendix-B
    decode: function(input) {
      const components = TopPattern.exec(input);
      if (components) {
        const authority = components[2] && NestedPattern.exec(components[2]);
        if (!components[2] || authority) {
          const scheme = components[1] && decodeString(components[1]);
          const user = authority && authority[1] && decodeString(authority[1]);
          const password = authority && authority[2] && decodeString(authority[2]);
          const host = authority && authority[3] && decodeString(authority[3]);
          const port = authority && authority[4] && decodeString(authority[4]);
          const path = components[3] && components[3].split('/').map(decodeString);
          const query = components[4] && components[4].split('&').map(decodeParameter);
          const fragment = components[5] && decodeString(components[5]);
          return I.$.create(scheme, user, password, host, port, path, query, fragment);
        }
      }
    }
  });
})