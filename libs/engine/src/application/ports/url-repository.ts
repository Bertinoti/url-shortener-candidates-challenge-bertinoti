import type { ShortUrl } from "../../domain/short-url";

export type CreateShortUrlRecord = Omit<ShortUrl, "clicks">;

export interface UrlRepository {
  create(input: CreateShortUrlRecord): Promise<ShortUrl>;
  findAndIncrementClicks(code: string): Promise<ShortUrl | null>;
  list(): Promise<ShortUrl[]>;
}
