import type { CSSProperties } from "react";
export type MascotName = "luna" | "nori" | "mimi";
export const MASCOTS = {
  luna: {name:"Luna",title:"Lesson guide",color:"#b998e4",quote:"Follow a worked example one step at a time."},
  nori: {name:"Nori",title:"Practice guide",color:"#66c8cd",quote:"Use hints and check each answer."},
  mimi: {name:"Mimi",title:"Game guide",color:"#efa7c9",quote:"Review formulas and measurements in a game."},
};
export function Mascot({name="luna",className="",decorative=false,style}: {name?:MascotName;className?:string;decorative?:boolean;style?:CSSProperties}) {
  return <span className={`mascot mascot-${name} ${className}`} role={decorative?undefined:"img"} aria-label={decorative?undefined:`${MASCOTS[name].name}, ${MASCOTS[name].title}, in a ${name === "luna"?"purple":name === "nori"?"teal":"pink"} bear suit`} aria-hidden={decorative||undefined} style={style}/>;
}
