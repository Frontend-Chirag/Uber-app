import Tesseract from 'tesseract.js';

export class OCRService {
    async extractText(image: File): Promise<any> {
        try {
            // Convert File to bas64
            const base64Image = await this.fileTobase64(image)


            // Use Tesseract.js for OCR
            const result = await Tesseract.recognize(
                base64Image,
                'eng',
                {
                    logger: m => console.log(m)
                }
            );

            // Parse the extracted text into structured data
            return this.parseExtractedText(result.data.text);

        } catch (error) {

        }
    }

    private async fileTobase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    private parseExtractedText(text: string): any {
        // TODO: Implement parsing logic based on document type
        // This will extract structured data from the OCR text
        // You'll need different parsing logic for each document type
        return {};
    }


}