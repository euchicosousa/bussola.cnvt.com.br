import React from "react";
import { isAfter } from "date-fns";
import { ActionItem } from "../ActionItem";

interface GridOfActionsProps {
  actions?: Action[];
  partner: Partner;
}

export function GridOfActions({ actions, partner }: GridOfActionsProps) {
  // Sort by Instagram date
  actions = actions?.sort((a, b) =>
    isAfter(a.instagram_date, b.instagram_date) ? -1 : 1,
  );

  return (
    <div className="scrollbars-v">
      <div className="grid grid-cols-3 overflow-hidden rounded-xs">
        {actions?.map((action, index) => (
          <ActionItem
            key={index}
            action={action}
            variant="grid"
            partner={partner}
          />
        ))}
      </div>
    </div>
  );
}
