# LifeLink 🩸
LifeLink is a community-driven, real-time emergency blood donation web application designed to connect voluntary blood donors, blood banks, and patients in urgent need. Built with a responsive layout and an intuitive sidebar dashboard, LifeLink aims to streamline life-saving medical requests.
--
## 🚀 Features
* **Instant Emergency Requests:** Broadcast emergency blood requirements directly to local donors with instant status updates (`Pending`, `Fulfilled`, `Cancelled`).
* **Verified Donor Directory:** Search and filter registered donors by blood group and locality in real time.
* **Blood Bank Directory:** Find local authorized blood storage centers, complete with contact information and available stock indicators.
* **24/7 AI Assistant:** An interactive AI chatbot interface providing round-the-clock guidance on donor eligibility, blood request procedures, and bank searches.
* **Donor Portal & Profile Management:** User authentication system enabling donors to register, log in, toggle availability, or manage profiles securely using JWT.
---
## 🛠️ Tech Stack
* **Frontend:** HTML5, CSS3 (Responsive CSS Grid & Flexbox)
* **Backend:** Node.js, Express.js
* **Authentication:** JSON Web Tokens (JWT), LocalStorage
* **API Communication:** RESTful API with Fetch API
---
## 📁 Repository Structure
```text
.
├── index.html          # Main landing page with overview & stats
├── about.html          # Mission, vision, and project info
├── login.html          # Donor login portal
├── register.html       # Donor registration form
├── donors.html         # Donor directory & availability controls
├── bloodbanks.html     # Blood bank locator & availability tracker
├── eb.html             # Emergency blood request portal
├── contact.html        # Contact details & social links
├── reviews.html        # Community reviews & feedback
├── ai-bot.html         # 24/7 AI Chatbot interface
└── server.js           # Backend REST API server
```
---
## ⚡ Getting Started
### Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your machine.
### Installation
1. **Clone the repository:**
```bash
git clone https://github.com/your-username/lifelink.git
cd lifelink
```
2. **Install backend dependencies:**
```bash
npm install
```
3. **Start the backend server:**
```bash
node server.js
```
The server will run on `http://localhost:3000` by default.
4. **Launch the application:**
Open `index.html` in your web browser.
