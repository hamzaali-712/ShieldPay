# ShieldPay MVP — Testing & Verification Guide

This document provides step-by-step instructions to test every feature of the ShieldPay application to ensure it meets the **UBL Hackathon 2026** requirements.

---

## 🛠️ Global Setup Check
Before testing, ensure both servers are active:
1. **Backend**: `cd shieldpay/server && npm run dev` (Port 3001)
2. **Frontend**: `cd shieldpay/client && npm run dev` (Port 5173)
3. **API Key**: Ensure `GROQ_API_KEY` is set in `shieldpay/server/.env`.

---

## 🔍 Feature 1: Scam Content Analyzer
**Goal**: Verify AI classification and red flag detection.

### Test Case 1.1: The "Try a Sample" Button
1. Go to the **Scan Content** tab.
2. Click the **"Try a Sample"** button.
3. Observe: The textarea should fill with a fake UBL suspension SMS.
4. Click **"Scan Content"**.
5. **Expected Result**: 
   - A `DANGEROUS` Result Card appears.
   - Confidence score > 80%.
   - Red Flags list items like "Malicious URL", "Urgent framing", and "Requesting PIN".

### Test Case 1.2: Normal Message (Manual)
1. Select the **WhatsApp** sub-tab.
2. Paste: `"Hey bro, I'm at the grocery store, can you send me 500 PKR via JazzCash for a minute? I'll pay back tonight."`
3. Click **"Scan Content"**.
4. **Expected Result**: 
   - Likely returns `SAFE` or `SUSPICIOUS` (depending on AI's risk profile).
   - Explanation suggests verifying with a phone call.

---

## 💸 Feature 2: P2P Transfer Validator
**Goal**: Verify IBAN formatting and behavioral risk analysis.

### Test Case 2.1: IBAN Formatting
1. Go to the **Validate Transfer** tab.
2. Type into the IBAN field: `PK36MEZN0123456789012345`.
3. Observe: 
   - The field should auto-format with spaces: `PK36 MEZN 0123 4567 8901 2345`.
   - A green badge should appear saying **"Meezan Bank"**.

### Test Case 2.2: High-Risk Transfer Note
1. Enter Recipient: `Mystery Buyer`.
2. Amount: `75,000`.
3. Note: `URGENT advance for crypto deal, transfer now or lose bonus`.
4. Click **"Validate Transfer"**.
5. **Expected Result**:
   - `HIGH RISK` level.
   - Risk score > 70.
   - Behavioral Flags: "High Urgency", "Crypto related", "Irreversible transfer".
   - Verdict: `DO NOT PROCEED`.

---

## 🎓 Feature 3: Education Hub ("Learn & Earn")
**Goal**: Verify interactive learning and scoring logic.

### Test Case 3.1: Flip Card Interaction
1. Go to the **Learn & Earn** tab.
2. Select **"Fake Prize SMS"** from the left sidebar.
3. Click the center card.
4. Observe: The card should perform a 3D flip to reveal "Investigation Results" on a red background.

### Test Case 3.2: Quiz Workflow
1. Click **"Start Module Quiz"**.
2. Answer the 3 questions.
3. Observe: 
   - The score and streak in the top right should update.
   - After 3rd question, a **"Module Complete!"** screen should appear.
   - A green checkmark should appear next to "Fake Prize SMS" in the sidebar.

---

## 📱 Mobile Responsiveness
1. Open Browser DevTools (F12).
2. Toggle Device Toolbar and select **iPhone SE (375px)**.
3. Verify:
   - Navbar logo and badge are visible.
   - Tabs are scrollable or fit the screen.
   - Result cards do not have horizontal overflow.

---

## 🚨 Troubleshooting
- **AI Error**: If the scan fails, check the server terminal. Most likely the `GROQ_API_KEY` is missing or invalid.
- **Connection Error**: Check `shieldpay/client/.env`. Ensure `VITE_API_URL` matches your server's port (default: `http://localhost:3001`).
