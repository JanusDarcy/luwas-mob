import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
  type Firestore,
} from "firebase/firestore";
import type { Activity, Destination, TripPackage } from "../../types/shared";

export const fetchDestination = async (
  db: Firestore,
  destinationId: string
): Promise<Destination | null> => {
  const snap = await getDoc(doc(db, "destinations", destinationId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Destination) : null;
};

export const fetchDestinationPackages = async (
  db: Firestore,
  destinationId: string
): Promise<TripPackage[]> => {
  const snapshot = await getDocs(
    query(
      collection(db, "tripPackages"),
      where("destinationId", "==", destinationId),
      orderBy("price", "asc")
    )
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as TripPackage);
};

export const fetchDestinationActivities = async (
  db: Firestore,
  destinationId: string
): Promise<Activity[]> => {
  const snapshot = await getDocs(
    query(
      collection(db, "activities"),
      where("destinationId", "==", destinationId),
      orderBy("price", "asc")
    )
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Activity);
};

export const saveBooking = async (
  db: Firestore,
  bookingData: Record<string, unknown>
): Promise<string> => {
  const docRef = await addDoc(collection(db, "bookings"), {
    ...bookingData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};
