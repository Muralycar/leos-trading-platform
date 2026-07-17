import { CheckIcon } from "@/components/ui/Icons";

export function IconList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-[15px] text-text-1">
          <CheckIcon className="mt-1 h-4 w-4 flex-shrink-0 text-brass" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
