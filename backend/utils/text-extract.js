import mammoth from "mammoth";
import { PDFExtract } from "pdf.js-extract";
import fs from "fs";

const pdfExtract = new PDFExtract();

// Function to extract text from resume
export const extractTextFromResume = async (filePath, fileType) => {
    try {
      const dataBuffer = fs.readFileSync(filePath);
  
      if (fileType === "application/pdf") {
        return new Promise((resolve, reject) => {
          pdfExtract.extract(filePath, {}, (err, data) => {
            if (err) {
              console.error("PDF extraction error:", err);
              return reject(err);
            }
            const extractedText = data.pages
              .map((page) => page.content.map((item) => item.str).join(" "))
              .join("\n");
            resolve(extractedText);
          });
        });
      }
  
      if (
        fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const parsed = await mammoth.extractRawText({ buffer: dataBuffer });
        return parsed.value;
      }
  
      if (fileType === "text/plain") {
        return fs.readFileSync(filePath, "utf8");
      }
  
      throw new Error("Unsupported file type");
    } catch (error) {
      console.error("Error extracting text:", error);
      throw error;
    }
  };