import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useState } from "react";
import { cn } from "~/lib/ui/utils";

export default function LoaderTransition({
  className,
  id = "overlay",
  start,
  fakePCT = 0,
}: {
  className?: string;
  id?: string;
  start?: Boolean;
  fakePCT?: number;
}) {
  const [pct, setPCT] = useState(fakePCT);

  // useGSAP(() => {
  //   if (fakePCT < 100) {
  //     gsap.set("#numbers", {
  //       y: "-100%",
  //     });
  //   }
  // }, [fakePCT]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (start) {
      if (pct < 80) {
        interval = setInterval(() => {
          setPCT(pct + Math.floor(Math.random() * 20));
        }, 200);
      } else {
        clearInterval(interval);
      }
    }

    return () => clearInterval(interval);
  }, [start, pct]);

  // useEffect(() => {
  //   if (start) {
  //     gsap.to("#numbers", {
  //       duration: 0.8,
  //       delay: 0.2,
  //       y: 0,
  //       ease: "expo.inOut",
  //     });
  //   }
  // }, [start]);

  // useEffect(() => {
  //   if (fakePCT === 100) {
  //     gsap.to("#numbers", {
  //       duration: 1,
  //       y: "100%",
  //       ease: "expo.inOut",
  //     });
  //   }
  // }, [fakePCT]);

  return (
    <div
      id={id}
      className={cn(
        "bg-background fixed inset-0 z-[999] grid place-content-center overflow-hidden",
        className,
      )}
    >
      <div id="numbers" className="text-9xl font-light tracking-tighter">
        {pct}%
      </div>
    </div>
  );
}
