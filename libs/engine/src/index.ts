import { FileUrlRepository } from "./shortened-url";

export { baseUrl } from "./base-url";
export { FileUrlRepository, generateShortCode, validateUrl, MAX_URL_LENGTH } from "./shortened-url";
export type { ShortenedUrl } from "./shortened-url";

export { CreateShortUrl } from "./application/use-cases/create-short-url";
export { ListShortUrls } from "./application/use-cases/list-short-urls";
export { ResolveShortUrl } from "./application/use-cases/resolve-short-url";
export { DestinationUrl } from "./domain/destination-url";
export {
  InvalidDestinationUrlError,
  InvalidShortCodeError,
  ShortCodeAlreadyExistsError,
  ShortCodeGenerationExhaustedError,
  ShortUrlNotFoundError,
} from "./domain/errors";
export { ShortCode } from "./domain/short-code";
export type { Clock } from "./application/ports/clock";
export type { ShortCodeGenerator } from "./application/ports/short-code-generator";
export type {
  CreateShortUrlRecord,
  UrlRepository,
} from "./application/ports/url-repository";
export type { ShortUrl } from "./domain/short-url";

export const urlRepository = new FileUrlRepository(process.env.DATA_FILE ?? "data/urls.json");
