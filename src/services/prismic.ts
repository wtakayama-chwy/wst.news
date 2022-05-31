import Prismic from "@prismicio/client";

export function getPrismicClient(req?: unknown) {
  if (!process.env.PRISMIC_ENDPOINT) {
    throw new Error("Missing PRISMIC_ENDPOINT key");
  }

  if (!process.env.PRISMIC_ACCESS_TOKEN) {
    throw new Error("Missing PRISMIC_ACCESS_TOKEN key");
  }

  const prismic = Prismic.client(process.env.PRISMIC_ENDPOINT, {
    req,
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  });

  return prismic;
}
