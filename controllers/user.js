const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then((hashedPass) => {
    const user = new User({
      email: req.body.email,
      password: hashedPass,
    });

    user
      .save()
      .then((result) => {
        res.status(201).json({
          message: "User created",
          result,
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  });
};

exports.loginUser = (req, res, next) => {
  let userData;
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        throw new Error();
      }
      userData = user;

      return bcrypt.compare(req.body.password, user.password);
    })
    .then((result) => {
      if (!result) {
        throw new Error();
      }

      const expireDurationSeconds = 3600;
      const token = jwt.sign(
        { email: userData.email, userId: userData._id },
        process.env.JWTSECRET,
        { expiresIn: expireDurationSeconds + "s" }
      );

      res.status(200).json({
        token,
        expiresInSeconds: expireDurationSeconds,
        userId: userData._id,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        message: "Invalid authentication credentials!",
      });
    });
};
