import { useEffect, useState, useRef } from "react";
import { Tldraw, createTLStore, defaultShapeUtils } from "tldraw";
import { useRoom } from "../config/liveblocks";
import "tldraw/tldraw.css";
import { Spin, Alert } from "antd";

/**
 * Collaborative Whiteboard - SIMPLE VERSION
 * Dùng room.subscribe() thay vì hooks phức tạp
 */
export default function CollaborativeWhiteboard() {
  const room = useRoom();
  const [store, setStore] = useState(null);
  const [error, setError] = useState(null);

  const isApplyingRemoteChanges = useRef(false);

  useEffect(() => {
    if (!room) return;

    let tlStore;
    let unsubscribeStore;
    let unsubscribeRoom;

    const setupCollaboration = async () => {
      try {
        console.log("🎨 Setting up Tldraw...");

        // Create Tldraw store
        tlStore = createTLStore({
          shapeUtils: defaultShapeUtils,
        });

        // Listen to Tldraw changes and broadcast
        unsubscribeStore = tlStore.listen(
          (entry) => {
            if (isApplyingRemoteChanges.current) return;

            const { changes } = entry;

            const addedCount = Object.keys(changes.added).length;
            const updatedCount = Object.keys(changes.updated).length;
            const removedCount = Object.keys(changes.removed).length;

            if (addedCount > 0 || updatedCount > 0 || removedCount > 0) {
              // Filter out pointer updates
              const filteredAdded = Object.values(changes.added).filter(
                (r) => !r.id.includes("pointer")
              );
              const filteredUpdated = Object.values(changes.updated)
                .filter(([, to]) => !to.id.includes("pointer"))
                .map(([, to]) => to);
              const filteredRemoved = Object.values(changes.removed)
                .filter((r) => !r.id.includes("pointer"))
                .map((r) => r.id);

              if (
                filteredAdded.length > 0 ||
                filteredUpdated.length > 0 ||
                filteredRemoved.length > 0
              ) {
                console.log(
                  `📤 Broadcasting: +${filteredAdded.length} ~${filteredUpdated.length} -${filteredRemoved.length}`
                );

                // Broadcast using room.broadcastEvent
                room.broadcastEvent({
                  type: "tldraw-changes",
                  added: filteredAdded,
                  updated: filteredUpdated,
                  removed: filteredRemoved,
                });
              }
            }
          },
          { scope: "all" }
        );

        // Listen to events from other clients
        unsubscribeRoom = room.subscribe("event", (eventData) => {
          const { event } = eventData;

          if (event.type !== "tldraw-changes") return;

          console.log("📥 Received changes from another client");

          isApplyingRemoteChanges.current = true;

          try {
            tlStore.mergeRemoteChanges(() => {
              if (event.added && event.added.length > 0) {
                tlStore.put(event.added);
                console.log(`  ✓ Added ${event.added.length} records`);
              }

              if (event.updated && event.updated.length > 0) {
                tlStore.put(event.updated);
                console.log(`  ✓ Updated ${event.updated.length} records`);
              }

              if (event.removed && event.removed.length > 0) {
                tlStore.remove(event.removed);
                console.log(`  ✓ Removed ${event.removed.length} records`);
              }
            });

            console.log("✅ Remote changes applied");
          } catch (err) {
            console.error("❌ Error applying changes:", err);
          } finally {
            setTimeout(() => {
              isApplyingRemoteChanges.current = false;
            }, 50);
          }
        });

        console.log("✅ Collaboration setup complete");
        setStore(tlStore);
      } catch (err) {
        console.error("❌ Setup error:", err);
        setError(err.message);
      }
    };

    setupCollaboration();

    // Cleanup
    return () => {
      if (unsubscribeStore) unsubscribeStore();
      if (unsubscribeRoom) unsubscribeRoom();
      // Note: Tldraw 2.0.2 store doesn't have dispose method
    };
  }, [room]);

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          padding: "24px",
        }}
      >
        <Alert
          message="Lỗi kết nối"
          description={`Không thể kết nối: ${error}`}
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (!store) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          minHeight: "500px",
        }}
      >
        <Spin size="large" tip="Đang kết nối..." />
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <Tldraw store={store} autoFocus />
    </div>
  );
}
