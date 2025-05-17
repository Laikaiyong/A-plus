# Interlinked Features Across Pages with OSS Integration

## Global Theme

- **Background**: White (#FFFFFF) across all pages
- **Primary Accent**: Orange (#FF6900) for interactive elements and highlights
- **Secondary Color**: Black (#181818) for text and UI frameworks
- **Alibaba Cloud Integration**: OSS for storage, vector embeddings for RAG

## 1. Dashboard

- **Primary Feature**: Progress tracker with milestone visualization

  - Orange progress wheels and black milestone markers
  - Quick-jump buttons to upcoming study sessions

- **Interconnected Features**:
  - Dynamic calendar widget showing next 3 sessions (links to Study Plan)
  - Calendar view with color-coded study sessions (links to Study Plan) for the month
    - Progress bar for each study plan (links to Studyplan Detail)
  - Recent AI-generated content previews (links to Studyplan Detail)
  - Quick access to chatbot for recent topics (links to Chat)
  - "Create New Plan" orange CTA button (links to Create Studyplan)

## 2. Study Plan

- **Primary Feature**: Dynamic calendar with drag-drop scheduling

  - Orange time blocks on white calendar with black grid lines
  - Visual indicators for content types (video/text/audio)

- **Interconnected Features**:
  - Progress metrics for each plan (syncs with Dashboard tracker)
  - Content preview cards (link to Studyplan Detail)
  - Plan-specific chat button (opens Chat with context)
  - "Add New Plan" orange button (links to Create Studyplan)

## 3. Studyplan Detail

- **Primary Feature**: AI-generated interactive content viewer

  - Media players with orange controls
  - Content navigation with orange active indicators

- **Interconnected Features**:
  - Plan-specific progress tracking (syncs to Dashboard)
  - Calendar widget showing related sessions (links to Study Plan)
  - Able to change content type (text/video/audio/text with images)
  - Content-specific Q&A section (integrated with Chat)
  - "Edit Plan" button to modify generated content (links to Create Studyplan)

## 4. Create Studyplan

- **Primary Feature**: AI-powered study plan generator

  - Step-by-step wizard with orange progress indicators
  - AI suggestion chips with orange highlighting

- **New Material Upload System**:

  - Upload interface with dashed orange border for drag-drop
  - URL input field with orange "Scrape" button
  - Processing indicators showing OCR/extraction progress
  - Preview panel showing extracted content
  - **Technical Flow**:
    1. PDF upload or URL input
    2. OCR processing for images/scanned documents
    3. Web scraping for URL inputs
    4. Content chunking and processing
    5. Upload to Alibaba Cloud OSS
    6. Vector embedding generation
    7. Integration with RAG system for AI features

- **Interconnected Features**:
  - Calendar integration to schedule new plan (links to Study Plan)
  - Content type selector (affects Studyplan Detail view)
  - "Ask About This Material" button (opens Chat with context)
  - Progress goal setting (feeds into Dashboard tracker)

## 5. Chat

- **Primary Feature**: Q&A chatbot with instant responses

  - User messages in orange bubbles, AI in white with black text
  - Context-aware responses based on study materials

- **Interconnected Features**:
  - Study material references with previews (links to Studyplan Detail)
  - Calendar suggestions for related topics (links to Study Plan)
  - "Create Plan From This Chat" button (transfers context to Create Studyplan)
  - Learning milestone suggestions (feeds into Dashboard tracker)

## Vector Search Implementation

- All uploaded/scraped content is processed into embeddings
- Vector search powers all generative AI features across pages:
  - Personalized study plan generation
  - Interactive content creation
  - Contextual chat responses
  - Related material suggestions
  - Progress-appropriate recommendations

Would you like me to elaborate on any specific part of this integration or the vector search implementation details?
