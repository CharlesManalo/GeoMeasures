"use client";
import type { ReactElement } from "react";
import { CurrencyWidget, ScaleWidget, SolidExplorer, UnitConverter, UnitsCompare } from "./WidgetsA";
import { LawsWidget, MethodWidget, PerimWidget, PythagWidget, TempWidget, TimeWidget, TriangleWidget, TrigWidget } from "./WidgetsB";

export const WIDGETS: Record<string, () => ReactElement> = {
  units: () => <UnitsCompare />,
  convert: () => <UnitConverter />,
  "solid:sa": () => <SolidExplorer focus="sa" />,
  "solid:volume": () => <SolidExplorer focus="volume" />,
  scale: () => <ScaleWidget />,
  currency: () => <CurrencyWidget />,
  time: () => <TimeWidget />,
  temp: () => <TempWidget />,
  perim: () => <PerimWidget />,
  triangle: () => <TriangleWidget />,
  pythag: () => <PythagWidget />,
  trig: () => <TrigWidget />,
  laws: () => <LawsWidget />,
  method: () => <MethodWidget />,
};
