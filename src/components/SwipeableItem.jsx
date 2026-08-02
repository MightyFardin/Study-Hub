import React, { useState, useRef } from 'react';
import { Trash2, Edit2 } from 'lucide-react';

export default function SwipeableItem({ children, onDelete, onEdit }) {
  const [offset, setOffset] = useState(0);
  const startX = useRef(0);
  const isDragging = useRef(false);

  const handleStart = (clientX) => {
    startX.current = clientX;
    isDragging.current = true;
  };

  const handleMove = (clientX) => {
    if (!isDragging.current) return;
    const diffX = clientX - startX.current;
    
    // Only move if we have the corresponding action handler
    if (diffX < 0 && onDelete) {
      setOffset(Math.max(diffX, -80));
    } else if (diffX > 0 && onEdit) {
      setOffset(Math.min(diffX, 80));
    } else {
      setOffset(0);
    }
  };

  const handleEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    // Trigger actions if dragged past threshold
    if (offset <= -60 && onDelete) {
      onDelete();
    } else if (offset >= 60 && onEdit) {
      onEdit();
    }
    
    // Always bounce back
    setOffset(0);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-rose-50 dark:bg-rose-900/20" style={{ touchAction: 'pan-y' }}>
      {/* Background Action Indicators */}
      <div className="absolute inset-0 flex items-center justify-between px-5 z-0">
        {onEdit ? (
          <div className="flex-1 flex items-center justify-start text-emerald-500 opacity-80">
            <Edit2 size={20} />
          </div>
        ) : <div />}
        
        {onDelete ? (
          <div className="flex-1 flex items-center justify-end text-rose-500 opacity-80">
            <Trash2 size={20} />
          </div>
        ) : <div />}
      </div>

      {/* Draggable Foreground Content */}
      <div
        className="relative z-10 w-full transition-transform duration-200 ease-out bg-white dark:bg-[#111]"
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={() => { if (isDragging.current) handleEnd(); }}
      >
        {children}
      </div>
    </div>
  );
}
