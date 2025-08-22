import { isInstagramFeed } from "../validation/contentValidation";

export function getResponsibles(people: Person[], users_ids?: string[] | null) {
  return people
    .filter((person) => users_ids?.find((user) => person.user_id === user))
    .sort((a, b) => {
      const nameCompare = a.name.localeCompare(b.name, "pt-BR");
      if (nameCompare !== 0) return nameCompare;
      // Secondary sort by user_id for stability
      return a.user_id.localeCompare(b.user_id, "pt-BR");
    });
}

export function getPartners(partners_slug: string[], partners: Partner[]) {
  if (partners_slug.length) {
    return partners
      .filter((partner) => partners_slug?.find((p) => partner.slug === p))
      .sort((a, b) => {
        const titleCompare = a.title.localeCompare(b.title, "pt-BR");
        if (titleCompare !== 0) return titleCompare;
        // Secondary sort by slug for stability
        return a.slug.localeCompare(b.slug, "pt-BR");
      });
  }
  return partners.sort((a, b) => {
    const titleCompare = a.title.localeCompare(b.title, "pt-BR");
    if (titleCompare !== 0) return titleCompare;
    // Secondary sort by slug for stability
    return a.slug.localeCompare(b.slug, "pt-BR");
  });
}

export function getCategoriesSortedByContent(categories: Category[]) {
  const firsts = categories.filter((c) => isInstagramFeed(c.slug));
  const lasts = categories.filter((c) => !isInstagramFeed(c.slug));

  return [firsts, lasts];
}