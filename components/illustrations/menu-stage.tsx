import Image from "next/image";

import { cn } from "@/lib/cn";
import type { NavMenuIllustration } from "@/types/content";

const STAGE = {
  regular: {
    box: "h-224",
    illustration: "",
    corners: [
      "left-[calc(50%-9rem)] top-[calc(50%-5rem)]",
      "left-[calc(50%+9rem)] top-[calc(50%-5rem)]",
      "left-[calc(50%-9rem)] top-[calc(50%+5rem)]",
      "left-[calc(50%+9rem)] top-[calc(50%+5rem)]",
    ],
  },
  compact: {
    box: "h-200",
    illustration: "scale-88",
    corners: [
      "left-[calc(50%-7.71875rem)] top-[calc(50%-4.25rem)]",
      "left-[calc(50%+7.71875rem)] top-[calc(50%-4.25rem)]",
      "left-[calc(50%-7.71875rem)] top-[calc(50%+4.25rem)]",
      "left-[calc(50%+7.71875rem)] top-[calc(50%+4.25rem)]",
    ],
  },
};

function Layer({ src }: { src: string }) {
  return <Image src={src} alt="" fill unoptimized />;
}

function GrowthColumns() {
  return (
    <>
      <Layer src="/illustrations/growth-columns-construction.svg" />
      <Layer src="/illustrations/growth-columns-solid.svg" />
      <div className="absolute top-[18.5%] left-[73.565%] flex h-[8%] w-[13.8565%] items-center justify-center">
        <div className="relative size-16 flex-none scale-y-87 rotate-30 -skew-x-30">
          <Image
            src="/illustrations/growth-columns-mark.svg"
            alt=""
            width={10}
            height={12}
            unoptimized
            className="absolute top-[12.5%] left-[21.875%] h-3/4 w-[60.4%]"
          />
        </div>
      </div>
    </>
  );
}

function CoinStack() {
  return (
    <>
      <Layer src="/illustrations/coin-stack-solid.svg" />
      <div className="absolute top-[31.87%] left-[43.1%] flex h-[8%] w-[13.8565%] items-center justify-center">
        <div className="relative size-16 flex-none scale-y-87 rotate-30 -skew-x-30">
          <Image
            src="/illustrations/growth-columns-mark.svg"
            alt=""
            width={10}
            height={12}
            unoptimized
            className="absolute top-[12.5%] left-[21.875%] h-3/4 w-[60.4%]"
          />
        </div>
      </div>
    </>
  );
}

function Target() {
  return (
    <>
      <Layer src="/illustrations/target-construction.svg" />
      <Layer src="/illustrations/target-solid.svg" />
      <div className="absolute top-[61.04%] left-[40.925%] flex h-[10%] w-[17.3205%] items-center justify-center">
        <div className="relative size-20 flex-none scale-y-87 rotate-30 -skew-x-30">
          <Image
            src="/illustrations/target-mark.svg"
            alt=""
            width={12}
            height={15}
            unoptimized
            className="absolute top-[10%] left-[20.85%] h-[75.67%] w-[57.74%]"
          />
        </div>
      </div>
    </>
  );
}

function Safe() {
  return (
    <>
      <Layer src="/illustrations/safe-construction.svg" />
      <Layer src="/illustrations/safe-solid.svg" />
      <div className="absolute top-[56.65%] left-[27.21%] flex h-[12%] w-[6.928%] items-center justify-center">
        <div className="relative size-16 flex-none scale-y-87 rotate-30 skew-x-30">
          <Image
            src="/illustrations/safe-mark.svg"
            alt=""
            width={10}
            height={12}
            unoptimized
            className="absolute top-[12.5%] left-[21.875%] h-3/4 w-[61.46%]"
          />
        </div>
      </div>
    </>
  );
}

function QrDstock() {
  return (
    <Image
      src="/illustrations/qr-dstock.svg"
      alt=""
      width={128}
      height={128}
      unoptimized
      className="absolute top-1/2 left-1/2 size-128 -translate-x-1/2 -translate-y-1/2"
    />
  );
}

const illustrations: Record<NavMenuIllustration, () => React.JSX.Element> = {
  "growth-columns": GrowthColumns,
  "coin-stack": CoinStack,
  target: Target,
  safe: Safe,
  "qr-dstock": QrDstock,
};

type MenuStageProps = {
  illustration: NavMenuIllustration;
  size?: keyof typeof STAGE;
  className?: string;
};

export function MenuStage({ illustration, size = "regular", className }: MenuStageProps) {
  const Illustration = illustrations[illustration];
  const stage = STAGE[size];

  return (
    <div
      aria-hidden="true"
      className={cn("relative w-full shrink-0 overflow-hidden bg-background-surface", stage.box, className)}
    >
      <Image
        src="/illustrations/stage-grid.svg"
        alt=""
        width={1024}
        height={1024}
        unoptimized
        className="absolute top-[calc(50%+25rem)] left-[calc(50%+21rem)] size-1024 max-w-none -translate-x-1/2 -translate-y-1/2"
      />
      {stage.corners.map((position) => (
        <Image
          key={position}
          src="/illustrations/stage-corner.svg"
          alt=""
          width={12}
          height={12}
          unoptimized
          className={`absolute size-12 -translate-x-1/2 -translate-y-1/2 ${position}`}
        />
      ))}
      <div className={cn("absolute top-1/2 left-1/2 size-200 -translate-x-1/2 -translate-y-1/2", stage.illustration)}>
        <Illustration />
      </div>
    </div>
  );
}
