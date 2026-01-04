# imgico

Convert images (png, jpg, svg, etc.) to ICO format using Node.js.
Minimal dependencies (only `sharp`), TypeScript support.

## Installation

> npm install imgico

## Usage

### Code

```typescript
import { imgico, imgsvg } from 'imgico';
import fs from 'fs/promises';

async function main() {
  // Convert from file path
  const icoBuffer = await imgico('input.png');
  await fs.writeFile('output.ico', icoBuffer);

  // Or with options
  const icoBuffer2 = await imgico('input.svg', {
    sizes: [16, 32, 64], // Custom sizes
    resizeOptions: { fit: 'cover' }, // Sharp resize options
  });
  await fs.writeFile('output-custom.ico', icoBuffer2);

  // Convert to SVG
  const svgBuffer = await imgsvg('input.png', { size: 512 });
  await fs.writeFile('output.svg', svgBuffer);
}

main();
```

### CLI

You can use the CLI to extract icons in various sizes.

> npm install -g imgico

```bash
# Extract individual ICOs to a directory (default)
# Creates a directory named imgico-{timestamp} containing 16.ico, 32.ico, etc.
imgico input.png

# Extract individual SVGs to a directory
imgico input.png -f svg
```

## API

### `imgico(input, options?)`

- `input`: `string | Buffer` - Path to the image file or image buffer.
- `options`: `IcoOptions` (optional)
  - `sizes`: `number[]` - Array of sizes to include in the ICO. Default: `[16, 32, 48, 64, 128, 256]`.
  - `resizeOptions`: `sharp.ResizeOptions` - Options passed to sharp's resize function.

Returns a `Promise<Buffer>` containing the ICO file data.

### `img2svg(input, options?)`

- `input`: `string | Buffer` - Path to the image file or image buffer.
- `options`: `SvgOptions` (optional)
  - `size`: `number` - Size of the SVG (width and height). If not specified, uses the original image size.
  - `resizeOptions`: `sharp.ResizeOptions` - Options passed to sharp's resize function.

Returns a `Promise<Buffer>` containing the SVG file data.

## License

ISC
