import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-stone-900">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-500 text-white shadow-md shadow-orange-500/30">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 19V6a2 2 0 0 1 2-2h12v13H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h12" />
          <path d="M9 9h5M9 12.5h3" />
        </svg>
      </span>
      English<span className="-ml-2 text-orange-500">AI</span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-orange-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />
        <nav className="hidden items-center gap-1 text-sm font-semibold text-stone-600 md:flex">
          <Link href="/#lo-trinh" className="rounded-lg px-3 py-2 hover:bg-orange-50 hover:text-orange-600">
            Lộ trình
          </Link>
          <Link href="/#khoa-hoc" className="rounded-lg px-3 py-2 hover:bg-orange-50 hover:text-orange-600">
            Khóa học
          </Link>
          <Link href="/#cach-hoc" className="rounded-lg px-3 py-2 hover:bg-orange-50 hover:text-orange-600">
            Cách học
          </Link>
          <Link href="/studio" className="rounded-lg px-3 py-2 hover:bg-orange-50 hover:text-orange-600">
            ✨ Thầy AI soạn bài
          </Link>
        </nav>
        <Link
          href="/courses/grammar"
          className="rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-orange-500/30 transition hover:bg-orange-600"
        >
          Vào học ngay
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-orange-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-stone-500 md:flex-row">
        <Logo />
        <p>
          Học tiếng Anh miễn phí cùng thầy AI · Mô hình lớp học dựa trên{" "}
          <a className="font-medium text-orange-600 hover:underline" href="https://github.com/THU-MAIC/OpenMAIC" target="_blank" rel="noreferrer">
            OpenMAIC
          </a>{" "}
          (MIT)
        </p>
      </div>
    </footer>
  );
}
