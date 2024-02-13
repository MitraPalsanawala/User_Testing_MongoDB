var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = new Schema({
    UserName: { type: String, required: true },
    MobileNo: { type: String, required: true },
    EmailID: { type: String, required: true },
    Password: { type: String, required: true },
    CodeBook: { type: String, required: true },
    UserImage: { type: String, required: false },
    IsActive: { type: String, required: true, default: 1 },
    IsDelete: { type: String, required: true, default: 0 },
    LoginStatus: { type: String, required: false },
    EntryDate: { type: String, required: true },
},{ collection: 'tbl_user' }, { timestamps: true });
module.exports = mongoose.model('tbl_user', UserSchema);