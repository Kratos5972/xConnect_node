import express from 'express';
import dotenv from "dotenv";
import router from "../src/Routers/user_routes.mjs"
import cookieParser from 'cookie-parser';
import session from 'express-session';
import mongoose from 'mongoose';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import { users } from '../src/Data/user_data.mjs';
import { UserSchema } from '../src/Mongoose Schema/user_schema.mjs';
const app = express();
const PORT = 3000;
dotenv.config();

app.use(express.json());
app.use(cookieParser("secretKey"));
app.use(session({
    secret: process.env.SESSION_SECRET || 'defaultSecret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 60000 } // Set to true if using HTTPS
}));
mongoose.connect('mongodb://localhost:27017/express_session_db').then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(
    { usernameField: 'username', passwordField: 'password' },
    function (username, password, done) {
        // Dummy authentication for demonstration
        console.log(username, password);
        const user = users.find(u => u.name === username);
        if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
        }
        if (user.password === password) {
            // return done(null, { id: user.id, username: user.name , email: user.email, age: user.age });
            return done(null, user);
        }
        return done(null, false, { message: 'Incorrect password.' });
    }
));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
}, async function (accessToken, refreshToken, profile, done) {
    // In a real application, you'd look up or create the user in your database here.
    try {
        const user = await UserSchema.findOne({ email: profile.emails[0].value });
        if (!user) {
            const newUser = new UserSchema({
                name: profile.displayName,
                email: profile.emails[0].value,
                age: 21
            });
            newUser.save();
            return done(null, newUser);
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser(function (user, done) {
    done(null, user);
}
);

passport.deserializeUser(function (id, done) {
    const user = users.find(u => u.id === id);
    done(null, user ? { id: user.id, username: user.name } : false);
});

app.use(router);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

