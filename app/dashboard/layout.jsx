import {auth} from "@/auth";import {redirect} from "next/navigation";export default async function Layout({children}){const s=await auth();if(!s?.user)redirect("/login");return children}
