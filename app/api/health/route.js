import {ok} from "@/lib/http";export async function GET(){return ok({status:"ok",service:"eventverse",time:new Date().toISOString()})}
