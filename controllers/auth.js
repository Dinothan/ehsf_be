const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const User = require("../models/user");
const Session = require("../models/sessions");
const jwt = require("jsonwebtoken");

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            jwt.sign(
              { user },
              "secretkey",
              // { expiresIn: "30s" },
              (err, token) => {
                res.json({
                  token,
                  user: user
                });
                req.session.user = user;
                req.session.token = token;
                return req.session.save((err) => {
                  console.log("err sess:", err);
                });
              }
            );
          }
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => console.log(err));
};

exports.getSignup = (req, res, next) => {};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body?.password;
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const gender = req.body.gender;
  const phone = req.body.phone;
  const city = req.body.city;
  const state = req.body.state;
  const country = req.body.country;
  const id = req.body?._id;

  if (!id) {
    User.findOne({ email: email })
      .then((userDoc) => {
        if (userDoc) {
          return res.send("User already exist");
        }
        return bcrypt
          .hash(password, 12)
          .then((hashPassword) => {
            const user = new User({
              email: email,
              password: hashPassword,
              phone: phone,
              gender: gender,
              city: city,
              state: state,
              country: country,
              firstname: firstname,
              lastname: lastname
            });
            return user.save();
          })
          .then((result) => {
            console.log("result :", result);
            return res.send("successfully created");
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    let us = {
      email: email,
      password: hashPassword,
      phone: phone,
      gender: gender,
      city: city,
      state: state,
      country: country,
      firstname: firstname,
      lastname: lastname
    };
    User.findByIdAndUpdate(id, us).then((user) => {
      us = {
        _id: id,
        email: email,
        phone: phone,
        gender: gender,
        city: city,
        state: state,
        country: country,
        firstname: firstname,
        lastname: lastname
      };
      res.send(us);
    });
  }
};

exports.getUser = (req, res, next) => {
  const email = req.body.id;
  User.findOne({ id: email })

    .then((user) => {
      res.send(user);
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    let token = req.token;
    Session.deleteOne({ "session.token": token })
      .then((response) => {
        req.token = null;
        res.send();

        console.log("res.session :", response);
      })
      .catch((err) => console.log("err :", err));
  });
};
