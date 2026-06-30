# ShieldPay 🛡️

**AI-Powered Financial Safety for Pakistani University Students**

ShieldPay is a production-grade safety engine designed for the **UBL National Innovation Hackathon 2026**. It protects students from the growing threat of social engineering scams, fraudulent P2P transfers, and financial misinformation.

![ShieldPay Banner](https://img.shields.io/badge/Status-Hackathon--Ready-emerald?style=for-the-badge&logo=github)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node%20%7C%20Groq%20%7C%20Tailwind-blue?style=for-the-badge)

## 🚀 Vision

To empower every student in Pakistan with an AI guardian that scans suspicious messages, validates bank transfers, and educates them on digital hygiene.

## ✨ Core Features

- **🕵️ Scam Content Analyzer**: Real-time message scanning (SMS, WhatsApp, Email) using **Llama 3.3 70B on Groq**. Identifies red flags, calculates confidence scores, and explains the fraud mechanism.
- **💸 P2P Transfer Validator**: Validates Pakistani IBANs (UBL, Meezan, HBL, etc.) and analyzes transaction notes for behavioral risk indicators like "Advance Fee" or "Urgency Fraud".
- **🎓 Learn & Earn (Education Hub)**: Interactive flip-cards and gamified quizzes on the top 5 scams in Pakistan (Benazir Income Support scams, Fake Prize alerts, etc.).
- **🤖 ShieldBot**: A friendly floating AI assistant to answer safety-related queries instantly.

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS v4 (CSS-first engine).
- **Backend**: Node.js 20, Express, Zod for schema validation.
- **AI**: Groq SDK (Llama 3.3 70B Versatile).
- **Security**: Rate limiting (Express-Rate-Limit), Input sanitization, Environment protection.

## 📦 Project Structure

```text
ShieldPay/
├── shieldpay/
│   ├── client/       # React Frontend (Vite)
│   ├── server/       # Node.js Backend API
│   └── TESTING_GUIDE.md
└── README.md
```

## 🛠️ Setup & Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ShieldPay
```

### 2. Configure Backend

```bash
cd shieldpay/server
npm install
# Create a .env file and add:
GROQ_API_KEY=your_key_here
PORT=3001
CLIENT_URL=http://localhost:5173
```

### 3. Configure Frontend

```bash
cd ../client
npm install
# Create a .env file and add:
VITE_API_URL=http://localhost:3001
```

### 4. Run the Application

Start the server:

```bash
# In shieldpay/server
npm run dev
```

Start the client:

```bash
# In shieldpay/client
npm run dev
```


© 2026 ShieldPay — Towards a Safer Digital Pakistan.
