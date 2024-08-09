import React, { useEffect, useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';

interface DraggableItemProps {
  id: number;
  position: { x: number; y: number };
  onDrag: (id: number, data: DraggableData) => void;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ id, position, onDrag }) => {
  const [status, setStatus] = useState<string>('');

  const handleDrag = (e: DraggableEvent, data: DraggableData) => {
    setStatus('drag');
    onDrag(id, data);
  };

  return (
    <>
      <Draggable
        handle=".handle"
        defaultPosition={position}
        grid={[25, 25]}
        scale={1}
        onStart={() => setStatus('start')}
        onDrag={handleDrag}
        onStop={() => setStatus('stop')}
      >
        <div>
          <div className="bg-white handle">Drag from here</div>
          <div className="bg-white">This readme is really dragging on...</div>
        </div>
      </Draggable>
      <div className='bg-white'>State: {status}</div>
    </>
  );
};

const DragContainer: React.FC = () => {
  const [positions, setPositions] = useState<{ id: number; x: number; y: number }[]>([
    { id: 1, x: 0, y: 0 },
    { id: 2, x: 100, y: 100 },
    // Add more elements as needed
  ]);
  const [draggedOverId, setDraggedOverId] = useState<number | null>(null);

  const handleDrag = (id: number, data: DraggableData) => {
    setPositions((prevPositions) =>
      prevPositions.map((pos) =>
        pos.id === id ? { ...pos, x: data.x, y: data.y } : pos
      )
    );

    const draggedElement = { x: data.x, y: data.y, width: 100, height: 100 }; // Replace with your element dimensions
    const overlappingElement = positions.find(
      (pos) =>
        pos.id !== id &&
        pos.x < draggedElement.x + draggedElement.width &&
        pos.x + draggedElement.width > draggedElement.x &&
        pos.y < draggedElement.y + draggedElement.height &&
        pos.y + draggedElement.height > draggedElement.y
    );

    if (overlappingElement) {
      setDraggedOverId(overlappingElement.id);
    } else {
      setDraggedOverId(null);
    }
  };

  useEffect(() => {
    if (draggedOverId !== null) {
      console.log(`Dragging over element with ID: ${draggedOverId}`);
    }
  }, [draggedOverId]);

  return (
    <div>
      {positions.map((pos) => (
        <DraggableItem
          key={pos.id}
          id={pos.id}
          position={{ x: pos.x, y: pos.y }}
          onDrag={handleDrag}
        />
      ))}
      <div className='bg-white'>
        Dragged over element ID: {draggedOverId !== null ? draggedOverId : 'None'}
      </div>
    </div>
  );
};

export default DragContainer;
