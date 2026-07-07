# Implementation Prompt: Packages & Custom Itinerary Features

## 🎯 Overview

Implement two critical features for LUWAS Travel App (Web + Mobile):

1. **Trip Packages Listing** - Display destination packages with place-aware filtering
2. **Custom Itinerary Creator** - Allow users to build custom trips by selecting activities

Both features require code refactoring for maintainability and consistency.

---

## 📋 Part 1: Trip Packages Listing

### A. Web App Implementation

#### **Scope**

- **File**: `app/(path)/destinations/[id]/packages/page.tsx`
- **Type**: Server Component (Next.js 15+ App Router)
- **Purpose**: Display all trip packages for a destination with filtering

#### **Requirements**

1. **Data Fetching**
   - Fetch from Firestore collection `tripPackages`
   - Filter by `destinationId` matching route param
   - Sort by `price` ascending (cheapest first)
   - Query destination name from `destinations` collection for fallback

2. **Data Structure** - Must match this interface:

   ```typescript
   interface TripPackage {
     id: string;
     destinationId: string;
     title: string;
     duration: string; // e.g., "3 days, 2 nights"
     price: number; // per person
     inclusions: string[]; // What's included
     dailySchedule: {
       // Detailed breakdown
       day: number;
       activities: string[];
     }[];
     imageUrl?: string;
     packageLocation?: string; // Specific location (e.g., "White Beach")
     destinationLocation?: string; // Fallback destination name
   }
   ```

3. **UI/UX Features**
   - Display hero image (background layer)
   - Show destination header with breadcrumb
   - Filter by place/location (dropdown with available places)
   - Cards for each package showing:
     - Image
     - Title
     - Duration
     - Price per person
     - Brief description/inclusions
     - "View Details" or "Book Now" button
   - Loading state with skeleton loaders
   - Error state with user-friendly message

4. **Filtering Logic**
   - Extract unique places from packages
   - Filter `packageLocation` OR `destinationLocation` (case-insensitive)
   - Show "All Packages" option in dropdown
   - Update URL query params when filter changes (e.g., `?place=White Beach`)

5. **Navigation**
   - Link to individual package detail page: `/destinations/[id]/packages/[packageId]`
   - Link to customize (custom itinerary): `/destinations/[id]/customize`
   - Back navigation to destination detail

6. **Error Handling**
   - Handle async params properly: `params: Promise<{ id: string }>`
   - Catch Firestore errors
   - Show 404 if destination doesn't exist
   - Show empty state if no packages available

#### **Implementation Checklist**

- [ ] Create server component with async params
- [ ] Fetch destination data from Firestore
- [ ] Fetch trip packages with WHERE filter
- [ ] Extract available places for filter
- [ ] Create PackageCard component (reusable)
- [ ] Implement place filter dropdown
- [ ] Add filter URL query params
- [ ] Create PageHeading component with breadcrumb
- [ ] Add loading skeleton UI
- [ ] Add error boundary
- [ ] Add empty state UI
- [ ] Style with Tailwind CSS
- [ ] Test with different destinations
- [ ] Test filter functionality
- [ ] Test navigation links

---

### B. Mobile App Implementation

#### **Scope**

- **Files**:
  - `app/(destination)/packages.tsx` (new) OR integrate into destination detail
  - `components/PackageCard.tsx` (new)
- **Type**: Functional component (React Native)
- **Purpose**: Display packages similar to web but optimized for mobile

#### **Requirements**

1. **Data Fetching**
   - Same Firestore queries as web
   - Use custom hook: `useDestinationPackages(destinationId)`
   - Real-time listener optional (consider performance)

2. **UI Components**
   - FlatList with PackageCard items
   - Pull-to-refresh support
   - Horizontal scrollable filter pills
   - Package card with image, title, price, duration

3. **Features**
   - Filter by place with horizontal scroll pills
   - Tap card to navigate to booking or detail
   - Loading indicator (ActivityIndicator)
   - Error handling with retry button

4. **Navigation**
   - Tap package to go to booking or detail
   - Tap filter pill to update list
   - Back button to destination

#### **Implementation Checklist**

- [ ] Create custom hook `useDestinationPackages`
- [ ] Create PackageCard component for mobile
- [ ] Create filter pills component
- [ ] Add FlatList rendering
- [ ] Implement pull-to-refresh
- [ ] Add loading state
- [ ] Add error state with retry
- [ ] Test on Android emulator
- [ ] Test on iOS simulator

---

## 📋 Part 2: Custom Itinerary Creator

### A. Web App Implementation

#### **Scope**

- **File**: `app/(path)/destinations/[id]/customize/page.tsx`
- **Type**: Client Component (interactive)
- **Purpose**: Let users build custom trips by selecting activities

#### **Requirements**

1. **Data Fetching**
   - Fetch destination details
   - Fetch all activities for destination from `activities` collection
   - Sort by category and price

2. **Data Structures** - Must match these interfaces:

   ```typescript
   type Activity = {
     id: string;
     title: string;
     category?: string; // "Adventure", "Food", "Culture", "Nature"
     price: number; // per person
     durationHours?: number | null; // How long
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
     startDate?: string; // ISO format
     endDate?: string; // ISO format
     travelers: number;
     chosenActivities: ChosenActivity[];
     totalBudget: number; // travelers * sum(prices)
     specialRequests?: string;
   };
   ```

3. **UI/UX Components**
   - Hero section with destination image
   - Activity search bar (search by title/description)
   - Category filter tabs (Adventure, Food, Culture, Nature, All)
   - Activity list/grid with cards showing:
     - Image
     - Title
     - Category badge with color
     - Price per person
     - Duration
     - Day recommendation (if available)
   - Selected activities section showing:
     - Which activities selected
     - Which day assigned
     - Individual price × travelers
   - Summary card showing:
     - Total activities selected
     - Total budget (activities sum × travelers)
     - Travelers count (with +/- buttons)
     - Trip duration (estimated from day assignments)
   - "Continue to Booking" button

4. **Interactions**
   - Click activity card to select/deselect
   - Choose day from dropdown/buttons when selecting
   - Drag-and-drop day assignment (optional - can use click)
   - Update +/- travelers count
   - Search filters activities in real-time
   - Category filter updates immediately
   - Budget recalculates on every change

5. **Features**
   - Real-time budget calculation
   - Category color coding for visual appeal
   - Activity recommendations by day
   - Max 7 days (or configurable)
   - Prevent duplicate activities per day (optional)
   - Show estimated daily costs

6. **Session/Storage**
   - Save to session/localStorage while building
   - Pass itinerary to booking page on "Continue"
   - Allow editing before booking
   - Show confirmation on "Book Now"

7. **Error Handling**
   - Handle async params: `params: Promise<{ id: string }>`
   - Handle Firestore errors
   - Show 404 if destination not found
   - Show error if activities not found
   - Validate selections before booking

#### **Implementation Checklist**

- [ ] Create client component with proper hooks
- [ ] Fetch destination and activities from Firestore
- [ ] Create ActivityCard component (reusable)
- [ ] Create CategoryFilter component with tabs
- [ ] Implement search functionality (useMemo for performance)
- [ ] Create SelectedActivities summary section
- [ ] Create BudgetSummary component
- [ ] Implement day selector (for each activity)
- [ ] Add +/- travelers controls
- [ ] Real-time budget calculation
- [ ] Implement "Continue to Booking" flow
- [ ] Add loading state
- [ ] Add error boundary
- [ ] Test search/filter performance
- [ ] Test budget calculation accuracy
- [ ] Test navigation to booking
- [ ] Mobile responsive design

---

### B. Mobile App Implementation

#### **Scope**

- **File**: `app/(destination)/[id]/customize.tsx` (new)
- **Type**: Functional component (React Native)
- **Purpose**: Mobile-optimized custom itinerary builder

#### **Requirements**

1. **Layout**
   - ScrollView for vertical scroll
   - Hero image at top
   - Search bar below
   - Category filter pills (horizontal scroll)
   - Activity FlatList
   - Sticky footer with summary & CTA button

2. **Components**
   - SearchBar (TextInput)
   - FilterPills (horizontal FlatList)
   - ActivityCard (customized for mobile)
   - DaySelector (Modal or Picker)
   - SummaryCard (sticky footer)
   - TravelerCounter (+/- buttons)

3. **Interactions**
   - Tap activity to open day picker
   - Long-press for quick add (default day)
   - Swipe to remove from selection (optional)
   - Tap summary card to expand/collapse

4. **Performance**
   - Use React.memo for cards
   - Lazy load images
   - Debounce search
   - FlatList optimization (removeClippedSubviews, maxToRenderPerBatch)

#### **Implementation Checklist**

- [ ] Create custom hook `useCustomItinerary`
- [ ] Create ActivityCard for mobile
- [ ] Create FilterPills component
- [ ] Create DaySelector (Modal/Picker)
- [ ] Implement search with debounce
- [ ] Create SummaryCard component
- [ ] Add FlatList with proper optimization
- [ ] Implement sticky footer
- [ ] Test on Android
- [ ] Test on iOS
- [ ] Test performance with many activities

---

## 🔄 Part 3: Code Refactoring Requirements

### A. Extract Shared Utilities

Create shared TypeScript utilities that work on both web and mobile:

#### **1. File**: `lib/activities.ts` (Web) + `src/lib/activities.ts` (Mobile)

```typescript
// Calculate total budget
export const calculateBudget = (
  activities: Activity[],
  travelers: number,
): number => {
  return activities.reduce((sum, act) => sum + act.price, 0) * travelers;
};

// Filter activities by search term
export const filterBySearch = (
  activities: Activity[],
  searchTerm: string,
): Activity[] => {
  if (!searchTerm) return activities;
  const lower = searchTerm.toLowerCase();
  return activities.filter(
    (act) =>
      act.title.toLowerCase().includes(lower) ||
      act.description?.toLowerCase().includes(lower),
  );
};

// Filter by category
export const filterByCategory = (
  activities: Activity[],
  category: string,
): Activity[] => {
  if (category === "All" || !category) return activities;
  return activities.filter((act) => act.category === category);
};

// Sort activities
export const sortActivities = (
  activities: Activity[],
  sortBy: "price" | "duration" | "recommended",
): Activity[] => {
  const sorted = [...activities];
  switch (sortBy) {
    case "price":
      return sorted.sort((a, b) => a.price - b.price);
    case "duration":
      return sorted.sort(
        (a, b) => (a.durationHours || 0) - (b.durationHours || 0),
      );
    case "recommended":
      return sorted.sort(
        (a, b) => (a.dayRecommendation || 0) - (b.dayRecommendation || 0),
      );
    default:
      return sorted;
  }
};

// Get available places from packages
export const getAvailablePlaces = (packages: TripPackage[]): string[] => {
  const places = packages
    .map((pkg) => pkg.packageLocation || pkg.destinationLocation || "")
    .filter(Boolean)
    .map((p) => p.trim());
  return Array.from(new Set(places)); // Remove duplicates
};
```

#### **2. File**: `lib/booking.ts` (Web) + `src/lib/booking.ts` (Mobile)

```typescript
// Create booking data structure
export const createBookingData = (
  userId: string,
  destination: Destination,
  itinerary: CustomItinerary,
  tripType: "package" | "custom" | "itinerary" | "promo",
): Partial<Booking> => {
  return {
    userId,
    destinationId: destination.id,
    destination: destination.name,
    tripType,
    travelers: itinerary.travelers,
    price: 0, // Set by caller
    totalPrice: itinerary.totalBudget,
    departureDate:
      itinerary.startDate || new Date().toISOString().split("T")[0],
    returnDate: itinerary.endDate,
    specialRequests: itinerary.specialRequests,
    status: "pending_payment" as const,
    createdAt: new Date(),
  };
};

// Validate booking data
export const validateBooking = (
  booking: Partial<Booking>,
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!booking.userId) errors.push("User ID required");
  if (!booking.destinationId) errors.push("Destination required");
  if (!booking.travelers || booking.travelers < 1)
    errors.push("At least 1 traveler required");
  if (!booking.departureDate) errors.push("Departure date required");
  if (!booking.totalPrice || booking.totalPrice <= 0)
    errors.push("Invalid price");

  return {
    valid: errors.length === 0,
    errors,
  };
};
```

#### **3. File**: `lib/firestore.ts` (Web) + `src/lib/firestore.ts` (Mobile)

```typescript
// Reusable Firestore queries
export const fetchDestinationPackages = async (
  db: Firestore,
  destinationId: string,
): Promise<TripPackage[]> => {
  const snapshot = await getDocs(
    query(
      collection(db, "tripPackages"),
      where("destinationId", "==", destinationId),
      orderBy("price", "asc"),
    ),
  );
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as TripPackage,
  );
};

export const fetchDestinationActivities = async (
  db: Firestore,
  destinationId: string,
): Promise<Activity[]> => {
  const snapshot = await getDocs(
    query(
      collection(db, "activities"),
      where("destinationId", "==", destinationId),
      orderBy("price", "asc"),
    ),
  );
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as Activity,
  );
};

export const fetchDestination = async (
  db: Firestore,
  destinationId: string,
): Promise<Destination | null> => {
  const snap = await getDoc(doc(db, "destinations", destinationId));
  return snap.exists()
    ? ({ id: snap.id, ...snap.data() } as Destination)
    : null;
};

export const saveBooking = async (
  db: Firestore,
  bookingData: Partial<Booking>,
): Promise<string> => {
  const docRef = await addDoc(collection(db, "bookings"), {
    ...bookingData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};
```

### B. Create Reusable Hooks

#### **Web**: `lib/hooks/useActivities.ts`

```typescript
export const useActivities = (destinationId: string) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchDestinationActivities(db, destinationId);
        setActivities(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [destinationId]);

  return { activities, loading, error };
};

export const useCustomItinerary = () => {
  const [itinerary, setItinerary] = useState<CustomItinerary>({
    destinationId: "",
    destination: "",
    location: "",
    travelers: 1,
    chosenActivities: [],
    totalBudget: 0,
  });

  const addActivity = (activity: Activity, day: number) => {
    setItinerary((prev) => ({
      ...prev,
      chosenActivities: [...prev.chosenActivities, { ...activity, day }],
      totalBudget: calculateBudget(
        [...prev.chosenActivities, activity],
        prev.travelers,
      ),
    }));
  };

  const removeActivity = (activityId: string) => {
    setItinerary((prev) => {
      const updated = prev.chosenActivities.filter((a) => a.id !== activityId);
      return {
        ...prev,
        chosenActivities: updated,
        totalBudget: calculateBudget(
          updated.map((a) => ({ ...a })),
          prev.travelers,
        ),
      };
    });
  };

  const setTravelers = (count: number) => {
    setItinerary((prev) => ({
      ...prev,
      travelers: count,
      totalBudget: calculateBudget(prev.chosenActivities, count),
    }));
  };

  return { itinerary, addActivity, removeActivity, setTravelers };
};
```

#### **Mobile**: `hooks/useCustomItinerary.ts` (similar)

### C. Type Definitions

Create unified type file accessible by both platforms:

#### **Shared**: `types/shared.ts` (commit to monorepo root)

```typescript
// All interfaces used across web and mobile
export interface Activity {
  id: string;
  title: string;
  category?: string;
  price: number;
  durationHours?: number | null;
  dayRecommendation?: number | null;
  description?: string;
  imageUrl?: string;
  destinationId: string;
}

export interface TripPackage {
  id: string;
  destinationId: string;
  title: string;
  duration: string;
  price: number;
  inclusions: string[];
  dailySchedule: { day: number; activities: string[] }[];
  imageUrl?: string;
  packageLocation?: string;
  destinationLocation?: string;
}

export interface Destination {
  id: string;
  name: string;
  location: string;
  description?: string;
  imageUrl?: string;
  price
```
