import Image from "next/image";

export function Gallery({ imagePath, description }: { imagePath: string | null; description: string }) {
  return (
    <div className="relative flex aspect-square items-center justify-center rounded-m border border-line bg-bg-2 p-10">
      {imagePath ? (
        <Image src={imagePath} alt={description} fill className="object-contain p-10" />
      ) : (
        <span className="px-6 text-center font-mono text-[13px] text-text-2">{description} — photography pending</span>
      )}
    </div>
  );
}
