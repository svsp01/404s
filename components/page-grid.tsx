import { Page404 } from '@/lib/actions';
import { PageTile } from '@/components/page-tile';

interface PageGridProps {
  pages: Page404[];
}

export function PageGrid({ pages }: PageGridProps) {
  if (pages.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-2xl font-medium mb-4">No 404 pages yet</h3>
        <p className="text-muted-foreground">
          Enter a prompt above to create your first custom 404 page.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-center">Your 404 Pages</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page) => (
          <PageTile key={page._id} page={page} />
        ))}
      </div>
    </div>
  );
}