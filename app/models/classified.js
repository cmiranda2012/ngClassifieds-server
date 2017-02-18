'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClassifiedSchema = new Schema({
	name: String,
	phone: String,
	email: String,
	title: {
		type: String,
		required: true
	},
	description: String,
	price: {
		type: Number,
		required: true
	},
	image: String,
	category: String,
	createdAt: Date,
	updatedAt: Date
});

module.exports = mongoose.model('Classified', ClassifiedSchema);
