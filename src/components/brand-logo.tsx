import Link from "next/link";

export function BrandLogo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" aria-label="CRAK home" className="inline-flex items-center gap-2.5 no-underline">
      <span className={`grid size-8 place-items-center rounded-[9px] ${inverse ? "bg-[#dafa7b]" : "bg-[#087a4f]"}`}>
        <span className={`block size-3.5 rotate-45 rounded-[3px] border-[3px] ${inverse ? "border-[#075f40]" : "border-white"}`} />
      </span>
      <span className={`text-[22px] font-extrabold tracking-[-0.06em] ${inverse ? "text-white" : "text-[#13211a]"}`}>crak</span>
    </Link>
  );
}
