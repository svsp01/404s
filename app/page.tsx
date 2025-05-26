import { HeaderSection } from '@/components/header-section';
import MainContent from '@/components/main-content';
import { PageGrid } from '@/components/page-grid';
import { PromptInput } from '@/components/prompt-input';
import { page404Api } from '@/lib/services/api';

export default async function Home() {
  const pages = await page404Api.getAll();

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderSection />

      <main className="flex-1 container mx-auto px-4 py-8">
        <MainContent />
        <div className="max-w-4xl mx-auto mb-16">
          <PromptInput />
        </div>

        <PageGrid pages={pages} />
      </main>

      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} 404s. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
