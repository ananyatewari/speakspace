# 🚀 SpeakSpace Assisted Backend Workflow: Voice-to-Blog Automation

Transform voice notes into AI-generated blog posts — fully automated, production-ready workflow.

# 📌 Overview

This project is a custom workflow module built for the SpeakSpace app.
When a user selects their custom action inside the SpeakSpace app:

The user picks a voice note

SpeakSpace processes intent → builds the final prompt

SpeakSpace POSTs the workflow payload to the backend

The backend generates content using AI

Workflow logs are stored in MongoDB

(Optional) Blog post can be published to WordPress

# 🎯 Features

🔐 Secure API (x-api-key token authentication)

⚡ Instant response to SpeakSpace ({ "status": "success" })

🤖 AI-generated blog content using Groq Llama 3

🗂 Workflow execution logs saved in MongoDB

🌐 Optional WordPress publishing integration (can add custom user, password while running in local)

📡 Fully deployed backend on Render

🛠 Clean environment-variable-based configuration

## 🧠 Architecture Flow
SpeakSpace App → Sends {prompt, note_id, timestamp}  
      ↓  
This Backend (Render)  
      - Validates API key  
      - Stores workflow log  
      - Returns immediate success  
      - Runs AI generation in background  
      - Stores generated output in DB  
      - Publishes to WordPress  
      ↓  
MongoDB stores complete workflow history  

### 📩 Example Incoming Payload (From SpeakSpace)
{
  "prompt": "Publish Blog Post\n\n### Introduction\nHello, Hi",
  "note_id": "user_note_8482",
  "timestamp": "2025-12-10T18:04:32Z"
}

### 📤 Required API Response
{ "status": "success" }


SpeakSpace does not require large or detailed responses — minimal output is preferred.

### 🗄 MongoDB Workflow Log Example
{
  "_id": "693b1d47242762220be5d1c2",
  "note_id": "user_note_8482",
  "timestamp": "2025-12-10T18:04:32Z",
  "prompt": "Publish Blog Post\n\n### Introduction\nHello, Hi",
  "action": "speakspace_workflow",
  "status": "done",
  "result": {
    "generated": "### Published Blog Post ...",
    "wordpress": {
      "status": "success",
      "message": "WP publish was done" //halted if WP not configured (does not fail still)
    }
  }
}

## 🛠 Tech Stack
Component	Technology
Backend	Node.js + Express
AI Model	Groq Llama 3 (free tier)
Database	MongoDB Atlas
Deployment	Render

# 🚀 Getting Started (Local Setup)

## 1️⃣ Install dependencies
npm install

## 2️⃣ Create .env file

Use the template below.

🔐 Environment Variables

### Create a .env file using this structure:

SPEAKSPACE_SHARED_KEY=your_shared_key_here

MONGO_URI=your_mongo_uri_here

GROQ_API_KEY=your_groq_api_key_here

WP_BASE_URL=
WP_USER=
WP_APP_PASSWORD=

## 3️⃣ Start backend
npm run dev

## 🌍 Deployment (Render)

https://speakspace-amfe.onrender.com/api/process

Please use this URL when configuring SpeakSpace actions

## 🔧 SpeakSpace Custom Action Configuration for quick workflow testing 

Name: Publish Blog Post
Description: Converts a user voice note into a structured blog post using AI.
Prompt Template:
Take the user's voice note and convert it into a structured blog post with H2 headings.

$PROMPT

Notes Selector: Any note

API URL: https://your-server/api/process
Headers:
  Key: x-api-key
  Value: your_secret_here

## 📁 Project Structure (when building locally)
/server
  /routes
    process.js
  /models
    RequestLog.js
  /services
    groq.js
    wordpressAdapter.js
  server.js
  .env (need to create exclusively)
  README.md

## Expected result:

{"status":"success"}

## 🏁 Final Notes

This project demonstrates:

✔ Real workflow automation
✔ Real-time processing
✔ Proper SpeakSpace integration
✔ Clean code
✔ Scalable backend
✔ Database logging for audits