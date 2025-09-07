import { ActionsContainer } from "~/components/features/actions";
import { VARIANTS, DATE_FORMAT, TIME_FORMAT } from "~/lib/constants";

export function HoursView({ actions }: { actions: Action[] }) {
  return (
    <div className="gap-4 md:grid md:grid-cols-2 xl:grid-cols-4">
      {[
        [0, 1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10, 11],
        [12, 13, 14, 15, 16, 17],
        [18, 19, 20, 21, 22, 23],
      ].map((columns, i) => (
        <div key={i}>
          {columns.map((hour, j) => {
            const hourActions = actions.filter(
              (action) => new Date(action.date).getHours() === hour,
            );
            return (
              <div key={j} className="flex min-h-11 gap-2 border-t py-2">
                <div
                  className={`text-xs font-bold ${
                    hourActions.length === 0 ? "opacity-15" : ""
                  }`}
                >
                  {hour}h
                </div>
                <div className="w-full">
                  <ActionsContainer
                    actions={hourActions}
                    variant={VARIANTS.HOUR}
                    showCategory={true}
                    columns={1}
                    dateDisplay={{
                      dateFormat: DATE_FORMAT.NONE,
                      timeFormat: TIME_FORMAT.WITH_TIME,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
