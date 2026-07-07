# LUWAS Travel App - Complete Implementation Guide

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Setup Instructions](#setup-instructions)
4. [Web App Implementation](#web-app-implementation)
5. [Mobile App Implementation](#mobile-app-implementation)
6. [Cross-Platform Integration](#cross-platform-integration)
7. [Firebase Configuration](#firebase-configuration)
8. [API Endpoints](#api-endpoints)
9. [Database Schema](#database-schema)
10. [Deployment Guide](#deployment-guide)

---

## Project Overview

LUWAS is a **full-stack travel booking application** with:

- **Web App**: Next.js 15+ with App Router (TypeScript)
- **Mobile App**: React Native (Expo SDK 54)
- **Backend**: Firebase (Firestore, Auth, Storage, Functions)
- **Frontend**: Shared Firestore database between web and mobile

### Key Features

- User authentication (Email, Google, Facebook OAuth)
- Destination browsing with detailed information
- Trip packages listing with place-aware filtering
- Custom trip planning (pick activities per day, calculate budget)
- Itinerary/promo booking system
- Payment proof upload system
- Real-time chat support
- Travel history tracking
- Weather insights & nearby recommendations

---

## Architecture & Tech Stack

### Web App Stack

```
Frontend:
├── Framework: Next.js 15+ (App Router)
├── Language: TypeScript
├── Styling: Tailwind CSS + custom CSS
├── UI Components: shadcn/ui + Lucide Icons
├── State Management: React Context + hooks
└── HTTP Client: Fetch API

Backend/Database:
├── Firebase Auth (Email, Google, Facebook)
├── Firestore (Document database)
├── Firebase Storage (Images, payment proofs)
└── Firebase Functions (Optional - for backend logic)

Build/Deploy:
├── Package Manager: npm
├── Deployment: Vercel (Next.js optimized)
└── Environment: .env.local (secrets)
```

### Mobile App Stack

```
Framework:
├── React Native (Expo SDK 54)
├── Language: TypeScript
├── Router: Expo Router (file-based)
└── Navigation: Bottom tabs + stack navigation

UI/Styling:
├── React Native built-in components
├── react-native-reanimated (animations)
├── expo-linear-gradient
├── expo-blur
└── Lucide React Native icons

Firebase:
├── Firebase Auth (web SDK + react-native compatibility)
├── Firestore SDK
├── Storage SDK
└── Real-time listeners (onSnapshot)

Maps & Location:
├── react-native-maps
├── expo-location
└── Google Maps API (for nearby spots)

Build/Deploy:
├── Package Manager: npm
├── Build Tool: Expo EAS
├── Local Dev: expo start
└── Deployment: EAS build → TestFlight / Play Store
```

---

## Setup Instructions

### Prerequisites

- **Node.js**: v18+ and npm v9+
- **Git**: Latest version
- **Firebase Account**: With project created
- **Expo Account** (for mobile): https://expo.dev
- **Code Editor**: VS Code recommended

### Step 1: Clone Repositories

```bash
# Web App
git clone https://github.com/Moncito/luwas-travel-app.git
cd luwas-travel-app
npm install

# Mobile App (separate directory)
cd ../
git clone https://github.com/Moncito/luwas-mobile.git
cd luwas-mobile
npm install
```

### Step 2: Environment Variables Setup

#### **Web App** - Create `.env.local`

```env
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id

# Optional: OpenWeather API
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_weather_key
```

#### **Mobile App** - Create `.env`

```env
# Firebase Config (same as web)
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# OAuth (from Constants.expoConfig?.extra)
GOOGLE_EXPO_CLIENT_ID=your_expo_google_id
GOOGLE_ANDROID_CLIENT_ID=your_android_google_id
GOOGLE_IOS_CLIENT_ID=your_ios_google_id
GOOGLE_WEB_CLIENT_ID=your_web_google_id
FACEBOOK_APP_ID=your_facebook_app_id

# API
OPENWEATHER_API_KEY=your_weather_key
```

### Step 3: Firebase Setup

1. **Create Firebase Project**: https://console.firebase.google.com
2. **Create Firestore Database**: `us-central1` region
3. **Enable Authentication**:
   - Email/Password
   - Google Sign-In
   - Facebook Login
4. **Enable Storage**: For images and payment proofs
5. **Download Service Account Key**: For admin operations
6. **Configure Firestore Rules** (see [Firestore Rules](#firestore-security-rules) below)

### Step 4: Run Locally

#### **Web App**

```bash
cd luwas-travel-app
npm run dev
# Open http://localhost:3000
```

#### **Mobile App**

```bash
cd luwas-mobile
npx expo start
# Press 'a' for Android / 'i' for iOS / 'w' for web
```

---

## Web App Implementation

### 1. Project Structure

```
app/
├── (auth)/                          # Auth routes
│   ├── layout.tsx                   # Auth layout
│   ├── sign-in/page.tsx            # Sign-in page
│   └── sign-up/page.tsx            # Registration page
├── (path)/                          # Main app routes
│   ├── about/page.tsx              # About page
│   ├── destinations/
│   │   ├── page.tsx                # Destinations listing
│   │   └── [id]/
│   │       ├── page.tsx            # Destination detail
│   │       ├── packages/
│   │       │   ├── page.tsx        # ✅ PACKAGES LIST (DONE)
│   │       │   └── [packageId]/
│   │       │       └── page.tsx    # Package detail
│   │       ├── customize/
│   │       │   └── page.tsx        # ✅ PLAN YOUR OWN TRIP (DONE)
│   │       ├── book/page.tsx       # Booking form
│   │       ├── pay/page.tsx        # Payment page
│   │       └── check/page.tsx      # Booking status
│   ├── profile/page.tsx            # User profile
│   ├── bookings/page.tsx           # My bookings
│   ├── itineraries/page.tsx        # Pre-built itineraries
│   ├── promos/page.tsx             # Promotions
│   └── ...
├── (root)/
│   └── page.tsx                     # Home page
├── admin/
│   └── ...                          # Admin dashboard
├── api/
│   ├── route.ts                     # API routes
│   ├── weather/route.ts             # Weather endpoint
│   ├── places/route.ts              # Nearby places endpoint
│   └── reviews/route.ts             # Review summary endpoint
├── layout.tsx                       # Root layout
└── globals.css                      # Global styles

components/
├── Navbar.tsx                       # Top navigation
├── Footer.tsx                       # Footer
├── (destinations)/
│   ├── DestinationHero.tsx
│   ├── DestinationSearch.tsx
│   └── DestinationList.tsx
├── (payment)/
│   ├── PaymentForm.tsx
│   └── PaymentProof.tsx
├── (itineraries)/
│   ├── ItineraryCard.tsx
│   └── ItineraryList.tsx
└── ui/
    ├── Button.tsx
    ├── Card.tsx
    ├── Input.tsx
    └── ...

lib/
├── firebase.ts                      # Firebase client config
├── useAuth.ts                       # Auth hook
├── utils.ts                         # Utility functions
├── actions/
│   ├── bookings.ts                  # Booking server actions
│   ├── users.ts                     # User operations
│   └── ...
└── db/
    ├── destinations.ts              # Firestore helpers
    ├── packages.ts                  # Package queries
    ├── activities.ts                # Activity queries
    └── ...

types/
├── index.d.ts                       # Global types
├── User.ts                          # User interface
├── booking.ts                       # Booking types
├── places.ts                        # Place types
└── ...
```

### 2. Key Features Implementation

#### **A. Destinations Package Listing** ✅

**File**: `app/(path)/destinations/[id]/packages/page.tsx`

**Key Features**:

- Display all trip packages for a destination
- Place-aware filtering (if `packageLocation` specified)
- Sort by price
- Fallback to destination location if package location missing

**Data Structure**:

```typescript
interface TripPackage {
  id: string;
  destinationId: string;
  title: string;
  duration: string; // e.g., "3 days"
  price: number; // per person
  inclusions: string[]; // What's included
  dailySchedule: {
    // Detailed daily itinerary
    day: number;
    activities: string[];
  }[];
  imageUrl?: string;
  packageLocation?: string; // Specific location within destination
  destinationLocation?: string; // Fallback destination name
}
```

**Firestore Query**:

```typescript
const snapshot = await db
  .collection("tripPackages")
  .where("destinationId", "==", destinationId)
  .orderBy("price", "asc")
  .get();
```

**Implementation Checklist**:

- [ ] Create `app/(path)/destinations/[id]/packages/page.tsx`
- [ ] Add place filter UI with dropdown
- [ ] Fetch packages from Firestore
- [ ] Display package cards with pricing
- [ ] Add link to package details or booking
- [ ] Handle loading & error states

---

#### **B. Plan Your Own Trip (Customizer)** ✅

**File**: `app/(path)/destinations/[id]/customize/page.tsx`

**Key Features**:

- Browse all activities for a destination
- Filter by category (Adventure, Food, Culture, Nature)
- Select activities for specific days
- Real-time budget calculation
- Drag-and-drop day assignment
- Save custom itinerary

**Data Structure**:

```typescript
type Activity = {
  id: string;
  title: string;
  category?: string; // Adventure, Food, Culture, Nature
  price: number; // per person
  durationHours?: number | null; // How long the activity takes
  dayRecommendation?: number | null; // Suggested day
  description?: string;
  imageUrl?: string;
  destinationId: string;
};

type ChosenActivity = Activity & { day: number };

type CustomItinerary = {
  destinationId: string;
  destination: string;
  location: string;
  startDate?: string;
  endDate?: string;
  travelers: number;
  chosenActivities: ChosenActivity[];
  totalBudget: number; // travelers * sum of activity prices
  specialRequests?: string;
};
```

**Firestore Query**:

```typescript
const snapshot = await db
  .collection("activities")
  .where("destinationId", "==", destinationId)
  .orderBy("price", "asc")
  .get();
```

**Implementation Checklist**:

- [ ] Create `app/(path)/destinations/[id]/customize/page.tsx`
- [ ] Add activity search bar
- [ ] Add category filter tabs
- [ ] Fetch activities from Firestore
- [ ] Create activity card component
- [ ] Add day picker (radio buttons or buttons)
- [ ] Implement drag-and-drop (optional - can use click to assign)
- [ ] Calculate and display total budget in real-time
- [ ] Add "Continue to Booking" button
- [ ] Save custom itinerary to session or Firestore
- [ ] Handle loading states

---

#### **C. Booking Flow**

**Files**:

- `app/(path)/destinations/[id]/book/page.tsx`
- `app/(path)/destinations/[id]/pay/page.tsx`

**Booking Data Structure**:

```typescript
interface Booking {
  id: string;
  userId: string;
  destinationId: string;
  destination: string;
  tripType: "package" | "custom" | "itinerary" | "promo";
  travelers: number;
  price: number; // per person
  totalPrice: number; // total
  departureDate: string; // ISO format
  returnDate?: string; // ISO format
  specialRequests?: string;
  status:
    | "pending_payment"
    | "awaiting_approval"
    | "approved"
    | "rejected"
    | "completed";
  proofUrl?: string; // Payment proof image
  createdAt: Timestamp;
  paidAt?: Timestamp;
  paidBy?: {
    uid: string;
    name: string;
    email: string;
  };
}
```

**Implementation Steps**:

1. Create booking form with date/traveler picker
2. Fetch destination/package/itinerary details
3. Calculate total price
4. Submit to Firestore `bookings` collection
5. Redirect to payment page
6. Allow image upload for payment proof
7. Update booking status to `awaiting_approval`

---

### 3. API Routes

#### **Weather Endpoint**

**File**: `app/api/weather/route.ts`

```typescript
// GET /api/weather?location=Boracay&title=Destination%20Name
// Returns: { temperature, condition, humidity, windSpeed, forecast }
```

**Implementation**:

- Call OpenWeather API with location
- Return formatted weather data
- Cache results for 6 hours

---

#### **Nearby Places Endpoint**

**File**: `app/api/places/route.ts`

```typescript
// GET /api/places?lat=11.9&lon=121.9
// Returns: [{ name, description, image, lat, lon }]
```

**Implementation**:

- Use Google Places API or similar
- Return nearby attractions
- Include images and ratings

---

#### **Reviews Summary Endpoint**

**File**: `app/api/reviews/route.ts`

```typescript
// GET /api/reviews?destinationId=xyz
// Returns: { summary, rating, reviews: [...] }
```

**Implementation**:

- Fetch reviews from Firestore
- Summarize using AI (optional)
- Return top reviews

---

### 4. Authentication Flow

#### **Sign-Up**

1. User enters email & password
2. Firebase creates auth user
3. Create user document in Firestore:
   ```typescript
   {
     uid: user.uid,
     email: user.email,
     fullName: "",
     role: "traveler",
     createdAt: serverTimestamp(),
   }
   ```

#### **Sign-In**

1. User enters email & password
2. Firebase authenticates
3. Check if user document exists
4. Redirect to dashboard if valid

#### **OAuth (Google/Facebook)**

1. User clicks "Sign in with Google/Facebook"
2. Firebase handles OAuth flow
3. Create/merge user document if needed
4. Redirect to dashboard

---

## Mobile App Implementation

### 1. Project Structure

```
app/
├── _layout.tsx                      # Root navigation
├── index.tsx                        # Initial route/auth check
├── IntroScreen.tsx                  # Splash screen
├── booking-success.tsx              # Success page
├── editProfile.tsx                  # Profile editor
├── homesection.tsx                  # Home section
├── (auth)/
│   ├── login.tsx                    # Login screen
│   ├── register.tsx                 # Registration screen
│   └── forgot-password.tsx          # Password recovery
├── (tabs)/                          # Tab navigation
│   ├── _layout.tsx                  # Tab routes
│   ├── home.tsx                     # Home/dashboard
│   ├── destinations.tsx             # Destinations list
│   ├── chat-support.tsx             # Chat support
│   ├── history.tsx                  # Travel history
│   └── profile.tsx                  # Profile page
├── (destination)/
│   ├── index.tsx                    # Destination list
│   └── [id]/
│       ├── index.tsx                # Destination detail
│       ├── book.tsx                 # Booking form
│       └── pay.tsx                  # Payment proof upload
├── (itineraries)/
│   ├── index.tsx                    # Itineraries list
│   └── [id]/
│       ├── index.tsx                # Itinerary detail
│       ├── book.tsx                 # Booking form
│       └── pay.tsx                  # Payment upload
├── (promos)/
│   ├── index.tsx                    # Promos list
│   └── [id]/
│       ├── index.tsx                # Promo detail
│       ├── book.tsx                 # Booking form
│       └── pay.tsx                  # Payment upload
└── ...

components/
├── ActivityCardImage.tsx            # Activity card
├── ActivityCardSkeleton.tsx         # Loading skeleton
├── ChatWidgetWrapper.tsx            # Chat wrapper
├── ChatSupportPage.tsx              # Chat UI
├── DestinationCard.tsx              # Card component
├── ItineraryCard.tsx                # Itinerary card
├── PromoBanner.tsx                  # Promo banner
├── DropdownSelect.tsx               # Custom dropdown
├── AnimatedCard.tsx                 # Animated card
├── AuthScaffold.tsx                 # Auth layout
├── (destination-calls)/
│   ├── WeatherInsights.tsx          # Weather display
│   ├── NearbySpots.tsx              # Nearby places
│   ├── TravelerReviews.tsx          # Reviews display
│   └── YelpSummary.tsx              # Yelp integration
├── (destination-details)/
│   ├── WeatherInsights.tsx
│   ├── RecommendedPlaces.tsx
│   └── TravelerReviews.tsx
└── ui/
    ├── icon-symbol.tsx
    ├── collapsible.tsx
    └── ...

src/
├── lib/
│   └── firebase.ts                  # Firebase config
├── types/
│   └── firebase-react-native.d.ts  # Firebase type definitions
└── ...

hooks/
├── useDestinations.ts               # Destinations hook
├── useItineraries.ts                # Itineraries hook
├── usePromos.ts                     # Promos hook
├── useUserProfile.ts                # User profile hook
└── ...
```

### 2. Key Components

#### **A. Destinations List**

**File**: `app/(tabs)/destinations.tsx`

**Features**:

- Animated hero section
- Sticky header on scroll
- FlatList with destinations
- Tap to navigate to detail

**Implementation Checklist**:

- [ ] Fetch destinations from Firestore
- [ ] Create DestinationCard component
- [ ] Add scroll animations
- [ ] Navigate to detail on tap
- [ ] Handle loading states

---

#### **B. Booking Forms**

**Files**:

- `app/(destination)/[id]/book.tsx`
- `app/(itineraries)/[id]/book.tsx`
- `app/(promos)/[id]/book.tsx`

**Features**:

- Date picker
- Traveler count selector
- Special requests text
- Submit to Firestore
- Redirect to payment

**Implementation Steps**:

1. Fetch destination/itinerary/promo details
2. Add date picker (react-native-modal-datetime-picker)
3. Add +/- buttons for traveler count
4. Calculate total price
5. Create booking on submit
6. Navigate to payment screen

---

#### **C. Payment Proof Upload**

**Files**:

- `app/(destination)/[id]/pay.tsx`
- Similar pattern for itineraries & promos

**Features**:

- Image picker (gallery)
- Preview selected image
- Upload to Firebase Storage
- Update booking status
- Show success screen

**Implementation**:

```typescript
const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
  });

  if (!result.canceled) {
    setImage(result.assets[0].uri);
  }
};

const handleUpload = async () => {
  if (!image || !bookingId || !user) return;

  // Fetch image as blob
  const response = await fetch(image);
  const blob = await response.blob();

  // Upload to Firebase
  const proofRef = ref(storage, `proofs/${bookingId}/${Date.now()}.jpg`);
  await uploadBytes(proofRef, blob);
  const proofUrl = await getDownloadURL(proofRef);

  // Update booking
  await updateDoc(doc(db, "bookings", bookingId), {
    proofUrl,
    status: "awaiting_approval",
    paidAt: serverTimestamp(),
  });

  // Show success
  Alert.alert("✅ Success", "Payment proof submitted!");
};
```

---

### 3. Authentication

#### **Firebase Setup in Mobile**

**File**: `src/lib/firebase.ts`

```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

#### **OAuth Configuration**

**File**: `app.config.js`

```javascript
export default {
  expo: {
    extra: {
      GOOGLE_EXPO_CLIENT_ID: process.env.GOOGLE_EXPO_CLIENT_ID,
      GOOGLE_ANDROID_CLIENT_ID: process.env.GOOGLE_ANDROID_CLIENT_ID,
      GOOGLE_IOS_CLIENT_ID: process.env.GOOGLE_IOS_CLIENT_ID,
      GOOGLE_WEB_CLIENT_ID: process.env.GOOGLE_WEB_CLIENT_ID,
      FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
    },
  },
};
```

---

## Cross-Platform Integration

### 1. Shared Firestore Collections

All data is stored in **one Firebase project** and accessed by both web and mobile.

#### **Collection: `destinations`**

```typescript
{
  id: "boracay",
  name: "Boracay",
  location: "Aklan, Philippines",
  description: "White sand beaches...",
  imageUrl: "https://...",
  price: 2500,                    // Base price per person
  rating: 4.8,
  reviews: 150,
  latitude: 11.967,
  longitude: 121.932,
  tags: ["beach", "tropical", "water-sports"],
}
```

#### **Collection: `tripPackages`**

```typescript
{
  id: "pkg_boracay_3days",
  destinationId: "boracay",
  title: "Boracay Beach Escape",
  duration: "3 days, 2 nights",
  price: 3500,                    // per person
  inclusions: [
    "Hotel accommodation",
    "Breakfast daily",
    "Beach activities",
  ],
  dailySchedule: [
    {
      day: 1,
      activities: [
        "Arrival & check-in",
        "Beach sunset",
        "Welcome dinner"
      ]
    },
    // ... more days
  ],
  imageUrl: "https://...",
  packageLocation: "White Beach",  // Specific location
  destinationLocation: "Boracay",   // Fallback
  createdAt: Timestamp,
}
```

#### **Collection: `activities`**

```typescript
{
  id: "act_parasailing",
  destinationId: "boracay",
  title: "Parasailing",
  category: "Adventure",          // Adventure, Food, Culture, Nature
  price: 800,                     // per person
  durationHours: 1.5,
  dayRecommendation: 2,           // Suggested on day 2
  description: "Thrilling parasailing experience...",
  imageUrl: "https://...",
}
```

#### **Collection: `bookings`**

```typescript
{
  id: "booking_xyz",
  userId: "user123",
  destinationId: "boracay",
  destination: "Boracay",
  tripType: "package",            // package, custom, itinerary, promo
  travelers: 2,
  price: 3500,                    // per person
  totalPrice: 7000,               // total
  departureDate: "2026-07-15",
  returnDate: "2026-07-18",
  specialRequests: "Vegan meals please
```
