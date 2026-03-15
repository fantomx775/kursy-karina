export type SeedMode = "seed" | "reset" | "all";

export const resolveSeedFilePath = (fileName: string) =>
  `${process.cwd()}\\database\\${fileName}`;

export const buildSqlCommand = (databaseUrl: string, filePath: string) => ({
  command: "psql",
  args: [databaseUrl, "-f", filePath],
});
