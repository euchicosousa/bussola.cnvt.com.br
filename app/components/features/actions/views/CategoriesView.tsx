import { useMatches } from "react-router";
import { Icons } from "~/lib/helpers";
import { ActionsContainer } from "~/components/features/actions";
import { TIME_FORMAT, VARIANTS } from "~/lib/constants";

export function CategoriesView({ actions }: { actions: Action[] }) {
  const matches = useMatches();
  const { categories } = matches[1].data as DashboardRootType;

  return (
    <div className="grid items-start gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => {
        const categoryActions = actions.filter(
          (action) => action.category === category.slug,
        );
        return categoryActions.length > 0 ? (
          <div key={category.slug}>
            <div className="mb-2 flex items-center gap-2">
              {<Icons id={category.slug} className={`size-4`} />}

              <h4 className="font-bold">{category.title}</h4>
            </div>

            <ActionsContainer
              actions={categoryActions}
              variant={VARIANTS.BLOCK}
              showPartner
              dateDisplay={{ timeFormat: TIME_FORMAT.WITH_TIME }}
            />
          </div>
        ) : null;
      })}
    </div>
  );
}
