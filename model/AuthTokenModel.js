var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var AuthTokenSchema = new Schema({
	Token: { type: String, default: null },//Security API Auth Access Token 
	DeviceToken: { type: String, default: null },//Firebased Token(Andriod),APNS Token(IOS)
	UserID: { type: ObjectId, default: null, ref: "tbl_user" },
	DeviceType: { type: Number, default: 0 },//Device Type=(1-Android,2-IOS,0-Web)
	AppVersion: { type: String, default: "" },//Application Production Builds (1)Alpha (2)Beta (3)Nightly 
	DeviceInfo: { type: String, default: "" },//Device Version info Like OS Regarding
	IPAddress: { type: String, default: "" },//User Internet on Which IPV4 Address Like Ethernet,Wifi,Host-Port,Mobile-Data,VPN,ETC
	DeviceLocation: { type: String, default: "" },//Getting Information Of the Current Location Login
	Is_LoggedOut: { type: Number, default: 0 },//Device Login Status(0-Login,1-Logout)
	EntryDate: { type: Date, default: Date.now },
}, { collection: 'tbl_authtoken' },{ timestamps: true });
module.exports = mongoose.model("tbl_authtoken", AuthTokenSchema);