import { Form, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/_index";
import { baseUrl, urlRepository, validateUrl } from "@url-shortener/engine";

const requestsByClient = new Map<string, number[]>();

export async function loader() {
  return {
    baseUrl: `${baseUrl}/s/`,
    urls: await urlRepository.list(),
  };
}

export async function action({ request }: Route.ActionArgs) {
  const client = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const now = Date.now();
  const recentRequests = (requestsByClient.get(client) ?? []).filter((time) => now - time < 60_000);
  if (recentRequests.length >= 20) return { error: "Too many requests. Please try again in a minute." };
  requestsByClient.set(client, [...recentRequests, now]);

  const formData = await request.formData();
  const url = String(formData.get("url") ?? "");
  const validationError = validateUrl(url);
  if (validationError) return { error: validationError };

  const record = await urlRepository.create(url.trim());

  return {
    shortenedUrl: `${baseUrl}/s/${record.code}`,
  };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "URL Shortener" },
    { name: "description", content: "Shorten your URLs quickly and easily" },
  ];
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { baseUrl, urls } = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Kabilio challenge</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Short links, clear insights.</h1>
          <p className="mt-3 max-w-2xl text-slate-600">Create durable short links and keep an eye on their usage.</p>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <Form method="post" className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="url" className="sr-only">Long URL</label>
            <input id="url" type="url" name="url" placeholder="https://example.com/your-long-url" required
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            <button type="submit" disabled={isSubmitting}
              className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60">
              {isSubmitting ? "Creating…" : "Shorten URL"}
            </button>
          </Form>
          <p className="mt-3 text-sm text-slate-500">Short links start with {baseUrl}</p>
          {actionData?.error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{actionData.error}</p>}
          {actionData?.shortenedUrl && <div className="mt-4 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
            <span className="font-semibold">Created: </span>
            <a className="break-all underline" href={actionData.shortenedUrl} target="_blank" rel="noreferrer">{actionData.shortenedUrl}</a>
          </div>}
        </section>

        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-semibold">Your links</h2><span className="text-sm text-slate-500">{urls.length} total</span></div>
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            {urls.length === 0 ? <p className="p-6 text-slate-500">No links yet. Create your first one above.</p> : <div className="divide-y divide-slate-100">
              {urls.map((url) => <article key={url.code} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0"><a className="font-semibold text-indigo-700 hover:underline" href={`${baseUrl}/s/${url.code}`} target="_blank" rel="noreferrer">{baseUrl}/s/{url.code}</a><p className="truncate text-sm text-slate-500">{url.originalUrl}</p></div>
                <div className="flex gap-5 text-sm text-slate-600"><span><strong className="text-slate-900">{url.clicks}</strong> clicks</span><time dateTime={url.createdAt}>{new Date(url.createdAt).toLocaleDateString()}</time></div>
              </article>)}
            </div>}
          </div>
        </section>
      </div>
    </main>
  );
}
