import { Boxes, Search, Share2 } from "lucide-react";
import { modongStates, publicPhrases, wantedStates } from "@dongmodel/shared";

const highlights = [
  {
    icon: Boxes,
    title: "กองโมดอง",
    text: "เก็บของที่มีจริง แยกสถานะ ที่เก็บ ราคา และโน้ตส่วนตัว"
  },
  {
    icon: Search,
    title: "ของที่ตามหา",
    text: `แชร์ด้วยคำว่า "${publicPhrases.wantedShare}" โดยไม่ต้องโชว์งบ`
  },
  {
    icon: Share2,
    title: "แชร์อวดเพื่อน",
    text: "public link ดูได้เลย แต่ไม่เปิดราคา ที่เก็บ หรือโน้ตส่วนตัว"
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-8 sm:py-12">
        <header className="flex flex-col gap-4 border-b border-border pb-6">
          <p className="text-sm font-semibold text-primary">Dongmodel MVP</p>
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-6xl">
              จัดกองโมดองให้รู้ว่าอะไรอยู่ไหน อะไรตามหาอยู่ และอะไรพร้อมอวด
            </h1>
            <p className="text-base leading-7 text-muted-foreground">
              โครงหน้าแรกสำหรับ Next.js frontend แยกจาก NestJS backend ตาม MVP ที่ตกลงไว้
            </p>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-3">
          {highlights.map((item) => (
            <article
              className="rounded-lg border border-border bg-white p-5 shadow-sm"
              key={item.title}
            >
              <item.icon className="mb-4 h-6 w-6 text-accent" aria-hidden />
              <h2 className="text-lg font-bold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.text}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-white p-5">
            <h2 className="text-xl font-bold">สถานะโมดอง</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {modongStates.map((state) => (
                <span
                  className="rounded-md border border-border px-3 py-2 text-sm font-medium"
                  key={state}
                >
                  {state}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-white p-5">
            <h2 className="text-xl font-bold">สถานะของที่ตามหา</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {wantedStates.map((state) => (
                <span
                  className="rounded-md border border-border px-3 py-2 text-sm font-medium"
                  key={state}
                >
                  {state}
                </span>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
