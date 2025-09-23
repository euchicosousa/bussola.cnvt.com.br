// Component prop types and interfaces will be defined here
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Image size types
export type ImageSize = "thumbnail" | "mini" | "preview" | "full";

// Action related types
export interface ActionComponentProps extends BaseComponentProps {
  action?: any; // TODO: Define proper action type
}

// Dashboard related types
export interface DashboardComponentProps extends BaseComponentProps {
  partner?: string;
}

// Form related types
export interface FormComponentProps extends BaseComponentProps {
  onSubmit?: () => void;
}