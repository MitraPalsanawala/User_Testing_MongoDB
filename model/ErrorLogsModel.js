var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ErrorLogsSchema = new Schema({
   serviceName: { type: String, required: true },
   Method: { type: String, required: true },
   message: { type: String, required: false },
   RequestBody: { type: JSON, required: false, default: {} },
   InsertBy: { type: String, required: false, default: '' },//future use by the specific user store
   entryDate: { type: Date, default: Date.now },
}, { collection: 'tbl_errorlog' },{ timestamps: true });
module.exports = mongoose.model('tbl_errorlog', ErrorLogsSchema);
