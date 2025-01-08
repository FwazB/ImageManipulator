import { createCanvas, loadImage } from "canvas";
import * as fs from "fs";
import { Readable } from "node:stream";

// Define a type for the pixel
type Pixel = {
  r: number;
  g: number;
  b: number;
  a: number;
};

// Function to sort pixels and create a glitch effect in specified regions
async function pixelSort(
  imagePath: string,
  outputPath: string,
  regions: { x: number; y: number; width: number; height: number }[]
) {
  try {
    // Load the image
    const image = await loadImage(imagePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    // Draw the image onto the canvas
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    // Process each specified region
    for (const region of regions) {
      for (let y = region.y; y < region.y + region.height; y++) {
        const row: Pixel[] = [];
        for (let x = region.x; x < region.x + region.width; x++) {
          const i = (y * canvas.width + x) * 4;
          row.push({
            r: pixels[i],
            g: pixels[i + 1],
            b: pixels[i + 2],
            a: pixels[i + 3],
          });
        }

        // Sort the row of pixels by brightness
        row.sort((a, b) => {
          const brightnessA = 0.2126 * a.r + 0.7152 * a.g + 0.0722 * a.b;
          const brightnessB = 0.2126 * b.r + 0.7152 * b.g + 0.0722 * b.b;
          return brightnessA - brightnessB;
        });

        // Write the sorted pixels back to the image
        for (let x = region.x; x < region.x + region.width; x++) {
          const i = (y * canvas.width + x) * 4;
          const pixel = row[x - region.x];
          pixels[i] = pixel.r;
          pixels[i + 1] = pixel.g;
          pixels[i + 2] = pixel.b;
          pixels[i + 3] = pixel.a;
        }
      }
    }

    // Save the modified image
    ctx.putImageData(imageData, 0, 0);
    const out = fs.createWriteStream(outputPath);
    const stream = canvas.createPNGStream() as Readable;
    stream.pipe(out);
    out.on("finish", () => console.log("Glitchy image saved to:", outputPath));
  } catch (error) {
    console.error("Error processing the image:", error);
  }
}

// Usage
const inputImagePath = "/Users/fawazbutt/Desktop/Messingaround/PoW.jpeg";
const outputImagePath = "output_image.png";

// Define regions to apply the glitch effect
const regions = [
  { x: 0, y: 0, width: 100, height: 100 }, // Top-left corner
  { x: 200, y: 200, width: 150, height: 150 }, // Another region
];

pixelSort(inputImagePath, outputImagePath, regions);
