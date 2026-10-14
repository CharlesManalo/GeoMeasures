import type { DiagramSpec } from "@/lib/types";
import { AnglesDiagram, PlaneDiagram } from "./plane";
import { SolidDiagram, NetDiagram, CubesDiagram } from "./solids";
import { RightDiagram, TriDiagram } from "./tri";
import { BarsDiagram, ClockDiagram, CurrencyDiagram, LadderDiagram, MapDiagram, RulerDiagram, ThermDiagram, TimelineDiagram } from "./misc";

/** Renders a data-driven, mathematically consistent SVG diagram. */
export function Diagram({ spec }: { spec: DiagramSpec }) {
  switch (spec.k) {
    case "tri": return <TriDiagram spec={spec} />;
    case "right": return <RightDiagram spec={spec} />;
    case "solid": return <SolidDiagram spec={spec} />;
    case "net": return <NetDiagram spec={spec} />;
    case "cubes": return <CubesDiagram spec={spec} />;
    case "plane": return <PlaneDiagram spec={spec} />;
    case "angles": return <AnglesDiagram spec={spec} />;
    case "therm": return <ThermDiagram spec={spec} />;
    case "clock": return <ClockDiagram spec={spec} />;
    case "map": return <MapDiagram spec={spec} />;
    case "ruler": return <RulerDiagram spec={spec} />;
    case "ladder": return <LadderDiagram spec={spec} />;
    case "currency": return <CurrencyDiagram spec={spec} />;
    case "timeline": return <TimelineDiagram spec={spec} />;
    case "bars": return <BarsDiagram spec={spec} />;
    default: return null;
  }
}
