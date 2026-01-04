import sharp from 'sharp';

export interface IcoOptions {
  /**
   * List of sizes to include in the ICO file.
   * Default: [16, 32, 48, 64, 128, 256]
   */
  sizes?: number[];
  /**
   * Sharp resize options.
   */
  resizeOptions?: sharp.ResizeOptions;
}

const DEFAULT_SIZES = [16, 32, 48, 64, 128, 256];

/**
 * Convert an image to ICO format.
 * @param input File path or Buffer of the image.
 * @param options Conversion options.
 * @returns Promise resolving to the ICO file Buffer.
 */
export async function imgico(input: string | Buffer, options: IcoOptions = {}): Promise<Buffer> {
  const sizes = options.sizes || DEFAULT_SIZES;
  const images: { buffer: Buffer; size: number }[] = [];

  // 1. Resize images to PNG buffers
  for (const size of sizes) {
    // Ensure size is within valid range for ICO (1-256)
    if (size < 1 || size > 256) {
      throw new Error(`Invalid icon size: ${size}. Size must be between 1 and 256.`);
    }

    const buffer = await sharp(input)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        ...options.resizeOptions,
      })
      .png()
      .toBuffer();
    images.push({ buffer, size });
  }

  // 2. Create ICO header
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type (1 = ICO)
  header.writeUInt16LE(images.length, 4); // Count

  // 3. Create Directory Entries
  const directorySize = 16 * images.length;
  const directory = Buffer.alloc(directorySize);
  let offset = 6 + directorySize;

  for (let i = 0; i < images.length; i++) {
    const { buffer, size } = images[i];
    const entryOffset = i * 16;

    // Width & Height (0 means 256)
    const dim = size >= 256 ? 0 : size;
    directory.writeUInt8(dim, entryOffset);
    directory.writeUInt8(dim, entryOffset + 1);

    directory.writeUInt8(0, entryOffset + 2); // Palette count (0 for >8bpp)
    directory.writeUInt8(0, entryOffset + 3); // Reserved
    directory.writeUInt16LE(1, entryOffset + 4); // Color planes
    directory.writeUInt16LE(32, entryOffset + 6); // Bits per pixel
    directory.writeUInt32LE(buffer.length, entryOffset + 8); // Size of image data
    directory.writeUInt32LE(offset, entryOffset + 12); // Offset of image data

    offset += buffer.length;
  }

  // 4. Combine all buffers
  return Buffer.concat([header, directory, ...images.map((img) => img.buffer)]);
}

export interface SvgOptions {
  /**
   * Size of the SVG (width and height).
   * If not specified, uses the original image size.
   */
  size?: number;
  /**
   * Sharp resize options.
   */
  resizeOptions?: sharp.ResizeOptions;
}

/**
 * Convert an image to SVG format (embedded PNG).
 * @param input File path or Buffer of the image.
 * @param options Conversion options.
 * @returns Promise resolving to the SVG file Buffer.
 */
export async function imgsvg(input: string | Buffer, options: SvgOptions = {}): Promise<Buffer> {
  let pipeline = sharp(input);

  if (options.size) {
    pipeline = pipeline.resize(options.size, options.size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      ...options.resizeOptions,
    });
  }

  // Convert to PNG and get dimensions
  const { data: pngBuffer, info } = await pipeline.png().toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const pngBase64 = pngBuffer.toString('base64');

  // Create SVG with embedded PNG
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <image width="${width}" height="${height}" xlink:href="data:image/png;base64,${pngBase64}" />
</svg>`;

  return Buffer.from(svg);
}
