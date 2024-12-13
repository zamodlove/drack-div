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

  const handleDragStart = (item) => {
    setDraggedItem(item);
  };

  const handleDrop = (zoneType, index) => {
    if (!draggedItem) return;

    setZones(prev => {
      const newZones = { ...prev };
      Object.keys(newZones).forEach(zone => {
        const itemIndex = newZones[zone].findIndex(item => item?.id === draggedItem.id);
        if (itemIndex !== -1) {
          newZones[zone][itemIndex] = null;
        }
      });
      newZones[zoneType][index] = draggedItem;
      return newZones;
    });

    setAvailableItems(prev => prev.filter(item => item.id !== draggedItem.id));
    setDraggedItem(null);
    setDragOverItemId(null);
  };

  const handleDropToAvailable = (e) => {
    e.preventDefault();
    if (!draggedItem) return;

    // ถ้าลากมาจากโซน
    const isFromZone = Object.values(zones).flat().some(item => item?.id === draggedItem.id);
    
    if (isFromZone) {
      setZones(prev => {
        const newZones = { ...prev };
        Object.keys(newZones).forEach(zone => {
          newZones[zone] = newZones[zone].map(item => 
            item?.id === draggedItem.id ? null : item
          );
        });
        return newZones;
      });
      setAvailableItems(prev => [...prev, draggedItem]);
    } else if (dragOverItemId && draggedItem.id !== dragOverItemId) {
      // สลับตำแหน่งภายใน Available Items
      setAvailableItems(prev => {
        const newItems = [...prev];
        const draggedIndex = newItems.findIndex(item => item.id === draggedItem.id);
        const dropIndex = newItems.findIndex(item => item.id === dragOverItemId);
        
        // สลับตำแหน่ง
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
        className="w-16 h-16 sm:w-24 sm:h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center m-1 sm:m-2"
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => handleDrop(zoneType, index)}
      >
        {item && (
          <div
            className={`w-14 h-14 sm:w-20 sm:h-20 ${item.color} rounded-lg flex items-center justify-center text-white cursor-move text-xs sm:text-base`}
            draggable
            onDragStart={() => handleDragStart(item)}
          >
            {item.text}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-8 max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between mb-4 sm:mb-8 gap-4">
        <div className="w-full sm:w-auto">
          <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Available Items:</h2>
          <div 
            className="flex flex-wrap gap-2 sm:gap-4 p-2 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg min-h-20 sm:min-h-24"
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
                onDragStart={() => handleDragStart(item)}
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
        <div className="w-full sm:w-1/2 p-2 sm:p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Left Zone</h2>
          <div className="grid grid-cols-2 gap-1 sm:gap-2">
            {[0, 1, 2, 3].map(index => 
              renderDropZone('left', index)
            )}
          </div>
        </div>
        
        <div className="w-full sm:w-1/2 p-2 sm:p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Right Zone</h2>
          <div className="grid grid-cols-2 gap-1 sm:gap-2">
            {[0, 1, 2, 3].map(index => 
              renderDropZone('right', index)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraggableWithZones;