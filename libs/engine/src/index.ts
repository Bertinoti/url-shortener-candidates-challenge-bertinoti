import { FileUrlRepository } from "./shortened-url";

export { baseUrl } from "./base-url";
export { FileUrlRepository, generateShortCode, validateUrl, MAX_URL_LENGTH } from "./shortened-url";
export type { ShortenedUrl, UrlRepository } from "./shortened-url";

export const urlRepository = new FileUrlRepository(process.env.DATA_FILE ?? "data/urls.json");
