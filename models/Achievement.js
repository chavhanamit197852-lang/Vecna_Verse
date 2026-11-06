import mongoose from "mongoose";
const AchievementSchema = new mongoose.Schema({userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},title:{type:String,required:true,trim:true,maxLength:140},issuer:{type:String,default:""},date:{type:Date,default:null},notes:{type:String,default:"",maxLength:2000},proofUrl:{type:String,default:""},category:{type:String,default:"General"}},{timestamps:true});
export default mongoose.models.Achievement || mongoose.model("Achievement",AchievementSchema);
