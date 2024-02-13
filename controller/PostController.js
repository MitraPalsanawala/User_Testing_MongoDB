const PostModel = require('../model/PostModel');
const UserModel = require('../model/UserModel');
const ErrorLogModel = require('../model/ErrorLogsModel');
const moment = require('moment-timezone');
var mongoose = require('mongoose')
const currentDate = moment(Date.now()).format('DD-MM-YYYY HH:mm:ss');

exports.setPost = [async (req, res) => {
    try {
         if (!req.body.Title) {
            return res.status(200).json({ status: 0, Message: 'Please Enter Title', data: null });
        } else if (!req.body.Description) {
            return res.status(200).json({ status: 0, Message: 'Please Enter Description', data: null });
        } else if (!req.body.CreatedBy) { 
            return res.status(200).json({ status: 0, Message: 'Please Enter CreatedBy', data: null });
        } else if (!req.body.Latitude) {
            return res.status(200).json({ status: 0, Message: 'Please Enter Latitude', data: null });
        }else if (!req.body.Longitude) {
            return res.status(200).json({ status: 0, Message: 'Please Enter Longitude', data: null });
        } else {
            if (!req.body.ID) {
                await new PostModel({
                    Title: req.body.Title,
                    Description: req.body.Description,
                    CreatedBy: req.body.CreatedBy,
                    Latitude: req.body.Latitude,
                    Longitude: req.body.Longitude,
                    EntryDate:currentDate,
                    UpdateDate:''
                }).save();
                return res.status(200).json({ status: 1, Message: "Successfully Inserted..", data: "" });
            }else{
                var UpdatePostData = {};
                UpdatePostData["Title"] = req.body.Title;
                UpdatePostData["Description"] = req.body.Description;
                UpdatePostData["CreatedBy"] = req.body.CreatedBy;
                UpdatePostData["Latitude"] = req.body.Latitude;
                UpdatePostData["Longitude"] = req.body.Longitude;
                UpdatePostData["UpdateDate"] = currentDate;
                await PostModel.updateOne({ _id: new mongoose.Types.ObjectId(req.body.ID) }, UpdatePostData).exec();
                return res.status(200).json({ status: 1, Message: "Successfully Updated..", data: "" });
            }
        }
    } catch (err) {
        save(req, err.message);
        return res.status(500).json({ status: 0, message: err.message, data: null });
    }
}];

async function BindPostData(req) {
    var Latitude = ((req.body.Latitude) ? ({ $in: [req.body.Latitude] }) : { $nin: [] });
    var Longitude = ((req.body.Longitude) ? ({ $in: [req.body.Longitude] }) : { $nin: [] });
    var CreatedBy = ((req.body.CreatedBy) ? ({ $in: [new mongoose.Types.ObjectId(req.body.CreatedBy)] }) : { $nin: [] });
    var PostID = ((req.body.PostID) ? ({ $in: [new mongoose.Types.ObjectId(req.body.PostID)] }) : { $nin: [] });
    var DataResponse = await PostModel.aggregate(
        [
            {
                "$project": {
                    "_id": "_id",
                    "Post": "$$ROOT"
                }
            },
            {
                "$lookup": {
                    "localField": "Post.CreatedBy",
                    "from": "tbl_user",
                    "foreignField": "_id",
                    "as": "tbl_user"
                }
            },
            {
                "$unwind": {
                    "path": "$tbl_user",
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                "$match": {
                    "Post.IsActive": "1",
                    "Post.IsDelete": "0",
                    "Post.Latitude": Latitude,
                    "Post.Longitude": Longitude,
                    "Post.CreatedBy": CreatedBy,
                    "Post._id": PostID,
                }
            },
            { "$sort": { "Post._id": -1 } },
            {
                "$project": {
                    "_id": "$Post._id",
                    "Title": "$Post.Title",
                    "Description": "$Post.Description",
                    "CreatedBy": "$Post.CreatedBy",
                    "UserName": "$tbl_user.UserName",
                    "PostStatus": "$Post.PostStatus",
                    "Latitude":"$Post.Latitude",
                    "Longitude":"$Post.Longitude",
                    "IsActive": "$Post.IsActive",
                    "IsDelete": "$Post.IsDelete",
                    "EntryDate": "$Post.EntryDate",
                    "UpdateDate": "$Post.UpdateDate",
                }
            },
    ]);
    return DataResponse;
}

exports.getPost = [async (req, res) => {
    try {
        let BindPost = await BindPostData(req);
        if(BindPost.length > 0){
            return res.status(200).json({ status: 1, Message: "Success..", data: BindPost });
        }else{
            return res.status(200).json({ status: 0, Message: "Data Not Found..", data: null });
        }
    } catch (err) {
        save(req, err.message);
        return res.status(500).json({ status: 0, message: err.message, data: null });
    }
}];

exports.deletePost = [async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.body.ID)) {
            return res.status(400).json({ status: 0, Message: "Invalid ID Format", data: null });
        } else {
            var UpdatePostData = {};
            UpdatePostData["IsActive"] = "0";
            UpdatePostData["IsDelete"] = "1";
            await PostModel.updateOne({ _id: new mongoose.Types.ObjectId(req.body.ID)}, UpdatePostData).exec();
            return res.status(200).json({ status: 1, Message: "Successfully Deleted..", data: UpdatePostData });
        }
    } catch (err) {
        save(req, err.message);
        return res.status(500).json({ status: 0, message: err.message, data: null });
    }
}];

exports.DashboardCountPost = [async (req, res) => {
    try {
            var Count = [];
            let PostData = await PostModel.find({IsActive:"1",IsDelete:"0"}).count();
            let ActivePostData = await PostModel.find({ IsActive:"1",IsDelete:"0",PostStatus:"1"}).count();
            let InActivePostData = await PostModel.find({IsActive:"1",IsDelete:"0", PostStatus:"2"}).count();
            Count.push({
                PostData : PostData ? PostData : 0,
                ActivePostData : ActivePostData ? ActivePostData : 0,
                InActivePostData : InActivePostData ? InActivePostData : 0,
            })     
            return res.status(200).json({ status: 1, Message: "Success..", Count:Count });
    } catch (err) {
        save(req, err.message);
        return res.status(500).json({ status: 0, message: err.message, data: null });
    }
}];

function save(req, err) {
    new ErrorLogModel({ 
        serviceName: req.headers.host + req.path, 
        Method: req.method, 
        message: err, 
        RequestBody: ((req.body == {}) ? ({}) : (req.body))
    }).save();
}
