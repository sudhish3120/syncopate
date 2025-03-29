"use client";
import React, { useEffect, useRef, useState } from "react";
import ConcertCard from "../components/ConcertCard";
import { Concert } from "../types/concerts";
interface ConcertListProps {
  concerts: Array<Concert> | null;
  title: string;
}
const ConcertList: React.FC<ConcertListProps> = ({ concerts, title }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      handleScroll(); // Ensure initial check
      scrollElement.addEventListener("scroll", handleScroll);
      return () => scrollElement.removeEventListener("scroll", handleScroll);
    }
  }, [concerts]); // Re-run when concerts change

  return (
    <>
      <h2 className="text-lg font-medium text-white mb-4 uppercase">
        {title}
      </h2>

      <div className="relative">
        {
          (!concerts || concerts?.length == 0) && <>No concerts available</>
        }
        {
          concerts && (
            <>
              {/* Left Gradient */}
              {canScrollLeft && (
                <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-violet-950/50 to-transparent pointer-events-none z-10"></div>
              )}

              {/* Scrollable Concert List */}
              <div
                ref={scrollRef}
                className="relative overflow-x-auto whitespace-nowrap scroll-hidden snap-x snap-mandatory"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                <div className="flex space-x-8 m-10">
                  {concerts?.map((concert) => (
                      <div key={concert.id} className="snap-center shrink-0">
                      <ConcertCard
                        id={concert.id}
                        title={concert.name}
                        date={new Date(
                        concert.dates.start.localDate
                        ).toLocaleDateString()}
                        imageUrl={concert.images.reduce((largest, image) => {
                        return image.width * image.height > largest.width * largest.height ? image : largest;
                        }, concert.images[0]).url}
                      />
                      </div>
                  ))}
                </div>
              </div>

              {/* Right Gradient */}
              {canScrollRight && (
                <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-violet-950/50 to-transparent pointer-events-none z-10"></div>
              )}
            </>
          )
        }
      </div>
    </>
  );
};

export default ConcertList;
