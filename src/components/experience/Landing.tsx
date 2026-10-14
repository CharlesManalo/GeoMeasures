import Link from "next/link";
import {Icon} from "./Icon";
import {Mascot,MASCOTS,type MascotName} from "./Mascot";

export function Landing(){
  return <main className="landing">
    <section className="landing-hero content">
      <p className="eyebrow"><Icon name="shapes"/>GEOMETRY & MEASUREMENT · GRADE 11</p>
      <h1>Learn geometry<br/><span>step by step.</span></h1>
      <p>Lessons, games, practice, and a math glossary for Grade 11.</p>
      <Link href="/dashboard" className="button button-dark">Go to dashboard<Icon name="arrow"/></Link>
      <div className="mascot-stage">
        <div className="stage-rainbow"/>
        <Icon name="spark" className="stage-spark one"/>
        <Icon name="spark" className="stage-spark two"/>
        <Mascot name="luna" className="stage-luna"/>
        <Mascot name="nori" className="stage-nori"/>
        <Mascot name="mimi" className="stage-mimi"/>
      </div>
    </section>
    <section className="content companions" id="companions">
      <div className="section-heading">
        <div>
          <h2>Learning guides</h2>
          <p>Meet the characters who appear throughout your lessons and activities.</p>
        </div>
      </div>
      <div className="companion-grid">
        {(Object.keys(MASCOTS) as MascotName[]).map((name,i)=><article className={`companion-card tone-${["lavender","mint","pink"][i]}`} key={name}>
          <Mascot name={name}/>
          <div>
            <p className="eyebrow">{MASCOTS[name].title}</p>
            <h3>{MASCOTS[name].name}</h3>
            <p>{MASCOTS[name].quote}</p>
          </div>
        </article>)}
      </div>
    </section>
  </main>;
}
