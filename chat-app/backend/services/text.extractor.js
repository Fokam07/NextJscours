import { extractText, getDocumentProxy } from "unpdf";

export const textExtractor = {
    async cleanText(rawText) {
        return rawText
            .replace(/\r/g, "")
            .replace(/[ ]{2,}/g, " ")
            .replace(/\n{2,}/g, "\n")
            .trim();
    },

    async extractFromPdf(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
            const { text } = await extractText(pdf, { mergePages: true });
            return this.cleanText(text);
        } catch (error) {
            console.error("Erreur extraction PDF :", error);
            throw new Error("Impossible de lire le CV.");
        }
    }
};