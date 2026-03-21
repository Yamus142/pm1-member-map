import { db } from './firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';

const COLLECTION = 'members';

export function subscribeMembers(callback) {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const members = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(members);
  }, (error) => {
    console.error('Firestore subscription error:', error);
    callback([]);
  });
  return unsubscribe;
}

export async function addMember(member) {
  await addDoc(collection(db, COLLECTION), {
    name: member.name,
    province: member.province,
    ward: member.ward || '',
    createdAt: serverTimestamp(),
  });
}

export async function deleteMember(id) {
  await deleteDoc(doc(db, COLLECTION, id));
}
