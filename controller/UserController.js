const UserModel = require('../model/UserModel');
const AuthTokenModel = require('../model/AuthTokenModel');
const ErrorLogModel = require('../model/ErrorLogsModel');
const CryptoJS = require("crypto-js");
const moment = require('moment-timezone');
const jwt = require("jsonwebtoken");
const maxSize = 4 * 1024 * 1024;
const { v4: uuidv4 } = require('uuid');
var multer = require('multer'); 
const DIRUserImage = './public/UploadImage/UserImage';
const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, DIRUserImage) },
    filename: function (req, file, cb) {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, uuidv4() + '-' + fileName)
    }
});
const fileFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|)$/)) {
        req.fileValidationError = 'Only images files are allowed!';
        return cb(new Error(FileError), false);
    }
    cb(null, true);
};
var FileError = 'Only .png, .jpg, .jpeg format allowed!';
var SizeError = 'File size cannot be larger than 4MB!';
const currentDate = moment(Date.now()).format('DD-MM-YYYY HH:mm:ss');

function MobileRegex(value) {
    return /^[0-9]{10}$/.test(value);
}

function EmailRegex(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

exports.Registration = [async (req, res) => {
    try {
        let upload = multer({storage: storage, fileFilter: fileFilter, limits: { fileSize: maxSize }}).single("UserImage");
        upload(req, res, async (err) => {
            if (req.fileValidationError) {
                return res.status(200).json({ status: 0, Message: FileError, data: null });
            } else if (err) {
                return res.status(200).json({ status: 0, Message: SizeError, data: null });
            } else if (!req.body.UserName) {
                return res.status(200).json({ status: 0, Message: 'Please Enter Username', data: null });
            } else if (!req.body.MobileNo) {
                return res.status(200).json({ status: 0, Message: 'Please Enter Mobile Number', data: null });
            } else if (!MobileRegex(req.body.MobileNo)) { 
                return res.status(200).json({ status: 0, Message: 'Enter Only 10 digit number', data: null });
            } else if (!req.body.EmailID) {
                return res.status(200).json({ status: 0, Message: 'Please Enter EmailID', data: null });
            } else if (!EmailRegex(req.body.EmailID)) { 
                return res.status(200).json({ status: 0, Message: 'Invalid EmailID format', data: null });
            } else if (!req.body.Password) {
                return res.status(200).json({ status: 0, Message: 'Please Enter Password', data: null });
            } else {
                let userByEmail = await UserModel.findOne({ EmailID: req.body.EmailID }).exec();
                let userByMobileNo = await UserModel.findOne({ MobileNo: req.body.MobileNo }).exec();
                if (userByEmail) { 
                    return res.status(200).json({ status: 0, Message: "EmailID Already Exit!", data: null }); 
                } else if (userByMobileNo){
                    return res.status(200).json({ status: 0, Message: "MobileNo Already Exit!", data: null }); 
                } else {
                    var ciphertext = CryptoJS.AES.encrypt(req.body.Password, process.env.PASSWORD_SECRET).toString();
                    let registration = await new UserModel({
                        UserName: req.body.UserName,
                        MobileNo: req.body.MobileNo,
                        EmailID: req.body.EmailID,
                        Password: ciphertext,
                        CodeBook: req.body.Password,
                        UserImage: req.file ? req.file.filename : '',
                        EntryDate:currentDate
                    }).save();
                    return res.status(200).json({ status: 1, Message: "Registration Success..", data: registration });
                }
            }
        });
    } catch (err) {
        save(req, err.message);
        return res.status(500).json({ status: 0, message: err.message, data: null });
    }
}];

exports.Login = [async (req, res) => {
    try {
        if (!req.body.EmailID) { return res.json({ status: 0, Message: "Please Enter EmailID", data: null }); }
        else if (!EmailRegex(req.body.EmailID)) { return res.status(200).json({ status: 0, Message: 'Invalid EmailID format', data: null }); }
        else if (!req.body.Password) { return res.json({ status: 0, Message: "Please Enter Password", data: null }) }
        else {
            let user = await UserModel.findOne({ EmailID: req.body.EmailID }).exec();
            if (!user) {
                return res.status(200).json({ status: 0, Message: "EmailID Not Available", data: null });
             } else if (user.IsActive == 0) {
                return res.status(200).json({ status: 0, Message: "User is InActive", data: null });
             } else {
                var bytes = CryptoJS.AES.decrypt(user.Password, process.env.PASSWORD_SECRET);
                var originalText = bytes.toString(CryptoJS.enc.Utf8);
                if (originalText === req.body.Password) {
                    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_TIMEOUT_DURATION });
                    await AuthTokenModel.create({
                       Token: token,
                       DeviceToken: "",
                       UserID: user._id,
                       DeviceType: "",
                       AppVersion: "",
                       DeviceInfo: "",
                       IPAddress: "",
                       DeviceLocation: "",
                       Is_LoggedOut: 0
                    });
                    var UpdateData = {};
                    UpdateData["LoginStatus"] = 'Login'
                    await UserModel.updateOne({ EmailID: req.body.EmailID }, UpdateData).exec();
                    return res.status(200).json({ status: 1, Message: "Login Success..", data: user, token: token });
                 } else {
                    return res.status(200).json({ status: 0, Message: "Please Enter Correct Password!", data: null });
                 }
             }
        }
    } catch (err) {
        save(req, err.message);
        return res.status(500).json({ status: 0, message: err.message, data: null });
    }
}];

function save(req, err) {
    // const isRequestBodyEmpty = Object.keys(req.body).length === 0 && req.body.constructor === Object;
    new ErrorLogModel({ 
        serviceName: req.headers.host + req.path, 
        Method: req.method, 
        message: err, 
        RequestBody: ((req.body == {}) ? ({}) : (req.body))
    }).save();
}