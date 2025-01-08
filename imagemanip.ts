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

// Function to sort pixels and create a glitch effect
async function pixelSort(imagePath: string, outputPath: string) {
  try {
    // Load the image
    const image = await loadImage(imagePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    // Draw the image onto the canvas
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    // Process the pixels row by row
    for (let y = 0; y < canvas.height; y++) {
      // Extract a single row of pixels
      const row: Pixel[] = []; // Explicitly define the type
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4; // Calculate index
        row.push({
          r: pixels[i],
          g: pixels[i + 1],
          b: pixels[i + 2],
          a: pixels[i + 3],
        });
      }

      // Sort the row of pixels by brightness to create a glitch effect
      row.sort((a, b) => {
        const brightnessA = 0.2126 * a.r + 0.7152 * a.g + 0.0722 * a.b;
        const brightnessB = 0.2126 * b.r + 0.7152 * b.g + 0.0722 * b.b;
        return brightnessA - brightnessB;
      });

      // Write the sorted pixels back to the image
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        pixels[i] = row[x].r;
        pixels[i + 1] = row[x].g;
        pixels[i + 2] = row[x].b;
        pixels[i + 3] = row[x].a;
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
const inputImagePath = "input_image.png"; // Path to your input image
const outputImagePath = "output_image.png"; // Path to save the glitchy image

pixelSort(inputImagePath, outputImagePath);
