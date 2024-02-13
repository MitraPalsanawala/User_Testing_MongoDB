var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var PostSchema = new Schema({
    Title: { type: String, required: true },
    Description: { type: String, required: true }, //Body field
    CreatedBy: { type: ObjectId, default: null, ref: "tbl_user" },
    PostStatus: { type: String, required: true, default: 1 }, //PostStatus=(1-Active,2-InActive)
    Latitude : { type: String, required: true },
    Longitude : { type: String, required: true },
    IsActive: { type: String, required: true, default: 1 },
    IsDelete: { type: String, required: true, default: 0 },
    EntryDate: { type: String, required: true },
    UpdateDate: { type: String, required: false },
},{ collection: 'tbl_post' }, { timestamps: true });
module.exports = mongoose.model('tbl_post', PostSchema);