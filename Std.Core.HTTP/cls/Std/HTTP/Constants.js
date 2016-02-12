//@ Constants of HTTP 1.1 standard.
'BaseObject'.subclass(function (I) {
  "use strict";
  I.share({
    //@{Object} HTTP method names.
    Method: {
      Connect: 'CONNECT',
      Delete: 'DELETE',
      Get: 'GET',
      Head: 'HEAD',
      Options: 'OPTIONS',
      Post: 'POST',
      Put: 'PUT',
      Trace: 'TRACE'
    },
    //@{Object} HTTP status names and codes.
    StatusCode: {
      Accepted: 202,
      BadGateway: 502,
      BadRequest: 400,
      Conflict: 409,
      Continue: 100,
      Created: 201,
      ExpectationFailed: 417,
      Forbidden: 403,
      Found: 302,
      GatewayTimeout: 504,
      Gone: 410,
      HTTPVersionNotSupported: 505,
      InternalServerError: 500,
      LengthRequired: 411,
      MethodNotAllowed: 405,
      MovedPermanently: 301,
      MultipleChoices: 300,
      NoContent: 204,
      NonAuthoritiveInformation: 203,
      NotAcceptable: 406,
      NotFound: 404,
      NotImplemented: 501,
      NotModified: 304,
      Ok: 200,
      PartialContent: 206,
      PaymentRequired: 402,
      PreconditionFailed: 412,
      ProxyAuthenticationRequired: 407,
      RequestEntityTooLarge: 413,
      RequestedRangeNotSatisfiable: 416,
      RequestTimeout: 408,
      RequestURITooLong: 414,
      ResetContent: 205,
      SeeOther: 303,
      ServiceUnavailable: 503,
      SwitchingProtocols: 101,
      TemporaryRedirect: 307,
      Unauthorized: 401,
      UnsupportedMediaType: 415,
      UseProxy: 305
    }
  });
  I.share({
    //@{Object} HTTP status codes and names.
    CodeStatus: Object.keys(I.StatusCode).reduce(function (accu, name) {
      // derive reverse mapping from numeric code to textual status
      accu[I.StatusCode[name]] = name;
      return accu;
    }, {})
  });
})