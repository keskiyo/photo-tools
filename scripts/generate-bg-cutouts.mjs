// Генерирует прозрачные PNG-вырезы (субъект без фона) из демо-фото в public/demo
// через PhotoRoom API. В рантайме приложение использует уже готовые *-cut.png.
//
// Запуск (ключ берётся из .env): node --env-file=.env scripts/generate-bg-cutouts.mjs
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const apiKey = process.env.PHOTOROOM_REMOVE_BG_API;
if (!apiKey) {
  console.error(
    "PHOTOROOM_REMOVE_BG_API не задан. Запусти: node --env-file=.env scripts/generate-bg-cutouts.mjs",
  );
  process.exit(1);
}

const names = [
  "bg-demo-people",
  "bg-demo-animal",
  "bg-demo-object",
  "bg-demo-scene",
];
const dir = path.join(process.cwd(), "public", "demo");

for (const name of names) {
  const input = await readFile(path.join(dir, `${name}.png`));
  const form = new FormData();
  form.append("image_file", new Blob([input], { type: "image/png" }), `${name}.png`);
  form.append("format", "png");

  const response = await fetch("https://sdk.photoroom.com/v1/segment", {
    method: "POST",
    headers: { "x-api-key": apiKey },
    body: form,
  });

  if (!response.ok) {
    console.error(`${name}: ${response.status} ${await response.text()}`);
    process.exit(1);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(path.join(dir, `${name}-cut.png`), buffer);
  console.log(`generated ${name}-cut.png (${buffer.length} bytes)`);
}

console.log("Done.");
