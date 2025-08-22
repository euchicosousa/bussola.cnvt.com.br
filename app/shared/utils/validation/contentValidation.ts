/*
@description Função que verifica se a categoria é uma categoria de feed do Instagram e Stories
@params category: string
@params stories: boolean
@returns boolean
*/
export function isInstagramFeed(category: string, stories = false) {
  return ["post", "reels", "carousel", stories ? "stories" : null].includes(
    category,
  );
}

export function getTypeOfTheContent(content: string) {
  return /(.mp4|.mov)$/.test(content.toLowerCase()) ? "video" : "image";
}