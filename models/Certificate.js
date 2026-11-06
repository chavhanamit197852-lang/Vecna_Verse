import mongoose from "mongoose";
const CertificateSchema = new mongoose.Schema({userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},title:{type:String,required:true,trim:true,maxLength:140},issuer:{type:String,default:""},issuedAt:{type:Date,default:null},folder:{type:String,default:"General",trim:true},fileUrl:{type:String,required:true},publicId:{type:String,default:""},resourceType:{type:String,default:"raw"}},{timestamps:true});
export default mongoose.models.Certificate || mongoose.model("Certificate",CertificateSchema);
