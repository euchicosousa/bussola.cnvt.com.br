import type { MetaFunction } from "react-router";

/**
 * Default meta configuration for the application
 */
export const defaultMeta: MetaFunction = ({ matches }) => {
  const parentMeta = matches
    .flatMap((match) => match.meta ?? [])
    .filter((meta): meta is { title?: string; name?: string; content?: string } => Boolean(meta));

  return [
    { title: "ʙússoʟa - Domine, Crie e Conquiste." },
    {
      name: "description",
      content: "Aplicativo de Gestão de Projetos Criado e Mantido pela Agência CNVT®. Navegue seus projetos com precisão."
    },
    {
      name: "keywords", 
      content: "gestão de projetos, kanban, dashboard, agência, CNVT, bussola"
    },
    {
      property: "og:title",
      content: "Bússola - Gestão de Projetos Inteligente"
    },
    {
      property: "og:description",
      content: "Plataforma moderna de gestão de projetos com IA integrada."
    },
    {
      property: "og:type",
      content: "website"
    },
    ...parentMeta
  ];
};

/**
 * Creates meta function with custom title while keeping other defaults
 */
export function createMeta(title: string, description?: string): MetaFunction {
  return ({ matches }) => {
    const parentMeta = matches
      .flatMap((match) => match.meta ?? [])
      .filter((meta): meta is { title?: string; name?: string; content?: string; property?: string } => Boolean(meta));

    return [
      { title: `${title} - Bússola` },
      {
        name: "description",
        content: description || "Aplicativo de Gestão de Projetos Criado e Mantido pela Agência CNVT®."
      },
      {
        property: "og:title",
        content: title
      },
      {
        property: "og:description", 
        content: description || "Plataforma moderna de gestão de projetos com IA integrada."
      },
      ...parentMeta.filter(meta => 
        meta.title !== undefined || 
        (meta.name !== "description" && meta.property !== "og:title" && meta.property !== "og:description")
      )
    ];
  };
}