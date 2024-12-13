'use client';
import React from 'react';

const DraggableWithZones = () => {
  const [zones, setZones] = React.useState({
    left: Array(4).fill(null),
    right: Array(4).fill(null)
  });
  const [draggedItem, setDraggedItem] = React.useState(null);
  const [availableItems, setAvailableItems] = React.useState([
    { id: 1, color: 'bg-blue-500', text: 'Item 1' },
    { id: 2, color: 'bg-green-500', text: 'Item 2' },
    { id: 3, color: 'bg-yellow-500', text: 'Item 3' },
    { id: 4, color: 'bg-purple-500', text: 'Item 4' }
  ]);
  const [dragOverItemId, setDragOverItemId] = React.useState(null);

  const handleDragStart = (item, source) => {
    setDraggedItem({ ...item, source });
  };

  const handleDrop = (zoneType, index) => {
    if (!draggedItem) return;

    // ตรวจสอบว่าตำแหน่งที่จะวางว่างหรือไม่
    if (zones[zoneType][index] !== null) {
      // ถ้าไม่ว่าง ให้สลับตำแหน่ง
      const existingItem = zones[zoneType][index];
      
      setZones(prev => {
        const newZones = { ...prev };
        
        // ถ้า item ที่ลากมาอยู่ในโซนอื่น ให้ลบออกจากตำแหน่งเดิม
        if (draggedItem.source && draggedItem.source.zoneType) {
          newZones[draggedItem.source.zoneType][draggedItem.source.index] = existingItem;
        } else {
          // ถ้าลากมาจาก available items
          setAvailableItems(prev => [...prev.filter(item => item.id !== draggedItem.id), existingItem]);
        }
        
        newZones[zoneType][index] = draggedItem;
        return newZones;
      });
    } else {
      // ถ้าว่าง ให้วางได้เลย
      setZones(prev => {
        const newZones = { ...prev };
        if (draggedItem.source && draggedItem.source.zoneType) {
          newZones[draggedItem.source.zoneType][draggedItem.source.index] = null;
        }
        newZones[zoneType][index] = draggedItem;
        return newZones;
      });

      if (!draggedItem.source?.zoneType) {
        setAvailableItems(prev => prev.filter(item => item.id !== draggedItem.id));
      }
    }

    setDraggedItem(null);
    setDragOverItemId(null);
  };

  const handleDropToAvailable = (e) => {
    e.preventDefault();
    if (!draggedItem) return;

    // ถ้าลากมาจากโซน
    if (draggedItem.source?.zoneType) {
      setZones(prev => {
        const newZones = { ...prev };
        newZones[draggedItem.source.zoneType][draggedItem.source.index] = null;
        return newZones;
      });
      setAvailableItems(prev => [...prev, draggedItem]);
    } else if (dragOverItemId && draggedItem.id !== dragOverItemId) {
      // สลับตำแหน่งภายใน Available Items
      setAvailableItems(prev => {
        const newItems = [...prev];
        const draggedIndex = newItems.findIndex(item => item.id === draggedItem.id);
        const dropIndex = newItems.findIndex(item => item.id === dragOverItemId);
        [newItems[draggedIndex], newItems[dropIndex]] = [newItems[dropIndex], newItems[draggedIndex]];
        return newItems;
      });
    }

    setDraggedItem(null);
    setDragOverItemId(null);
  };

  const handleDragOver = (e, itemId) => {
    e.preventDefault();
    if (draggedItem?.id !== itemId) {
      setDragOverItemId(itemId);
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItemId(null);
  };

  const resetAll = () => {
    setZones({
      left: Array(4).fill(null),
      right: Array(4).fill(null)
    });
    setAvailableItems([
      { id: 1, color: 'bg-blue-500', text: 'Item 1' },
      { id: 2, color: 'bg-green-500', text: 'Item 2' },
      { id: 3, color: 'bg-yellow-500', text: 'Item 3' },
      { id: 4, color: 'bg-purple-500', text: 'Item 4' }
    ]);
    setDraggedItem(null);
    setDragOverItemId(null);
  };

  const renderDropZone = (zoneType, index) => {
    const item = zones[zoneType][index];
    return (
      <div
        key={`${zoneType}-${index}`}
        className="w-16 h-16 sm:w-24 sm:h-24 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center m-1 sm:m-2 bg-gray-800"
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => handleDrop(zoneType, index)}
      >
        {item && (
          <div
            className={`w-14 h-14 sm:w-20 sm:h-20 ${item.color} rounded-lg flex items-center justify-center text-white cursor-move text-xs sm:text-base`}
            draggable
            onDragStart={() => handleDragStart(item, { zoneType, index })}
          >
            {item.text}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between mb-4 sm:mb-8 gap-4">
          <div className="w-full sm:w-auto">
            <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Available Items:</h2>
            <div 
              className="flex flex-wrap gap-2 sm:gap-4 p-2 sm:p-4 border-2 border-dashed border-gray-600 rounded-lg min-h-20 sm:min-h-24 bg-gray-800"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropToAvailable}
            >
              {availableItems.map(item => (
                <div
                  key={item.id}
                  className={`w-14 h-14 sm:w-20 sm:h-20 ${item.color} rounded-lg flex items-center justify-center text-white cursor-move text-xs sm:text-base 
                    transition-transform duration-200
                    ${dragOverItemId === item.id ? 'scale-110' : ''}`}
                  draggable
                  onDragStart={() => handleDragStart(item, null)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, item.id)}
                >
                  {item.text}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={resetAll}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 w-full sm:w-auto"
          >
            Reset All
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-1/2 p-2 sm:p-4 bg-gray-800 rounded-lg">
            <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Left Zone</h2>
            <div className="grid grid-cols-2 gap-1 sm:gap-2">
              {[0, 1, 2, 3].map(index => 
                renderDropZone('left', index)
              )}
            </div>
          </div>
          
          <div className="w-full sm:w-1/2 p-2 sm:p-4 bg-gray-800 rounded-lg">
            <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Right Zone</h2>
            <div className="grid grid-cols-2 gap-1 sm:gap-2">
              {[0, 1, 2, 3].map(index => 
                renderDropZone('right', index)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraggableWithZones;