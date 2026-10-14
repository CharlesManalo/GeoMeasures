import {notFound} from "next/navigation";
import {LessonPage} from "@/components/experience/LearningPages";
import {LESSONS} from "@/components/experience/data";
export function generateStaticParams(){return LESSONS.map(l=>({id:String(l.id)}));}
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;const number=Number(id);if(!Number.isInteger(number)||!LESSONS.some(l=>l.id===number))notFound();return <LessonPage key={number} id={number}/>}
