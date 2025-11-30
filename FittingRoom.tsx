
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Move, RotateCw, X, Sliders, Eraser, Layers, Check, ShoppingBag, ArrowUp, ArrowDown } from 'lucide-react';
import { PersonPhoto, ClothingItem, PlacedItem } from '../types';
import { Button } from './Button';
import { removeWhiteBackground } from '../utils';

interface FittingRoomProps {
  personPhoto: PersonPhoto;
  availableClothes: ClothingItem[];
}

export const FittingRoom: React.FC<FittingRoomProps> = ({ personPhoto, availableClothes }) => {
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialItemPos = useRef({ x: 0, y: 0 });

  // Add item to canvas
  const handleAddItem = (clothing: ClothingItem) => {
    // Calculate next zIndex
    const maxZ = placedItems.length > 0 ? Math.max(...placedItems.map(i => i.zIndex)) : 0;
    
    const newItem: PlacedItem = {
      id: crypto.randomUUID(),
      clothingId: clothing.id,
      x: 50, // Percent
      y: 50, // Percent
      width: 30, // Percent of container width
      height: 30, // Aspect ratio maintained via CSS usually, but here we track relative width
      rotation: 0,
      zIndex: maxZ + 1,
      processedUrl: clothing.url
    };
    setPlacedItems([...placedItems, newItem]);
    setSelectedItemId(newItem.id);
  };

  const handleRemoveItem = (id: string) => {
    setPlacedItems(placedItems.filter(item => item.id !== id));
    if (selectedItemId === id) setSelectedItemId(null);
  };

  const updateItem = (id: string, updates: Partial<PlacedItem>) => {
    setPlacedItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  // Magic BG Removal
  const handleRemoveBg = async (item: PlacedItem) => {
    if (!item.processedUrl) return;
    try {
      const newUrl = await removeWhiteBackground(item.processedUrl);
      updateItem(item.id, { processedUrl: newUrl });
    } catch (e) {
      alert("Could not process image. If this is an external link, try uploading the file instead.");
    }
  };

  // Layering
  const handleLayerChange = (item: PlacedItem, direction: 'up' | 'down') => {
    const newZ = direction === 'up' ? item.zIndex + 1 : item.zIndex - 1;
    updateItem(item.id, { zIndex: newZ });
  };

  // Shopping
  const handleBuy = (item: PlacedItem) => {
    const clothing = availableClothes.find(c => c.id === item.clothingId);
    if (clothing?.productUrl) {
      window.open(clothing.productUrl, '_blank');
    } else {
      alert("No product link available for this item.");
    }
  };

  // --- Interaction Handlers ---

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    e.stopPropagation(); // Prevent container click
    setSelectedItemId(id);
    isDragging.current = true;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    dragStart.current = { x: clientX, y: clientY };
    
    const item = placedItems.find(i => i.id === id);
    if (item) {
      initialItemPos.current = { x: item.x, y: item.y };
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging.current || !selectedItemId || !containerRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Calculate delta in percentage relative to container
    const deltaX = ((clientX - dragStart.current.x) / containerRect.width) * 100;
    const deltaY = ((clientY - dragStart.current.y) / containerRect.height) * 100;

    const newX = initialItemPos.current.x + deltaX;
    const newY = initialItemPos.current.y + deltaY;

    setPlacedItems(prev => prev.map(item => 
      item.id === selectedItemId 
        ? { ...item, x: newX, y: newY } 
        : item
    ));
  }, [selectedItemId]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const selectedItem = placedItems.find(i => i.id === selectedItemId);
  const selectedClothing = selectedItem ? availableClothes.find(c => c.id === selectedItem.clothingId) : null;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-6 p-4">
      {/* Sidebar: Clothes Selector */}
      <div className="w-full lg:w-80 flex flex-col gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 overflow-hidden order-2 lg:order-1">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Layers size={18} />
          Your Wardrobe
        </h3>
        <div className="overflow-y-auto grid grid-cols-2 gap-3 flex-1 content-start">
          {availableClothes.map(item => (
            <div 
              key={item.id}
              onClick={() => handleAddItem(item)}
              className="group relative aspect-square rounded-lg border border-gray-100 p-2 cursor-pointer hover:border-black transition-colors"
            >
              <img src={item.url} alt={item.name} className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
            </div>
          ))}
          {availableClothes.length === 0 && (
            <div className="col-span-2 text-center text-gray-400 text-sm py-8">
              No clothes yet. Upload some in the Wardrobe tab!
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden order-1 lg:order-2">
        {/* Toolbar */}
        <div className="h-auto min-h-14 border-b border-gray-100 flex flex-wrap items-center px-4 py-2 justify-between bg-white z-10 gap-2">
          <div className="text-sm font-medium text-gray-500 mr-auto">
             {selectedItem ? 'Adjust Item' : 'Select an item to edit'}
          </div>
          
          {selectedItem && (
            <div className="flex flex-wrap items-center gap-3">
              {/* Shopping Button */}
              {selectedClothing?.productUrl && (
                 <Button 
                   size="sm"
                   className="bg-green-600 hover:bg-green-700 text-white"
                   onClick={() => handleBuy(selectedItem)}
                   icon={<ShoppingBag size={14} />}
                 >
                   Buy
                 </Button>
              )}

              <div className="h-4 w-px bg-gray-200 hidden sm:block"></div>

              {/* Layer Controls */}
              <div className="flex items-center bg-gray-50 rounded-lg p-0.5 border border-gray-200">
                <button 
                  onClick={() => handleLayerChange(selectedItem, 'up')}
                  className="p-1.5 hover:bg-white rounded-md transition-colors text-gray-600"
                  title="Bring Forward"
                >
                  <ArrowUp size={14} />
                </button>
                <button 
                  onClick={() => handleLayerChange(selectedItem, 'down')}
                  className="p-1.5 hover:bg-white rounded-md transition-colors text-gray-600"
                  title="Send Backward"
                >
                  <ArrowDown size={14} />
                </button>
              </div>

              <div className="h-4 w-px bg-gray-200 hidden sm:block"></div>

              {/* Edit Controls */}
              <Button 
                size="sm" 
                variant="secondary" 
                title="Remove White Background"
                onClick={() => handleRemoveBg(selectedItem)}
                icon={<Eraser size={14} />}
              >
                <span className="hidden sm:inline">Auto-Cut</span>
              </Button>
              
               <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 hidden sm:inline">Size</span>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={selectedItem.width}
                    onChange={(e) => updateItem(selectedItem.id, { width: parseInt(e.target.value) })}
                    className="w-20 sm:w-24 accent-black"
                  />
               </div>
               
               <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 hidden sm:inline">Rotate</span>
                  <input 
                    type="range" 
                    min="-180" 
                    max="180" 
                    value={selectedItem.rotation}
                    onChange={(e) => updateItem(selectedItem.id, { rotation: parseInt(e.target.value) })}
                    className="w-20 sm:w-24 accent-black"
                  />
               </div>

               <Button 
                size="sm" 
                variant="danger"
                onClick={() => handleRemoveItem(selectedItem.id)}
              >
                <X size={14} />
              </Button>
            </div>
          )}
        </div>

        {/* The "Mirror" */}
        <div 
          ref={containerRef}
          className="flex-1 relative bg-gray-50 overflow-hidden touch-none select-none"
          onClick={() => setSelectedItemId(null)}
        >
          {/* Base Person Image */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img 
              src={personPhoto.url} 
              alt="Model" 
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {/* Draggable Clothing Layers */}
          {placedItems.map(item => (
            <div
              key={item.id}
              className={`absolute cursor-move group`}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                width: `${item.width}%`,
                // Transform origin center for rotation, translate to center the point
                transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                zIndex: item.zIndex,
              }}
              onMouseDown={(e) => handleMouseDown(e, item.id)}
              onTouchStart={(e) => handleMouseDown(e, item.id)}
            >
              <div className={`relative ${selectedItemId === item.id ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-1 hover:ring-gray-300 hover:ring-offset-1'}`}>
                <img 
                  src={item.processedUrl} 
                  alt="Clothing" 
                  className="w-full h-auto block select-none pointer-events-none"
                  draggable={false}
                  // Mix blend mode multiply helps seamlessly blend white-bg items onto photos
                  style={{ mixBlendMode: 'normal' }} 
                />
              </div>
            </div>
          ))}
          
          {placedItems.length === 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-sm text-gray-500 shadow-sm pointer-events-none whitespace-nowrap">
              Drag items from your wardrobe here
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
