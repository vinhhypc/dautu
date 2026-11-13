import { cn } from "@/lib/cn";

const base =
  "group flex cursor-pointer items-center gap-4 rounded-4 font-semibold text-normal-lg transition-colors duration-150 hover:text-brand-primary focus-visible:text-brand-primary motion-reduce:transition-none";

const byOrientation = {
  horizontal: "px-12 py-6",
  vertical: "w-full justify-between py-16 text-left",
};

const defaultColor = {
  horizontal: "",
  vertical: "text-text-primary",
};

export function navItemClasses(orientation: keyof typeof byOrientation, isSelected: boolean) {
  return cn(base, byOrientation[orientation], isSelected ? "text-brand-primary" : defaultColor[orientation]);
}

export function navLabelClasses(isSelected: boolean) {
  return cn(
    "relative pb-2 after:absolute after:inset-x-0 after:bottom-0 after:h-2 after:origin-left after:rounded-1000 after:bg-current after:transition-transform after:duration-150 after:ease-(--easing) group-hover:after:scale-x-100 group-focus-visible:after:scale-x-100 motion-reduce:after:transition-none",
    isSelected ? "after:scale-x-100" : "after:scale-x-0",
  );
}

export function navChevronClasses(isOpen: boolean) {
  return cn(
    "transition-transform duration-150 ease-(--easing) group-hover:translate-y-2 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0",
    isOpen && "rotate-180 group-hover:translate-y-0",
  );
}
