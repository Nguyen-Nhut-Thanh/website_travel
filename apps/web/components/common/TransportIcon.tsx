"use client";

import { Bus, Plane, Train } from "lucide-react";
import { getTransportCategory } from "@/lib/tourDisplay";

type Props = {
  type?: string | null;
  className?: string;
};

export default function TransportIcon({ type, className }: Props) {
  const category = getTransportCategory(type);

  if (category === "plane") {
    return <Plane className={className} />;
  }

  if (category === "train") {
    return <Train className={className} />;
  }

  return <Bus className={className} />;
}
