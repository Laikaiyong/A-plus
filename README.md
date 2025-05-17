# **A+ – A Virtual Learning Platform Powered by Alibaba Cloud and AI**

**Alibaba Cloud Global AI Hackathon 2024 Submission**

---

## **Introduction**

**A+** is an AI-driven virtual learning platform designed to help students overcome common academic challenges through personalized study planning, intelligent time management, and visual progress tracking. Built on **Alibaba Cloud**, the platform leverages AI and scalable cloud infrastructure to deliver adaptive and engaging learning experiences tailored to each learner.

---

## **Problem**

- Lack of motivation – students face boring, generic study content
- Lack of effective, personalized learning strategies

---

## **Solution**

- AI-powered assistant creates personalized study plans
- AI-generated interactive content: video, text, audio based on user preferences and age groups
- Uses RAG and Alibaba AI to turn personal materials into tailored lessons
- Dynamic calendar adapts to individual schedule and pace
- Progress tracker to monitor learning milestones
- Q&A chatbot for instant doubt clearing

---

## **Business Value**

- Large EdTech market ($250B+) – [Statista: Global EdTech Market Size](https://www.statista.com/statistics/1134766/edtech-market-size-worldwide/)
- Freemium + subscription revenue model
- Scalable worldwide across languages and learner types

---

## **Impact**

- Makes personalized learning accessible beyond premium platforms
- Supports diverse learning styles and underserved communities
- Empowers millions to improve learning outcomes and stay motivated

---

## **Overview**

Many students struggle with:

- Unstructured and ineffective learning strategies
- Poor time management and difficulty prioritizing subjects
- Limited visibility into their progress, leading to low motivation

**A+** addresses these challenges by offering intelligent features powered by **AI** and **Alibaba Cloud services**, with a focus on seamless integration and user-centric design.

---

## **Core Features**

### **Interlinked Features Across Pages with OSS Integration**

#### **Global Theme**

- **Background**: White (#FFFFFF) across all pages
- **Primary Accent**: Orange (#FF6900) for interactive elements and highlights
- **Secondary Color**: Black (#181818) for text and UI frameworks
- **Alibaba Cloud Integration**:
  - **Object Storage Service (OSS)** for scalable file storage
  - **Vector embeddings** to support RAG (Retrieval-Augmented Generation) for personalized AI features

---

### **1. Dashboard**

**Primary Feature**

- Visual progress tracker with milestone indicators
- Orange circular progress wheels and black milestone markers

**Interconnected Features**

- Upcoming session preview (linked to **Study Plan**)
- Monthly calendar with color-coded study sessions (linked to **Study Plan**)
- Plan-specific progress bars (linked to **Studyplan Detail**)
- Preview of recent AI-generated materials (linked to **Studyplan Detail**)
- Shortcut to chatbot for topic queries (linked to **Chat**)
- "Create New Plan" call-to-action (linked to **Create Studyplan**)

---

### **2. Study Plan**

**Primary Feature**

- Dynamic calendar with drag-and-drop scheduling
- Orange time blocks on white background with black gridlines
- Icons for content types (video, text, audio)

**Interconnected Features**

- Progress metrics synchronized with **Dashboard**
- Preview cards linking to **Studyplan Detail**
- Chat button for plan-specific inquiries
- "Add New Plan" action (linked to **Create Studyplan**)

---

### **3. Studyplan Detail**

**Primary Feature**

- AI-generated content viewer supporting multiple formats
- Interactive media players with orange controls
- Section navigation with active highlights

**Interconnected Features**

- Real-time progress tracking (synced with **Dashboard**)
- Calendar widget for session navigation (linked to **Study Plan**)
- Content-type toggling (text, video, audio, image-supported)
- In-context Q&A panel (linked to **Chat**)
- "Edit Plan" functionality (linked to **Create Studyplan**)

---

### **4. Create Studyplan**

**Primary Feature**

- AI-powered, step-by-step study plan generator
- Wizard UI with orange progress indicators and AI suggestion chips

**Material Upload System**

- Drag-and-drop uploader with orange dashed border
- URL scraping with a “Scrape” button
- Processing indicators for OCR/web scraping
- Preview panel for extracted content

**Technical Workflow**

1. PDF upload or URL input
2. OCR processing for images/scanned documents
3. Web scraping for online resources
4. Content chunking and segmentation
5. Upload to **Alibaba Cloud OSS**
6. Embedding generation
7. Integration with vector-based RAG system

**Interconnected Features**

- Calendar scheduling (linked to **Study Plan**)
- Content type selector (affects **Studyplan Detail**)
- “Ask About This Material” chat integration
- Goal setting (feeds into **Dashboard** progress tracking)

---

### **5. Chat**

**Primary Feature**

- Intelligent Q&A chatbot with contextual awareness
- User inputs in orange bubbles, AI responses in white with black text

**Interconnected Features**

- Content previews from related study plans (linked to **Studyplan Detail**)
- Study calendar suggestions (linked to **Study Plan**)
- "Create Plan From This Chat" functionality (opens **Create Studyplan** with context)
- Milestone recommendations (update **Dashboard** progress)

---

### **Vector Search Implementation (RAG)**

All study materials uploaded or scraped are converted into vector embeddings, enabling intelligent and contextual functionality across the platform. These embeddings power:

- Personalized study plan generation
- AI-driven interactive content creation
- Context-aware chatbot responses
- Smart material suggestions
- Learning recommendations based on progress

## Setup Instructions

```bash
# In frontend and backend folders, run the following commands to start the application:
cp .env.example .env
# Replace the envs

sh ./scripts/run.sh
```
