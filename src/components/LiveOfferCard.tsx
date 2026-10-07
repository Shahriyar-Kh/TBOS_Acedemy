import type { LiveOffer } from "@/data/liveOffers";
import { LiveProgramCard } from "@/components/live/LiveProgramCard";

export function LiveOfferCard({ offer }: { offer: LiveOffer }) {
  return <LiveProgramCard offer={offer} />;
}
