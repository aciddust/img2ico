#!/usr/bin/env node
import { parseArgs } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { imgico, imgsvg } from './index';

async function main() {
  try {
    const { values, positionals } = parseArgs({
      args: process.argv.slice(2),
      options: {
        format: { type: 'string', short: 'f' },
        help: { type: 'boolean', short: 'h' },
      },
      allowPositionals: true,
    });

    if (values.help || positionals.length === 0) {
      console.log(`
Usage: imgico <input> [options]

Options:
  -f, --format <type>   Output format: 'ico' or 'svg' (default: ico)
  -h, --help            Show this help message
`);
      process.exit(0);
    }

    const inputPath = positionals[0];

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dirName = `imgico-${timestamp}`;
    await fs.mkdir(dirName, { recursive: true });

    // Default sizes
    const sizes = [16, 32, 48, 64, 128, 256];
    const format = values.format?.toLowerCase() === 'svg' ? 'svg' : 'ico';

    for (const size of sizes) {
      if (format === 'svg') {
        const buffer = await imgsvg(inputPath, { size });
        await fs.writeFile(path.join(dirName, `${size}.svg`), buffer);
      } else {
        // Create a single-size ICO for each size
        const buffer = await imgico(inputPath, { sizes: [size] });
        await fs.writeFile(path.join(dirName, `${size}.ico`), buffer);
      }
    }
    console.log(`Extracted ${format.toUpperCase()} images to ${dirName}`);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
