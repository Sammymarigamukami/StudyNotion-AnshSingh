# 📚 StudyNotion — Complete Interview Preparation Guide

> **What is StudyNotion?** A full-stack e-learning platform where **Instructors** create & sell courses, **Students** browse, buy, and watch them, and **Admins** manage categories. Think of it as a simplified Udemy clone.

---

## Table of Contents

1. [Project Overview & Elevator Pitch](#1-project-overview--elevator-pitch)
2. [Tech Stack Deep Dive](#2-tech-stack-deep-dive)
3. [System Architecture](#3-system-architecture)
4. [Database Schema (Prisma + PostgreSQL)](#4-database-schema-prisma--postgresql)
5. [Backend — API Design & Controllers](#5-backend--api-design--controllers)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Payment Integration (Razorpay)](#7-payment-integration-razorpay)
8. [Media Management (Cloudinary)](#8-media-management-cloudinary)
9. [Email System (Nodemailer)](#9-email-system-nodemailer)
10. [Frontend Architecture](#10-frontend-architecture)
11. [State Management (Redux Toolkit)](#11-state-management-redux-toolkit)
12. [Routing & Route Protection](#12-routing--route-protection)
13. [Key Frontend Flows](#13-key-frontend-flows)
14. [Component Breakdown](#14-component-breakdown)
15. [Course Content Hierarchy](#15-course-content-hierarchy)
16. [Mongoose → Prisma Migration Details](#16-mongoose--prisma-migration-details)
17. [Environment Variables & Configuration](#17-environment-variables--configuration)
18. [Deployment & DevOps](#18-deployment--devops)
19. [Security Considerations](#19-security-considerations)
20. [Performance & Scalability](#20-performance--scalability)
21. [Potential Interview Questions (100+)](#21-potential-interview-questions)

---

## 1. Project Overview & Elevator Pitch

> **"StudyNotion is a MERN-stack (now migrated to PostgreSQL + Prisma) ed-tech platform supporting 3 user roles: Students, Instructors, and Admins. Students browse course catalogs, add courses to cart, pay via Razorpay, and track lecture progress. Instructors create multi-section courses with video content uploaded to Cloudinary. Admins manage course categories. The system uses JWT-based authentication, OTP email verification at signup, and a responsive React frontend with Redux Toolkit for state management."**

### Key Features
| Feature | Description |
|---|---|
| **Multi-role Auth** | Student, Instructor, Admin with OTP email verification |
| **Course CRUD** | Create, edit, delete courses with sections/subsections |
| **Video Hosting** | Cloudinary-based video/image upload |
| **Payments** | Razorpay payment gateway with signature verification |
| **Course Progress** | Per-user video completion tracking |
| **Ratings & Reviews** | Students rate courses; aggregate average rating |
| **Catalog & Categories** | Category-based course discovery with "most selling" |
| **Instructor Dashboard** | Revenue analytics, enrolled student counts |
| **Cart System** | localStorage-persisted cart with Redux |
| **Profile Management** | Avatar upload, profile editing, account deletion |
| **Password Reset** | Token-based email reset flow |

---

## 2. Tech Stack Deep Dive

### Frontend
| Technology | Version | Purpose | Study Topics |
|---|---|---|---|
| **React 18** | ^18.2.0 | UI Library | Hooks, component lifecycle, JSX, virtual DOM |
| **React Router v7** | ^7.6.0 | Client-side routing | `<Routes>`, `<Route>`, `useNavigate`, `useParams`, nested routes |
| **Redux Toolkit** | ^2.8.2 | State management | `createSlice`, `configureStore`, `useSelector`, `useDispatch`, thunks |
| **Axios** | ^1.9.0 | HTTP client | Interceptors, `withCredentials`, instance creation |
| **Tailwind CSS** | ^3.2.7 | Styling | Utility classes, custom config, responsive design |
| **react-hook-form** | ^7.56.4 | Form handling | `useForm`, `register`, `handleSubmit`, validation |
| **react-hot-toast** | ^2.5.2 | Notifications | Toast loading/success/error patterns |
| **Swiper** | ^11.2.8 | Carousel/slider | Course slider, review slider |
| **Chart.js + react-chartjs-2** | ^4.5.0 / ^5.3.0 | Instructor analytics charts | Pie/doughnut charts |
| **react-dropzone** | ^14.3.8 | File upload UI | Drag-and-drop file uploads |
| **react-otp-input** | ^3.1.1 | OTP input component | 6-digit OTP verification UI |
| **react-type-animation** | ^3.2.0 | Typing animation | Homepage hero section |
| **video-react** | ^0.16.0 | Video player | Course video playback |
| **react-markdown** | ^10.1.0 | Markdown rendering | Course descriptions |

### Backend
| Technology | Version | Purpose | Study Topics |
|---|---|---|---|
| **Node.js** | 18.x | Runtime | Event loop, CommonJS modules |
| **Express.js** | ^4.18.2 | Web framework | Middleware pattern, routing, req/res cycle |
| **Prisma ORM** | ^7.8.0 | Database ORM | Schema DSL, migrations, `findMany`, `create`, `update`, relations |
| **PostgreSQL** | via `pg` ^8.21.0 | Relational database | SQL, joins, UUIDs, native arrays |
| **@prisma/adapter-pg** | ^7.8.0 | Prisma driver adapter | Direct pg pool connection |
| **bcryptjs** | ^2.4.3 | Password hashing | Salt rounds, `hash()`, `compare()` |
| **jsonwebtoken** | ^9.0.0 | JWT tokens | `sign()`, `verify()`, payload claims, expiry |
| **Cloudinary** | ^1.36.4 | Media CDN | Upload API, `resource_type: "auto"` |
| **Razorpay** | ^2.8.6 | Payment gateway | Order creation, signature verification |
| **Nodemailer** | ^6.9.1 | Email sending | SMTP transporter, HTML templates |
| **express-fileupload** | ^1.4.0 | File upload middleware | `req.files`, `tempFilePath` |
| **otp-generator** | ^4.0.1 | OTP generation | 6-digit numeric OTPs |
| **cookie-parser** | ^1.4.6 | Cookie middleware | Parse cookies from `req.cookies` |
| **cors** | ^2.8.5 | CORS middleware | `origin`, `credentials` |
| **nodemon** | ^2.0.22 | Dev hot-reload | Auto-restart on file changes |
| **concurrently** | ^9.1.2 | Run frontend+backend | `npm run dev` runs both |

---

## 3. System Architecture

```mermaid
graph TB
    subgraph Frontend ["Frontend (React - Port 3000)"]
        A["Browser"] --> B["React Router v7"]
        B --> C["Redux Store"]
        C --> D["API Connector (Axios)"]
    end

    subgraph Backend ["Backend (Express - Port 4000)"]
        D -->|"HTTP + JWT"| E["Express Server"]
        E --> F["Middleware Layer"]
        F --> G["Route Handlers"]
        G --> H["Controllers"]
    end

    subgraph Database ["Database & Services"]
        H -->|"Prisma ORM"| I["PostgreSQL"]
        H -->|"Upload API"| J["Cloudinary CDN"]
        H -->|"Order API"| K["Razorpay"]
        H -->|"SMTP"| L["Nodemailer"]
    end
```

### Request Flow
```
Browser → React Component → Redux Thunk (dispatch) → apiConnector (Axios) 
    → Express Server → auth middleware (JWT verify) → role middleware (isStudent/isInstructor/isAdmin) 
    → Controller → Prisma query → PostgreSQL → Response → Redux state update → UI re-render
```

---

## 4. Database Schema (Prisma + PostgreSQL)

### Entity-Relationship Diagram
```mermaid
erDiagram
    User ||--o| Profile : "has one"
    User ||--o{ Course : "creates (Instructor)"
    User }o--o{ Course : "enrolls in (Student)"
    User ||--o{ CourseProgress : "tracks"
    User ||--o{ RatingAndReview : "writes"
    Course ||--o{ Section : "contains"
    Course ||--o{ RatingAndReview : "receives"
    Course ||--o{ CourseProgress : "tracked by"
    Course }o--|| Category : "belongs to"
    Section ||--o{ SubSection : "contains"
    SubSection }o--o{ CourseProgress : "completed in"
    OTP ||--|| OTP : "standalone"
```

### Models in Detail

#### User
| Field | Type | Details |
|---|---|---|
| `id` | UUID (String) | Primary key, auto-generated |
| `firstName`, `lastName` | String | Required |
| `email` | String | Unique |
| `password` | String | Bcrypt hashed (10 salt rounds) |
| `accountType` | Enum | `Admin`, `Student`, `Instructor` |
| `active` | Boolean | Default `true` |
| `approved` | Boolean | `false` for Instructors at signup |
| `image` | String | DiceBear avatar URL or Cloudinary URL |
| `token` | String? | Password reset token |
| `resetPasswordExpires` | DateTime? | Token expiry (1 hour) |

**Relations:**
- `profile` → 1:1 with `Profile` (cascade delete)
- `createdCourses` → 1:many with `Course` (as Instructor)
- `enrolledCourses` → many:many with `Course` (as Student, implicit join table)
- `courseProgress` → 1:many with `CourseProgress`
- `ratingsAndReviews` → 1:many with `RatingAndReview`

#### Profile
| Field | Type | Details |
|---|---|---|
| `id` | UUID | Primary key |
| `gender` | String? | Nullable |
| `dateOfBirth` | String? | Stored as string |
| `about` | String? | Bio text |
| `contactNumber` | String? | Phone number |
| `userId` | String | Unique FK → User |

#### Course
| Field | Type | Details |
|---|---|---|
| `id` | UUID | Primary key |
| `courseName` | String | Required |
| `courseDescription` | String? | Optional |
| `whatYouWillLearn` | String? | Learning objectives |
| `price` | Float? | Course price in INR |
| `thumbnail` | String? | Cloudinary image URL |
| `tag` | String[] | PostgreSQL native text array |
| `instructions` | String[] | PostgreSQL native text array |
| `status` | Enum | `Draft` or `Published` |
| `instructorId` | String | FK → User |
| `categoryId` | String? | FK → Category (onDelete: SetNull) |

#### Section → SubSection (Course Content Hierarchy)
```
Course
  └── Section (sectionName)
       └── SubSection (title, description, videoUrl, timeDuration)
```

#### CourseProgress
- Compound unique: `@@unique([courseId, userId])`
- `completedVideos` → many:many with `SubSection` (via `CompletedVideos` relation)

#### RatingAndReview
- Compound unique: `@@unique([userId, courseId])` — one review per user per course
- `rating` (Int), `review` (String)

#### OTP
- `email`, `otp`, `createdAt` (for 5-minute expiry check)
- Indexed on `email` for fast lookup

> [!IMPORTANT]
> **Key schema design patterns to know:**
> - **UUID primary keys** (`@default(uuid())`) instead of auto-increment
> - **Cascade deletes** on Profile, Section, SubSection, CourseProgress, RatingAndReview
> - **SetNull on Category** deletion (courses remain, category becomes null)
> - **Implicit many-to-many** for `enrolledStudents` (Prisma auto-creates junction table)
> - **Explicit many-to-many** for `completedVideos` via named relation `"CompletedVideos"`
> - **PostgreSQL native arrays** for `tag` and `instructions` (no separate table needed)

---

## 5. Backend — API Design & Controllers

### API Route Map

#### Auth Routes (`/api/v1/auth`)
| Method | Endpoint | Auth | Controller | Purpose |
|---|---|---|---|---|
| POST | `/login` | ❌ | `Auth.login` | Email/password login, returns JWT |
| POST | `/signup` | ❌ | `Auth.signup` | Register with OTP verification |
| POST | `/sendotp` | ❌ | `Auth.sendotp` | Send 6-digit OTP to email |
| POST | `/changepassword` | ✅ auth | `Auth.changePassword` | Change password (logged in) |
| POST | `/reset-password-token` | ❌ | `ResetPassword.resetPasswordToken` | Generate reset token, send email |
| POST | `/reset-password` | ❌ | `ResetPassword.resetPassword` | Reset with token |

#### Course Routes (`/api/v1/course`)
| Method | Endpoint | Auth | Controller | Purpose |
|---|---|---|---|---|
| POST | `/createCourse` | ✅ auth + isInstructor | `Course.createCourse` | Create new course |
| POST | `/editCourse` | ✅ auth + isInstructor | `Course.editCourse` | Update course details |
| DELETE | `/deleteCourse` | ✅ auth + isInstructor | `Course.deleteCourse` | Delete a course |
| GET | `/getAllCourses` | ❌ | `Course.getAllCourses` | List published courses |
| POST | `/getCourseDetails` | ❌ | `Course.getCourseDetails` | Public course details (no videoUrl) |
| POST | `/getFullCourseDetails` | ✅ auth | `Course.getFullCourseDetails` | Full details with progress |
| GET | `/getInstructorCourses` | ✅ auth + isInstructor | `Course.getInstructorCourses` | Instructor's own courses |
| POST | `/addSection` | ✅ auth + isInstructor | `section.createSection` | Add section to course |
| POST | `/updateSection` | ✅ auth + isInstructor | `section.updateSection` | Update section name |
| POST | `/deleteSection` | ✅ auth + isInstructor | `section.deleteSection` | Delete section |
| POST | `/addSubSection` | ✅ auth + isInstructor | `Subsection.createSubSection` | Add video lecture |
| POST | `/updateSubSection` | ✅ auth + isInstructor | `Subsection.updateSubSection` | Update lecture |
| POST | `/deleteSubSection` | ✅ auth + isInstructor | `Subsection.deleteSubSection` | Delete lecture |
| POST | `/createCategory` | ✅ auth + isAdmin | `Category.createCategory` | Admin creates category |
| GET | `/showAllCategories` | ❌ | `Category.showAllCategories` | List all categories |
| POST | `/getCategoryPageDetails` | ❌ | `Category.categoryPageDetails` | Catalog page data |
| POST | `/createRating` | ✅ auth + isStudent | `RatingAndReview.createRating` | Student rates course |
| GET | `/getAverageRating` | ❌ | `RatingAndReview.getAverageRating` | Get avg rating |
| GET | `/getReviews` | ❌ | `RatingAndReview.getAllRating` | All reviews |
| POST | `/updateCourseProgress` | ✅ auth + isStudent | `courseProgress.updateCourseProgress` | Mark lecture complete |

#### Profile Routes (`/api/v1/profile`)
| Method | Endpoint | Auth | Controller | Purpose |
|---|---|---|---|---|
| PUT | `/updateProfile` | ✅ auth | `Profile.updateProfile` | Update user + profile |
| DELETE | `/deleteProfile` | ✅ auth | `Profile.deleteAccount` | Delete account (cascade) |
| GET | `/getUserDetails` | ✅ auth | `Profile.getAllUserDetails` | Get current user details |
| GET | `/getEnrolledCourses` | ✅ auth | `Profile.getEnrolledCourses` | Student's enrolled courses |
| PUT | `/updateDisplayPicture` | ✅ auth | `Profile.updateDisplayPicture` | Upload avatar |
| GET | `/instructorDashboard` | ✅ auth + isInstructor | `Profile.instructorDashboard` | Revenue & stats |

#### Payment Routes (`/api/v1/payment`)
| Method | Endpoint | Auth | Controller |
|---|---|---|---|
| POST | `/capturePayment` | ✅ auth + isStudent | `Payments.capturePayment` |
| POST | `/verifyPayment` | ✅ auth + isStudent | `Payments.verifyPayment` |
| POST | `/sendPaymentSuccessEmail` | ✅ auth + isStudent | `Payments.sendPaymentSuccessEmail` |

#### Contact Routes (`/api/v1/reach`)
| Method | Endpoint | Auth | Controller |
|---|---|---|---|
| POST | `/contact` | ❌ | `ContactUs.contactUsController` |

### Controller Design Patterns
1. **Input Validation** — check required fields, return 400/403
2. **Authorization Check** — verify role/ownership
3. **Business Logic** — Prisma queries, Cloudinary uploads
4. **Format Response** — `formatCourseDetails()` helper maps Prisma → Mongoose-compatible shape
5. **Error Handling** — try/catch with 500 responses
6. **Mongoose Compatibility Layer** — `_id: entity.id`, `additionalDetails` ↔ `profile`, `courseContent` ↔ `sections`

---

## 6. Authentication & Authorization

### Signup Flow (OTP-Based)
```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as Backend
    participant DB as PostgreSQL
    participant EM as Email (SMTP)

    U->>FE: Fill signup form
    FE->>BE: POST /auth/sendotp {email}
    BE->>DB: Check user exists (findUnique)
    BE->>BE: Generate 6-digit OTP (unique check loop)
    BE->>EM: Send verification email with OTP
    BE->>DB: Store OTP record (email, otp, createdAt)
    BE->>FE: OTP sent success
    FE->>U: Redirect to /verify-email
    U->>FE: Enter OTP
    FE->>BE: POST /auth/signup {firstName, lastName, email, password, confirmPassword, otp, accountType}
    BE->>DB: Find most recent OTP for email
    BE->>BE: Verify OTP match + 5-minute expiry check
    BE->>BE: Hash password (bcrypt, 10 rounds)
    BE->>DB: Create User + Profile (nested create, single transaction)
    BE->>FE: User registered success
    FE->>U: Redirect to /login
```

### Login Flow
```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as Backend
    participant DB as PostgreSQL

    U->>FE: Enter email + password
    FE->>BE: POST /auth/login {email, password}
    BE->>DB: findUnique User by email (include profile)
    BE->>BE: bcrypt.compare(password, hashedPassword)
    BE->>BE: jwt.sign({email, id, accountType}, JWT_SECRET, {expiresIn: "24h"})
    BE->>FE: Set httpOnly cookie + return token + user object
    FE->>FE: dispatch(setToken(token))
    FE->>FE: dispatch(setUser(userObject))
    FE->>FE: localStorage.setItem("token", token)
    FE->>U: Redirect to /dashboard/my-profile
```

### JWT Token Structure
```json
{
  "email": "user@example.com",
  "id": "uuid-string",
  "accountType": "Student",
  "iat": 1718286236,
  "exp": 1718372636
}
```

### Middleware Chain
```
Request → auth (extract & verify JWT) → isStudent/isInstructor/isAdmin (check accountType) → Controller
```

**Token extraction order:**
1. `req.cookies.token`
2. `req.body.token`
3. `req.headers.authorization` (Bearer token)

### Password Reset Flow
1. User sends email → backend generates `crypto.randomBytes(20).toString("hex")` token
2. Token + 1-hour expiry saved to User record
3. Email sent with link: `/update-password/{token}`
4. User clicks link → enters new password → backend validates token + expiry → bcrypt hash + save

---

## 7. Payment Integration (Razorpay)

### Payment Flow
```mermaid
sequenceDiagram
    participant S as Student
    participant FE as Frontend
    participant BE as Backend
    participant RZ as Razorpay

    S->>FE: Click "Buy Now" on course(s)
    FE->>FE: Load Razorpay SDK script dynamically
    FE->>BE: POST /payment/capturePayment {courses: [courseId1, courseId2]}
    BE->>BE: Sum up course prices, check not already enrolled
    BE->>RZ: instance.orders.create({amount: totalX100, currency: "INR"})
    RZ->>BE: Order object (order_id, amount, currency)
    BE->>FE: Return order details
    FE->>RZ: Open Razorpay checkout modal with order_id
    S->>RZ: Complete payment
    RZ->>FE: Callback with razorpay_order_id, razorpay_payment_id, razorpay_signature
    FE->>BE: POST /payment/verifyPayment {razorpay_order_id, razorpay_payment_id, razorpay_signature, courses}
    BE->>BE: HMAC-SHA256 verify signature against RAZORPAY_SECRET
    BE->>BE: enrollStudents() — connect User to Course relations
    BE->>S: Send enrollment confirmation emails
    FE->>FE: dispatch(resetCart()), navigate to enrolled courses
```

### Key Implementation Details
- **Amount** is sent in **paise** (multiply by 100)
- **Signature verification**: `HMAC-SHA256(order_id + "|" + payment_id, RAZORPAY_SECRET)`
- Frontend **dynamically loads** Razorpay SDK via `loadScript()` function
- Supports **multi-course purchase** (cart checkout)

---

## 8. Media Management (Cloudinary)

### How it works
1. Frontend sends file via `FormData` with `express-fileupload` middleware
2. File is stored as temp file (`useTempFiles: true, tempFileDir: "/tmp"`)
3. `uploadImageToCloudinary(file, folder, height, quality)` uploads to Cloudinary
4. Cloudinary returns `{ secure_url, duration }` (duration for videos)
5. URL is stored in PostgreSQL

### Used For
| Entity | Field | Content |
|---|---|---|
| Course | `thumbnail` | Course thumbnail image |
| SubSection | `videoUrl` | Lecture video |
| User | `image` | Profile picture (via `updateDisplayPicture`) |

### Config
```javascript
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});
```

> [!NOTE]
> `resource_type: "auto"` allows both images and videos through the same upload function.

---

## 9. Email System (Nodemailer)

### Transport Config
```javascript
nodemailer.createTransport({
    host: process.env.MAIL_HOST,    // smtp.gmail.com
    port: 587,
    secure: false,
    auth: { user: MAIL_USER, pass: MAIL_PASS }
})
```

### Email Templates (HTML)
| Template | Trigger | Content |
|---|---|---|
| `emailVerificationTemplate.js` | Signup OTP | 6-digit OTP code |
| `courseEnrollmentEmail.js` | After payment | Course enrollment confirmation |
| `paymentSuccessEmail.js` | After payment | Payment receipt details |
| `passwordUpdate.js` | Password change | Password updated notification |
| `contactFormRes.js` | Contact form submit | Contact form acknowledgment |

---

## 10. Frontend Architecture

### Directory Structure
```
src/
├── App.js              # Main component with all routes
├── index.js            # React entry point, Redux store, BrowserRouter
├── App.css             # Global styles
├── index.css           # Tailwind directives
│
├── components/
│   ├── common/         # Shared components (Navbar, Footer, etc.)
│   ├── core/           # Feature-specific components
│   │   ├── Auth/       # LoginForm, SignupForm, OpenRoute, PrivateRoute
│   │   ├── Dashboard/  # MyProfile, Settings, AddCourse, Cart, etc.
│   │   ├── HomePage/   # Hero section, CodeBlocks, Timeline, ExploreMore
│   │   ├── Catalog/    # CourseSlider, Course_Card
│   │   ├── Course/     # CourseAccordionBar, CourseDetailsCard
│   │   ├── ViewCourse/ # VideoDetails, VideoDetailsSidebar, CourseReviewModal
│   │   ├── AboutPage/
│   │   └── ContactUsPage/
│   └── ContactPage/
│
├── pages/              # Route-level page components
│   ├── Home.jsx, About.jsx, Contact.jsx, Catalog.jsx
│   ├── Login.jsx, Signup.jsx, VerifyEmail.jsx
│   ├── ForgotPassword.jsx, UpdatePassword.jsx
│   ├── CourseDetails.jsx, Dashboard.jsx, ViewCourse.jsx
│   └── Error.jsx
│
├── slices/             # Redux Toolkit slices
│   ├── authSlice.js, profileSlice.js, cartSlice.js
│   ├── courseSlice.js, viewCourseSlice.js
│
├── reducer/index.js    # combineReducers
│
├── services/
│   ├── apiconnector.js # Axios instance (withCredentials: true)
│   ├── apis.js         # All API endpoint URLs
│   ├── formatDate.js
│   └── operations/     # Thunk-like async API functions
│       ├── authAPI.js, profileAPI.js, SettingsAPI.js
│       ├── courseDetailsAPI.js, studentFeaturesAPI.js
│       └── pageAndComponentData.js
│
├── hooks/              # Custom React hooks
│   ├── useOnClickOutside.js
│   └── useRouteMatch.js
│
├── utils/
│   ├── constants.js    # ACCOUNT_TYPE enum
│   ├── avgRating.js    # Calculate average rating
│   └── dateFormatter.js
│
├── data/               # Static data
│   ├── navbar-links.js, dashboard-links.js, footer-links.js
│   ├── homepage-explore.js, countrycode.json
│
└── assets/             # Images, logos
```

---

## 11. State Management (Redux Toolkit)

### Store Configuration
```javascript
// src/index.js
const store = configureStore({ reducer: rootReducer });

// src/reducer/index.js
const rootReducer = combineReducers({
    auth: authReducer,       // token, loading, signupData
    profile: profileReducer, // user object
    cart: cartReducer,       // cart array, total, totalItems
    course: courseReducer,   // course editing state, paymentLoading
    viewCourse: viewCourseReducer, // courseSectionData, courseEntireData, completedLectures
});
```

### Slice Details

| Slice | State | Key Reducers | Persistence |
|---|---|---|---|
| **auth** | `{ token, loading, signupData }` | `setToken`, `setLoading`, `setSignupData` | `token` in localStorage |
| **profile** | `{ user, loading }` | `setUser`, `setLoading` | `user` in localStorage |
| **cart** | `{ cart[], total, totalItems }` | `addToCart`, `removeFromCart`, `resetCart` | All 3 in localStorage |
| **course** | `{ step, course, editCourse, paymentLoading }` | `setStep`, `setCourse`, `setEditCourse`, `setPaymentLoading` | None |
| **viewCourse** | `{ courseSectionData, courseEntireData, completedLectures, totalNoOfLectures }` | Various setters | None |

### Async Pattern (Thunk-style, manual)
The project uses **manually created thunks** (not `createAsyncThunk`):

```javascript
// Pattern used in operations/authAPI.js
export function login(email, password, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("POST", LOGIN_API, { email, password });
      if (!response.data.success) throw new Error(response.data.message);
      dispatch(setToken(response.data.token));
      dispatch(setUser(response.data.user));
      localStorage.setItem("token", JSON.stringify(response.data.token));
      navigate("/dashboard/my-profile");
    } catch (error) {
      toast.error("Login Failed");
    }
    dispatch(setLoading(false));
    toast.dismiss(toastId);
  };
}
```

> [!TIP]
> Be ready to explain: "Why manual thunks instead of `createAsyncThunk`?" — Answer: The project was originally built with a simpler approach. `createAsyncThunk` would add automatic loading/error states but the manual approach gives more control over toast notifications, navigation, and multi-dispatch patterns.

---

## 12. Routing & Route Protection

### Route Categories

**Public Routes** (no auth needed):
- `/` — Home
- `/about` — About
- `/contact` — Contact
- `/courses/:courseId` — Course details
- `/catalog/:catalogName` — Category catalog

**Open Routes** (only for non-logged-in users):
- `/login`, `/signup`, `/verify-email`
- `/forgot-password`, `/update-password/:id`

**Private Routes** (requires auth):
- `/dashboard/*` — All dashboard routes
- `/view-course/*` — Course video player

### Route Protection Components

```jsx
// OpenRoute — redirects logged-in users to dashboard
function OpenRoute({ children }) {
  const { token } = useSelector((state) => state.auth);
  return token === null ? children : <Navigate to="/dashboard/my-profile" />;
}

// PrivateRoute — redirects unauthenticated users to login
function PrivateRoute({ children }) {
  const { token } = useSelector((state) => state.auth);
  return token !== null ? children : <Navigate to="/login" />;
}
```

### Role-Based Route Rendering
```jsx
// In App.js — Routes rendered conditionally based on accountType
{user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
  <>
    <Route path="dashboard/instructor" element={<Instructor />} />
    <Route path="dashboard/my-courses" element={<MyCourses />} />
    <Route path="dashboard/add-course" element={<AddCourse />} />
    <Route path="dashboard/edit-course/:courseId" element={<EditCourse />} />
  </>
)}
{user?.accountType === ACCOUNT_TYPE.STUDENT && (
  <>
    <Route path="dashboard/enrolled-courses" element={<EnrolledCourses />} />
    <Route path="/dashboard/cart" element={<Cart />} />
  </>
)}
```

---

## 13. Key Frontend Flows

### 1. Course Creation Flow (Instructor)
```
Dashboard → Add Course → Step 1: Course Info (name, description, price, category, thumbnail, tags)
    → Step 2: Course Builder (add sections → add subsections with video upload)
    → Step 3: Publish (set status to "Published" or keep as "Draft")
```

### 2. Course Purchase Flow (Student)
```
Browse Catalog/Home → Click Course → Course Details Page 
    → "Add to Cart" (Redux + localStorage) → Cart Page 
    → "Buy Now" → Razorpay Checkout Modal → Payment Success 
    → Enrollment → Redirect to Enrolled Courses
```

### 3. Course Consumption Flow (Student)
```
Enrolled Courses → Click Course → ViewCourse layout (sidebar + video)
    → VideoDetailsSidebar shows sections/subsections
    → Click lecture → VideoDetails plays video (video-react player)
    → "Mark as Completed" → updateCourseProgress API → progress bar updates
```

### 4. Auto-Login on Refresh
```javascript
// App.js useEffect
useEffect(() => {
    if (localStorage.getItem("token")) {
        const token = JSON.parse(localStorage.getItem("token"));
        dispatch(getUserDetails(token, navigate));
    }
}, []);
```

---

## 14. Component Breakdown

### Common Components
| Component | Purpose |
|---|---|
| `Navbar` | Navigation bar with logo, links, categories dropdown, cart icon, profile dropdown |
| `Footer` | Site footer with link sections |
| `ConfirmationModal` | Reusable confirm/cancel dialog |
| `IconBtn` | Styled button with icon |
| `RatingStars` | Star rating display |
| `ReviewSlider` | Swiper carousel for reviews |
| `Tab` | Tab switching component |

### HomePage Components
| Component | Purpose |
|---|---|
| `CodeBlocks` | Animated code display with typing animation |
| `ExploreMore` | Tabbed course exploration section |
| `CourseCard` | Individual course card in explore section |
| `TimelineSection` | Learning journey timeline |
| `InstructorSection` | CTA for becoming an instructor |
| `LearningLanguageSection` | Language learning showcase |
| `HighlightText` | Gradient-colored text component |

### Dashboard Components
| Component | Purpose |
|---|---|
| `Sidebar` | Dashboard navigation sidebar |
| `SidebarLink` | Individual sidebar navigation link |
| `MyProfile` | User profile display page |
| `Settings/` | Profile editing, password change, account deletion |
| `AddCourse/` | Multi-step course creation form |
| `EditCourse/` | Edit existing course |
| `MyCourses` | List of instructor's courses |
| `EnrolledCourses` | Student's enrolled courses with progress |
| `Instructor` | Instructor analytics dashboard with charts |
| `Cart/` | Shopping cart page |
| `InstructorCourses/` | Course management table |

### ViewCourse Components
| Component | Purpose |
|---|---|
| `VideoDetails` | Video player with mark-complete functionality |
| `VideoDetailsSidebar` | Course outline sidebar with section/subsection navigation |
| `CourseReviewModal` | Modal for writing course reviews |

---

## 15. Course Content Hierarchy

```
Course
├── courseName, courseDescription, price, thumbnail, status (Draft/Published)
├── whatYouWillLearn, tag[], instructions[]
├── category (FK to Category)
├── instructor (FK to User)
│
├── Section 1 (sectionName)
│   ├── SubSection 1.1 (title, description, videoUrl, timeDuration)
│   ├── SubSection 1.2
│   └── SubSection 1.3
│
├── Section 2 (sectionName)
│   ├── SubSection 2.1
│   └── SubSection 2.2
│
└── enrolledStudents (many-to-many with User)
```

### Duration Calculation
```javascript
// Server-side: Sum all subsection durations
courseDetails.sections.forEach(section => {
    section.subSections.forEach(sub => {
        totalDurationInSeconds += parseInt(sub.timeDuration) || 0;
    });
});
const totalDuration = convertSecondsToDuration(totalDurationInSeconds);
// Returns format like "2h 15m 30s"
```

### Progress Tracking
```javascript
progressPercentage = (completedVideos.length / totalSubsections) * 100
```

---

## 16. Mongoose → Prisma Migration Details

> [!WARNING]
> This is a **critical** interview topic. The project was migrated from MongoDB/Mongoose to PostgreSQL/Prisma. Understanding this migration shows depth.

### Why This Migration?
- MongoDB → PostgreSQL for relational data integrity
- Mongoose → Prisma for type-safe queries and migration management
- Document model → Relational model with proper foreign keys

### Compatibility Layer Pattern
The backend maintains **Mongoose-compatible response shapes** for the frontend:
```javascript
// Every controller uses formatting helpers like:
const formatCourseDetails = (course) => ({
    ...course,
    _id: course.id,                    // Mongoose used _id, Prisma uses id
    courseContent: course.sections,     // Mongoose field name was courseContent
    ratingAndReviews: course.ratingsAndReviews,
    studentsEnrolled: course.enrolledStudents.map(s => s.id),
    instructor: {
        ...course.instructor,
        _id: course.instructor.id,
        additionalDetails: course.instructor.profile  // Mongoose populated name
    }
});
```

### Key Differences
| Aspect | Mongoose/MongoDB | Prisma/PostgreSQL |
|---|---|---|
| IDs | `_id` (ObjectId) | `id` (UUID) |
| Relations | `populate()` | `include: {}` |
| Embedded docs | Supported natively | Requires separate tables |
| Arrays | Array of ObjectIds | `String[]` or join tables |
| Hooks | `pre('save')` | Manual (e.g., OTP email sent explicitly) |
| Transactions | Sessions | `prisma.$transaction()` |
| Cascade delete | Manual | Schema-level `onDelete: Cascade` |
| Schema | Runtime (flexible) | Migration-based (strict) |

---

## 17. Environment Variables & Configuration

### Frontend (`.env`)
```
REACT_APP_BASE_URL=http://localhost:4000/api/v1
REACT_APP_RAZORPAY_KEY=rzp_xxx
```

### Backend (`server/.env`)
```
PORT=4000
DATABASE_URL=postgresql://user:pass@host:5432/studynotion
JWT_SECRET=your-secret-key
CLOUD_NAME=xxx
API_KEY=xxx
API_SECRET=xxx
RAZORPAY_KEY=rzp_xxx
RAZORPAY_SECRET=xxx
MAIL_HOST=smtp.gmail.com
MAIL_USER=your-email@gmail.com
MAIL_PASS=app-password
FOLDER_NAME=StudyNotion
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

### Express Middleware Stack (Order Matters)
```javascript
app.use(express.json());                    // Parse JSON bodies
app.use(cookieParser());                    // Parse cookies
app.use(cors({ origin, credentials: true })); // CORS
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp" })); // File uploads
cloudinaryConnect();                        // Initialize Cloudinary
```

---

## 18. Deployment & DevOps

### Development
```bash
npm run dev  # Runs both client (port 3000) and server (port 4000) via concurrently
```

### Backend Deployment (Vercel)
- `server/vercel.json` exists for Vercel serverless deployment
- Prisma generates client at `postinstall`

### Database
- PostgreSQL (Supabase, Neon, Railway, or any PG host)
- Prisma migrations managed via `prisma migrate dev`

### Build
```bash
npm run build  # react-scripts build → /build directory
```

---

## 19. Security Considerations

### What's Implemented
| Security Measure | Implementation |
|---|---|
| **Password Hashing** | bcryptjs with 10 salt rounds |
| **JWT Authentication** | 24-hour expiry, httpOnly cookie |
| **CORS** | Restricted origin |
| **OTP Verification** | 5-minute expiry, unique generation loop |
| **Password Reset Token** | crypto.randomBytes (1-hour expiry) |
| **Role-Based Access** | isStudent, isInstructor, isAdmin middleware |
| **Payment Verification** | HMAC-SHA256 signature validation |
| **Video URL Protection** | `videoUrl` stripped from public `getCourseDetails` |

### Potential Improvements (Good for Interview)
| Issue | Improvement |
|---|---|
| Token in body/header AND cookie | Stick to httpOnly cookies only |
| No rate limiting | Add `express-rate-limit` |
| Console.log in production | Use proper logging (Winston/Pino) |
| No input sanitization | Add validation middleware (Joi/Zod) |
| No CSRF protection | Add CSRF tokens |
| Instructor approval field unused | Implement admin approval workflow |
| OTP brute force possible | Add max attempts, delay |

---

## 20. Performance & Scalability

### Current Optimizations
- `localStorage` persistence for cart, token, user (reduces API calls)
- Cloudinary CDN for media (images/videos served globally)
- PostgreSQL with proper indexes (`@unique`, `@@index`)
- Prisma's `include` for efficient JOINs (vs N+1 queries)

### Potential Improvements
- Redis caching for frequently accessed data (categories, popular courses)
- Pagination for course listings
- WebSocket for real-time progress updates
- Image lazy loading
- Code splitting with `React.lazy()`
- Database connection pooling (already using `pg.Pool`)

---

## 21. Potential Interview Questions

### Architecture & Design (15 Questions)
1. **Explain the overall architecture of StudyNotion.** → 3-tier: React frontend, Express REST API, PostgreSQL database with Cloudinary & Razorpay integrations.
2. **Why did you choose PostgreSQL over MongoDB?** → Relational data with many-to-many relationships (enrollments, progress), ACID compliance, strong schema enforcement.
3. **Why Prisma over raw SQL or another ORM?** → Type-safe queries, auto-generated client, migration system, excellent DX with `include` for relations.
4. **How does data flow from the frontend to the database?** → Component → dispatch(thunk) → apiConnector(axios) → Express route → middleware → controller → Prisma → PostgreSQL.
5. **What design patterns did you use?** → MVC (controllers/routes/models), middleware chain, Redux flux pattern, service layer (operations/), compatibility adapter pattern.
6. **How would you scale this for 100K users?** → Horizontal scaling, Redis caching, CDN, database read replicas, microservices split, message queues.
7. **Why did you keep Mongoose-compatible response shapes?** → To minimize frontend changes during the MongoDB → PostgreSQL migration.
8. **What are the tradeoffs of your current architecture?** → Monolithic backend (could be microservices), no caching layer, no WebSockets for real-time features.
9. **How do you handle concurrent payments?** → Razorpay handles concurrency; enrollment uses `connect` which is atomic in Prisma.
10. **What happens if the server crashes mid-payment?** → Razorpay webhook could verify; currently relies on client-side callback.
11. **Why `concurrently` for dev instead of Docker?** → Simpler setup for development; Docker would be better for production.
12. **Explain the project's folder structure rationale.** → Feature-based frontend (components/core/Dashboard), concern-based backend (controllers, routes, models, middlewares).
13. **How do you handle file uploads?** → `express-fileupload` saves temp files → uploaded to Cloudinary → URL stored in DB.
14. **Why not use AWS S3 instead of Cloudinary?** → Cloudinary provides auto-optimization, transformations, and video duration metadata out of the box.
15. **How would you add real-time notifications?** → Socket.io or WebSockets for enrollment notifications, course updates.

### Authentication & Security (12 Questions)
16. **Walk me through the complete signup flow.** → Enter details → Send OTP → Verify email → OTP validation (5-min expiry, match check) → Hash password → Create User + Profile in one Prisma transaction.
17. **How does JWT authentication work in your app?** → Login generates JWT with {email, id, accountType}, 24h expiry. Sent as httpOnly cookie and in response. Middleware extracts from cookie/body/header, verifies with `jwt.verify()`, attaches decoded payload to `req.user`.
18. **What's stored in the JWT payload and why?** → email, id, accountType — minimal data needed for auth + role checks without DB lookup.
19. **How do you handle token expiration?** → 24-hour expiry in JWT. Cookie expires in 3 days. On expiry, user must re-login.
20. **Explain the password reset mechanism.** → User requests reset → `crypto.randomBytes(20)` token saved to user with 1-hour expiry → Email with `/update-password/{token}` link → User submits new password + token → Backend validates token & expiry → bcrypt hash & update.
21. **How does OTP verification prevent abuse?** → 5-minute expiry, unique OTP generation loop (checks DB), email sent before storage.
22. **What are the three middleware roles and how do they work?** → `isStudent`, `isInstructor`, `isAdmin` — each checks `req.user.accountType` (set by `auth` middleware). Returns 401 if mismatch.
23. **Why check token in 3 places (cookie, body, header)?** → Flexibility for different clients (browser with cookies, mobile with headers, Postman with body).
24. **How would you implement refresh tokens?** → Short-lived access token (15 min) + long-lived refresh token (7 days) stored in httpOnly cookie. Separate `/refresh-token` endpoint.
25. **What security vulnerabilities exist and how would you fix them?** → No rate limiting (add express-rate-limit), no input sanitization (add Zod), console logs in production (use logger), no CSRF protection.
26. **How does the Razorpay signature verification prevent fraud?** → HMAC-SHA256 of `order_id|payment_id` using server-side secret. Attacker can't forge without knowing the secret.
27. **How do you prevent a student from accessing instructor routes?** → Backend: `isInstructor` middleware. Frontend: conditional route rendering based on `user.accountType`.

### Database & Prisma (12 Questions)
28. **Explain your database schema design.** → [See Section 4 above — explain entities, relations, and design decisions]
29. **How do many-to-many relations work in Prisma?** → Implicit (enrolledStudents: `User[] @relation("EnrolledStudents")` on Course + `Course[] @relation("EnrolledStudents")` on User → Prisma auto-creates `_EnrolledStudents` junction table) and Explicit (completedVideos via CourseProgress).
30. **Why UUID instead of auto-increment IDs?** → UUIDs are globally unique, don't expose record count, safe for distributed systems, no sequential guessing.
31. **What does `onDelete: Cascade` do?** → When parent record is deleted, all child records are automatically deleted. Used on Profile→User, Section→Course, SubSection→Section, etc.
32. **Why `onDelete: SetNull` on Category→Course?** → If a category is deleted, courses should remain but with `categoryId` set to null (they become uncategorized, not deleted).
33. **How does course progress tracking work at the DB level?** → `CourseProgress` table with compound unique `[courseId, userId]`. Many-to-many with SubSection via `CompletedVideos` relation. Each video completion adds a `connect` to the relation.
34. **What are the compound unique constraints and why?** → `@@unique([courseId, userId])` on CourseProgress (one progress record per user per course), `@@unique([userId, courseId])` on RatingAndReview (one review per user per course).
35. **How do PostgreSQL native arrays differ from join tables?** → `String[]` for `tag` and `instructions` — simple, non-relational data. No need for separate table. But can't do relational queries on individual elements.
36. **How would you add pagination?** → `prisma.course.findMany({ skip: page * limit, take: limit, orderBy: { createdAt: 'desc' } })`.
37. **What are Prisma migrations and how do they work?** → `prisma migrate dev` generates SQL migration files from schema changes. Keeps DB in sync with schema. Files stored in `prisma/migrations/`.
38. **What's the Prisma driver adapter pattern used here?** → `@prisma/adapter-pg` connects directly via `pg.Pool` (required for Prisma 7). Allows using any PostgreSQL connection.
39. **How would you optimize slow queries?** → Add indexes, use `select` instead of `include` for partial data, add database-level materialized views, use Prisma's query logging.

### Frontend & React (15 Questions)
40. **How does state management work in your app?** → Redux Toolkit with 5 slices (auth, profile, cart, course, viewCourse). Async operations via manual thunks in `services/operations/`.
41. **Why manual thunks vs `createAsyncThunk`?** → More control over toast notifications, navigation callbacks, and multi-dispatch sequences. Trade-off: less boilerplate reduction.
42. **How does the cart persist across page refreshes?** → Cart state synced to `localStorage` in every reducer action. Initial state reads from localStorage.
43. **Explain the `OpenRoute` vs `PrivateRoute` pattern.** → OpenRoute: only accessible when NOT logged in (redirects to dashboard if logged in). PrivateRoute: only accessible when logged in (redirects to login if not).
44. **How does role-based rendering work on the frontend?** → `user?.accountType === ACCOUNT_TYPE.INSTRUCTOR` conditional rendering in App.js Routes. Dashboard sidebar links also filtered by role.
45. **How does the course creation multi-step form work?** → `courseSlice` has a `step` state (1, 2, 3). AddCourse component renders different sub-components per step. Each step saves to backend on completion.
46. **How does the video player and progress tracking integrate?** → `video-react` player in VideoDetails. "Mark as Completed" button calls `updateCourseProgress` API. Redux `viewCourseSlice` tracks `completedLectures` array.
47. **How does the API connector work?** → `axios.create({ withCredentials: true })` instance. `apiConnector(method, url, body, headers, params)` wrapper handles all HTTP methods uniformly.
48. **What custom hooks did you build and why?** → `useOnClickOutside` (close dropdowns when clicking outside), `useRouteMatch` (check if current route matches a pattern — for sidebar active state).
49. **How does the catalog page fetch and display data?** → `categoryPageDetails` API returns `selectedCategory`, `differentCategory` (random other category), and `mostSellingCourses`. Frontend renders in sections with CourseSlider components.
50. **How does the Navbar handle categories dropdown?** → Fetches categories from `/showAllCategories` API. Renders dropdown on hover. Links to `/catalog/:categoryName`.
51. **How does the review slider work?** → `getAllRating` API fetches all reviews. Swiper component auto-plays through review cards.
52. **How does `react-hook-form` integrate with the course creation flow?** → `useForm()` manages form state. `register()` connects inputs. `handleSubmit()` validates before API call. FormData created for file + text data.
53. **How does `react-dropzone` work for file uploads?** → Drag-and-drop zone accepts files. On drop, file is stored in component state. On form submit, sent as part of FormData.
54. **What happens when a user refreshes the page?** → App.js useEffect checks localStorage for token. If found, dispatches `getUserDetails` to re-fetch user from API and populate Redux store.

### Payment Integration (8 Questions)
55. **Walk me through the complete payment flow.** → [See Section 7 above]
56. **How does Razorpay SDK integration work on the frontend?** → Dynamically loaded via `loadScript()` function. Creates script tag, resolves Promise on load. Then `new window.Razorpay(options)` opens checkout.
57. **What is signature verification and why is it important?** → Prevents tampered payment data. Server computes `HMAC-SHA256(order_id|payment_id, secret)` and compares with signature from Razorpay. Only Razorpay can generate valid signatures.
58. **How do you handle multiple course purchases?** → Cart holds multiple courses. `capturePayment` sums prices for all courses. After payment, `enrollStudents()` loops through course IDs to create enrollments.
59. **What happens if payment succeeds but enrollment fails?** → Current weakness — no retry mechanism. Would need Razorpay webhooks + idempotent enrollment endpoint for production.
60. **Why convert amount to paise?** → Razorpay API expects amounts in smallest currency unit. ₹100 = 10000 paise.
61. **How would you add refund functionality?** → Razorpay Refund API → unenroll student → recalculate instructor revenue → send refund email.
62. **What's the `receipt` field in Razorpay order?** → Unique identifier for your order. Currently uses `Math.random(Date.now()).toString()` — should be more deterministic.

### DevOps & Deployment (5 Questions)
63. **How do you run the project locally?** → `npm install` (root + server) → configure `.env` files → `npm run dev` (runs both via concurrently).
64. **How would you deploy this to production?** → Frontend: Vercel/Netlify static build. Backend: Vercel serverless/Railway/Render. Database: Supabase/Neon PostgreSQL. Media: Cloudinary (already).
65. **What's in `vercel.json`?** → Serverless function configuration to deploy Express app as Vercel function.
66. **How do Prisma migrations work in deployment?** → `postinstall` script runs `prisma generate`. Production: `prisma migrate deploy` applies pending migrations.
67. **How would you set up CI/CD?** → GitHub Actions: lint → test → build → deploy. Prisma migrate as part of deploy step.

### Advanced / System Design (15 Questions)
68. **How would you implement search functionality?** → PostgreSQL full-text search, or Elasticsearch for advanced. Frontend debounced search input.
69. **How would you add course categories hierarchy (sub-categories)?** → Self-referential `parentId` in Category model. Tree traversal for breadcrumbs.
70. **How would you implement real-time chat between students and instructors?** → Socket.io server, chat model in DB, message history API.
71. **How would you add course recommendations?** → Collaborative filtering (users who enrolled in X also enrolled in Y), content-based (same category/tags).
72. **How would you implement video streaming instead of direct URLs?** → HLS/DASH adaptive streaming, Cloudinary video transformations, or AWS CloudFront + S3.
73. **How would you add multiple currency support?** → Store prices in base currency, convert at checkout using exchange rate API, Razorpay supports multi-currency.
74. **How would you implement instructor payouts?** → Track revenue per course, Razorpay Route (split payments) or manual payout via bank transfer API.
75. **How would you add course completion certificates?** → PDF generation (puppeteer/jspdf), store certificate URL, unlock after 100% progress.
76. **How would you implement rate limiting?** → `express-rate-limit` middleware, different limits per endpoint (auth: strict, public: relaxed).
77. **How would you add caching?** → Redis for session/token storage, API response caching with TTL, React Query for frontend caching.
78. **How would you make the app SEO-friendly?** → Server-side rendering (Next.js migration), meta tags, structured data, sitemap.
79. **What would you change if rebuilding from scratch?** → Next.js App Router, TypeScript, `createAsyncThunk`, proper validation (Zod), better error handling, test coverage.
80. **How would you handle image optimization?** → Cloudinary transformations (auto format, quality, resize), responsive images with `srcset`, lazy loading.
81. **How would you add an admin dashboard?** → Admin routes for user management, course approval, analytics, category CRUD (partially exists).
82. **How would you implement course prerequisites?** → `prerequisiteCourseId` relation on Course model, enrollment check before allowing enrollment.

### Behavioral / Project-Specific (20 Questions)
83. **What was the most challenging part of this project?** → [Prepare: payment integration, Mongoose→Prisma migration, or course builder multi-step form]
84. **How did you decide on the database schema?** → Analyzed e-learning domain: users, courses, content hierarchy, progress tracking. Drew ER diagram first.
85. **How did you handle the MongoDB to PostgreSQL migration?** → Created Prisma schema matching MongoDB collections, added compatibility layer in controllers, migrated data, updated all queries from Mongoose to Prisma.
86. **What would you do differently?** → TypeScript for type safety, better error handling, add tests, use Next.js for SSR.
87. **How did you test the payment flow?** → Razorpay test mode with test API keys, test card numbers.
88. **How do you handle errors across the app?** → Backend: try/catch in every controller returning `{ success: false, message }`. Frontend: toast.error() in catch blocks.
89. **What's your debugging process?** → Console logs (currently), browser DevTools, network tab for API calls, Prisma query logging.
90. **How did you handle CORS issues?** → `cors({ origin: 'http://localhost:3000', credentials: true })` on backend, `withCredentials: true` on Axios.
91. **Why did you choose this tech stack?** → React for component-based UI, Express for fast API development, PostgreSQL for relational data, Prisma for type-safe ORM.
92. **How did you plan the component hierarchy?** → Identified pages first, then broke into reusable components (common/) and feature-specific (core/).
93. **How do you ensure data consistency?** → PostgreSQL ACID transactions, Prisma's atomic operations, cascade deletes in schema.
94. **What accessibility features did you implement?** → [Be honest — likely minimal. Mention what you'd add: ARIA labels, keyboard navigation, screen reader support.]
95. **How did you handle form validation?** → Frontend: react-hook-form with validation rules. Backend: manual field checks in controllers.
96. **What metrics would you track in production?** → API response times, error rates, user signups, course completions, payment success rate, bounce rate.
97. **How would you handle a production outage?** → Check logs, identify failing service, rollback if deployment issue, failover DB, communicate with users.
98. **How do you manage environment variables securely?** → `.env` files (gitignored), platform-specific env var settings in deployment.
99. **What's the user experience for a first-time visitor?** → Home page with hero, explore courses, review slider → Browse catalog → Course details → Sign up → Buy course.
100. **How does the instructor dashboard calculate revenue?** → `totalAmountGenerated = enrolledStudents.length × course.price` (simple calculation, no actual transaction tracking).
101. **Why is `_id` added to responses alongside `id`?** → Frontend code was written for Mongoose's `_id`. Instead of changing every frontend reference, the backend maps `id → _id` for compatibility.
102. **How does the Category catalog page work?** → `categoryPageDetails` returns: selected category's courses, a random different category's courses, and top 10 most-enrolled courses across all categories.

---

## Quick Reference: Files to Review Before Interview

### Must-Know Files (Backend)
| File | Why |
|---|---|
| [schema.prisma](file:///c:/Users/ANSH SINGH/Desktop/SN/server/prisma/schema.prisma) | The entire data model |
| [Auth.js controller](file:///c:/Users/ANSH SINGH/Desktop/SN/server/controllers/Auth.js) | Signup, Login, OTP, Password change |
| [auth.js middleware](file:///c:/Users/ANSH SINGH/Desktop/SN/server/middlewares/auth.js) | JWT verification, role checks |
| [Payments.js](file:///c:/Users/ANSH SINGH/Desktop/SN/server/controllers/Payments.js) | Razorpay integration |
| [Course.js controller](file:///c:/Users/ANSH SINGH/Desktop/SN/server/controllers/Course.js) | CRUD + formatting helpers |
| [index.js server](file:///c:/Users/ANSH SINGH/Desktop/SN/server/index.js) | Express setup, middleware order |

### Must-Know Files (Frontend)
| File | Why |
|---|---|
| [App.js](file:///c:/Users/ANSH SINGH/Desktop/SN/src/App.js) | All routes, role-based rendering |
| [index.js](file:///c:/Users/ANSH SINGH/Desktop/SN/src/index.js) | Redux store setup |
| [authAPI.js](file:///c:/Users/ANSH SINGH/Desktop/SN/src/services/operations/authAPI.js) | Auth flow thunks |
| [studentFeaturesAPI.js](file:///c:/Users/ANSH SINGH/Desktop/SN/src/services/operations/studentFeaturesAPI.js) | Payment flow |
| [cartSlice.js](file:///c:/Users/ANSH SINGH/Desktop/SN/src/slices/cartSlice.js) | Cart with localStorage |
| [apis.js](file:///c:/Users/ANSH SINGH/Desktop/SN/src/services/apis.js) | All API endpoint URLs |

---

> [!TIP]
> **Interview Strategy**: Start with the elevator pitch. When asked about any feature, trace the **full flow**: UI component → Redux action → API call → middleware → controller → database query → response. This shows deep understanding vs surface-level knowledge.
