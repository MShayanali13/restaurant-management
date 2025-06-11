import { openDB } from 'idb';
import { OrderType } from '@/types/OrderType';

const DB_NAME = 'restaurant-management';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('tempOrders')) {
        db.createObjectStore('tempOrders', { keyPath: 'tableNumber' });
      }
    },
  });
};

export const saveOrderToIndexedDB = async (
  tableNumber: string,
  items: OrderType[]
) => {
  const db = await initDB();
  await db.put('tempOrders', { tableNumber, items });
};

export const getOrderFromIndexedDB = async (tableNumber: string) => {
  const db = await initDB();
  return await db.get('tempOrders', tableNumber);
};


export const deleteOrderFromIndexedDB = async (tableNumber: string) => {
  const db = await openDB("restaurant-management", 1);
  const tx = db.transaction("tempOrders", "readwrite");
  tx.objectStore("tempOrders").delete(tableNumber);
  await tx.done;
};
