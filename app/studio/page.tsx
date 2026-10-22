import { SiteHeader } from "@/components/SiteHeader";
import { Studio } from "@/components/Studio";

export const metadata = { title: "Tạo bài học bằng AI – EnglishAI" };

export default function StudioPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <Studio />
      </main>
    </>
  );
}
