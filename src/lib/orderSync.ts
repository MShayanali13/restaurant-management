import { MenuType } from '@/types/MenuType';
import { initDB } from './indexedDB';

let syncTimeout: ReturnType<typeof setTimeout> | null = null;
let latestOrderToSync: { tableNumber: string; items: MenuType[] } | null = null;

/**
 * Save order to IndexedDB and debounce sync to server
 */
export const saveOrderDebounced = async (
  tableNumber: string,
  items: MenuType[]
) => {
  const db = await initDB();
  const updatedAt = new Date().toISOString();

  // Save order to local IndexedDB
  await db.put('tempOrders', { tableNumber, items, updatedAt });
  console.log(`[💾] Order saved locally for Table ${tableNumber}`);

  // Update latest for queued sync
  latestOrderToSync = { tableNumber, items };

  // Reset debounce timer
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    if (latestOrderToSync) {
      syncOrderToServer(latestOrderToSync.tableNumber, latestOrderToSync.items);
      latestOrderToSync = null;
    }
  }, 500); // 0.5 seconds delay
};

/**
 * Actually sends order data to server
 */
const syncOrderToServer = async (
  tableNumber: string,
  items: MenuType[]
) => {
  try {
    const res = await fetch('/api/save-temp-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableNumber, items }),
    });

    const result = await res.json();
    if (result.ok) {
      console.log(`[✅] Synced order to server for Table ${tableNumber}`);
    } else {
      console.error(`[⚠️] Sync failed for Table ${tableNumber}:`, result.error);
    }
  } catch (err) {
    console.error(`[❌] Sync error for Table ${tableNumber}:`, err);
  }
};
