import { notFound } from "next/navigation";
import { GamePlay } from "@/components/GamePlay";
import { GAMES } from "@/content/gamesMeta";

export function generateStaticParams() {
  return GAMES.map((g) => ({ id: g.id }));
}
export const dynamicParams = false;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!GAMES.some((g) => g.id === id)) notFound();
  return <GamePlay gameId={id} />;
}
