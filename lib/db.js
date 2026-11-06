import mongoose from "mongoose";
const URI=process.env.MONGODB_URI;
if(!URI) throw new Error("MONGODB_URI is missing. Add your MongoDB Atlas connection string to .env.local.");
let cache=globalThis.mongooseCache;
if(!cache) cache=globalThis.mongooseCache={conn:null,promise:null};
export async function dbConnect(){if(cache.conn)return cache.conn;if(!cache.promise)cache.promise=mongoose.connect(URI,{dbName:"eventverse",bufferCommands:false});try{cache.conn=await cache.promise;}catch(e){cache.promise=null;throw e;}return cache.conn;}
