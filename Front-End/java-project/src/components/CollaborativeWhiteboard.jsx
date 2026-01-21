import { useEffect, useState } from 'react';
import { Tldraw, createTLStore, defaultShapeUtils } from 'tldraw';
import { useRoom } from '../config/liveblocks';
import { LiveblocksYjsProvider } from '@liveblocks/yjs';
import * as Y from 'yjs';
import 'tldraw/tldraw.css';
import { Spin, Alert } from 'antd';

/**
 * Collaborative Whiteboard với Liveblocks + Yjs + Tldraw
 * Real-time collaborative drawing - syncs at record level
 */
export default function CollaborativeWhiteboard() {
  const room = useRoom();
  const [store, setStore] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!room) return;

    let yDoc;
    let yProvider;
    let tlStore;
    let unsubscribe;

    const setupCollaboration = async () => {
      try {
        console.log('Setting up collaboration...');
        
        // Create Yjs document
        yDoc = new Y.Doc();
        
        // Create Liveblocks Yjs provider
        yProvider = new LiveblocksYjsProvider(room, yDoc);
        
        // Debug provider events
        yProvider.on('sync', (isSynced) => {
          console.log('🔄 Yjs Provider sync event:', isSynced);
        });
        
        yProvider.on('status', (event) => {
          console.log('📡 Yjs Provider status:', event.status);
        });
        
        yProvider.awareness.on('change', () => {
          console.log('👥 Awareness changed, states:', yProvider.awareness.getStates().size);
        });
        
        console.log('📡 Yjs Provider created, synced:', yProvider.synced);

        // Wait for initial sync
        await new Promise((resolve) => {
          const timeout = setTimeout(() => {
            console.warn('Sync timeout - continuing anyway');
            resolve(); // Don't reject, just continue
          }, 5000);

          if (yProvider.synced) {
            clearTimeout(timeout);
            console.log('Already synced');
            resolve();
          } else {
            yProvider.on('sync', (isSynced) => {
              if (isSynced) {
                clearTimeout(timeout);
                console.log('Synced successfully');
                resolve();
              }
            });
          }
        });

        // Create Tldraw store
        tlStore = createTLStore({
          shapeUtils: defaultShapeUtils,
        });

        // Use Y.Map to store records by ID
        const yRecords = yDoc.getMap('tldraw_records');
        console.log('📦 Y.Map created, current size:', yRecords.size);

        // Generate unique client ID for this session
        const clientId = `client-${Math.random().toString(36).substr(2, 9)}`;
        console.log('🆔 Client ID:', clientId);

        // Track if we're applying remote changes to avoid loops
        let isApplyingRemoteChanges = false;

        // Sync Tldraw changes to Yjs
        console.log('🎧 Setting up Tldraw listener...');
        unsubscribe = tlStore.listen((entry) => {
          if (isApplyingRemoteChanges) {
            console.log('⏭️ Skipping (applying remote changes)');
            return;
          }
          
          const { changes, source } = entry;
          console.log('👂 Store change detected, source:', source);
          
          const addedCount = Object.keys(changes.added).length;
          const updatedCount = Object.keys(changes.updated).length;
          const removedCount = Object.keys(changes.removed).length;
          
          if (addedCount > 0 || updatedCount > 0 || removedCount > 0) {
            console.log(`📤 Sending changes: +${addedCount} ~${updatedCount} -${removedCount}`);
          }
          
          yDoc.transact(() => {
            // Handle added/updated records
            Object.values(changes.added).forEach((record) => {
              const recordStr = JSON.stringify(record);
              yRecords.set(record.id, recordStr);
              console.log(`  ➕ Added: ${record.typeName || record.type} (${record.id})`);
              console.log(`     Size: ${recordStr.length} bytes`);
            });
            
            Object.values(changes.updated).forEach(([, to]) => {
              const recordStr = JSON.stringify(to);
              yRecords.set(to.id, recordStr);
              console.log(`  🔄 Updated: ${to.typeName || to.type} (${to.id})`);
              console.log(`     Size: ${recordStr.length} bytes`);
            });
            
            // Handle removed records
            Object.values(changes.removed).forEach((record) => {
              yRecords.delete(record.id);
              console.log(`  ➖ Removed: ${record.id}`);
            });
            
            console.log(`📊 Y.Map now has ${yRecords.size} records`);
          }, clientId); // Pass clientId as transaction origin
          
          console.log('✅ Changes sent to Yjs, Y.Map size:', yRecords.size);
        }, { scope: 'all' }); // Remove source: 'user' to catch ALL changes

        // Sync Yjs changes to Tldraw
        console.log('🎧 Setting up Yjs observer...');
        yRecords.observe((event) => {
          const changesCount = event.changes.keys.size;
          console.log('🔔 Yjs observe triggered! Changes:', changesCount);
          
          // Check transaction origin
          const transaction = event.transaction;
          const origin = transaction.origin;
          console.log('📍 Change origin:', origin, 'Our client:', clientId);
          
          // ONLY skip if we're currently applying remote changes (to prevent infinite loop)
          // DO NOT skip based on origin - we need to apply changes from other clients!
          if (isApplyingRemoteChanges) {
            console.log('⏭️ Skipping (already applying remote changes - prevent loop)');
            return;
          }
          
          // Skip our own local changes (they're already in Tldraw)
          if (origin === clientId) {
            console.log('⏭️ Skipping (our own local change - already in Tldraw)');
            return;
          }
          
          // This is a remote change from another client - apply it!
          if (changesCount > 0) {
            console.log(`📥 Receiving ${changesCount} changes from another client!`);
          }
          
          isApplyingRemoteChanges = true;
          
          try {
            tlStore.mergeRemoteChanges(() => {
              // Handle added/updated records
              event.changes.keys.forEach((change, key) => {
                if (change.action === 'add' || change.action === 'update') {
                  const recordStr = yRecords.get(key);
                  if (recordStr) {
                    try {
                      const record = JSON.parse(recordStr);
                      tlStore.put([record]);
                      console.log(`  ✓ Applied ${change.action}: ${record.typeName || record.type} (${key})`);
                    } catch (err) {
                      console.error('Error parsing record:', err);
                    }
                  }
                } else if (change.action === 'delete') {
                  tlStore.remove([key]);
                  console.log(`  ✓ Removed: ${key}`);
                }
              });
            });
            console.log('✅ Remote changes applied successfully!');
          } catch (err) {
            console.error('❌ Error applying remote changes:', err);
          } finally {
            isApplyingRemoteChanges = false;
          }
        });

        // Load initial records from Yjs
        isApplyingRemoteChanges = true;
        try {
          const records = [];
          yRecords.forEach((recordStr) => {
            try {
              records.push(JSON.parse(recordStr));
            } catch (err) {
              console.error('Error parsing initial record:', err);
            }
          });
          
          if (records.length > 0) {
            tlStore.put(records);
            console.log(`Loaded ${records.length} initial records`);
          }
        } finally {
          isApplyingRemoteChanges = false;
        }

        console.log('Collaboration setup complete');
        setStore(tlStore);
      } catch (err) {
        console.error('Error setting up collaboration:', err);
        setError(err.message);
      }
    };

    setupCollaboration();

    // Cleanup
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (yProvider) {
        yProvider.destroy();
      }
      if (yDoc) {
        yDoc.destroy();
      }
      if (tlStore) {
        tlStore.dispose();
      }
    };
  }, [room]);

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
          description={`Không thể kết nối Liveblocks: ${error}. Vui lòng kiểm tra API key.`}
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
