import Link from "next/link";
import {Mascot} from "@/components/experience/Mascot";
import {Icon} from "@/components/experience/Icon";
export default function NotFound(){return <main className="content not-found"><Mascot name="luna"/><p className="eyebrow">PAGE NOT FOUND</p><h1>This page doesn’t exist.</h1><p>The page may have moved or the address may be incorrect.</p><Link href="/dashboard" className="button button-dark">Go to dashboard<Icon name="arrow"/></Link></main>}
