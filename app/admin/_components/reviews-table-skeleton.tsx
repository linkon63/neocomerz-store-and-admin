export function ReviewsTableSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-2 py-2 text-sm font-semibold text-slate-700">User</th>
              <th className="px-2 py-2 text-sm font-semibold text-slate-700">Product</th>
              <th className="px-2 py-2 text-sm font-semibold text-slate-700">Rating</th>
              <th className="px-2 py-2 text-sm font-semibold text-slate-700">Comment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 4 }).map((_, j) => (
                  <td className="px-2 py-2" key={j}>
                    <div className="h-5 w-full max-w-28 animate-pulse rounded bg-slate-100" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
