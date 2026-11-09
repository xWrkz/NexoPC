import { getProductsBySlugs } from "@/lib/catalog/products";
import { exampleBuilds } from "@/lib/home/exampleBuilds";
import { resolveBuild, ResolvedBuild } from "@/lib/home/resolveBuild";

export type { ResolvedBuild };

export async function getExampleBuilds(): Promise<ResolvedBuild[]> {
  const slugs = [...new Set(exampleBuilds.flatMap((build) => Object.values(build.slugs).filter((slug): slug is string => Boolean(slug))))];
  const products = await getProductsBySlugs(slugs);
  return exampleBuilds.map((build) => resolveBuild(build, products));
}
