# CertForge — Bulk Certificate Generator 🚀

**CertForge** is a fast, 100% client-side React application designed for generating hundreds of personalized PDF certificates in seconds. Designed with performance and privacy in mind, you can upload a stunning template, import CSV data, arrange your placeholders with our Canva-like magnetic design editor, and securely export a `.zip` file containing all your PDFs—without any data leaving the browser.

## ✨ Features
- **Magnetic Grid Editor:** Move text and image elements with intuitive Canva-like pixel-perfect centering and snap-to-edge guidelines.
- **Dynamic Data Mapping:** Upload any CSV file and map column headers to `{{Placeholder}}` fields seamlessly.
- **Embedded Logos & Signatures:** Drop secondary images (e.g., logos or signatures) into your generated certificates with automatic `.png` transparency support.
- **100% Client-Side Private Generation:** Powered by `pdf-lib` and custom chunked processing hooks to keep your browser fast while generating thousands of documents.
- **Live PDF Previews:** Instantly render a one-row mockup of your final PDF inside an elegant glassmorphism viewing modal without having to mass-generate first.

## 🛠️ Tech Stack
- **Framework:** React + Vite
- **Styling:** Tailwind CSS (v4)
- **Icons:** Lucide React
- **Canvas Engine:** `react-konva`
- **Data Processing:** `papaparse` (CSV Engine)
- **PDF Generation:** `pdf-lib` (Native PDF DOM engine)
- **Download Compression:** `jszip` & `file-saver`

## 🚀 Getting Started Locally

```bash
# Clone the repository
git clone https://github.com/VishwakarmaVaibhav/CertForge-Bulk-Certificate-Generator.git

# Navigate into the project directory
cd CertForge-Bulk-Certificate-Generator

# Install dependencies
npm install

# Run the development server
npm run dev
```

Visit `http://localhost:5173` in your browser to start designing.

