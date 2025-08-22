import { useSearchParams } from "react-router";

export function getQueryString(qs?: string) {
  if (typeof window !== "undefined") {
    const searchParams = new URLSearchParams(location.search).toString();
    qs = qs ? `${qs}` : "";

    return searchParams ? `?${searchParams}&${qs}` : `?${qs}`;
  } else {
    const [searchParams] = useSearchParams();
    qs = qs ? `${qs}` : "";
    return searchParams.toString()
      ? `?${searchParams.toString()}&${qs}`
      : `?${qs}`;
  }
}

export function getCategoriesQueryString(category?: string) {
  let categories = "";

  if (typeof window !== "undefined") {
    const searchParams = new URLSearchParams(location.search);
    categories = searchParams.get("categories") || "";

    categories =
      category !== undefined
        ? categories !== ""
          ? `${categories}-${category}`
          : category
        : categories;
  } else {
    const [searchParams] = useSearchParams();
    categories = searchParams.get("categories") || "";
    categories =
      category !== undefined
        ? categories !== ""
          ? `${categories}-${category}`
          : category
        : categories;
  }

  return categories;
}