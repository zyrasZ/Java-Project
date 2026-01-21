import { useEffect, useState, useCallback, useRef } from 'react';
import { Tldraw, createTLStore, defaultShapeUtils } from 'tldraw';
import { useRoom, useBroadcastEvent, useEventListener } from '../config/liveblocks';
import 'tldraw/tldraw.css';
import { Spin, Alert } from 'antd';

/**
 * Collaborative Whiteboard với Liveblocks Events (KHÔNG dùng Yjs)
 * Dùng broadcast events để sync - đơn giản và trực tiếp
 */
export default function CollaborativeWhiteboard() {
  const room = useRoom();
  const [store, setStore] = useState(null);
  const [error, setError] = useState(null);
  const broadcast = useBroadcastEvent();
  
  // Use ref to track if we're applying remote changes (persist across renders)
  const isApplyingRemoteChanges = useRef(false);
  const pendingChanges = useRef([]);
  const applyTimer = useRef(null);

  useEffect(() => {
    if (!room) return;

    let tlStore;
    let unsubscribe;

    const setupCollaboration = async () => {
      try {
        console.log('🎨 Setting up Tldraw with Liveblocks Events...');

        // Create Tldraw store
        tlStore = createTLStore({
          shapeUtils: defaultShapeUtils,
        });

        // Listen to Tldraw changes and broadcast to other clients
        unsubscribe = tlStore.listen((entry) => {
          // CRITICAL: Check ref value to prevent loop
          if (isApplyingRemoteChanges.current) {
            console.log('⏭️ Skipping broadcast (applying remote changes)');
            return;
          }

          const { changes } = entry;
          
          const addedCount = Object.keys(changes.added).length;
          const updatedCount = Object.keys(changes.updated).length;
          const removedCount = Object.keys(changes.removed).length;

          if (addedCount > 0 || updatedCount > 0 || removedCount > 0) {
            // OPTIMIZATION: Skip pointer updates (too frequent, not important)
            const filteredAdded = Object.values(changes.added).filter(r => !r.id.includes('pointer'));
            const filteredUpdated = Object.values(changes.updated)
              .filter(([, to]) => !to.id.includes('pointer'))
              .map(([, to]) => to);
            const filteredRemoved = Object.values(changes.removed)
              .filter(r => !r.id.includes('pointer'))
              .map(r => r.id);

            const hasRealChanges = 
              filteredAdded.length > 0 || 
              filteredUpdated.length > 0 || 
              filteredRemoved.length > 0;

            if (hasRealChanges) {
              console.log(`📤 Broadcasting changes: +${filteredAdded.length} ~${filteredUpdated.length} -${filteredRemoved.length}`);
              
              // Broadcast changes to other clients
              broadcast({
                type: 'tldraw-changes',
                changes: {
                  added: filteredAdded,
                  updated: filteredUpdated,
                  removed: filteredRemoved,
                }
              });
            }
          }
        }, { scope: 'all' });

        console.log('✅ Collaboration setup complete');
        setStore(tlStore);
      } catch (err) {
        console.error('❌ Error setting up collaboration:', err);
        setError(err.message);
      }
    };

    setupCollaboration();

    // Cleanup
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (tlStore) {
        tlStore.dispose();
      }
    };
  }, [room, broadcast]);

  // Listen for changes from other clients
  useEventListener(useCallback(({ event }) => {
    if (!store) return;
    if (event.type !== 'tldraw-changes') return;

    console.log('📥 Received changes from another client');
    const { changes } = event;

    // OPTIMIZATION: Batch multiple changes together
    pendingChanges.current.push(changes);

    // Clear existing timer
    if (applyTimer.current) {
      clearTimeout(applyTimer.current);
    }

    // Apply changes after a short delay (batching)
    applyTimer.current = setTimeout(() => {
      if (pendingChanges.current.length === 0) return;

      console.log(`📦 Applying ${pendingChanges.current.length} batched changes`);

      // CRITICAL: Set flag BEFORE applying changes
      isApplyingRemoteChanges.current = true;

      try {
        store.mergeRemoteChanges(() => {
          // Merge all pending changes
          const allAdded = [];
          const allUpdated = [];
          const allRemoved = [];

          pendingChanges.current.forEach((change) => {
            if (change.added) allAdded.push(...change.added);
            if (change.updated) allUpdated.push(...change.updated);
            if (change.removed) allRemoved.push(...change.removed);
          });

          // Apply merged changes
          if (allAdded.length > 0) {
            store.put(allAdded);
            console.log(`  ✓ Added ${allAdded.length} records`);
          }

          if (allUpdated.length > 0) {
            store.put(allUpdated);
            console.log(`  ✓ Updated ${allUpdated.length} records`);
          }

          if (allRemoved.length > 0) {
            store.remove(allRemoved);
            console.log(`  ✓ Removed ${allRemoved.length} records`);
          }
        });

        console.log('✅ Remote changes applied');
      } catch (err) {
        console.error('❌ Error applying remote changes:', err);
      } finally {
        // Clear pending changes
        pendingChanges.current = [];

        // CRITICAL: Reset flag AFTER applying changes
        setTimeout(() => {
          isApplyingRemoteChanges.current = false;
          console.log('🔓 Remote changes flag reset');
        }, 50); // Reduced from 100ms to 50ms
      }
    }, 16); // 16ms = 60fps - batch changes within one frame
  }, [store]));

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        padding: '24px'
      }}>
        <Alert
          message="Lỗi kết nối"
          description={`Không thể kết nối Liveblocks: ${error}`}
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (!store) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        minHeight: '500px'
      }}>
        <Spin size="large" tip="Đang kết nối..." />
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0,
      width: '100%',
      height: '100%'
    }}>
      <Tldraw
        store={store}
        autoFocus
      />
    </div>
  );
}
