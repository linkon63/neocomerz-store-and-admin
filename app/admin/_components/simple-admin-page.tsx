import { AdminIcon, PageHeader, StatusToggle } from "./admin-shell";

type SimpleRow = {
  name: string;
  detail: string;
  meta: string;
  status: string;
};

export function SimpleAdminPage({
  title,
  description,
  listTitle,
  countLabel,
  addLabel,
  searchPlaceholder,
  rows,
}: {
  title: string;
  description: string;
  listTitle: string;
  countLabel: string;
  addLabel: string;
  searchPlaceholder: string;
  rows: SimpleRow[];
}) {
  return (
    <>
      <PageHeader
        title={title}
        description={description}
        action={
          <div className="flex gap-3">
            <button className="h-14 rounded-lg border border-slate-300 bg-white px-5 text-xl">
              <AdminIcon className="h-5 w-5" name="refresh" />
            </button>
            <button className="inline-flex h-14 items-center gap-2 rounded-lg bg-blue-600 px-6 font-medium text-white">
              <AdminIcon className="h-5 w-5" name="plus" />
              {addLabel}
            </button>
          </div>
        }
      />

      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">{listTitle}</h2>
          <p className="font-medium text-slate-600">{countLabel}</p>
        </div>
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="p-5">
            <label className="flex h-14 max-w-2xl items-center gap-3 rounded-lg border border-slate-300 px-4">
              <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
              <input
                className="w-full bg-transparent font-medium outline-none"
                placeholder={searchPlaceholder}
              />
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  {["Name", "Detail", "Meta", "Status", "Actions"].map(
                    (heading) => (
                      <th className="px-5 py-4 font-semibold" key={heading}>
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr className="odd:bg-white even:bg-slate-50/70" key={row.name}>
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {row.name}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-600">
                      {row.detail}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-600">
                      {row.meta}
                    </td>
                    <td className="px-5 py-4">
                      {row.status === "Active" ? (
                        <StatusToggle />
                      ) : (
                        <span className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
                          {row.status}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 text-slate-600">
                        <AdminIcon className="h-4 w-4" name="actions" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}

export const defaultRows = [
  {
    name: "Main Branch",
    detail: "Dhaka warehouse and fulfillment",
    meta: "Updated today",
    status: "Active",
  },
  {
    name: "Online Store",
    detail: "Customer storefront operation",
    meta: "8 linked products",
    status: "Active",
  },
  {
    name: "Manual Review",
    detail: "Requires staff confirmation",
    meta: "3 pending items",
    status: "Draft",
  },
];
