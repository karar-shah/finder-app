# Text Finder App - System Design Documentation

## Table of Contents

1. [Chapter 4: System Design](#chapter-4-system-design)
   - [4.1. Architecture Diagram](#41-architecture-diagram)
   - [4.2. Domain Model](#42-domain-model)
     - [4.2.1. Entity Relationship Diagram (ERD)](#421-entity-relationship-diagram-erd)
   - [4.3. Class Diagram](#43-class-diagram)
   - [4.4. Sequence/Collaboration Diagram](#44-sequencecollaboration-diagram)
   - [4.5. REST API Endpoints](#45-rest-api-endpoints)
   - [4.6. Operation Contracts](#46-operation-contracts)
   - [4.7. Activity Diagram](#47-activity-diagram)
   - [4.8. State Transition Diagrams](#48-state-transition-diagrams)
   - [4.9. Component Diagram](#49-component-diagram)
   - [4.10. Deployment Diagram](#410-deployment-diagram)
   - [4.11. User Interface Design](#411-user-interface-design)

---

## Chapter 4: System Design

### 4.1. Architecture Diagram

#### Purpose

Illustrate the high-level architecture and component relationships of the Text Finder App system.

#### Components to Include

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Desktop UI    │  │   Web Browser   │  │  Mobile UI  │  │
│  │   (Electron)    │  │    Interface    │  │  (Future)   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │  Django REST    │  │   File Upload   │  │   Search    │  │
│  │   Framework     │  │   Management    │  │  Management │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │  Text Extraction│  │  Word Processing│  │  File Type  │  │
│  │    Orchestrator │  │    & Indexing   │  │  Detection  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │  Django ORM     │  │   File System   │  │  Database   │  │
│  │   Models        │  │   Operations    │  │  Queries    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │ Google Speech   │  │  Tesseract OCR  │  │   Various   │  │
│  │ Recognition API │  │     Engine      │  │ File Parsers│  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

#### Key Architectural Patterns

- **Layered Architecture**: Clear separation of concerns
- **MVC Pattern**: Django's Model-View-Controller implementation
- **REST API**: Standardized communication interface
- **Modular Architecture**: Frontend modules for separation of concerns

#### System Architecture Signal Flow Analysis

The Text Finder App follows a multi-layered architecture with distinct signal flow patterns between layers. Understanding the signal flow helps identify system bottlenecks, dependencies, and communication patterns.

##### Signal Flow Legend

```
→ Single Direction Signal (Unidirectional)
↔ Duplex Signal (Bidirectional)
⟲ Internal Processing Loop
◉ User Interaction Point
□ System Component
○ External Service
```

##### Detailed Signal Flow Diagram

```
                          ◉ User
                          │
                    [User Requests]
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 PRESENTATION LAYER                          │
│                                                             │
│  ┌─────────────────┐            ┌─────────────────────────┐ │
│  │   Desktop UI    │◄──────────►│      Web Interface      │ │
│  │   (Electron)    │  [Duplex]  │     (Browser)           │ │
│  │                 │            │                         │ │
│  │ • File Upload   │            │ • Search Interface      │ │
│  │ • Search Forms  │            │ • Results Display       │ │
│  │ • Status Display│            │ • File Management       │ │
│  └─────────────────┘            └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
          │                                          ▲
          │ [HTTP Requests]                          │ [HTTP Responses]
          │ (Single Direction Down)                  │ (Single Direction Up)
          ▼                                          │
┌─────────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                          │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  Django Views   │◄►│   Serializers   │◄►│ URL Routing │ │
│  │                 │  │                 │  │             │ │
│  │ • File Upload   │  │ • Data Format   │  │ • Request   │ │
│  │ • Search API    │  │ • Validation    │  │   Routing   │ │
│  │ • Delete API    │  │ • Response      │  │ • Auth      │ │
│  │                 │  │   Transform     │  │   Handling  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
          │                                          ▲
          │ [Business Logic Calls]                   │ [Processing Results]
          │ (Single Direction Down)                  │ (Single Direction Up)
          ▼                                          │
┌─────────────────────────────────────────────────────────────┐
│                 BUSINESS LOGIC LAYER                        │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Text Extraction │◄►│  File Processor │◄►│ Word Index  │ │
│  │ Orchestrator    │  │                 │  │ Manager     │ │
│  │                 │  │ • Type Detect   │  │             │ │
│  │ • Route Files   │  │ • Parse Content │  │ • Store     │ │
│  │ • Manage Queue  │  │ • Extract Text  │  │   Words     │ │
│  │ • Handle Errors │  │ • Clean Data    │  │ • Build     │ │
│  │                 │⟲ │                 │⟲ │   Index     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│                                ⟲                           │
│  [Internal Processing Loops - Duplex Signals]              │
└─────────────────────────────────────────────────────────────┘
          │                                          ▲
          │ [Data Operations]                        │ [Query Results]
          │ (Single Direction Down)                  │ (Single Direction Up)
          ▼                                          │
┌─────────────────────────────────────────────────────────────┐
│                   DATA ACCESS LAYER                         │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  Django ORM     │◄►│  File System    │◄►│  Database   │ │
│  │                 │  │                 │  │             │ │
│  │ • Model CRUD    │  │ • File Storage  │  │ • Tables    │ │
│  │ • Relationships │  │ • Media Mgmt    │  │ • Queries   │ │
│  │ • Transactions  │  │ • Path Handling │  │ • Indexes   │ │
│  │                 │  │                 │  │             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│                                                             │
│  [Internal Duplex Communication for Data Consistency]      │
└─────────────────────────────────────────────────────────────┘
          │                                          ▲
          │ [External Service Calls]                 │ [Service Responses]
          │ (Single Direction Down)                  │ (Single Direction Up)
          ▼                                          │
┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                          │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ ○ Google Speech │  │ ○ Tesseract OCR │  │ ○ Document  │ │
│  │   Recognition   │  │     Engine      │  │   Parsers   │ │
│  │                 │  │                 │  │             │ │
│  │ • Audio → Text  │  │ • Image → Text  │  │ • PDF Parse │ │
│  │ • API Calls     │  │ • Local Process │  │ • Word Parse│ │
│  │ • Rate Limits   │  │ • OS Dependent  │  │ • Excel     │ │
│  │                 │  │                 │  │   Parse     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│                                                             │
│  [External Services - Single Direction Request/Response]   │
└─────────────────────────────────────────────────────────────┘
```

##### Signal Flow Analysis

**1. User Interaction Layer (Top Level)**

- **Signal Type**: Duplex (↔)
- **Flow Pattern**: User initiates requests, receives responses
- **Components**: Desktop UI, Web Browser Interface
- **Characteristics**:
  - Bidirectional communication
  - Human-computer interaction point
  - Event-driven signal initiation

**2. Presentation to Application Layer**

- **Signal Type**: Single Direction (→ ↑)
- **Flow Pattern**: HTTP Requests down, HTTP Responses up
- **Characteristics**:
  - Unidirectional per transaction
  - Stateless communication
  - REST protocol compliance

**3. Application Layer (Middleware)**

- **Signal Type**: Internal Duplex (↔)
- **Flow Pattern**: Views ↔ Serializers ↔ URL Routing
- **Characteristics**:
  - Complex internal communication
  - Request processing and response formatting
  - Direct access (no authentication required)

**4. Application to Business Logic Layer**

- **Signal Type**: Single Direction (→ ↑)
- **Flow Pattern**: Business calls down, results up
- **Characteristics**:
  - Command-query separation
  - Business rule enforcement
  - Process orchestration

**5. Business Logic Layer (Core Processing)**

- **Signal Type**: Internal Duplex + Processing Loops (↔ ⟲)
- **Flow Pattern**: Complex internal orchestration
- **Characteristics**:
  - **Most Complex Signal Flow**
  - Multiple processing loops
  - File type routing decisions
  - Error handling and retry logic
  - Internal component coordination

**6. Business Logic to Data Access Layer**

- **Signal Type**: Single Direction (→ ↑)
- **Flow Pattern**: Data operations down, query results up
- **Characteristics**:
  - CRUD operations
  - Transaction management
  - Data consistency enforcement

**7. Data Access Layer (Persistence)**

- **Signal Type**: Internal Duplex (↔)
- **Flow Pattern**: ORM ↔ File System ↔ Database
- **Characteristics**:
  - Data persistence coordination
  - File and database synchronization
  - Atomic transaction support

**8. Data Access to External Services Layer**

- **Signal Type**: Single Direction (→ ↑)
- **Flow Pattern**: Service calls down, responses up
- **Characteristics**:
  - External API integration
  - Network dependency
  - Error handling for external failures

**9. External Services Layer (Bottom Level)**

- **Signal Type**: Single Direction per Service (→)
- **Flow Pattern**: Request-response pattern
- **Characteristics**:
  - **Simplest Signal Flow**
  - Independent service calls
  - No internal communication between services
  - External dependency management

##### Layer Complexity Analysis

**Highest Signal Complexity:**

1. **Business Logic Layer** - Multiple duplex signals and processing loops
2. **Application Layer** - HTTP processing and internal routing
3. **Data Access Layer** - Multi-source data coordination

**Lowest Signal Complexity:**

1. **External Services Layer** - Simple request-response
2. **Presentation Layer** - Standard user interaction patterns

##### Critical Signal Flow Points

**1. User Request Entry Point**

- **Location**: Presentation Layer
- **Type**: User-initiated duplex signal
- **Criticality**: System entry point - all processing originates here

**2. File Processing Decision Point**

- **Location**: Business Logic Layer
- **Type**: Internal routing with multiple duplex paths
- **Criticality**: Determines processing path for entire file workflow

**3. External Service Integration Points**

- **Location**: External Services Layer
- **Type**: Single direction with potential failure points
- **Criticality**: External dependencies that can affect system reliability

**4. Data Persistence Points**

- **Location**: Data Access Layer
- **Type**: Duplex signals ensuring data consistency
- **Criticality**: Data integrity and system state management

##### Performance Implications

**Single Direction Signals (→)**:

- **Advantages**: Simple, predictable, easier to debug
- **Performance**: Generally faster, no bidirectional overhead
- **Examples**: HTTP requests, database queries, API calls

**Duplex Signals (↔)**:

- **Advantages**: Rich interaction, real-time communication
- **Performance**: Higher overhead, more complex error handling
- **Examples**: UI interactions, internal component communication

**Processing Loops (⟲)**:

- **Advantages**: Complex business logic support
- **Performance**: Potential bottlenecks, requires careful optimization
- **Examples**: File type detection, text extraction processing

This signal flow analysis provides a foundation for system optimization, debugging, and scaling decisions by clearly identifying communication patterns and complexity levels throughout the architecture.

---

### 4.2. Domain Model

#### Purpose

Define the core business entities and their relationships within the Text Finder App domain.

#### Core Domain Entities

**Based on Actual Database Schema:**

```
┌─────────────────────────────────┐         ┌─────────────────────────────────┐
│        UploadedFiles            │◄────────┤         FileWords               │
│                                 │ 1     * │                                 │
│ + id: BigAutoField (PK)         │         │ + id: BigAutoField (PK)         │
│ + file: FileField               │         │ + word: CharField(max=200)      │
│ + original_filename: CharField  │         │ + file_id: ForeignKey           │
│   (max=255, null=True)          │         │   (CASCADE delete)              │
└─────────────────────────────────┘         └─────────────────────────────────┘
```

**Actual Model Attributes (from models.py):**

**UploadedFiles Model:**

- `id`: BigAutoField (auto-generated primary key)
- `file`: FileField(upload_to='media', null=True, blank=True)
- `original_filename`: CharField(max_length=255, null=True, blank=True)

**FileWords Model:**

- `id`: BigAutoField (auto-generated primary key)
- `word`: CharField(max_length=200)
- `file_id`: ForeignKey(UploadedFiles, on_delete=models.CASCADE)

#### Domain Rules

- One UploadedFiles can have many FileWords (1:\*)
- Each FileWord belongs to exactly one UploadedFiles
- CASCADE delete: When UploadedFiles is deleted, all associated FileWords are automatically deleted
- No explicit ProcessingJob or SearchResult entities - processing is handled in views
- Search operations return QuerySets, not stored entities

#### 4.2.1. Entity Relationship Diagram (ERD)

**Purpose:** Show the database schema using traditional ERD notation with primary keys, foreign keys, constraints, and cardinalities.

```
                    Text Finder App - Database Schema

┌─────────────────────────────────────────────────────────────────┐
│                       UploadedFiles                             │
├─────────────────────────────────────────────────────────────────┤
│ PK │ id                    │ BigAutoField  │ NOT NULL           │
│    │ file                  │ FileField     │ NULL, upload_to='media' │
│    │ original_filename     │ CharField(255)│ NULL               │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1
                                    │
                                    │ Relationship: One-to-Many
                                    │ ON DELETE CASCADE
                                    │
                                    │ *
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                        FileWords                                │
├─────────────────────────────────────────────────────────────────┤
│ PK │ id                    │ BigAutoField  │ NOT NULL           │
│    │ word                  │ CharField(200)│ NOT NULL           │
│ FK │ file_id               │ ForeignKey    │ NOT NULL → UploadedFiles.id │
└─────────────────────────────────────────────────────────────────┘
```

**ERD Notation Legend:**

- **PK**: Primary Key
- **FK**: Foreign Key
- **→**: References (Foreign Key relationship)
- **1**: One (Parent side)
- **\***: Many (Child side)

**Database Constraints:**

1. **Primary Keys:**

   - `UploadedFiles.id` (BigAutoField, auto-increment)
   - `FileWords.id` (BigAutoField, auto-increment)

2. **Foreign Key Constraints:**

   - `FileWords.file_id` REFERENCES `UploadedFiles.id`
   - ON DELETE CASCADE (deleting parent deletes all children)

3. **Field Constraints:**

   - `FileWords.word`: Maximum 200 characters, NOT NULL
   - `UploadedFiles.original_filename`: Maximum 255 characters, NULL allowed
   - `UploadedFiles.file`: FileField with upload path 'media', NULL allowed

4. **Cardinality Rules:**
   - One UploadedFiles record can have zero to many FileWords records
   - Each FileWords record belongs to exactly one UploadedFiles record
   - Minimum cardinality: 0 FileWords per UploadedFiles (empty files allowed)
   - Maximum cardinality: Unlimited FileWords per UploadedFiles

**Database Indexes (Django Auto-Generated):**

- Primary key indexes on `id` fields (auto-created by Django)
- Foreign key index on `FileWords.file_id` (auto-created by Django)

**Referential Integrity:**

- Enforced at database level via foreign key constraints
- CASCADE deletion ensures no orphaned FileWords records
- Django ORM handles referential integrity validation

---

### 4.3. Class Diagram

#### Purpose

Detail the system's class structure including attributes, methods, and relationships.

#### Core Classes

```python
# Models Layer (Actual Implementation)
┌─────────────────────────────────┐
│           UploadedFiles         │
├─────────────────────────────────┤
│ - id: BigAutoField (PK)         │
│ - file: FileField               │
│   (upload_to='media', null=True)│
│ - original_filename: CharField  │
│   (max=255, null=True)          │
├─────────────────────────────────┤
│ + save()                        │
│ + delete()                      │
│ + __str__()                     │
└─────────────────────────────────┘
                │
                │ 1:*
                ▼
┌─────────────────────────────────┐
│            FileWords            │
├─────────────────────────────────┤
│ - id: BigAutoField (PK)         │
│ - word: CharField(max=200)      │
│ - file_id: ForeignKey           │
│   (UploadedFiles, CASCADE)      │
├─────────────────────────────────┤
│ + save()                        │
│ + delete()                      │
│ + __str__()                     │
└─────────────────────────────────┘

# Serializers Layer (Actual Implementation)
┌─────────────────────────────────┐
│    UploadedFilesSerializers     │
├─────────────────────────────────┤
│ + fields: '__all__'             │
├─────────────────────────────────┤
│ + Meta: model=UploadedFiles     │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│     FileWordsSerializers        │
├─────────────────────────────────┤
│ + id: IntegerField              │
│ + word: CharField               │
│ + file: FileField (read_only)   │
│ + original_filename: CharField  │
│   (read_only)                   │
│ + file_id: IntegerField         │
│   (read_only)                   │
├─────────────────────────────────┤
│ + fields: ['id','word','file',  │
│   'original_filename','file_id']│
└─────────────────────────────────┘

# Views Layer (Actual Implementation)
┌─────────────────────────────────┐
│          file(request)          │
│      (Function-based View)      │
├─────────────────────────────────┤
│ + POST method handler           │
│ + Multi-file processing         │
│ + File type detection           │
│ + Text extraction routing       │
│ + Word storage                  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│    upload_directory(request)    │
│      (Function-based View)      │
├─────────────────────────────────┤
│ + POST method handler           │
│ + ZIP file processing           │
│ + Batch file extraction         │
│ + Temporary directory mgmt      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│         tableView               │
│       (APIView Class)           │
├─────────────────────────────────┤
│ + get(request, format=None)     │
│ + delete(request, id)           │
│ + Uses FileWordsSerializers     │
│ + Cascade delete logic          │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│    FileWordsSearchAPIView       │
│       (APIView Class)           │
├─────────────────────────────────┤
│ + post(request, format=None)    │
│ + exact/contains search logic   │
│ + Query validation              │
│ + Response formatting           │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│      FileDeleteAPIView          │
│       (APIView Class)           │
├─────────────────────────────────┤
│ + delete(request, file_id)      │
│ + Complete file deletion        │
│ + Physical file removal         │
└─────────────────────────────────┘

# Processing Layer (Actual Implementation - Inline in Views)
┌─────────────────────────────────┐
│     process_single_file()       │
│      (Helper Function)          │
├─────────────────────────────────┤
│ + File type detection           │
│ + Route to appropriate method   │
│ + Text extraction               │
│ + Word splitting & storage      │
│ + Error handling & cleanup      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  delete_file_completely()       │
│      (Helper Function)          │
├─────────────────────────────────┤
│ + FileWords deletion            │
│ + Physical file removal         │
│ + UploadedFiles record removal  │
│ + Success/error reporting       │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│   get_supported_extensions()    │
│      (Helper Function)          │
├─────────────────────────────────┤
│ + Returns: ['txt', 'docx',      │
│   'xlsx', 'pdf', 'wav', 'mp4',  │
│   'png', 'jpg', 'jpeg', 'csv']  │
└─────────────────────────────────┘

# File Processing Methods (Inline Implementation)
┌─────────────────────────────────┐
│       Document Processing       │
│     (Within file() function)    │
├─────────────────────────────────┤
│ + TXT: Direct text reading      │
│ + DOCX: python-docx parsing     │
│ + XLSX: openpyxl cell reading   │
│ + PDF: PyPDF2 text extraction   │
│ + CSV: CSV reader processing    │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│        Image Processing         │
│     (OCR within file())         │
├─────────────────────────────────┤
│ + Tesseract path configuration  │
│ + PIL image opening             │
│ + pytesseract text extraction   │
│ + OS-specific handling          │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│       Audio/Video Processing    │
│     (Within file() function)    │
├─────────────────────────────────┤
│ + WAV: Google Speech API        │
│ + MP4: MoviePy audio extraction │
│ + Temporary file management     │
│ + Speech recognition service    │
└─────────────────────────────────┘
```

---

### 4.4. Sequence/Collaboration Diagram

#### 4.4.1. File Upload Sequence

**Scenario: User uploads a single file**

```
User          Frontend       Django API     Inline Processing   Database    External API
 │                │              │               │            │             │
 │   Upload File  │              │               │            │             │
 ├───────────────►│              │               │            │             │
 │                │  POST /file/ │               │            │             │
 │                ├─────────────►│               │            │             │
 │                │              │ Validate File │            │             │
 │                │              ├──────────────►│            │             │
 │                │              │               │ Store File │             │
 │                │              │               ├───────────►│             │
 │                │              │               │            │ File Record │
 │                │              │               │◄───────────┤             │
 │                │              │               │            │             │
 │                │              │  Process Text │            │             │
 │                │              ├──────────────►│            │             │
 │                │              │               │ OCR/Speech │             │
 │                │              │               ├────────────────────────►│
 │                │              │               │            │ Text Result │
 │                │              │               │◄────────────────────────┤
 │                │              │               │            │             │
 │                │              │               │Store Words │             │
 │                │              │               ├───────────►│             │
 │                │              │               │            │Word Records │
 │                │              │               │◄───────────┤             │
 │                │              │  Success      │            │             │
 │                │              │◄──────────────┤            │             │
 │                │ 200 Response │               │            │             │
 │                │◄─────────────┤               │            │             │
 │  Confirmation  │              │               │            │             │
 │◄───────────────┤              │               │            │             │
```

#### 4.4.2. Search Operation Sequence

**Scenario: User searches for words**

```
User          Frontend       Django API     Database
 │                │              │            │
 │  Search "text" │              │            │
 ├───────────────►│              │            │
 │                │POST /api/search/│         │
 │                ├─────────────►│            │
 │                │              │Query Words │
 │                │              ├───────────►│
 │                │              │            │Results
 │                │              │◄───────────┤
 │                │              │ Format     │
 │                │              │ Response   │
 │                │ Search       │            │
 │                │ Results      │            │
 │                │◄─────────────┤            │
 │  Display       │              │            │
 │  Results       │              │            │
 │◄───────────────┤              │            │
```

---

### 4.5. REST API Endpoints

#### Purpose

Document all available HTTP endpoints for frontend integration and external API usage.

#### Endpoint Specifications

**Base URL**: `http://127.0.0.1:8000/`

##### File Upload Operations

**1. Individual File Upload**

- **Endpoint**: `POST /file/`
- **Purpose**: Upload single or multiple files for text extraction
- **Request**: Multipart form data with `file` field(s)
- **Response**: JSON with processing results
- **Processing**: Immediate text extraction and word storage
- **Supported Formats**: TXT, DOCX, PDF, PNG, JPG, WAV, MP4, XLSX, CSV

**2. Directory Upload (ZIP)**

- **Endpoint**: `POST /upload-directory/`
- **Purpose**: Batch upload directory contents as ZIP file
- **Request**: Multipart form data with `directory_zip` field
- **Response**: JSON with batch processing results
- **Processing**: ZIP extraction, individual file processing

##### Data Retrieval Operations

**3. Get File Words**

- **Endpoint**: `GET /filetbl/`
- **Purpose**: Retrieve all extracted words with file associations
- **Response**: JSON array of FileWords with serialized data
- **Format**: `[{id, word, file_id: {id, file, original_filename}}, ...]`

##### Search Operations

**4. API Search**

- **Endpoint**: `POST /api/search/`
- **Purpose**: Search for words with exact or substring matching
- **Request Body**: `{"wordsearch": "text", "search_type": "exact|contains"}`
- **Response**: JSON array of matching FileWords
- **Search Types**:
  - `exact`: Case-insensitive exact match
  - `contains`: Case-insensitive substring match

**5. Template Search (Legacy)**

- **Endpoint**: `POST /search/`
- **Purpose**: Search with HTML template response
- **Request**: Form data with `wordsearch` and `search_type` fields
- **Response**: HTML template `filetbl.html`

##### Deletion Operations

**6. Delete Individual Word**

- **Endpoint**: `DELETE /filetbl/<int:id>`
- **Purpose**: Delete specific FileWords entry
- **Parameter**: Word entry ID
- **Response**: JSON confirmation or error

**7. Delete Entire File**

- **Endpoint**: `DELETE /api/delete-file/<int:file_id>`
- **Purpose**: Delete entire file with all associated words and physical file
- **Parameter**: UploadedFiles ID
- **Response**: JSON with deletion status
- **Cascading**: Removes physical file, database record, and all FileWords

**8. Clear All Data**

- **Endpoint**: `DELETE /api/clear-all/`
- **Purpose**: Delete all uploaded files and database records
- **Response**: JSON with deletion summary
- **Effect**: Complete system reset

**9. Delete Single Word (Legacy)**

- **Endpoint**: `GET /delete/<int:id>`
- **Purpose**: Delete word with HTML template response
- **Parameter**: FileWords ID
- **Response**: HTML template `filetbl.html`

#### URL Patterns (from urls.py)

```python
urlpatterns = [
    path('file/', views.file),
    path('upload-directory/', views.upload_directory),
    path('filetbl/', views.tableView.as_view(), name='file_table'),
    path('filetbl/<int:id>', views.tableView.as_view(), name='delete_word'),
    path('search/', views.search),
    path('api/search/', views.FileWordsSearchAPIView.as_view(), name='api_search'),
    path('delete/<int:id>', views.delete),
    path('api/delete-file/<int:file_id>', views.FileDeleteAPIView.as_view(), name='delete_file'),
    path('api/clear-all/', views.clear_all_files, name='clear_all'),
]
```

#### API Usage Examples

**Upload File:**

```bash
curl -X POST http://127.0.0.1:8000/file/ -F "file=@document.pdf"
```

**Search Words:**

```bash
curl -X POST http://127.0.0.1:8000/api/search/ \
  -H "Content-Type: application/json" \
  -d '{"wordsearch": "example", "search_type": "contains"}'
```

**Delete File:**

```bash
curl -X DELETE http://127.0.0.1:8000/api/delete-file/1
```

---

### 4.6. Operation Contracts

#### Purpose

Define pre-conditions, post-conditions, and system state changes for key operations.

#### Contract 1: uploadFile

- **Operation**: uploadFile(file: File, filename: String)
- **Preconditions**:
  - File is valid and accessible
  - File type is supported (txt, docx, xlsx, pdf, wav, mp4, png, jpg, jpeg, csv)
  - System has available storage space
- **Postconditions**:
  - UploadedFiles instance created with file metadata
  - Physical file stored in media directory
  - File processing initiated automatically
  - FileWords records created (if processing succeeds)

#### Contract 2: processFile

- **Operation**: processFile(fileId: Integer)
- **Preconditions**:
  - File exists in system
  - Appropriate processing libraries available (PyPDF2, python-docx, openpyxl, pytesseract, SpeechRecognition)
  - External APIs accessible (for OCR/Speech processing)
- **Postconditions**:
  - Text extracted from file using appropriate method
  - Individual words identified and stored in FileWords table
  - Processing completion logged
  - Words associated with source file via foreign key

#### Contract 3: searchWords

- **Operation**: searchWords(query: String, searchType: String)
- **Preconditions**:
  - Query string is not empty
  - At least one FileWords record exists in database
  - Search type is valid ("exact" or "contains")
- **Postconditions**:
  - Matching FileWords retrieved with file associations
  - Results formatted with file context (id, word, file_id details)
  - Response serialized via FileWordsSerializers

#### Contract 4: deleteWord

- **Operation**: deleteWord(wordId: Integer)
- **Preconditions**:
  - Word record exists in FileWords table
- **Postconditions**:
  - FileWords record removed from database
  - Associated file record remains intact
  - No authentication required (open access system)

---

### 4.7. Activity Diagram

#### 4.7.1. File Processing Activity

```
[Start] → (Receive File Upload)
           │
           ▼
      [Validate File Type] ──No──► [Return Error]
           │ Yes                      │
           ▼                          │
      [Store File Physically]         │
           │                          │
           ▼                          │
      [Create Database Record]        │
           │                          │
           ▼                          │
      [Determine Processing Method]   │
           │                          │
           ├─TXT─► [Read Text Direct] │
           ├─DOC─► [Parse Document]   │
           ├─IMG─► [OCR Processing]   │
           ├─AUD─► [Speech Recognition]
           └─VID─► [Extract Audio] ──► [Speech Recognition]
           │                          │
           ▼                          │
      [Split into Words]              │
           │                          │
           ▼                          │
      [Store Word Records]            │
           │                          │
           ▼                          │
      [Update Statistics]             │
           │                          │
           ▼                          │
      [Return Success] ◄──────────────┘
           │
           ▼
        [End]
```

#### 4.7.2. Search Activity

```
[Start] → (Receive Search Request)
           │
           ▼
      [Validate Query] ──Empty──► [Return Error]
           │ Valid                    │
           ▼                         │
      [Determine Search Type]        │
           │                         │
           ├─Exact─► [Exact Match Query]
           └─Contains─► [Substring Query]
           │                         │
           ▼                         │
      [Execute Database Query]       │
           │                         │
           ▼                         │
      [Format Results]               │
           │                         │
           ▼                         │
      [Include File Context]         │
           │                         │
           ▼                         │
      [Return Search Results] ◄──────┘
           │
           ▼
        [End]
```

---

### 4.8. State Transition Diagrams

#### 4.8.1. File Processing State

```
[Uploaded] ──validate──► [Validating] ──success──► [Processing]
    │                        │                        │
    │                     failure                  success
    │                        ▼                        ▼
    │                    [Invalid] ◄──────────► [Completed]
    │                        │                        │
    │                     delete                   delete
    │                        ▼                        ▼
    └─────────────────► [Deleted] ◄─────────────────┘
```

#### 4.8.2. Search Session State

```
[Idle] ──search_request──► [Searching] ──results_found──► [Results_Display]
  ▲                            │                             │
  │                         timeout                      new_search
  │                            ▼                             ▼
  └────────────────────── [Search_Error] ◄─────────────────┘
                              │
                           retry
                              ▼
                         [Searching]
```

#### 4.8.3. File Upload Session State

```
[Ready] ──file_select──► [File_Selected] ──upload──► [Uploading]
  ▲                           │                         │
  │                        cancel                   success
  │                           ▼                         ▼
  └─────────────────────── [Ready]                [Processing]
                                                      │
                                                   complete
                                                      ▼
                                                 [Completed]
```

#### 4.8.4. System Data Management State

```
[Empty_System] ──first_upload──► [Has_Data] ──clear_all──► [Clearing]
      ▲                             │                         │
      │                          add_files                 complete
      │                             ▼                         ▼
      └─────────────────────── [Has_Data] ◄──────────── [Empty_System]
                                  │
                              delete_files
                                  ▼
                            [Partial_Data]
```

---

### 4.9. Component Diagram

#### Purpose

Show the organization and dependencies among software components.

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Components                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │File Upload  │  │   Search    │  │  Results Display    │  │
│  │ Component   │  │ Component   │  │    Component        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                               │ HTTP/REST
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Django REST API                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Views     │  │ Serializers │  │      URL Routing    │  │
│  │ Component   │  │ Component   │  │     Component       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                               │ Django ORM
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │Text Extract │  │File Type    │  │   Word Processing   │  │
│  │ Component   │  │ Detector    │  │     Component       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                               │
           ┌───────────────────┼───────────────────┐
           ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────────┐
│ Document    │    │     OCR     │    │      Audio      │
│ Processor   │    │  Processor  │    │   Processor     │
│ Component   │    │ Component   │    │   Component     │
└─────────────┘    └─────────────┘    └─────────────────┘
       │                   │                     │
       ▼                   ▼                     ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────────┐
│   PyPDF2    │    │ Tesseract   │    │ Google Speech   │
│  python-docx│    │    PIL      │    │ Recognition API │
│   openpyxl  │    │             │    │                 │
└─────────────┘    └─────────────┘    └─────────────────┘
```

---

### 4.10. Deployment Diagram

#### Purpose

Show the physical deployment of software components on hardware nodes.

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Environment                       │
│  ┌─────────────────┐              ┌─────────────────────┐   │
│  │  Desktop App    │              │   Web Browser       │   │
│  │   (Electron)    │              │   (Chrome/Firefox)  │   │
│  │                 │              │                     │   │
│  │ - Node.js       │              │ - JavaScript        │   │
│  │ - HTML/CSS/JS   │              │ - HTML/CSS          │   │
│  └─────────────────┘              └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                               │ HTTPS/HTTP
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Server                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Django Application                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │ │
│  │  │   Views     │  │   Models    │  │   Serializers   │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘ │ │
│  │                                                         │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │            Processing Engines                       │ │ │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │ │
│  │  │  │ Text Parser │  │ OCR Engine  │  │Audio Parser │ │ │ │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘ │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  Environment: Python 3.12, Django 5.x                       │
│  OS: Windows/macOS/Linux                                     │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Server                          │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                SQLite Database                          │ │
│  │  ┌─────────────┐              ┌─────────────────────┐  │ │
│  │  │ UploadedFiles│              │    FileWords       │  │ │
│  │  │    Table    │ 1        *   │      Table         │  │ │
│  │  │             │◄────────────►│                     │  │ │
│  │  └─────────────┘              └─────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    File Storage                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                Media Directory                          │ │
│  │                                                         │ │
│  │  /media/                                                │ │
│  │    └── media/                                           │ │
│  │        ├── sample_files/ (example files)               │ │
│  │        ├── sample_texts/ (text samples)                │ │
│  │        └── [user_uploaded_files]                       │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  External Services                          │
│  ┌─────────────────┐              ┌─────────────────────┐   │
│  │ Google Speech   │              │   Tesseract OCR     │   │
│  │ Recognition API │              │     Engine          │   │
│  │                 │              │                     │   │
│  │ - Cloud Service │              │ - Local Install     │   │
│  │ - Internet Req. │              │ - OS Dependent      │   │
│  └─────────────────┘              └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.11. User Interface Design

#### Purpose

Define the actual user interface components and interaction flow implemented in the system.

#### 4.11.1. Application Structure

**Two-Page Web Application:**

- Upload Page (`index.html`) - File upload and management
- Search Page (`words_table.html`) - Word search and results
- Splash Screen (`splash.html`) - Loading screen for Electron app
- Modern CSS Theming (`modern-theme.css`) - Bootstrap-based styling

#### 4.11.2. File Upload Interface (index.html)

**Actual Elements:**

- File input for single/multiple file selection
- Directory input for folder uploads (converted to ZIP)
- Uploaded files table with delete functionality
- Navigation to search page
- Status messages and loading indicators

**Implemented Layout:**

- Header with "Text Finder App" branding
- Card-based layout with file upload section
- Bootstrap-styled file input controls
- Uploaded files table with file names and delete buttons
- "Go to Search" navigation button

#### 4.11.3. Search Interface (words_table.html)

**Actual Elements:**

- Search input field
- Search type toggle (Exact/Contains)
- Results table showing words and source files
- Individual word deletion functionality
- "Clear All Files" bulk operation
- Navigation back to upload page

**Implemented Layout:**

- Header matching upload page design
- Search form with input and toggle controls
- Bootstrap table for displaying search results
- Action buttons for word deletion and bulk operations

#### 4.11.4. Electron Desktop Integration

**Implemented Components:**

- Splash screen with app logo and loading animation
- Main window creation and management (windowManager.js)
- IPC communication between processes (ipcHandlers.js)
- Seamless transition from splash to main application

#### 4.11.5. Styling and Theme

**Modern CSS Theme Features:**

- Bootstrap 5 framework integration
- Responsive design for various screen sizes
- Professional color scheme and typography
- Smooth animations and transitions
- Card-based layout with modern shadows and borders

**No Authentication Interface:**

- System operates with open access (no login required)
- All endpoints accessible without authentication
- No user management or permission controls implemented

---

## System Implementation Summary

### Implemented Technology Stack

- **Backend**: Django 5.0.6 + Django REST Framework (verified)
- **Database**: SQLite (db.sqlite3 configured in settings.py)
- **Frontend**: Electron.js + HTML/CSS/JavaScript (modular architecture)
- **External Services**: Google Speech API, Tesseract OCR
- **Processing Libraries**: PyPDF2, python-docx, openpyxl, SpeechRecognition, pytesseract, Pillow, moviepy

### Current System Status

All major components are implemented and functional:

- ✅ File upload endpoints with multiple format support
- ✅ Text extraction from various file types
- ✅ Database models (UploadedFiles, FileWords)
- ✅ Search API with exact/contains matching
- ✅ File deletion and bulk operations
- ✅ Electron desktop application with modular frontend
- ✅ Directory upload via ZIP processing

### System Characteristics

- **Processing**: Synchronous file processing (inline with upload)
- **Database**: Single SQLite file with two-table schema
- **Authentication**: None (open access system)
- **Storage**: Local media directory for uploaded files
- **Architecture**: Modular frontend with centralized API client

This system design documentation reflects the actual implemented Text Finder App architecture and capabilities.
