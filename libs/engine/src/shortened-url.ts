import { randomBytes } from "node:crypto";

export type ShortenedUrl = {
  code: string;
  originalUrl: string;
  createdAt: string;
  clicks: number;
};

export const MAX_URL_LENGTH = 2_048;

export function validateUrl(value: string): string | null {
  const url = value.trim();
  if (!url) return "URL is required.";
  if (url.length > MAX_URL_LENGTH) return `URL must be ${MAX_URL_LENGTH} characters or less.`;
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return "Only HTTP and HTTPS URLs are supported.";
    if (!parsed.hostname) return "Please enter a valid URL.";
  } catch {
    return "Please enter a valid URL, including https://.";
  }
  return null;
}

export function generateShortCode(): string {
  return randomBytes(6).toString("base64url").slice(0, 8);
}

export interface UrlRepository {
  create(originalUrl: string): Promise<ShortenedUrl>;
  findByCode(code: string): Promise<ShortenedUrl | null>;
  recordClick(code: string): Promise<ShortenedUrl | null>;
  list(): Promise<ShortenedUrl[]>;
}

export class FileUrlRepository implements UrlRepository {
  private records = new Map<string, ShortenedUrl>();
  private loaded = false;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(private readonly filePath: string) {}

  private async load(): Promise<void> {
    if (this.loaded) return;
    this.loaded = true;
    const { readFile } = await import("node:fs/promises");
    try {
      const values = JSON.parse(await readFile(this.filePath, "utf8")) as ShortenedUrl[];
      for (const value of values) this.records.set(value.code, value);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }

  private async persist(): Promise<void> {
    this.writeQueue = this.writeQueue.then(async () => {
      const { mkdir, rename, writeFile } = await import("node:fs/promises");
      const { dirname } = await import("node:path");
      await mkdir(dirname(this.filePath), { recursive: true });
      const temporaryPath = `${this.filePath}.tmp`;
      await writeFile(temporaryPath, JSON.stringify([...this.records.values()], null, 2), "utf8");
      await rename(temporaryPath, this.filePath);
    });
    return this.writeQueue;
  }

  async create(originalUrl: string): Promise<ShortenedUrl> {
    await this.load();
    let code = generateShortCode();
    for (let attempt = 0; this.records.has(code) && attempt < 10; attempt++) code = generateShortCode();
    if (this.records.has(code)) throw new Error("Could not generate a unique short code.");
    const record: ShortenedUrl = { code, originalUrl, createdAt: new Date().toISOString(), clicks: 0 };
    this.records.set(code, record);
    await this.persist();
    return record;
  }

  async findByCode(code: string): Promise<ShortenedUrl | null> {
    await this.load();
    return this.records.get(code) ?? null;
  }

  async recordClick(code: string): Promise<ShortenedUrl | null> {
    await this.load();
    const record = this.records.get(code);
    if (!record) return null;
    const updated = { ...record, clicks: record.clicks + 1 };
    this.records.set(code, updated);
    await this.persist();
    return updated;
  }

  async list(): Promise<ShortenedUrl[]> {
    await this.load();
    return [...this.records.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}
