import { useEffect, useState } from 'react';
import { Tldraw, createTLStore, defaultShapeUtils } from 'tldraw';
import { useRoom, useStorage, useMutation } from '../config/liveblocks';
import 'tldraw/tldraw.css';
import { Spin, Alert } from 'antd';

/**
 * Collaborative Whiteboard với Liveblocks Storage (KHÔNG dùng Yjs)
 * Đơn giản hơn, ổn định hơn
 */
export default function CollaborativeWhiteboard() {
  const room = useRoom();
  const [store, setStore] = useState(null);
  const [error, setError] = useState(null);

  // Get shapes from Liveblocks Storage
  const shapes = useStorage((root) => root.shapes);

  // Mutation to update shapes
  const updateShapes = useMutation(({ storage }, newShapes) => {
    storage.set('shapes', newShapes);
  }, []);

  useEffect(() => {
    if (!room) return;

    let tlStore;
    let unsubscribe;
    let isApplyingRemoteChanges = false;

    const setupCollaboration = async () => {
      try {
        console.log('🎨 Setting up Tldraw with Liveblocks Storage...');

        // Create Tldraw store
        tlStore = createTLStore({
          shapeUtils: defaultShapeUtils,
        });

        // Listen to Tldraw changes and sync to Liveblocks
        unsubscribe = tlStore.listen((entry) => {
          if (isApplyingRemoteChanges) return;

          const { changes } = entry;
          const hasChanges = 
            Object.keys(changes.added).length > 0 ||
            Object.keys(changes.updated).length > 0 ||
            Object.keys(changes.removed).length > 0;

          if (hasChanges) {
            console.log('📤 Sending changes to Liveblocks Storage');
            
            // Get all records from store
            const allRecords = tlStore.allRecords();
            const shapesData = {};
            
            allRecords.forEach((record) => {
              shapesData[record.id] = record;
            });

            // Update Liveblocks Storage
            updateShapes(shapesData);
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
  }, [room, updateShapes]);

  // Apply remote changes from Liveblocks Storage
  useEffect(() => {
    if (!store || !shapes) return;

    console.log('📥 Received shapes from Liveblocks Storage:', Object.keys(shapes).length);

    let isApplyingRemoteChanges = true;

    try {
      store.mergeRemoteChanges(() => {
        const records = Object.values(shapes);
        if (records.length > 0) {
          store.put(records);
          console.log('✅ Applied', records.length, 'shapes');
        }
      });
    } finally {
      isApplyingRemoteChanges = false;
    }
  }, [store, shapes]);

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
