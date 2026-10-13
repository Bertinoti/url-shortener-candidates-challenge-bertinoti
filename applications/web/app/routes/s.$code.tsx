import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { urlRepository } from "@url-shortener/engine";

export async function loader({ params }: Route.LoaderArgs) {
  const { code } = params;

  const record = code ? await urlRepository.recordClick(code) : null;

  if (!record) {
    throw new Response("Not Found", { status: 404 });
  }

  return redirect(record.originalUrl);
}
