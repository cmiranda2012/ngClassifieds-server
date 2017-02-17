require('dotenv').config();

module.exports = {
	'secret': process.env.SECRET,
	'database': `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ds153669.mlab.com:53669/ngclassifieds`
};
