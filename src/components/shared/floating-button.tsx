
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface FloatingButtonProps {
  sectionId: string;
  type: 'Price' | 'Ride'
  name: string;
}

export const FloatingButton = ({ sectionId, name }: FloatingButtonProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById(sectionId);

    if (!target) return;
    console.log(target)

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting); // Show button when Suggestions is NOT visible
      },
      {
        root: null, // viewport
        threshold: 0, // as soon as any part is visible
      }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, []);

  if (!isVisible) return null;

  return (
    <div className="p-4 bg-white fixed bottom-0 left-0 right-0 z-50 shadow-lg">
      <Button
        // onClick={} // TODO: FUNCTIONALITY TO WORK WITH FLOAT BUTTON
        className="w-full bg-black p-6 text-lg font-Rubik-Medium flex justify-center items-center"
      >
        {name}
      </Button>
    </div>
  );
};
