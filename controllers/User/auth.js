const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const nodemailer = require("nodemailer");

exports.register = (req, res) => {
    const { name, email, password } = req.body;

    User.findOne({ "email": email }).exec((err, user) => {
        if (user) {
            console.log("Email is taken");
            return res.status(400).json({
                error: 'Email is taken',
            });
        }
        else if (err) {
            console.log("Error Occured in finding user'");
            return res.status(400).json({
                error: 'Error Occured in finding user',
            });
        }
        else {
            let newUser = new User({ name, email, password });
            console.log(newUser);
        
            newUser.save((err, success) => {
                if (err) {
                    console.log('SIGNUP ERROR', err);
                    return res.status(400).json({
                        error: err,
                    });
                }
                else {
                    return res.json({
                        message: 'Successfully registered! Please Login'
                    });
                }
        
            });
        }
    });
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    const senderEmail = require('../../config/keys').email;
    const senderPassword = require('../../config/keys').password;
    const receiverEmail = ["aman.dwivedi5@gmail.com","help.eventup@gmail.com" ];
    const emailMessage = "This is a testing email !!!";

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: senderEmail,
          pass: senderPassword
        }
      });
  
    var mailOptions = {
        from: senderEmail,
        to: receiverEmail,
        subject: 'Test Email',
        text: emailMessage,
    };
  
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent successfully' );
        }
    });   

    // check if user exist
    User.findOne({ email }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User with that email does not exist. Please signup'
            });
        }
        // authenticate
        if (!user.authenticate(password)) {
            return res.status(400).json({
                error: 'Email and password do not match'
            });
        }
        else {
            // generate a token and send to client
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
            const { _id, name, email } = user;

            return res.json({
                token,
                user: { _id, name, email }
            });
        }

    });
};

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256']
});