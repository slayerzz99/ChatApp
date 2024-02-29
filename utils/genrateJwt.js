const jwt = require("jsonwebtoken");

const genrateJwt = item => {
  const token = jwt.sign(
    { _id: item._id, name: item.name, email: item.email },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h"
    }
  );

  return token;
};

module.exports = genrateJwt;
