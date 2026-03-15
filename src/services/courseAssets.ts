"server-only";

import { readdir } from "node:fs/promises";
import path from "node:path";

type CourseAsset = { name: string; src: string };

function isValidSegment(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(value);
}

export async function listCourseSvgs(
  courseSlug: string,
  section: string,
): Promise<CourseAsset[]> {
  if (!isValidSegment(courseSlug) || !isValidSegment(section)) {
    return [];
  }

  const folderPath = path.join(
    process.cwd(),
    "public",
    "courses",
    courseSlug,
    section,
  );

  let names: string[] = [];
  try {
    const entries = await readdir(folderPath, { withFileTypes: true });
    names = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => name.toLowerCase().endsWith(".svg"))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  } catch {
    names = [];
  }

  const baseUrl = `/courses/${encodeURIComponent(
    courseSlug,
  )}/${encodeURIComponent(section)}`;

  return names.map((name) => ({
    name,
    src: `${baseUrl}/${encodeURIComponent(name)}`,
  }));
}
