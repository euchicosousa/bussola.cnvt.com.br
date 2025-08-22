import { useMatches } from "react-router";
import { Icons } from "~/lib/helpers";
import { ListOfActions } from "~/components/features/actions";

export function CategoriesView({ actions }: { actions: Action[] }) {
  const matches = useMatches();
  const { categories } = matches[1].data as DashboardRootType;

  return (
    <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <div key={category.slug}>
          <div className="mb-2 flex items-center gap-2">
            {<Icons id={category.slug} className={`size-4`} />}

            <h4 className="font-bold">{category.title}</h4>
          </div>

          <ListOfActions
            actions={actions.filter(
              (action) => action.category === category.slug,
            )}
            isFoldable
            showPartner
            date={{ timeFormat: 1 }}
          />
        </div>
      ))}
    </div>
  );
}