import { Router } from "express"
import { getUserID } from "../middleware/users_middleware.mjs"
import { userSchema, validateBody } from "../Utils/validationSchemas.mjs"
import passport from 'passport';
import { authMiddleware } from "../middleware/auth_middleware.mjs";
import { getUserDataBody, getUserDataByParam, postUserData, updateUserDataBody, patchUserDataBody, deleteUserBody, encryptLoginBody, registerUserBody, loginDbBody } from "../controllers/userController.mjs"

const router = Router();

router.get('/', (req, res) => {
    res.send('Hello, Express with ES Modules!');
});
// Endpoint to get all users or filter users based on query parameters
router.get('/api/users', getUserDataBody);
router.get('/users', (req, res) => {
    res.redirect('/api/users');
});

// Endpoint to get a user by ID parameter
router.get('/api/users/:id', getUserID, getUserDataByParam);
// Endpoint to create a new user
router.post('/api/users', validateBody(userSchema), postUserData);

router.post('/api/registerUser', registerUserBody);

router.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);

        if (!user) {
            return res.status(401).json({
                message: info?.message || 'Login failed'
            });
        }

        req.logIn(user, (err) => {
            if (err) return next(err);

            console.log('Session ID after login:', req.sessionID);
            console.log('User info after login:', req.user);
            console.log('User serialized info:', user);
            return res.json({
                message: 'Login successful',
                userData: {
                    id: user.id.coerce,
                    name: user.name,
                    email: user.email,
                    age: user.age
                }
            });
        });
    })(req, res, next);
});

router.post('/api/loginDb', loginDbBody);

router.post('/api/encryptLogin', encryptLoginBody);

router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    function (req, res) {
        // Successful authentication, redirect home.
        // res.redirect('/api/users');
        res.send({ message: 'Google Authentication successful', user: req.user });
    });

router.get('/api/profile', authMiddleware, (req, res) => {
    res.send({ message: 'Protected profile data', user: req.user });
});

// Endpoint to update a user by ID  
router.put('/api/users/:id', getUserID, updateUserDataBody);
router.patch('/api/users/:id', getUserID, patchUserDataBody);
// Endpoint to delete a user by ID
router.delete('/api/users/:id', getUserID, deleteUserBody);

export default router;
