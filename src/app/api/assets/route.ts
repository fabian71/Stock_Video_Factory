import {mkdir, readdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {NextRequest, NextResponse} from 'next/server';

const assetDir = () => path.join(process.cwd(), 'public', 'assets');
const allowed = new Set(['.svg', '.png']);

const toAsset = (fileName: string) => {
  const extension = path.extname(fileName).toLowerCase();
  return {
    id: path.basename(fileName, extension),
    src: `/assets/${fileName}`,
    kind: extension === '.svg' ? 'svg' : 'png',
    dominantColor: extension === '.svg' ? '#ffd84d' : '#66a6ff',
  };
};

export async function GET() {
  await mkdir(assetDir(), {recursive: true});
  const files = (await readdir(assetDir())).filter((file) => allowed.has(path.extname(file).toLowerCase()));
  return NextResponse.json({ok: true, assets: files.map(toAsset)});
}

export async function POST(req: NextRequest) {
  await mkdir(assetDir(), {recursive: true});
  const formData = await req.formData();
  const files = formData.getAll('files').filter((file): file is File => file instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ok: false, error: 'Nenhum arquivo enviado.'}, {status: 400});
  }

  const assets = [];

  for (const file of files) {
    const extension = path.extname(file.name).toLowerCase();
    if (!allowed.has(extension)) {
      return NextResponse.json({ok: false, error: 'Use somente SVG ou PNG.'}, {status: 400});
    }

    const safeName = file.name.toLowerCase().replace(/[^a-z0-9_.-]+/g, '-');
    const targetName = `${Date.now()}-${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(assetDir(), targetName), buffer);
    assets.push(toAsset(targetName));
  }

  return NextResponse.json({ok: true, assets});
}
