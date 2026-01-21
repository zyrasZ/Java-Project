import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';

/**
 * Simple Whiteboard Component (No real-time sync)
 * Dùng component này nếu chưa setup Liveblocks
 */
const SimpleWhiteboard = () => {
  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100%',
      minHeight: '500px'
    }}>
      <Tldraw autoFocus />
    </div>
  );
};

export default SimpleWhiteboard;
