const DB_NAME = 'InterviewRecordingsDB';
const STORE_NAME = 'recordings';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

const openDB = (): Promise<IDBDatabase> => {
  if (dbPromise) {
    return dbPromise;
  }
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject('Error opening IndexedDB.');
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
  return dbPromise;
};

export const saveBlob = async (blob: Blob): Promise<string> => {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  const id = `rec_${new Date().getTime()}_${Math.random()}`;
  
  return new Promise((resolve, reject) => {
    const request = store.put(blob, id);
    request.onsuccess = () => resolve(id);
    request.onerror = () => {
      console.error('Error saving blob to IndexedDB:', request.error);
      reject('Failed to save recording.');
    };
  });
};

export const getBlob = async (id: string): Promise<Blob | null> => {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, 'readonly');
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => {
      resolve(request.result ? (request.result as Blob) : null);
    };
    request.onerror = () => {
      console.error('Error retrieving blob from IndexedDB:', request.error);
      reject('Failed to retrieve recording.');
    };
  });
};
