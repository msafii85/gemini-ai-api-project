// Mengimpor dan mengkonfigurasi dotenv untuk memuat variabel lingkungan dari file .env
import 'dotenv/config';
// Mengimpor framework Express.js untuk membangun server web
import express from 'express';
// Mengimpor multer untuk menangani unggahan file (multipart/form-data)
import multer from 'multer';
// Mengimpor modul 'fs/promises' untuk operasi sistem file berbasis promise
import fs from 'fs/promises';
// Mengimpor GoogleGenAI dari SDK Google GenAI
import { GoogleGenAI } from "@google/genai";

// Membuat instance aplikasi Express
const app = express();
// Membuat instance multer. Konfigurasi default akan menyimpan file di memori.
const upload = multer();
// Menginisialisasi klien Google GenAI dengan kunci API dari variabel lingkungan
const ai = new GoogleGenAI({ apikey: process.env.API_KEY });

// Menetapkan konstanta untuk nama model Gemini yang akan digunakan
const GEMINI_MODEL = "gemini-2.0-flash";

// Menambahkan middleware untuk mem-parsing body permintaan yang masuk sebagai JSON
app.use(express.json());

// Menentukan port untuk server, menggunakan variabel lingkungan PORT jika tersedia, atau default ke 3000
const PORT = 3000;

// Memulai server dan membuatnya mendengarkan koneksi pada port yang ditentukan
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));


/**
 * @description Endpoint untuk menghasilkan teks berdasarkan prompt yang diberikan.
 * @route POST /generate-text
 */
app.post('/generate-text', async(req, res) => {
    // Mengekstrak 'prompt' dari body permintaan
    const { prompt } = req.body;

    try {
        // Mendapatkan model generatif
        const model = ai.getGenerativeModel({ model: GEMINI_MODEL });
        // Menghasilkan konten berdasarkan prompt
        const result = await model.generateContent(prompt);
        // Mendapatkan respons teks dari hasil
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ result: response.text })
    } catch(e) {
        // Mencatat kesalahan ke konsol
        console.log(e);
        // Mengirimkan respons kesalahan server
        res.status(500).json({ message: e.message });
    }
})

/**
 * @description Endpoint untuk menghasilkan teks berdasarkan gambar dan prompt yang diberikan.
 * @route POST /generate-from-image
 */
app.post("/generate-from-image", upload.single("image"), async (req, res) => {
  // Mengekstrak 'prompt' dari body permintaan
  const { prompt } = req.body;
  // Mengonversi buffer gambar ke string base64
  const base64Image = req.file.buffer.toString("base64");
  try {
    // Mendapatkan model generatif
    const model = ai.getGenerativeModel({ model: GEMINI_MODEL });
    // Menyiapkan bagian gambar untuk permintaan
    const imagePart = { inlineData: { data: base64Image, mimeType: req.file.mimetype } };
    // Menghasilkan konten dari prompt teks dan gambar
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    // Mengirimkan teks yang dihasilkan sebagai respons JSON
    res.status(200).json({ result: text });
  } catch (e) {
    // Mencatat kesalahan ke konsol
    console.log(e);
    // Mengirimkan respons kesalahan server
    res.status(500).json({ message: e.message });
  }
});

/**
 * @description Endpoint untuk menghasilkan teks berdasarkan dokumen dan prompt yang diberikan.
 * @route POST /generate-from-document
 */
app.post("/generate-from-document", upload.single("document"), async (req, res) => {
  // Mengekstrak 'prompt' dari body permintaan
  const { prompt } = req.body;
  // Mengonversi buffer dokumen ke string base64
  const base64Document = req.file.buffer.toString("base64");

  try {
    // Mendapatkan model generatif
    const model = ai.getGenerativeModel({ model: GEMINI_MODEL });
    // Menyiapkan bagian dokumen untuk permintaan
    const documentPart = { inlineData: { data: base64Document, mimeType: req.file.mimetype } };
    // Menyiapkan prompt, menggunakan default jika tidak disediakan
    const textPrompt = prompt ?? "Tolong buat ringkasan dari dokumen berikut menggunakan bahasa inggris: ";
    // Menghasilkan konten dari prompt teks dan dokumen
    const result = await model.generateContent([textPrompt, documentPart]);
    const response = await result.response;
    const text = response.text();
    // Mengirimkan teks yang dihasilkan sebagai respons JSON
    res.status(200).json({ result: text });
  } catch (e) {
    // Mencatat kesalahan ke konsol
    console.log(e);
    // Mengirimkan respons kesalahan server
    res.status(500).json({ message: e.message });
  }
});

/**
 * @description Endpoint untuk menghasilkan teks berdasarkan file audio dan prompt yang diberikan.
 * @route POST /generate-from-audio
 */
app.post("/generate-from-audio", upload.single("audio"), async (req, res) => {
  // Mengekstrak 'prompt' dari body permintaan
  const { prompt } = req.body;
  // Mengonversi buffer audio ke string base64
  const base64Audio = req.file.buffer.toString("base64");
  // (Lanjutan dari kode di atas)
  // ... (Logika untuk menangani file audio akan ditambahkan di sini)
});