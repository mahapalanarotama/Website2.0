import React from "react";

interface DraggableListProps<T> {
  items: T[];
  renderItem: (item: T, idx: number, dragHandleProps: any) => React.ReactNode;
  onChange: (newItems: T[]) => void;
}

export function DraggableList<T>({ items, renderItem, onChange }: DraggableListProps<T>) {
  const dragItem = React.useRef<number | null>(null);
  const dragOverItem = React.useRef<number | null>(null);

  const handleDragStart = (idx: number) => {
    dragItem.current = idx;
  };
  const handleDragEnter = (idx: number) => {
    dragOverItem.current = idx;
  };
  const handleDragEnd = () => {
    const from = dragItem.current;
    const to = dragOverItem.current;
    if (from !== null && to !== null && from !== to) {
      const newItems = [...items];
      const [removed] = newItems.splice(from, 1);
      newItems.splice(to, 0, removed);
      onChange(newItems);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <div>
      {items.map((item, idx) => (
        <div
          key={idx}
          draggable
          onDragStart={() => handleDragStart(idx)}
          onDragEnter={() => handleDragEnter(idx)}
          onDragEnd={handleDragEnd}
          onDragOver={e => e.preventDefault()}
          style={{ cursor: "grab" }}
        >
          {renderItem(item, idx, { draggable: true })}
        </div>
      ))}
    </div>
  );
}
