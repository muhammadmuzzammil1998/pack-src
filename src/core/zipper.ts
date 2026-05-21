import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import archiver from 'archiver';
import type { CollectedFile, PackStats } from '../types/index.js';

export interface ZipperOptions {
  outputPath: string;
  compression: number;
  files: CollectedFile[];
  onProgress?: ((current: number, total: number) => void) | undefined;
}

/**
 * Stream files into a ZIP archive.
 * Returns final stats including compressed size.
 */
export async function createZip(opts: ZipperOptions, startTime: number): Promise<PackStats> {
  const { outputPath, compression, files, onProgress } = opts;

  // Ensure output directory exists
  await fsp.mkdir(path.dirname(outputPath), { recursive: true });

  return new Promise<PackStats>((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: compression },
      statConcurrency: 8,
    });

    let compressedBytes = 0;
    let processed = 0;
    const total = files.length;

    output.on('close', () => {
      compressedBytes = archive.pointer();
      const durationMs = Date.now() - startTime;
      const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
      resolve({ fileCount: total, totalBytes, compressedBytes, durationMs, outputPath });
    });

    archive.on('error', reject);
    output.on('error', reject);

    archive.pipe(output);

    for (const file of files) {
      archive.file(file.absolutePath, { name: file.archivePath });
      processed++;
      onProgress?.(processed, total);
    }

    void archive.finalize();
  });
}
