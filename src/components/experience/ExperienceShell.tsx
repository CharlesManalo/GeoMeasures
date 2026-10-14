"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect,useRef,useState,type ReactNode} from "react";
import {Icon,type IconName} from "./Icon";
import {ProgressProvider,useLearningProgress} from "./Progress";
import {SoundProvider,SoundToggle} from "./Sound";
import {FullscreenControl} from "./Fullscreen";
const NAV:{href:string;label:string;icon:IconName;short:string}[]=[{href:"/dashboard",label:"Dashboard",icon:"home",short:"Home"},{href:"/definitions",label:"Definitions",icon:"book",short:"Words"},{href:"/lessons",label:"Lessons",icon:"shapes",short:"Learn"},{href:"/games",label:"Games",icon:"game",short:"Play"},{href:"/practice",label:"Practice",icon:"practice",short:"Practice"},{href:"/progress",label:"My progress",icon:"trophy",short:"Progress"}];
export function Logo(){return <Link href="/" className="brand-logo" aria-label="Geo Measure home"><span className="logo-shape"><Icon name="shapes"/></span><span className="logo-words">geo<span>measure</span></span></Link>}
function Frame({children}:{children:ReactNode}) {
 const path=usePathname(); const [menu,setMenu]=useState(false); const menuButton=useRef<HTMLButtonElement>(null); const {stars,reward}=useLearningProgress();
 useEffect(()=>setMenu(false),[path]);
 useEffect(()=>{if(!menu)return;const close=(event:KeyboardEvent)=>{if(event.key==="Escape"){setMenu(false);menuButton.current?.focus();}};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close);},[menu]);
 const active=(href:string)=>path===href||path.startsWith(href+"/");
 return <><a className="skip-link" href="#main">Skip to content</a><header className="site-header"><div className="header-inner"><Logo/><nav className="desktop-nav" aria-label="Main navigation">{NAV.map(n=><Link key={n.href} href={n.href} className={active(n.href)?"active":""} aria-current={active(n.href)?"page":undefined}>{n.label}</Link>)}</nav><div className="header-actions"><Link href="/progress" className={`star-counter ${reward?"reward-active":""}`} aria-label={`${stars} stars. View your progress`}><Icon name="star"/><strong>{stars}</strong><span>stars</span></Link><SoundToggle/><FullscreenControl/><button className="icon-button mobile-menu-button" ref={menuButton} onClick={()=>setMenu(!menu)} aria-label={menu?"Close navigation":"Open navigation"} aria-expanded={menu} aria-controls="mobile-menu"><Icon name={menu?"close":"menu"}/></button></div></div>{menu&&<nav className="mobile-menu" id="mobile-menu" aria-label="All pages">{NAV.map(n=><Link key={n.href} href={n.href} onClick={()=>setMenu(false)} aria-current={active(n.href)?"page":undefined}><Icon name={n.icon}/>{n.label}<Icon name="arrow"/></Link>)}</nav>}</header>
 <div id="main" tabIndex={-1} className="page-transition" key={path}>{children}</div>
 <footer className="site-footer"><div className="footer-inner"><div className="footer-brand"><Logo/><p>Geometry & Measurement<br/>Grade 11 learning resources.</p></div><div><h2>Learning</h2><Link href="/dashboard">Dashboard</Link><Link href="/lessons">Lessons</Link><Link href="/games">Games</Link><Link href="/practice">Practice</Link></div><div><h2>Resources</h2><Link href="/definitions">Math glossary</Link><Link href="/progress">My progress</Link><a href="/#companions">Learning guides</a></div><div className="footer-bottom"><span>For Grade 11 learners</span><span>Geometry & Measurement</span></div></div></footer>
 {path!=="/"&&<nav className="bottom-nav" aria-label="Quick navigation">{NAV.filter(n=>n.href!=="/definitions").map(n=><Link key={n.href} href={n.href} className={active(n.href)?"active":""} aria-current={active(n.href)?"page":undefined}><Icon name={n.icon}/><span>{n.short}</span></Link>)}</nav>}</>;
}
export function ExperienceShell({children}:{children:ReactNode}){return <SoundProvider><ProgressProvider><Frame>{children}</Frame></ProgressProvider></SoundProvider>}
