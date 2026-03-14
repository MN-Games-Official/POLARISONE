# Polaris Pilot - Next.js/React Vercel Deployment AI Prompt

## Executive Summary

Build a professional, fully functional Next.js 14+ application with React, TypeScript, and Tailwind CSS that serves as the admin portal for the Polaris Pilot system. Deploy to Vercel with external MySQL database connectivity. Focus exclusively on internal admin tools: Application Center (builder), Rank Center (builder), API key management, and user account management. No consumer-facing website yet.

The application connects to an existing MySQL database (polarisone) and integrates with Roblox Cloud APIs for real-time group management and user promotion functionality.

---

## Part 1: Project Architecture & Tech Stack

### 1.1 Technology Stack (Required)
- **Framework**: Next.js 14+ with App Router
- **UI Library**: React 18+
- **Styling**: Tailwind CSS 3.4+
- **Language**: TypeScript (strict mode)
- **State Management**: React Context API + useReducer (no external libs needed initially)
- **Form Handling**: React Hook Form + Zod validation
- **HTTP Client**: Fetch API (native) + custom hooks
- **Date Formatting**: date-fns
- **Icons**: Lucide React
- **Deployment**: Vercel
- **Database**: MySQL (external, connection via environment variables)
- **ORM**: Prisma 5.0+ (for type-safe database operations)
- **Email**: Nodemailer (SMTP for password reset, email verification)
- **AI Integration**: Abacus AI (gemini-3-flash-preview model)
- **Authentication**: Next.js middleware + JWT (stored in httpOnly cookies)

### 1.2 Project Structure

```
polaris-next/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Redirect to /dashboard
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   └── verify-email/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── api-keys/
│   │   │   ├── page.tsx           # API Keys dashboard
│   │   │   ├── roblox/page.tsx    # Roblox API key upload
│   │   │   └── polaris/page.tsx   # Polaris API key generation
│   │   ├── application-center/
│   │   │   ├── page.tsx           # Application list
│   │   │   ├── [id]/page.tsx      # Edit application
│   │   │   └── new/page.tsx       # Create new application
│   │   ├── rank-center/
│   │   │   ├── page.tsx           # Rank center list
│   │   │   ├── [id]/page.tsx      # Edit rank center
│   │   │   └── new/page.tsx       # Create new rank center
│   │   └── settings/page.tsx
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── signup/route.ts
│       │   ├── logout/route.ts
│       │   ├── refresh-token/route.ts
│       │   └── verify-email/route.ts
│       ├── password/
│       │   ├── request-reset/route.ts
│       │   └── reset/route.ts
│       ├── applications/
│       │   ├── route.ts            # GET list, POST create
│       │   ├── [id]/route.ts       # GET, PUT, DELETE
│       │   ├── [id]/generate/route.ts  # AI generation
│       │   └── [id]/import/route.ts    # Import generated form
│       ├── rank-centers/
│       │   ├── route.ts
│       │   ├── [id]/route.ts
│       │   └── [id]/import/route.ts
│       ├── api-keys/
│       │   ├── roblox/route.ts
│       │   ├── roblox/validate/route.ts
│       │   ├── polaris/route.ts
│       │   └── polaris/regenerate/route.ts
│       ├── users/
│       │   ├── profile/route.ts
│       │   └── profile/update/route.ts
│       └── webhooks/
│           └── roblox/route.ts     # Roblox promotion webhooks
├── components/
│   ├── Navigation.tsx
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   ├── ForgotPasswordForm.tsx
│   │   ├── ResetPasswordForm.tsx
│   │   └── VerifyEmailForm.tsx
│   ├── applications/
│   │   ├── ApplicationBuilder.tsx
│   │   ├── QuestionEditor.tsx
│   │   ├── PreviewPanel.tsx
│   │   ├── ApplicationList.tsx
│   │   ├── PolarisWidget.tsx
│   │   └── AIFormGenerator.tsx
│   ├── rank-center/
│   │   ├── RankCenterBuilder.tsx
│   │   ├── RankList.tsx
│   │   ├── RanksEditor.tsx
│   │   └── RankPreview.tsx
│   ├── api-keys/
│   │   ├── RobloxKeyUpload.tsx
│   │   ├── PolarisKeyGenerator.tsx
│   │   └── ApiKeyDisplay.tsx
│   ├── dashboard/
│   │   ├── StatsCard.tsx
│   │   ├── ActivityFeed.tsx
│   │   └── QuickActions.tsx
│   ├── profile/
│   │   ├── ProfileForm.tsx
│   │   ├── PasswordChangeForm.tsx
│   │   └── ProfilePicture.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Textarea.tsx
│       ├── Select.tsx
│       ├── Modal.tsx
│       ├── Alert.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Loading.tsx
│       └── Toast.tsx
├── lib/
│   ├── api-client.ts              # Fetch wrapper
│   ├── auth.ts                    # Auth utilities
│   ├── validation.ts              # Zod schemas
│   ├── formatters.ts              # Date, number formatting
│   ├── storage.ts                 # localStorage/sessionStorage
│   ├── db.ts                      # Prisma client
│   └── constants.ts               # App constants
├── hooks/
│   ├── useAuth.ts
│   ├── useUser.ts
│   ├── useApplications.ts
│   ├── useRankCenters.ts
│   ├── useApiKeys.ts
│   ├── useFetch.ts
│   ├── useLocalStorage.ts
│   └── useForm.ts
├── middleware.ts                   # NextAuth/JWT verification
├── styles/
│   └── globals.css                # Global Tailwind styles
├── prisma/
│   └── schema.prisma              # Database schema
├── public/
│   ├── favicon.ico
│   └── logo.png
├── .env.local                     # Local env file (not committed)
├── .env.example                   # Example env file
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
├── package.json
├── pnpm-lock.yaml (or package-lock.json)
└── README.md
```

### 1.3 Database Schema (Prisma)

```prisma
// User authentication and profiles
model User {
  id                    Int       @id @default(autoincrement())
  email                 String    @unique
  username              String    @unique
  password_hash         String
  full_name             String?
  avatar_url            String?
  email_verified        Boolean   @default(false)
  email_verified_at     DateTime?
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt
  
  // Relations
  applications          Application[]
  rankCenters           RankCenter[]
  apiKeys               ApiKey[]
  passwordResets        PasswordReset[]
}

// API Keys for Roblox and Polaris
model ApiKey {
  id                    Int       @id @default(autoincrement())
  user_id               Int
  type                  String    // "roblox" | "polaris"
  encrypted_key         String
  key_prefix            String    // For display (e.g., "roblox_...")
  last_used             DateTime?
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt
  is_active             Boolean   @default(true)
  
  user                  User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  @@index([user_id])
}

// Applications (forms)
model Application {
  id                    String    @id @default(uuid())
  user_id               Int
  name                  String
  description           String?
  group_id              String    // Roblox group ID
  target_role           String    // "rank: 218" or "groups/x/roles/y"
  pass_score            Int       @default(70)
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt
  
  // Style
  primary_color         String    @default("#ff4b6e")
  secondary_color       String    @default("#1f2933")
  
  // Data serialization
  questions_json        String    // JSON string of questions
  style_json            String?   // JSON of style config
  
  user                  User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  submissions           ApplicationSubmission[]
  
  @@index([user_id])
  @@index([group_id])
}

// Rank Centers
model RankCenter {
  id                    String    @id @default(uuid())
  user_id               Int
  name                  String
  group_id              String    // Roblox group ID
  universe_id           String?   // Game universe ID
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt
  
  // Data serialization
  ranks_json            String    // JSON array of ranks
  
  user                  User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  
  @@index([user_id])
  @@index([group_id])
}

// Application Submissions
model ApplicationSubmission {
  id                    String    @id @default(uuid())
  application_id        String
  roblox_user_id        String    // Applicant's Roblox ID
  membership_id         String?   // Roblox group membership ID
  answers_json          String    // JSON of answers
  score                 Float
  max_score             Float
  passed                Boolean
  feedback              String?
  promotion_status      String?   // "pending" | "success" | "failed"
  submitted_at          DateTime  @default(now())
  
  application           Application @relation(fields: [application_id], references: [id], onDelete: Cascade)
  
  @@index([application_id])
  @@index([roblox_user_id])
}

// Password reset tokens
model PasswordReset {
  id                    String    @id @default(uuid())
  user_id               Int
  token                 String    @unique
  expires_at            DateTime
  used                  Boolean   @default(false)
  created_at            DateTime  @default(now())
  
  user                  User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  @@index([token])
}

// Email verification tokens
model EmailVerification {
  id                    String    @id @default(uuid())
  user_id               Int       @unique
  token                 String    @unique
  expires_at            DateTime
  used                  Boolean   @default(false)
  created_at            DateTime  @default(now())
}
```

### 1.4 Environment Variables (.env.local, .env.example)

```env
# Database
DATABASE_URL="mysql://user:password@localhost:5432/polarisone"

# Authentication
JWT_SECRET="your-super-secret-key-min-32-chars"
JWT_EXPIRES_IN="24h"
NEXTAUTH_URL="https://app.example.com"
NEXTAUTH_SECRET="your-nextauth-secret"

# External APIs
ROBLOX_API_BASE="https://apis.roblox.com"
ROBLOX_GROUP_API="https://groups.roblox.com"

# Email/SMTP (same credentials as current system)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="noreply@polarisone.com"
SMTP_PASS="smtp_password"
SMTP_FROM_EMAIL="noreply@polarisone.com"
SMTP_FROM_NAME="Polaris Pilot"

# AI Provider (Abacus AI)
ABACUS_AI_API_KEY="your-abacus-api-key"
ABACUS_AI_BASE_URL="https://routellm.abacus.ai/v1"
ABACUS_AI_MODEL="gemini-3-flash-preview"

# Encryption
ENCRYPTION_KEY="your-32-char-encryption-key"

# Frontend
NEXT_PUBLIC_APP_URL="https://app.example.com"
NEXT_PUBLIC_API_BASE="/api"
```

---

## Part 2: Core Features & Implementation Details

### 2.1 Authentication System

#### 2.1.1 Sign Up Flow
**Endpoint**: `POST /api/auth/signup`

**Request**:
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "SecurePassword123!",
  "full_name": "User Name"
}
```

**Validation** (Zod Schema):
- Email: valid format, unique in database
- Username: 3-20 chars, alphanumeric + underscore, unique
- Password: min 8 chars, 1 uppercase, 1 number, 1 special char
- Full name: optional, max 100 chars

**Process**:
1. Validate input using Zod
2. Check if email/username exists
3. Hash password with bcrypt (rounds: 12)
4. Create user record in database
5. Generate email verification token (6-hour expiry)
6. Send verification email via SMTP
7. Return success with message to check email

**Response** (201):
```json
{
  "success": true,
  "message": "Account created. Please verify your email.",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "username": "username"
  }
}
```

#### 2.1.2 Email Verification
**Endpoint**: `GET /api/auth/verify-email?token=<token>`

**Process**:
1. Find verification token in database
2. Check if expired
3. Mark email as verified in user record
4. Invalidate token
5. Redirect to login page

#### 2.1.3 Login Flow
**Endpoint**: `POST /api/auth/login`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Process**:
1. Find user by email
2. Verify password hash
3. Check if email is verified
4. Generate JWT token (expires in 24 hours)
5. Generate refresh token (expires in 30 days, stored in httpOnly cookie)
6. Return access token (can be in localStorage) + refresh token cookie
7. Set secure httpOnly cookie with refresh token

**Response** (200):
```json
{
  "success": true,
  "user": {
    "id": 123,
    "email": "user@example.com",
    "username": "username",
    "full_name": "User Name"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 2.1.4 Password Reset Flow
**Step 1 - Request Reset**:
**Endpoint**: `POST /api/password/request-reset`
```json
{
  "email": "user@example.com"
}
```

**Process**:
1. Find user by email
2. Generate reset token (valid for 1 hour)
3. Store token in PasswordReset table
4. Send reset email with link: `https://app.example.com/reset-password?token=<token>`
5. Return success message

**Step 2 - Reset Password**:
**Endpoint**: `POST /api/password/reset`
```json
{
  "token": "reset_token_here",
  "new_password": "NewPassword123!",
  "confirm_password": "NewPassword123!"
}
```

**Process**:
1. Validate token exists and not expired
2. Validate password strength
3. Hash new password
4. Update user password_hash
5. Mark token as used
6. Return success, redirect to login

### 2.2 Application Center (Builder)

#### 2.2.1 Application List Page: `/dashboard/application-center`

**Features**:
- Display all applications created by user
- Search/filter by name
- Sort by created/updated date
- Create new application button
- Edit/Delete actions for each app
- Quick stats: total apps, pass rate, total submissions

**Component**: `ApplicationList.tsx`

**Data Fetching**:
```typescript
const fetchApplications = async (userId: number) => {
  const response = await fetch('/api/applications', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.json();
};
```

**API Endpoint: `GET /api/applications`**
```json
{
  "success": true,
  "applications": [
    {
      "id": "uuid",
      "name": "Moderator Application",
      "description": "...",
      "group_id": "123456",
      "created_at": "2026-03-14T...",
      "updated_at": "2026-03-14T...",
      "submission_count": 5,
      "pass_count": 3
    }
  ]
}
```

#### 2.2.2 Application Builder: `/dashboard/application-center/[id]` or `/dashboard/application-center/new`

**Features**:
- Create new or edit existing applications
- Form metadata input (name, description, group_id, target_role, pass_score)
- Question editor with drag-and-drop reordering
- Three question types: multiple_choice, short_answer, true_false
- Color picker for primary/secondary colors
- Live preview panel
- Polaris AI widget for form generation

#### 2.2.3 Building Questions

**Question Schema** (TypeScript):
```typescript
interface Question {
  id: string;
  type: 'multiple_choice' | 'short_answer' | 'true_false';
  text: string;
  options?: string[]; // For multiple choice
  correct_answer?: number | string | boolean;
  max_score: number;
  grading_criteria?: string; // For short answer
}

interface Application {
  id?: string;
  name: string;
  description: string;
  group_id: string; // Roblox group ID
  target_role: string; // "rank: 218" or "groups/x/roles/y"
  pass_score: number; // 0-100
  style: {
    primary_color: string;
    secondary_color: string;
  };
  questions: Question[];
}
```

**QuestionEditor Component**:
- Modal form for adding/editing questions
- Type selector
- Text input for question
- For multiple_choice: dynamic option rows
- For short_answer: grading criteria textarea
- Validation: max 3 short-answer questions per application

#### 2.2.4 Save Application
**Endpoint**: `POST /api/applications` (create) or `PUT /api/applications/[id]` (update)

**Request**:
```json
{
  "name": "Leadership Assessment",
  "description": "Evaluate leadership potential",
  "group_id": "123456",
  "target_role": "rank: 218",
  "pass_score": 75,
  "style": {
    "primary_color": "#ff4b6e",
    "secondary_color": "#1f2933"
  },
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "text": "What is leadership?",
      "options": ["Vision", "Communication", "Integrity", "Teamwork"],
      "correct_answer": 2,
      "max_score": 10
    },
    {
      "id": "q2",
      "type": "short_answer",
      "text": "Describe your leadership experience",
      "max_score": 10,
      "grading_criteria": "Must mention team management"
    }
  ]
}
```

**Server Processing**:
1. Validate user is authenticated
2. Validate all fields using Zod
3. Check max 3 short-answer constraint
4. Serialize questions to JSON
5. Store/update in database
6. Return application object

#### 2.2.5 AI Form Generation (Polaris Widget)
**Component**: `AIFormGenerator.tsx`

**Endpoint**: `POST /api/applications/[id]/generate`

**Request**:
```json
{
  "name": "Application Name",
  "description": "Short description",
  "group_id": "123456",
  "rank": "218",
  "questions_count": 6,
  "vibe": "professional",
  "primary_color": "#ff4b6e",
  "secondary_color": "#1f2933",
  "instructions": "Optional custom instructions"
}
```

**Processing**:
1. Build AI prompt using the form parameters
2. Call Abacus AI API
3. Extract and validate JSON from response
4. Return form structure for preview/import

**Abacus AI Integration**:
```typescript
const generateForm = async (params: GenerationParams) => {
  const prompt = `
    You are an expert form designer for Roblox group applications.
    Create a ${params.questions_count}-question application form with the following specs:
    - Name: ${params.name}
    - Description: ${params.description}
    - Target Group: ${params.group_id}
    - Target Rank: ${params.rank}
    - Tone: ${params.vibe}
    
    Generate varied questions (multiple choice, short answer, true/false).
    For each question provide:
    - type: one of the three types
    - text: the question
    - options: array (if multiple choice)
    - correct_answer: the expected answer
    - max_score: 10
    
    Return ONLY valid JSON with key "form" containing the structure.
  `;

  const response = await fetch('https://routellm.abacus.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ABACUS_AI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gemini-3-flash-preview',
      messages: [{ role: 'user', content: prompt }],
      stream: false,
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  const data = await response.json();
  const text = data.choices[0].message.content;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch[0]);
};
```

**Import Options**:
- Replace: Overwrite all questions with generated ones
- Merge: Add generated questions to existing ones

---

### 2.3 Rank Center Builder

#### 2.3.1 Rank Center List: `/dashboard/rank-center`

**Features**:
- Display all rank centers
- Create new rank center
- Edit/delete existing
- Quick view of ranks per center

**API Endpoint: `GET /api/rank-centers`**
```json
{
  "success": true,
  "rank_centers": [
    {
      "id": "uuid",
      "name": "Premium Ranks",
      "group_id": "123456",
      "universe_id": "9876543",
      "rank_count": 5,
      "created_at": "2026-03-14T..."
    }
  ]
}
```

#### 2.3.2 Rank Center Builder: `/dashboard/rank-center/[id]` or `/dashboard/rank-center/new`

**Features**:
- Basic info: name, group_id, universe_id
- Dynamic list of ranks
- For each rank:
  - name
  - rank_id (Roblox rank number)
  - gamepass_id (for purchases)
  - price (Robux)
  - description
  - is_for_sale (toggle)
  - regional_pricing (toggle)

**Component**: `RankCenterBuilder.tsx`

**Rank Editor**:
```typescript
interface RankEntry {
  id: string; // Local ID for form
  rank_id: number; // Roblox rank (0-255)
  gamepass_id: number; // Gamepass ID (for purchase)
  name: string;
  description: string;
  price: number; // Robux
  is_for_sale: boolean;
  regional_pricing: boolean;
}

interface RankCenter {
  id?: string;
  name: string;
  group_id: string;
  universe_id?: string;
  ranks: RankEntry[];
}
```

**Save Rank Center**:
**Endpoint**: `POST /api/rank-centers` or `PUT /api/rank-centers/[id]`

```json
{
  "name": "Group Ranks",
  "group_id": "123456",
  "universe_id": "9876543",
  "ranks": [
    {
      "rank_id": 1,
      "gamepass_id": 987654,
      "name": "Member",
      "description": "Basic member",
      "price": 0,
      "is_for_sale": false,
      "regional_pricing": false
    },
    {
      "rank_id": 255,
      "gamepass_id": 987655,
      "name": "Owner",
      "description": "Group owner",
      "price": 0,
      "is_for_sale": false,
      "regional_pricing": false
    }
  ]
}
```

---

### 2.4 API Keys Management

#### 2.4.1 Roblox API Key Page: `/dashboard/api-keys/roblox`

**Component**: `RobloxKeyUpload.tsx`

**Features**:
- Upload/update Roblox API key (encrypted storage)
- Show key status (active/inactive)
- Validate key against Roblox API
- Last used timestamp
- Delete key button
- Generate new key button (external link to Roblox dev portal)

**Validation Endpoint**: `POST /api/api-keys/roblox/validate`

**Request**:
```json
{
  "api_key": "the_roblox_api_key_here"
}
```

**Process**:
1. Test key by calling Roblox API (e.g., GET /groups/{sample_group_id}/roles)
2. If successful, encrypt and save to database
3. Return success status
4. If failed, return error message

**Response**:
```json
{
  "success": true,
  "message": "API key validated and saved",
  "preview": "roblox_abc123...xyz"
}
```

**Save Endpoint**: `POST /api/api-keys/roblox`

**Request**:
```json
{
  "api_key": "the_key_here",
  "validate": true
}
```

#### 2.4.2 Polaris API Key Page: `/dashboard/api-keys/polaris`

**Component**: `PolarisKeyGenerator.tsx`

**Features**:
- Generate new API key for accessing Polaris services
- Copy key to clipboard
- Revoke existing keys
- Key permissions/scopes selector
- Usage statistics for each key

**Generate Key Endpoint**: `POST /api/api-keys/polaris`

**Request**:
```json
{
  "name": "My Integration",
  "scopes": ["applications:read", "applications:write", "submissions:read"],
  "expires_in": 2592000
}
```

**Process**:
1. Generate random 32-character key
2. Create hash for storage (never store plain text)
3. Save to ApiKey table with user_id, type='polaris'
4. Return full key once (only shown at creation time)

**Response** (201):
```json
{
  "success": true,
  "api_key": "polaris_k3j4h2k4j5h2k4j5h2k4j5h2k4j5h",
  "message": "Copy this key now. You won't be able to see it again.",
  "preview": "polaris_k3j4..."
}
```

**API Key Display Page**: `/dashboard/api-keys`

- List all active API keys (Roblox + Polaris)
- Show created_at, last_used, status (active/inactive)
- Delete/revoke buttons
- Regenerate buttons

---

### 2.5 User Profile & Settings

#### 2.5.1 Profile Page: `/dashboard/profile`

**Features**:
- Display user info (email, username, full_name)
- Edit profile form
- Profile picture upload
- Email change (requires verification)
- 2FA setup (optional future feature)

**Component**: `ProfileForm.tsx`

**Update Profile Endpoint**: `PUT /api/users/profile`

**Request**:
```json
{
  "full_name": "New Name",
  "avatar_url": "https://..."
}
```

#### 2.5.2 Change Password

**Component**: `PasswordChangeForm.tsx`

**Endpoint**: `POST /api/users/change-password`

**Request**:
```json
{
  "current_password": "CurrentPassword123!",
  "new_password": "NewPassword456!",
  "confirm_password": "NewPassword456!"
}
```

**Process**:
1. Verify current password
2. Validate new password strength
3. Hash new password
4. Update database
5. Invalidate all other sessions

---

## Part 3: Roblox API Integration

### 3.1 Roblox Cloud API Endpoints

**Base URL**: `https://apis.roblox.com`

#### 3.1.1 Get User Group Membership
**Endpoint**: `GET /cloud/v2/groups/{groupId}/memberships`

**Query Parameters**:
```
maxPageSize=1
filter=user=='users/{userId}'
```

**Headers**:
```
x-api-key: <ROBLOX_API_KEY>
```

**Response** (200):
```json
{
  "groupMemberships": [
    {
      "path": "groups/123456/memberships/987654",
      "user": "users/12345",
      "role": "groups/123456/roles/99513316",
      "joinedAt": "2026-01-15T10:30:00Z"
    }
  ]
}
```

**Usage**: Check if user is a member before promotion

#### 3.1.2 Update User Role (Promotion)
**Endpoint**: `PATCH /cloud/v2/groups/{groupId}/memberships/{membershipId}`

**Headers**:
```
x-api-key: <ROBLOX_API_KEY>
Content-Type: application/json
```

**Body**:
```json
{
  "role": "groups/{groupId}/roles/{roleId}"
}
```

**Response** (200):
```json
{
  "path": "groups/123456/memberships/987654",
  "user": "users/12345",
  "role": "groups/123456/roles/99513316"
}
```

**Error Cases**:
- 401: Invalid API key
- 403: API key lacks permissions
- 404: User not found in group
- 400: Invalid role path

**Implementation** (Node.js):
```typescript
const promoteUserInGroup = async (
  groupId: string,
  membershipId: string,
  roleId: string,
  apiKey: string
) => {
  const url = `https://apis.roblox.com/cloud/v2/groups/${groupId}/memberships/${membershipId}`;
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      role: `groups/${groupId}/roles/${roleId}`
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Promotion failed: ${error.message}`);
  }

  return response.json();
};
```

### 3.2 Roblox Legacy API

#### 3.2.1 Get Group Roles
**Endpoint**: `GET /v1/groups/{groupId}/roles`

**Base URL**: `https://groups.roblox.com`

**Headers**: None required (public endpoint)

**Response** (200):
```json
{
  "roles": [
    {
      "id": 99513316,
      "name": "Group Moderator",
      "rank": 218,
      "memberCount": 5
    },
    {
      "id": 99513315,
      "name": "Member",
      "rank": 1,
      "memberCount": 1000
    }
  ]
}
```

**Usage**: Map rank numbers to role IDs

**Implementation**:
```typescript
const getRolesMap = async (groupId: string) => {
  const response = await fetch(
    `https://groups.roblox.com/v1/groups/${groupId}/roles`
  );
  
  const data = await response.json();
  const map: Record<number, number> = {};
  
  for (const role of data.roles) {
    map[role.rank] = role.id;
  }
  
  return map; // { 1: 99513315, 218: 99513316, ... }
};
```

### 3.3 API Integration in Next.js

**Location**: `app/api/` routes

#### 3.3.1 Promotion Service
**File**: `lib/roblox-service.ts`

```typescript
export class RobloxService {
  constructor(private apiKey: string) {}

  async getMembership(groupId: string, userId: string) {
    const filter = encodeURIComponent(`user=='users/${userId}'`);
    const url = `https://apis.roblox.com/cloud/v2/groups/${groupId}/memberships?maxPageSize=1&filter=${filter}`;
    
    const response = await fetch(url, {
      headers: { 'x-api-key': this.apiKey }
    });
    
    if (!response.ok) throw new Error('Failed to get membership');
    
    const data = await response.json();
    return data.groupMemberships[0] || null;
  }

  async getRolesMap(groupId: string) {
    const response = await fetch(
      `https://groups.roblox.com/v1/groups/${groupId}/roles`
    );
    
    if (!response.ok) throw new Error('Failed to get roles');
    
    const data = await response.json();
    const map: Record<number, number> = {};
    
    for (const role of data.roles) {
      map[role.rank] = role.id;
    }
    
    return map;
  }

  async promoteUser(
    groupId: string,
    membershipId: string,
    targetRank: number | string
  ) {
    const rolesMap = await this.getRolesMap(groupId);
    
    let roleId: number;
    if (typeof targetRank === 'number') {
      roleId = rolesMap[targetRank];
      if (!roleId) throw new Error(`Rank ${targetRank} not found`);
    } else {
      roleId = parseInt(targetRank);
    }
    
    const url = `https://apis.roblox.com/cloud/v2/groups/${groupId}/memberships/${membershipId}`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: `groups/${groupId}/roles/${roleId}`
      })
    });
    
    if (!response.ok) throw new Error('Promotion failed');
    return response.json();
  }
}
```

---

## Part 4: Form Submission & Grading System

### 4.1 Submission Endpoints

**Note**: These are consumed by embedded forms in Roblox games, not the admin dashboard itself.

#### 4.1.1 Submit Application
**Endpoint**: `POST /api/submissions/submit` (or internal endpoint)

**Request**:
```json
{
  "app_id": "application_uuid",
  "applicant_id": 12345,
  "membership_id": 98765,
  "answers": {
    "q1": 2,
    "q2": "The answer to the second question",
    "q3": true
  }
}
```

**Server Process**:
1. Load application by ID
2. Validate user has answer for each question
3. Grade each answer:
   - Multiple choice: exact match comparison
   - True/false: exact match
   - Short answer: AI batch grading (Abacus API)
4. Calculate total score
5. Determine pass/fail (compare against pass_score)
6. If pass: promote user via Roblox API
7. Store submission record
8. Return result

#### 4.1.2 Batch Grade Short Answers
**Internal Function** (called from submission endpoint)

**Abacus AI Integration**:
```typescript
const batchGradeShortAnswers = async (
  items: ShortAnswerItem[],
  apiKey: string
) => {
  const prompt = `
    You are an objective grader for Roblox group applications.
    Grade each short answer on a scale of 0-max_score.
    
    ${items.map((item, i) => `
      ITEM ${i} (id=${item.id})
      Max score: ${item.max_score}
      Question: ${item.question}
      Answer: ${item.answer}
      Criteria: ${item.criteria || 'No specific criteria'}
    `).join('\n')}
    
    Return ONLY valid JSON:
    { "results": [
      {"id": "q1", "score": 8.5, "feedback": "Good answer"},
      ...
    ]}
  `;

  const response = await fetch('https://routellm.abacus.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gemini-3-flash-preview',
      messages: [{ role: 'user', content: prompt }],
      stream: false,
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  const data = await response.json();
  const text = data.choices[0].message.content;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const parsed = JSON.parse(jsonMatch[0]);
  
  return parsed.results;
};
```

**Result Format**:
```typescript
{
  "id": "q1",
  "score": 8.5,
  "max_score": 10,
  "feedback": "Good understanding but missed one detail"
}
```

### 4.2 Grade & Promote Workflow

**Endpoint**: `POST /api/submissions/grade-and-promote`

**Full Request Flow**:
```json
REQUEST:
{
  "app_id": "application_uuid",
  "applicant_id": 12345,
  "membership_id": 98765,
  "answers": {
    "q1": 2,
    "q2": "My answer here",
    "q3": true
  }
}

RESPONSE (200):
{
  "success": true,
  "passed": true,
  "total_score": 85,
  "max_score": 100,
  "percentage": 85,
  "breakdown": {
    "q1": {
      "type": "multiple_choice",
      "score": 10,
      "max_score": 10,
      "feedback": "Correct"
    },
    "q2": {
      "type": "short_answer",
      "score": 7.5,
      "max_score": 10,
      "feedback": "Good answer but could be more detailed"
    },
    "q3": {
      "type": "true_false",
      "score": 10,
      "max_score": 10,
      "feedback": "Correct"
    }
  },
  "promotion": {
    "success": true,
    "group_id": "123456",
    "rank_id": 218,
    "message": "Promoted to Group Moderator"
  }
}
```

---

## Part 5: Dashboard Features & UI/UX

### 5.1 Dashboard Layout

**Path**: `/dashboard`

**Components**:
- Top Navigation with user menu, logout
- Left Sidebar with navigation
- Main content area
- Responsive design (mobile, tablet, desktop)

**Navigation Items**:
- Dashboard (overview)
- Application Center
- Rank Center
- API Keys
- Profile
- Settings (future)

### 5.2 Dashboard Overview Page

**Displays**:
- Total applications created
- Total submissions received
- Pass rate (percentage)
- Recent submissions (table)
- API key status (Roblox: active/inactive, Polaris: keys count)
- Quick action cards

### 5.3 Responsive Design

- Mobile: Stack everything vertically, hamburger menu
- Tablet: 2-column layout where applicable
- Desktop: Full 3-column layout (sidebar, content, secondary)

**Tailwind Breakpoints**:
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

---

## Part 6: Deployment & Infrastructure

### 6.1 Vercel Deployment Setup

**File**: `vercel.json`
```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "env": {
    "DATABASE_URL": {
      "description": "MySQL connection string"
    },
    "JWT_SECRET": {
      "description": "JWT signing secret"
    },
    "ABACUS_AI_API_KEY": {
      "description": "Abacus AI API key"
    },
    "SMTP_HOST": {
      "description": "SMTP server host"
    }
  },
  "regions": ["iad1"]
}
```

### 6.2 Environment Configuration for Vercel

In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.example`
3. Set values for production
4. Ensure DATABASE_URL uses production MySQL

### 6.3 Database Connection Best Practices

**Prisma Client Instance** (`lib/db.ts`):
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production')
  globalForPrisma.prisma = db;
```

**Usage in Routes**:
```typescript
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const apps = await db.application.findMany({
      where: { user_id: userId }
    });
    return Response.json({ apps });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
```

### 6.4 Environment-Based Configuration

**lib/config.ts**:
```typescript
export const config = {
  environment: process.env.NODE_ENV || 'development',
  apiUrl: process.env.NEXT_PUBLIC_API_BASE || '/api',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Roblox
  robloxApi: {
    cloudBase: 'https://apis.roblox.com',
    groupsBase: 'https://groups.roblox.com'
  },
  
  // AI
  abacusAi: {
    baseUrl: process.env.ABACUS_AI_BASE_URL,
    model: process.env.ABACUS_AI_MODEL || 'gemini-3-flash-preview'
  },
  
  // Email
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM_EMAIL
  }
};
```

---

## Part 7: Error Handling & Logging

### 7.1 Global Error Handler

**middleware.ts**:
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Verify JWT token
  const token = request.cookies.get('accessToken')?.value;
  
  if (!token && !isPublicRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login|signup).*)',
  ],
};
```

### 7.2 API Error Responses

Standardize all API responses:
```typescript
// Success
{ "success": true, "data": {...} }

// Error
{ 
  "success": false, 
  "error": "Human readable message",
  "code": "ERROR_CODE"
}
```

### 7.3 Logging

Use console.log with structured format in development, send to logging service in production:
```typescript
const logger = {
  info: (msg: string, data?: any) => console.log(`[INFO] ${msg}`, data),
  error: (msg: string, error?: any) => console.error(`[ERROR] ${msg}`, error),
  warn: (msg: string, data?: any) => console.warn(`[WARN] ${msg}`, data)
};
```

---

## Part 8: Security Best Practices

### 8.1 Input Validation

All endpoints must validate inputs using Zod:
```typescript
import { z } from 'zod';

const ApplicationSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  group_id: z.string().regex(/^\d+$/),
  pass_score: z.number().min(0).max(100),
  questions: z.array(QuestionSchema)
});

export async function POST(request: Request) {
  const body = await request.json();
  
  try {
    const validated = ApplicationSchema.parse(body);
    // Process...
  } catch (error) {
    return Response.json(
      { error: 'Invalid input' },
      { status: 400 }
    );
  }
}
```

### 8.2 Authentication

- JWT tokens in httpOnly cookies
- Refresh token rotation
- Token expiration validation
- Logout clears cookies

### 8.3 API Key Encryption

- Never store plaintext API keys
- Use AES-256 encryption
- Key: `process.env.ENCRYPTION_KEY`

```typescript
import crypto from 'crypto';

export function encryptKey(key: string): string {
  const cipher = crypto.createCipher(
    'aes-256-cbc',
    process.env.ENCRYPTION_KEY!
  );
  let encrypted = cipher.update(key, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function decryptKey(encrypted: string): string {
  const decipher = crypto.createDecipher(
    'aes-256-cbc',
    process.env.ENCRYPTION_KEY!
  );
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

### 8.4 CORS & Rate Limiting

**next.config.ts**:
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  headers: async () => {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

**Rate Limiting** (use `next-rate-limit` package or Vercel Edge Middleware):
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'),
});

export async function POST(request: Request) {
  const identifier = request.headers.get('x-forwarded-for') || 'anonymous';
  
  const { success } = await ratelimit.limit(identifier);
  
  if (!success) {
    return new Response('Too many requests', { status: 429 });
  }
  
  // Handle request...
}
```

---

## Part 9: Testing & Quality Assurance

### 9.1 Unit Tests

**Framework**: Jest + React Testing Library

**Example** (`components/__tests__/LoginForm.test.tsx`):
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from '../auth/LoginForm';

describe('LoginForm', () => {
  it('should submit form with valid credentials', async () => {
    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
  });
});
```

### 9.2 Integration Tests

Test API routes with actual database:
```typescript
describe('POST /api/auth/login', () => {
  it('should return JWT token for valid credentials', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123!'
      })
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.access_token).toBeDefined();
  });
});
```

### 9.3 E2E Tests

**Framework**: Playwright

```typescript
import { test, expect } from '@playwright/test';

test('user can create application', async ({ page }) => {
  await page.goto('/login');
  
  await page.fill('[aria-label="Email"]', 'test@example.com');
  await page.fill('[aria-label="Password"]', 'Password123!');
  await page.click('button:has-text("Sign In")');
  
  await page.goto('/dashboard/application-center');
  await page.click('button:has-text("New Application")');
  
  await page.fill('[aria-label="Application Name"]', 'Test App');
  await page.fill('[aria-label="Group ID"]', '123456');
  
  await page.click('button:has-text("Save")');
  
  expect(page.url()).toContain('/application-center');
});
```

---

## Part 10: Performance Optimization

### 10.1 Image Optimization

Use Next.js Image component:
```typescript
import Image from 'next/image';

export default function ProfilePicture({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt="Profile"
      width={200}
      height={200}
      priority
      className="rounded-full"
    />
  );
}
```

### 10.2 Code Splitting & Lazy Loading

```typescript
import dynamic from 'next/dynamic';

const AIFormGenerator = dynamic(
  () => import('@/components/applications/AIFormGenerator'),
  { loading: () => <p>Loading...</p> }
);

export default function ApplicationBuilder() {
  return (
    <div>
      <AIFormGenerator />
    </div>
  );
}
```

### 10.3 Database Query Optimization

- Use Prisma's `select` to fetch only needed fields
- Implement pagination for lists
- Use database indexes on frequently queried fields

```typescript
const apps = await db.application.findMany({
  where: { user_id: userId },
  select: {
    id: true,
    name: true,
    created_at: true,
    _count: { select: { submissions: true } }
  },
  take: 20,
  skip: (page - 1) * 20,
  orderBy: { created_at: 'desc' }
});
```

### 10.4 Caching Strategies

- ISR (Incremental Static Regeneration) for application list
- SWR for real-time data
- Redis for session/token caching (optional)

```typescript
export const revalidate = 60; // Revalidate every 60 seconds

export default async function ApplicationList() {
  const apps = await db.application.findMany();
  return <div>{/* render apps */}</div>;
}
```

---

## Part 11: Package Dependencies

**package.json**:
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "@hookform/resolvers": "^3.3.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "prisma": "^5.7.0",
    "@prisma/client": "^5.7.0",
    "jsonwebtoken": "^9.1.0",
    "bcryptjs": "^2.4.3",
    "nodemailer": "^6.9.0",
    "date-fns": "^2.30.0",
    "lucide-react": "^0.292.0",
    "clsx": "^2.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@testing-library/react": "^14.1.0",
    "jest": "^29.7.0",
    "@playwright/test": "^1.40.0"
  }
}
```

---

## Part 12: Development Workflow

### 12.1 Environment Setup

```bash
# Clone repo
git clone https://github.com/yourusername/polaris-next.git
cd polaris-next

# Install dependencies
pnpm install

# Copy env file
cp .env.example .env.local

# Update .env.local with your database URL and API keys

# Run database migrations
pnpm prisma migrate dev

# Start development server
pnpm dev
```

### 12.2 Development Commands

```bash
# Start development server
pnpm dev

# Generate Prisma client  
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# Launch Prisma Studio (DB GUI)
pnpm prisma studio

# Run tests
pnpm test

# Run E2E tests
pnpm playwright test

# Build production
pnpm build

# Start production server
pnpm start

# Type check
pnpm type-check

# Lint
pnpm lint
```

### 12.3 Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes, commit
git add .
git commit -m "feat: describe your changes"

# Push to remote
git push origin feature/your-feature

# Create Pull Request on GitHub
# Request review, merge after approval
```

---

## Part 13: Deployment Checklist

Before deploying to production:

- [ ] All environment variables set in Vercel
- [ ] Database migrations applied to production
- [ ] JWT_SECRET and ENCRYPTION_KEY set to strong random values
- [ ] SMTP credentials verified
- [ ] Roblox API key validated
- [ ] Abacus AI API key configured
- [ ] SSL certificate configured
- [ ] CORS headers set correctly
- [ ] Rate limiting enabled
- [ ] All tests passing
- [ ] Error logging configured
- [ ] Database backups scheduled
- [ ] Monitoring/alerts set up
- [ ] Security headers configured

---

## Part 14: Future Enhancements

### Phase 2 (After MVP)
- Consumer-facing landing page
- Public application embedding (iframe)
- Submission analytics/reporting
- Bulk user imports
- CSV export of submissions
- Email templates customization
- Two-factor authentication
- OAuth2 / Discord integration
- Webhooks for external systems
- API rate limiting per key
- Usage analytics per API key

### Phase 3
- Multi-language support
- Custom domain support
- White-label solutions
- Advanced RBAC
- Application templates
- Mobile app
- Real-time collaboration
- Audit logging
- Compliance reporting (GDPR, etc.)

---

## Part 15: Support & Documentation

### API Documentation

Generate with Swagger/OpenAPI:
```typescript
// Use @astrojs/openapi or similar
// Document all endpoints with request/response schemas
```

### User Documentation

Create guides for:
- Getting started
- Creating applications
- Managing rank centers
- API key setup
- Integrating with games
- Troubleshooting

### Code Comments

Comment complex logic:
```typescript
// Normalize target rank to role ID:
// - If "rank: 218", map via rolesMap to role ID
// - If "groups/x/roles/y", extract role ID
// - If already numeric role ID, use directly
```

---

## Conclusion

This comprehensive prompt provides all the guidance needed to build a production-ready Next.js application that serves as the Polaris Pilot admin dashboard. The application integrates with MySQL, Roblox APIs, and Abacus AI for intelligent form generation and grading.

Focus on:
1. Type safety (TypeScript strict mode)
2. User experience (responsive, fast, accessible)
3. Security (encryption, validation, rate limiting)
4. Reliability (error handling, logging, testing)
5. Scalability (database optimization, caching, infrastructure)

The deployment to Vercel ensures global edge function execution and automatic scaling.

### **YOU ARE REQUIRED TO MAKE THE APPLICATION TENS OF THOUSANDS OF LINES LONG. MAKE SURE THE CSS AND ANIMATIONS ARE AMAZING**
