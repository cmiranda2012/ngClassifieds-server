'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClassifiedSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	description: String,
	price: {
		type: Number,
		required: true
	},
	image: String
});

module.exports = mongoose.model('Classified', ClassifiedSchema);
