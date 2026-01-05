# imgico (Wasm)

High-performance image to ICO/SVG converter for the browser, built with Rust and WebAssembly.
This is the WebAssembly port of the `imgico` library, allowing client-side image conversion without server dependencies.

## Features

- **Client-side Conversion**: Convert images directly in the browser.
- **Fast & Efficient**: Powered by Rust and WebAssembly.
- **Small Footprint**: Optimized for size (~430KB).
- **Supports**:
  - Image to ICO (multiple sizes)
  - Image to SVG (embedded PNG)

## Build

To build the project from source:

1. **Install Rust**: [https://rustup.rs/](https://rustup.rs/)
2. **Install wasm-pack**:

```bash
cargo install wasm-pack
```

3. **Build**:

```bash
wasm-pack build --target web
```

This will generate a `pkg` directory which can be imported into your web application.

## Usage

### Initialization

You must initialize the Wasm module before using the conversion functions.

```javascript
import init, { imgico, imgsvg } from './pkg/imgico.js';

async function main() {
  // Initialize the Wasm module
  await init();

  // Load image as Uint8Array
  const response = await fetch('input.png');
  const arrayBuffer = await response.arrayBuffer();
  const inputBuffer = new Uint8Array(arrayBuffer);

  // 1. Convert to ICO
  try {
    // Default sizes: [16, 32, 48, 64, 128, 256]
    const icoData = imgico(inputBuffer);

    // Download or use the ICO data
    download(icoData, 'icon.ico');
    // Custom sizes
    const customIcoData = imgico(inputBuffer, new Uint32Array([16, 32]));
  } catch (e) {
    console.error('ICO conversion failed:', e);
  }

  // 2. Convert to SVG
  try {
    // Optional size argument
    const svgData = imgsvg(inputBuffer, 512);

    // Convert bytes to string if needed
    const svgString = new TextDecoder().decode(svgData);
    console.log(svgString);
  } catch (e) {
    console.error('SVG conversion failed:', e);
  }
}

function download(data, filename) {
  const blob = new Blob([data], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

main();
```

## CLI Usage

You can also use `imgico` as a command-line tool.

### Installation

```bash
cargo install --path .
```

### Usage

```bash
imgico <input_file> [options]
```

Options:

- `-f, --format <type>`: Output format: 'ico' or 'svg' (default: ico)
- `-h, --help`: Show help message

Example:

```bash
imgico input.png -f ico
```

## API

### `imgico(input, sizes?)`

- `input`: `Uint8Array` - The input image data.
- `sizes`: `Uint32Array | number[]` (optional) - List of sizes to include in the ICO. Default: `[16, 32, 48, 64, 128, 256]`.

Returns: `Uint8Array` (The generated ICO file data).

### `imgsvg(input, size?)`

- `input`: `Uint8Array` - The input image data.
- `size`: `number` (optional) - The target width/height for the embedded image. If omitted, uses original size.

Returns: `Uint8Array` (The generated SVG file data as bytes).

## License

ISC
