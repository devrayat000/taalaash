import { createFileRoute } from '@tanstack/react-router';

import Sorter from "./components/Sorter";

const data = Array.from(new Array(40).keys()).map((i) => ({
  id: crypto.randomUUID(),
  imageUrl: `https://source.unsplash.com/random/800x450/?${i}`,
  serial: i + 1,
}));

function ContributorsPage() {
  return (
    <div className="container">
      <h2 className="text-2xl font-semibold mt-3">Contributors</h2>
      <div className="mt-4">
        <div className="grid grid-cols-4 gap-2">
          <Sorter items={data} />
        </div>
      </div>
    </div>
  );
}


export const Route = createFileRoute('/admin/_routes/contributors/')({
  component: ContributorsPage
});
