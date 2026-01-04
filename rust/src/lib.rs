use base64::{engine::general_purpose, Engine as _};
use image::ImageOutputFormat;
use std::io::{Cursor, Write};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn set_panic_hook() {
    console_error_panic_hook::set_once();
}

const DEFAULT_SIZES: [u32; 6] = [16, 32, 48, 64, 128, 256];

#[wasm_bindgen]
pub fn imgico(input: &[u8], sizes: Option<Vec<u32>>) -> Result<Vec<u8>, JsValue> {
    let sizes = sizes.unwrap_or_else(|| DEFAULT_SIZES.to_vec());
    let img = image::load_from_memory(input)
        .map_err(|e| JsValue::from_str(&format!("Failed to load image: {}", e)))?;

    let mut images = Vec::new();

    for size in sizes {
        if size < 1 || size > 256 {
            return Err(JsValue::from_str(&format!(
                "Invalid icon size: {}. Size must be between 1 and 256.",
                size
            )));
        }

        let resized = img.resize(size, size, image::imageops::FilterType::Lanczos3);
        let mut buffer = Cursor::new(Vec::new());
        resized
            .write_to(&mut buffer, ImageOutputFormat::Png)
            .map_err(|e| JsValue::from_str(&format!("Failed to write PNG: {}", e)))?;

        images.push((buffer.into_inner(), size));
    }

    // Create ICO header
    let mut ico_data = Vec::new();

    // Header
    ico_data.write_all(&0u16.to_le_bytes()).unwrap(); // Reserved
    ico_data.write_all(&1u16.to_le_bytes()).unwrap(); // Type (1 = ICO)
    ico_data
        .write_all(&(images.len() as u16).to_le_bytes())
        .unwrap(); // Count

    let directory_size = 16 * images.len();
    let mut offset = 6 + directory_size;

    // Directory Entries
    for (buffer, size) in &images {
        let dim = if *size >= 256 { 0 } else { *size as u8 };
        ico_data.write_all(&[dim]).unwrap(); // Width
        ico_data.write_all(&[dim]).unwrap(); // Height
        ico_data.write_all(&[0]).unwrap(); // Palette count
        ico_data.write_all(&[0]).unwrap(); // Reserved
        ico_data.write_all(&1u16.to_le_bytes()).unwrap(); // Color planes
        ico_data.write_all(&32u16.to_le_bytes()).unwrap(); // Bits per pixel
        ico_data
            .write_all(&(buffer.len() as u32).to_le_bytes())
            .unwrap(); // Size
        ico_data.write_all(&(offset as u32).to_le_bytes()).unwrap(); // Offset

        offset += buffer.len();
    }

    // Image Data
    for (buffer, _) in images {
        ico_data.write_all(&buffer).unwrap();
    }

    Ok(ico_data)
}

#[wasm_bindgen]
pub fn imgsvg(input: &[u8], size: Option<u32>) -> Result<Vec<u8>, JsValue> {
    let img = image::load_from_memory(input)
        .map_err(|e| JsValue::from_str(&format!("Failed to load image: {}", e)))?;

    let final_img = if let Some(s) = size {
        img.resize(s, s, image::imageops::FilterType::Lanczos3)
    } else {
        img
    };

    let mut buffer = Cursor::new(Vec::new());
    final_img
        .write_to(&mut buffer, ImageOutputFormat::Png)
        .map_err(|e| JsValue::from_str(&format!("Failed to write PNG: {}", e)))?;

    let png_data = buffer.into_inner();
    let width = final_img.width();
    let height = final_img.height();

    let b64 = general_purpose::STANDARD.encode(&png_data);

    let svg = format!(
        r#"<svg width="{}" height="{}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <image width="{}" height="{}" xlink:href="data:image/png;base64,{}" />
</svg>"#,
        width, height, width, height, b64
    );

    Ok(svg.into_bytes())
}
