"use client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigation } from "@refinedev/core";
import { CheckCircle2Icon, MapPin } from "lucide-react";
import { TVenueAllQuery } from "../utils/venue-query.types";

type VenueCardProps = {
  data: TVenueAllQuery
  className?: string;
}

export default function VenueCard({ data, className }: VenueCardProps) {
  const defaultImage = '';
  const backgroundImage = data.venue_photo || defaultImage;

  const { push } = useNavigation();

  const handleClick = () => {
    push(`/book/venue/${data.id}`);
  };

  return (
    <div onClick={handleClick} className={cn("w-full rounded-lg group/card", className)}>
      <div
        className={cn(
          "cursor-pointer overflow-hidden relative card h-48 rounded-lg shadow-xl mx-auto backgroundImage flex flex-col justify-between px-4 py-6",
          "bg-cover bg-center"
        )}
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute top-0 left-0 w-full h-full transition duration-500 border rounded-lg border-border/35 bg-black/50 group-hover/card:bg-black/75 backdrop-blur-none group-hover/card:backdrop-blur-sm" />
        <div className="z-10 flex flex-row items-center space-x-4" />
        <div className="space-y-1 text content">
          {(data.rate && data.is_paid) ? (
            <div className="inline-block">
              <Badge variant="outline" className="relative z-10 flex items-center text-sm font-normal border-primary bg-primary/5 text-primary">
                <span className="inline-flex text-xs">
                  {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(data.rate)}
                </span>
              </Badge>
            </div>
          ) : (
            <div className="inline-block">
              <Badge variant="outline" className="relative z-10 flex items-center text-sm font-normal text-green-600 border-green-600 bg-green-600/5">
                <span className="inline-flex text-xs">
                  Free Venue
                </span>
              </Badge>
            </div>
          )}
          <h1 className="relative z-10 text-xl font-bold md:text-2xl text-gray-50">
            {data.name}
          </h1>
          <div className="flex flex-row flex-wrap gap-2">
            <p className="relative z-10 flex items-center text-xs font-normal text-gray-50">
              <MapPin className="mr-1 size-4" /> {data.location}
            </p>
            <p className="relative z-10 flex items-center text-xs font-normal text-gray-50">
              <CheckCircle2Icon className="mr-1 size-4" /> {data.venue_types.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
