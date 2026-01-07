
export const getUserID = (req, res, next) => {
    const userId = parseInt(req.params.id, 10);
    console.log(userId, typeof userId);
    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    req.userId = userId;
    next();
};