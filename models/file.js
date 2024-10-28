const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { Schema } = require('mongoose');

const fileSchema = new Schema({
	filename: { type: String, required: true },
	url: { type: String, required: true },
	tags: [String],
	views: {
		type: Number,
		default: 0,
	},
	originalName: { type: String, required: true },
	shared: { type: Boolean, default: false },
	size: { type: Number, default: 0 },
	type: {
		type: String,
		enum: ['image', 'video'],
		required: true,
	},

	owner: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model
}, {
	timestamps: true,
});

fileSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('File', fileSchema);
