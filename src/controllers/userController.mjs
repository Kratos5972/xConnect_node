import {users} from '../Data/user_data.mjs'
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { generateJWT } from '../auth_helpers/jwt_generator.mjs';
import { UserSchema } from '../Mongoose Schema/user_schema.mjs';

export const getUserDataBody =  (req, res) => {
    console.log(req.query);
    const { name, value } = req.query;
    console.log(name, value);
    console.log(typeof name, typeof value);
    console.log("Cookies: ", req.cookies);
    console.log("Cookies Signed: ", req.signedCookies);
    console.log("Session: ", req.session);
    console.log("Session ID: ", req.sessionID);
    req.session.visited = true;
    res.cookie("User", 'Admin', { httpOnly: true, maxAge: 60000, secure: true, signed : true});
    if (name && value) {
        const filteredUsers = users.filter(user => {
            const userValue = String(user[name]);
            return userValue.toLowerCase().includes(String(value).toLowerCase());
        });
        return res.status(200).send(filteredUsers);
    }
    console.log('No filtering applied');
    res.status(200).send(users);
};

export const getUserDataByParam = (req, res) => {
    const userId = req.userId;
    console.log(userId, typeof userId);
    console.log("Cookies: ", req.cookies);
    console.log("Cookies Signed: ", req.signedCookies);
    console.log("Session ID: ", req.sessionID);
    req.sessionStore.get(req.sessionID, (err, session) => {
        if (err) {
            console.error('Error retrieving session:', err);
        }
        console.log("Session Data:", session);
    });
    const user = users.find(u => u.id === userId);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
};

export const postUserData = (req, res) => {
    const userData = req.body;
    const newID = users[users.length - 1].id + 1;
    const newUser = { id: newID, ...userData };
    users.push(newUser);
    res.status(201).json(newUser);

};

export const updateUserDataBody = (req, res) => {
    const userId = req.userId;
    const userData = req.body;
    console.log(userId, userData);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        res.status(404).json({ error: 'User not found' });
    } else {
        if (userData && userData.name && typeof userData.name === 'string') {
            users[userIndex] = { id: userId, name: userData.name };
            res.json(users[userIndex]);
        } else {
            res.status(400).json({ error: 'Invalid user data' });
        }
    }
};

export const patchUserDataBody = (req, res) => {
    const userId = req.userId;
    const userData = req.body;
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        res.status(404).json({ error: 'User not found' });
    } else {
        if (userData && userData.name && typeof userData.name === 'string') {
            users[userIndex] = { ...users[userIndex], name: userData.name };
            res.json(users[userIndex]);
        } else {
            res.status(400).json({ error: 'Invalid user data' });
        }
    }
};

export const deleteUserBody =  (req, res) => {
    const userId = req.userId;
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        res.status(404).json({ error: 'User not found' });
    } else {
        users.splice(userIndex, 1);
        res.json({ message: 'User deleted successfully' });
    }
};

export const encryptLoginBody = (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.name === username);
    console.log(user);
    // In real application, store hashedPassword in DB
    const hashedPassword = user ? bcrypt.hashSync(user.password, 10) : null;
    if (!user) {
        return res.status(401).json({ message: 'Incorrect username.' });
    }
    if (bcrypt.compareSync(password, hashedPassword)) {
        return res.json({ message: 'Login successful with encrypted password' });
    }
    return res.status(401).json({ message: 'Incorrect password.' });
};

export const registerUserBody = async (req, res) => {
    const { name, email, age, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new UserSchema({
        name,
        email,
        age,
        password: hashedPassword
    });
    try {
    const savedUser = await newUser.save();
    res.status(201).json({ message: 'User registered successfully', user: savedUser });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user', error });
    }

};

export const loginDbBody = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await UserSchema.findOne({ name: username });
        if (!user) {
            return res.status(401).json({ message: 'Incorrect username.' });
        }
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (isPasswordValid) {
            const token = generateJWT({ id: user._id, name: user.name, email: user.email, age: user.age });
            console.log('Generated JWT:', token);
            return res.json({ message: 'Login successful with DB', jwtToken: token, userData: {
                id: user._id,
                name: user.name,
                email: user.email,
                age: user.age
            } });
        }
        return res.status(401).json({ message: 'Incorrect password.' });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Error during login', error });
    }
};