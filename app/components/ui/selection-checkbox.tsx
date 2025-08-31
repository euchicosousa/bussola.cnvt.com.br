import { Checkbox } from "~/components/ui/checkbox";
import { cn } from "~/lib/ui";

interface SelectionCheckboxProps {
  isSelected: boolean;
  action: Action;
  onSelectionChange: (itemIds: Action[]) => void;
  currentSelection: Action[];
  className?: string;
}

export function SelectionCheckbox({
  isSelected,
  action,
  onSelectionChange,
  currentSelection,
  className,
}: SelectionCheckboxProps) {
  return (
    <Checkbox
      checked={isSelected}
      className={cn(
        "bg-accent size-6 rounded-full border-2 border-transparent",
        className,
      )}
      onCheckedChange={(state) => {
        if (state) {
          onSelectionChange([...currentSelection, action]);
        } else {
          onSelectionChange(currentSelection.filter((a) => a.id !== action.id));
        }
      }}
    />
  );
}
