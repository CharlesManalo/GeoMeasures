import type {MetadataRoute} from "next";
export default function manifest():MetadataRoute.Manifest{return{
 id:"/",name:"Geo Measure",short_name:"Geo Measure",description:"See it. Hear it. Solve it. Geometry and measurement lessons.",
 start_url:"/dashboard",scope:"/",display:"fullscreen",display_override:["fullscreen","standalone"],
 background_color:"#fffaf4",theme_color:"#fffaf4",lang:"en",
 icons:[{src:"/app-icons/icon-192.png",sizes:"192x192",type:"image/png"},{src:"/app-icons/icon-512.png",sizes:"512x512",type:"image/png"}]
};}
