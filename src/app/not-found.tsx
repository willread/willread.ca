import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <div className="text-[var(--dos-prompt)]">C:\&gt;Bad command or file name</div>
      <div className="mt-4">
        <Link
          href="/"
          className="hover:bg-[#aaa] hover:text-black transition-none"
          style={{ color: "#ffffff" }}
        >
          C:\&gt;DIR
        </Link>
      </div>
    </div>
  );
}
