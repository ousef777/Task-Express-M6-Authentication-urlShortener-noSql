const User = require('../models/User');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const { fromAuthHeaderAsBearerToken } = require('passport-jwt').ExtractJwt;
const { JWT_SECRET } = require('../config/keys');


exports.localStrategy = new LocalStrategy(
    { usernameField: 'username' }, 
    async (username, password, done) => {
    try {
        const user = await User.findOne({ username: username });
        let passwordsMatch = false;
        if (user) {
            passwordsMatch = await bcrypt.compare(password, user.password); 
        }
        if (passwordsMatch) return done(null, user);
        else return done(null, false);
    } catch (error) {
        // console.log("here");
        done(error);
    }
});

exports.jwtStrategy = new JWTStrategy(
    {
        jwtFromRequest: fromAuthHeaderAsBearerToken(),
        secretOrKey: JWT_SECRET
    }, 
    async (jwtPayload, done) => {
        // console.log('here');
        if (Date.now() > jwtPayload.exp) {
            return done(null, false); // this will throw a 401
        }
        try {
            const user = await User.findById(jwtPayload._id);
            done(null, user); // if there is no user, this will throw a 401
        } catch (error) {
            // console.log('here');
            done(error);
        }
    }
);