// Import library yang diperlukan
import 'dotenv/config'; // Mengimpor dan mengkonfigurasi dotenv untuk memuat variabel lingkungan dari file .env
import express from 'express'; // Kerangka kerja web untuk Node.js
import multer from 'multer'; // Middleware untuk menangani data multipart/form-data, terutama untuk unggahan file
import fs from 'fs/promises'; // Modul File System dengan dukungan promise untuk operasi file asinkron
import { GoogleGenAI } from '@google/genai'; // SDK Google GenAI untuk berinteraksi dengan model Gemini

// Membuat instance aplikasi Express
const app = express(); 

// Membuat instance Multer untuk menangani unggahan file dalam memori
const upload = multer(); 

// Menginisialisasi klien Google GenAI dengan kunci API dari variabel lingkungan
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 

// Menentukan nama model Gemini yang akan digunakan
const GEMINI_MODEL = "gemini-2.0-flash"; 

// Middleware untuk mem-parsing body permintaan JSON yang masuk
app.use(express.json());

// Menentukan port server
const PORT = 3000; 
// Menjalankan server pada port yang ditentukan dan mencatat pesan saat server siap
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`)); 

/**
 * @description Endpoint untuk menghasilkan konten teks berdasarkan prompt teks.
 * Menerima permintaan POST dengan body JSON yang berisi 'prompt'.
 * @route POST /generate-text
 * @access Public
 */
app.post('/generate-text', async (req, res) => {
    const { prompt } = req.body;

    try {
        // variable response berisi content yang digenerate oleh gemini
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
        });

        res.status(200).json({ result: response.text })
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message });
    }
})


/**
 * @description Endpoint untuk menghasilkan konten teks berdasarkan gambar dan prompt teks.
 * Menerima permintaan POST dengan data multipart/form-data yang berisi file 'image' dan field 'prompt'.
 * @route POST /generate-from-image
 * @access Public
 */
app.post('/generate-from-image', upload.single('image'), async (req, res) => {
    const { prompt } = req.body;
    const base64Image = req.file.buffer.toString('base64');

    try {
        // variable response berisi content yang digenerate oleh gemini
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { text: prompt, type: 'text' },
                { inlineData: { data: base64Image, mimeType: req.file.mimetype } }
            ],
        });

        res.status(200).json({ result: response.text })
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message });
    }
})
/**
 * @description Endpoint untuk menghasilkan konten teks berdasarkan dokumen dan prompt teks.
 * Menerima permintaan POST dengan data multipart/form-data yang berisi file 'document' dan field 'prompt' (opsional).
 * @route POST /generate-from-document
 * @access Public
 */
app.post('/generate-from-document', upload.single('document'), async (req, res) => {
    const { prompt } = req.body;
    const base64Document = req.file.buffer.toString('base64');

    try {
        // variable response berisi content yang digenerate oleh gemini
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { text: prompt ?? "Tolong buat ringkasan dari dokumen berikut menggunakan bahasa inggris: ", type: 'text' },
                { inlineData: { data: base64Document, mimeType: req.file.mimetype } }
            ],
        });

        res.status(200).json({ result: response.text })
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message });
    }
})
/**
 * @description Endpoint untuk menghasilkan transkrip teks dari file audio.
 * Menerima permintaan POST dengan data multipart/form-data yang berisi file 'audio' dan field 'prompt' (opsional).
 * @route POST /generate-from-audio
 * @access Public
 */
app.post('/generate-from-audio', upload.single('audio'), async (req, res) => {
    const { prompt } = req.body;
    const base64Audio = req.file.buffer.toString('base64');

    try {
        // variable response berisi content yang digenerate oleh gemini
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { text: prompt ?? "Tolong buatkan transkrip dari rekaman berikut", type: 'text' },
                { inlineData: { data: base64Audio, mimeType: req.file.mimetype } }
            ],
        });

        res.status(200).json({ result: response.text })
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message });
    }
})