const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
	try {
		const token = req.cookies && req.cookies.token;
		if (!token) return res.status(401).json({ message: 'Not authenticated' });

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (!decoded || !decoded.id) return res.status(401).json({ message: 'Not authenticated' });

		const user = await User.findById(decoded.id).select('-password');
		if (!user) return res.status(401).json({ message: 'Not authenticated' });

		req.user = user;
		next();
	} catch (err) {
		return res.status(401).json({ message: 'Not authenticated' });
	}
};
