const { AuthenticationError } = require('apollo-server');

const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const config = require('config');

const AUTH_DOMAIN = config.get('AUTH_DOMAIN');
const AUTH_CLIENT_ID = config.get('AUTH_CLIENT_ID');


// https://blog.apollographql.com/authorization-in-graphql-452b1c402a9
// https://auth0.com/blog/develop-modern-apps-with-react-graphql-apollo-and-add-authentication/
const client = jwksClient({
  jwksUri: `https://${AUTH_DOMAIN}/.well-known/jwks.json`
});

function getKey(header, cb){
  client.getSigningKey(header.kid, function(err, key) {
    var signingKey = key.publicKey || key.rsaPublicKey;
    cb(null, signingKey);
  });
}
const options = {
  audience: AUTH_CLIENT_ID,
  issuer: `https://${AUTH_DOMAIN}/`,
  algorithms: ['RS256']
};

function authenticated(data) {
  return async (_, _2, { user }) => {
    try {
      await user;
      return data
    } catch(e) {
      throw new AuthenticationError('You must be logged in to do this');
    }
  }
}

function authContext({ req })  {
  // simple auth check on every request
  const token = req.headers.authorization;
  const user = new Promise((resolve, reject) => {
    jwt.verify(token, getKey, options, (err, decoded) => {
      if(err) {
        return reject(err);
      }
      resolve(decoded.email);
    });
  });

  return {
    user
  };
}

module.exports = {
  authenticated,
  authContext
}
