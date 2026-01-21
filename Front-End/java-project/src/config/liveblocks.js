import { createClient } from '@liveblocks/client';
import { createRoomContext } from '@liveblocks/react';

// ⚠️ QUAN TRỌNG: Thay YOUR_PUBLIC_KEY bằng key thật từ https://liveblocks.io
// Ví dụ: pk_dev_znTFYBZvTi_J3g8rr4t5sREqWfXdGm8Ec9KcvvUJPeOq3fqwPtBDjSTdX_Em6lOn
const PUBLIC_KEY = "pk_dev_znTFYBZvTi_J3g8rr4t5sREqWfXdGm8Ec9KcvvUJPeOq3fqwPtBDjSTdX_Em6lOn";

const client = createClient({
  publicApiKey: PUBLIC_KEY,
  throttle: 16,
});

export const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useUpdateMyPresence,
  useSelf,
  useOthers,
  useOthersMapped,
  useOthersConnectionIds,
  useOther,
  useBroadcastEvent,
  useEventListener,
  useErrorListener,
  useStorage,
  useMutation,
  useBatch,
  useHistory,
  useUndo,
  useRedo,
  useCanUndo,
  useCanRedo,
  useStatus,
  useLostConnectionListener,
} = createRoomContext(client);

export default client;
