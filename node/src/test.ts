import { imgico, imgsvg } from './index';
import assert from 'assert';

async function test() {
  console.log('Running tests...');

  // Create a simple SVG buffer
  const svg = Buffer.from(`
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
    </svg>
  `);

  try {
    // Test imgico
    const icoBuffer = await imgico(svg);

    // Basic validation
    assert.ok(icoBuffer instanceof Buffer, 'Output should be a Buffer');
    assert.ok(icoBuffer.length > 0, 'Output buffer should not be empty');

    // Check ICO header (0, 1, count)
    assert.strictEqual(icoBuffer.readUInt16LE(0), 0, 'Reserved should be 0');
    assert.strictEqual(icoBuffer.readUInt16LE(2), 1, 'Type should be 1 (ICO)');

    // Default sizes length is 6
    const count = icoBuffer.readUInt16LE(4);
    assert.strictEqual(count, 6, 'Should contain 6 images by default');

    console.log('✅ imgico passed!');

    // Test imgsvg
    console.log('Testing imgsvg...');
    const svgBuffer = await imgsvg(svg, { size: 50 });
    const svgString = svgBuffer.toString();

    assert.ok(svgString.startsWith('<svg'), 'Output should start with <svg');
    assert.ok(svgString.includes('width="50"'), 'Should have correct width');
    assert.ok(svgString.includes('height="50"'), 'Should have correct height');
    assert.ok(svgString.includes('data:image/png;base64,'), 'Should contain embedded PNG');

    console.log('✅ img2svg passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

test();
