import React from "react";
import { isAfter } from "date-fns";
import { ActionItem } from "../ActionItem";
import { VARIANTS, IMAGE_SIZES } from "~/lib/constants";

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
            variant={VARIANTS.GRID}
            partner={partner}
            imageSize={IMAGE_SIZES.THUMBNAIL}
          />
        ))}
      </div>
    </div>
  );
}
