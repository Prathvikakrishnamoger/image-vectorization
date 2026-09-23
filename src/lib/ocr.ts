import { createWorker } from "tesseract.js";

export async function extractTextFromImage(
  image: string
): Promise<string> {
  const worker = await createWorker("eng");

  try {
    const result = await worker.recognize(image);

    return result.data.text.trim();
  } finally {
    await worker.terminate();
  }
}
