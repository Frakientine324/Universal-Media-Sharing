import { useListPosts } from '@workspace/api-client-react';
import { ArrowDown, ArrowUpRight, Camera, Sparkles } from 'lucide-react';
import { ErrorState, LoadingGrid, PostGrid } from '@/components/media-board';

export function HomePage({ onCreate }: { onCreate: () => void }) {
  const feed = useListPosts();
  return <main className="page-enter">
    <section className="relative overflow-hidden border-b border-[hsl(var(--border))]">
      <div className="pointer-events-none absolute -right-28 -top-28 hidden h-[420px] w-[420px] rounded-full border border-[hsl(var(--primary)/.15)] lg:block lg:right-[-4%] lg:top-[-38%] lg:h-[660px] lg:w-[660px]" />
      <div className="pointer-events-none absolute right-[9%] top-[19%] hidden h-[225px] w-[225px] rotate-[13deg] rounded-[46px] bg-[hsl(var(--accent))] lg:block lg:right-[14%] lg:top-[12%] lg:h-[310px] lg:w-[310px] lg:rounded-[72px]" />
      <div className="pointer-events-none absolute right-[18%] top-[23%] hidden h-[205px] w-[172px] rotate-[-9deg] overflow-hidden rounded-[39px] border-[9px] border-[hsl(var(--card))] bg-[hsl(var(--primary))] shadow-xl lg:block lg:right-[21%] lg:top-[19%] lg:h-[282px] lg:w-[236px] lg:rounded-[54px] lg:border-[12px]">
        <div className="absolute inset-[8%] rounded-[31px] bg-[hsl(var(--secondary))]" />
        <div className="absolute left-[19%] top-[23%] h-[37%] w-[62%] rounded-t-full bg-[hsl(var(--primary))]" />
        <div className="absolute bottom-[12%] left-[17%] h-[32%] w-[66%] rotate-[-10deg] rounded-[44%_44%_12px_12px] bg-[hsl(var(--accent))]" />
        <div className="absolute bottom-[9%] left-[28%] h-[22%] w-[44%] rotate-[13deg] rounded-[50%_50%_3px_3px] bg-[hsl(42_72%_61%)]" />
        <span className="absolute left-1/2 top-2 h-2 w-10 -translate-x-1/2 rounded-full bg-[hsl(var(--foreground)/.18)]" />
      </div>
      <div className="absolute right-[7%] top-[17%] hidden h-[58px] w-[58px] rotate-[12deg] items-center justify-center rounded-2xl bg-[hsl(42_72%_61%)] text-[hsl(var(--foreground))] shadow-md lg:flex"><Camera size={23} /></div>
      <div className="absolute right-[13%] top-[67%] hidden h-12 w-12 -rotate-[14deg] items-center justify-center rounded-full border-2 border-[hsl(var(--primary))] text-[hsl(var(--primary))] lg:flex"><Sparkles size={20} /></div>
      <div className="mx-auto grid min-h-[490px] max-w-[1320px] grid-cols-1 items-center px-5 py-16 sm:min-h-[555px] sm:px-8 sm:py-20 lg:grid-cols-[1.15fr_.85fr]">
        <div className="relative z-10 max-w-[700px]">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card)/.78)] px-3.5 py-2 font-mono text-[10px] uppercase tracking-[.14em] text-[hsl(var(--primary))]"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" /> An open gallery for everyone</p>
          <h1 className="font-serif text-[clamp(3.4rem,8vw,7rem)] font-semibold leading-[.89] tracking-[-.075em]">The world,<br /><span className="relative inline-block text-[hsl(var(--primary))]">as you see it.</span></h1>
          <p className="mt-7 max-w-[470px] text-base leading-7 text-[hsl(var(--muted-foreground))] sm:text-lg sm:leading-8">A public wall for the small scenes, faraway places and perfectly ordinary days worth keeping.</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button onClick={onCreate} className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-6 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-sm transition-transform hover:-translate-y-0.5" data-testid="button-hero-create">Put something out there <ArrowUpRight size={17} /></button>
            <a href="#recent" className="inline-flex items-center gap-2 px-2 py-3 text-sm font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]" data-testid="link-explore">Wander around <ArrowDown size={15} /></a>
          </div>
        </div>
        <div className="relative hidden h-full min-h-[420px] lg:block" aria-hidden="true">
          <span className="absolute right-[4%] top-[12%] hidden font-mono text-[10px] uppercase tracking-[.2em] text-[hsl(var(--muted-foreground))] lg:block">Little things. Wide open.</span>
          <span className="absolute bottom-[17%] right-[7%] hidden rotate-[5deg] rounded-lg bg-[hsl(var(--card))] px-4 py-3 font-serif text-lg shadow-md lg:block">a moment, shared ↗</span>
          <span className="absolute bottom-[5%] right-[37%] hidden -rotate-[8deg] font-mono text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))] lg:block">Est. right now</span>
          <svg className="absolute bottom-[19%] right-[34%] hidden h-[110px] w-[165px] text-[hsl(var(--primary))] lg:block" viewBox="0 0 165 110" fill="none"><path d="M2 83c29-33 40 24 68-2 18-17 29-66 52-57 19 7-3 62 41 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 7" /></svg>
        </div>
      </div>
    </section>
    <section id="recent" className="mx-auto max-w-[1320px] px-5 pb-20 pt-14 sm:px-8 sm:pb-28 sm:pt-[76px]">
      <div className="mb-8 flex items-end justify-between gap-5 sm:mb-10">
        <div><p className="mb-2 font-mono text-[10px] uppercase tracking-[.2em] text-[hsl(var(--accent))]">The community wall</p><h2 className="font-serif text-[clamp(2.2rem,4vw,3.5rem)] font-semibold leading-none tracking-[-.055em]">Fresh from everywhere<span className="text-[hsl(var(--accent))]">.</span></h2></div>
        <p className="hidden max-w-[225px] text-right text-xs leading-5 text-[hsl(var(--muted-foreground))] sm:block">Real moments from real people.<br />No audience required.</p>
      </div>
      {feed.isLoading ? <LoadingGrid /> : feed.isError ? <ErrorState retry={() => void feed.refetch()} /> : <PostGrid posts={feed.data || []} />}
    </section>
    <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.45)]">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-3 px-5 py-7 text-xs text-[hsl(var(--muted-foreground))] sm:flex-row sm:items-center sm:justify-between sm:px-8"><span className="font-serif text-lg font-semibold tracking-[-.04em] text-[hsl(var(--foreground))]">media<span className="text-[hsl(var(--accent))]">board</span></span><span>A shared wall for the way you see things.</span><span className="font-mono text-[10px] uppercase tracking-[.12em]">Made for every screen</span></div>
    </footer>
  </main>;
}
