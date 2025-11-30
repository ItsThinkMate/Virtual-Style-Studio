
import React, { useState, useEffect } from 'react';
import { Camera, Shirt, Sparkles, User, Link as LinkIcon, Plus, AlertCircle, X, ShoppingBag, Edit2, ArrowRight, Layers, ShieldCheck } from 'lucide-react';
import { PersonPhoto, PhotoType, ClothingItem } from './types';
import { PhotoUploader } from './components/PhotoUploader';
import { FittingRoom } from './components/FittingRoom';
import { Button } from './components/Button';
import { getBase64 } from './utils';

enum Tab {
  HOME = 'HOME',
  PROFILE = 'PROFILE',
  WARDROBE = 'WARDROBE',
  STUDIO = 'STUDIO'
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  
  // State with LocalStorage Initialization
  const [personPhotos, setPersonPhotos] = useState<PersonPhoto[]>(() => {
    const saved = localStorage.getItem('vss_photos');
    return saved ? JSON.parse(saved) : [];
  });

  const [wardrobe, setWardrobe] = useState<ClothingItem[]>(() => {
    const saved = localStorage.getItem('vss_wardrobe');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedPersonPhotoId, setSelectedPersonPhotoId] = useState<string | null>(null);
  
  // Link Input State
  const [linkInput, setLinkInput] = useState('');
  const [productLinkInput, setProductLinkInput] = useState('');
  
  // Edit State
  const [editingItem, setEditingItem] = useState<ClothingItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editProductUrl, setEditProductUrl] = useState('');

  // --- Persistence Effects ---
  useEffect(() => {
    localStorage.setItem('vss_photos', JSON.stringify(personPhotos));
  }, [personPhotos]);

  useEffect(() => {
    localStorage.setItem('vss_wardrobe', JSON.stringify(wardrobe));
  }, [wardrobe]);

  // --- Handlers ---

  const handlePhotoUpload = async (file: File, type: PhotoType) => {
    try {
      const base64 = await getBase64(file);
      const newPhoto: PersonPhoto = {
        id: crypto.randomUUID(),
        url: base64,
        type,
        file // Note: file object is not saved to LS, but used in current session if needed
      };
      
      setPersonPhotos(prev => {
        const filtered = prev.filter(p => p.type !== type);
        return [...filtered, newPhoto];
      });
      
      if (type === PhotoType.FRONT) {
        setSelectedPersonPhotoId(newPhoto.id);
      }
    } catch (e) {
      console.error("Failed to process image", e);
    }
  };

  const handleRemovePhoto = (type: PhotoType) => {
    setPersonPhotos(prev => prev.filter(p => p.type !== type));
    const remaining = personPhotos.filter(p => p.type !== type);
    if (remaining.length > 0 && selectedPersonPhotoId === personPhotos.find(p => p.type === type)?.id) {
        setSelectedPersonPhotoId(remaining[0].id);
    } else if (remaining.length === 0) {
        setSelectedPersonPhotoId(null);
    }
  };

  const handleClothingUpload = async (file: File) => {
    try {
      const base64 = await getBase64(file);
      const newItem: ClothingItem = {
        id: crypto.randomUUID(),
        url: base64,
        name: file.name,
        category: 'top', 
        isUrl: false,
        productUrl: '' 
      };
      setWardrobe(prev => [...prev, newItem]);
      // Open edit mode immediately to prompt for link
      openEditModal(newItem);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLinkAdd = () => {
    if (!linkInput) return;

    const newItem: ClothingItem = {
      id: crypto.randomUUID(),
      url: linkInput,
      name: 'Web Item',
      category: 'top',
      isUrl: true,
      productUrl: productLinkInput
    };
    
    setWardrobe(prev => [...prev, newItem]);
    setLinkInput('');
    setProductLinkInput('');
  };

  const openEditModal = (item: ClothingItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditProductUrl(item.productUrl || '');
  };

  const saveEditItem = () => {
    if (!editingItem) return;
    setWardrobe(prev => prev.map(item => 
      item.id === editingItem.id 
        ? { ...item, name: editName, productUrl: editProductUrl }
        : item
    ));
    setEditingItem(null);
  };

  const getPhotoByType = (type: PhotoType) => personPhotos.find(p => p.type === type)?.url || null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setActiveTab(Tab.HOME)}
          >
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg group-hover:bg-indigo-700 transition-colors">
              <Sparkles size={20} fill="currentColor" className="text-white/20" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-indigo-600 transition-colors">
              Virtual Style Studio
            </h1>
          </div>
          
          <nav className="flex items-center gap-1 sm:gap-2">
            {[
              { id: Tab.PROFILE, label: 'My Photos', icon: User },
              { id: Tab.WARDROBE, label: 'Wardrobe', icon: Shirt },
              { id: Tab.STUDIO, label: 'Fitting Room', icon: Layers },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${activeTab === tab.id 
                    ? 'bg-gray-900 text-white shadow-md' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                <tab.icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full">
        
        {/* TAB 0: HOME / LANDING */}
        {activeTab === Tab.HOME && (
          <div className="animate-in fade-in duration-500">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-white border-b border-gray-100">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-pink-50 opacity-70"></div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 relative z-10">
                <div className="text-center max-w-3xl mx-auto">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wide mb-6">
                    <Sparkles size={12} />
                    AI-Free Virtual Try-On
                  </div>
                  <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
                    Style Yourself, <span className="text-indigo-600">Virtually.</span>
                  </h1>
                  <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                    Visualize outfits instantly on your own photos. 
                    Build your digital wardrobe and mix & match looks without the guesswork.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                      onClick={() => setActiveTab(Tab.PROFILE)}
                      className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                    >
                      Start Styling Now <ArrowRight size={20} />
                    </button>
                    <button 
                      onClick={() => setActiveTab(Tab.WARDROBE)}
                      className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all flex items-center justify-center"
                    >
                      Add Clothes
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Features / How it works */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
                <p className="text-gray-500 mt-2">Three simple steps to your new look.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-center group">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                    <Camera size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">1. Upload Your Photo</h3>
                  <p className="text-gray-500 leading-relaxed">
                    Take a photo of yourself (Front, Side, or Back). It's saved locally on your device for total privacy.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-center group">
                  <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-purple-600 group-hover:scale-110 transition-transform">
                    <Shirt size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">2. Fill Your Wardrobe</h3>
                  <p className="text-gray-500 leading-relaxed">
                    Upload images of clothes or paste links from your favorite stores. We'll help you organize them.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-center group">
                  <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-pink-600 group-hover:scale-110 transition-transform">
                    <Layers size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">3. Mix & Match</h3>
                  <p className="text-gray-500 leading-relaxed">
                    Layer clothes onto your photo in the Fitting Room. Adjust fit, remove backgrounds, and shop the look.
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Note */}
            <div className="bg-gray-900 text-white py-12 mt-12">
              <div className="max-w-4xl mx-auto px-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-4 text-emerald-400">
                  <ShieldCheck size={24} />
                  <span className="font-semibold uppercase tracking-wider text-sm">Privacy First</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Your Photos Stay With You.</h3>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Virtual Style Studio operates entirely in your browser. No photos are sent to any server. 
                  Your data is stored in your browser's local storage and never leaves your device.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: PROFILE SETUP */}
        {activeTab === Tab.PROFILE && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">Your Style Profile</h2>
                <p className="text-gray-500">Upload up to 3 photos to start trying on clothes.</p>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <PhotoUploader 
                    label="Front View" 
                    type={PhotoType.FRONT}
                    currentPhoto={getPhotoByType(PhotoType.FRONT)}
                    onUpload={(f) => handlePhotoUpload(f, PhotoType.FRONT)}
                    onRemove={() => handleRemovePhoto(PhotoType.FRONT)}
                  />
                  <PhotoUploader 
                    label="Side View" 
                    type={PhotoType.SIDE}
                    currentPhoto={getPhotoByType(PhotoType.SIDE)}
                    onUpload={(f) => handlePhotoUpload(f, PhotoType.SIDE)}
                    onRemove={() => handleRemovePhoto(PhotoType.SIDE)}
                  />
                  <PhotoUploader 
                    label="Back View" 
                    type={PhotoType.BACK}
                    currentPhoto={getPhotoByType(PhotoType.BACK)}
                    onUpload={(f) => handlePhotoUpload(f, PhotoType.BACK)}
                    onRemove={() => handleRemovePhoto(PhotoType.BACK)}
                  />
                </div>
                <div className="mt-8 flex justify-end pt-6 border-t border-gray-100">
                  <Button onClick={() => setActiveTab(Tab.WARDROBE)} className="w-full sm:w-auto">
                    Next: Add Clothes <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WARDROBE */}
        {activeTab === Tab.WARDROBE && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Virtual Wardrobe</h2>
                <p className="text-gray-500">Manage your collection and add shopping links.</p>
              </div>
              <div className="flex gap-2">
                 <label className="cursor-pointer">
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleClothingUpload(e.target.files[0])} />
                    <div className="inline-flex items-center justify-center rounded-xl font-medium transition-all bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100 px-5 py-2.5 text-sm gap-2">
                       <Plus size={18} />
                       Upload Image
                    </div>
                 </label>
              </div>
            </div>

            {/* Add via Link Section */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4 mb-8">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <LinkIcon size={16} /> Add from URL
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="Image URL (e.g. https://.../dress.jpg)" 
                    className="block w-full px-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                   <input 
                    type="text" 
                    placeholder="Product Page URL (Optional - for shopping)" 
                    className="block w-full px-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                    value={productLinkInput}
                    onChange={(e) => setProductLinkInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLinkAdd()}
                  />
                </div>
                <Button variant="secondary" onClick={handleLinkAdd} disabled={!linkInput}>
                  Add Item
                </Button>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {wardrobe.map((item) => (
                <div key={item.id} className="group relative bg-white aspect-[3/4] rounded-2xl border border-gray-100 flex flex-col overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
                  
                  {/* Image Area */}
                  <div className="flex-1 p-4 flex items-center justify-center relative bg-gray-50/50">
                    <img src={item.url} alt={item.name} className="max-w-full max-h-full object-contain" />
                    
                    {/* Floating Actions */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setWardrobe(prev => prev.filter(i => i.id !== item.id))}
                        className="p-2 bg-white rounded-full text-red-500 shadow-sm hover:bg-red-50 border border-gray-100 transition-colors"
                        title="Delete"
                      >
                        <X size={14} />
                      </button>
                      <button 
                        onClick={() => openEditModal(item)}
                        className="p-2 bg-white rounded-full text-gray-600 shadow-sm hover:bg-indigo-50 hover:text-indigo-600 border border-gray-100 transition-colors"
                        title="Edit Details"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Info Area */}
                  <div className="p-3 border-t border-gray-50 bg-white">
                    <div className="text-xs font-semibold text-gray-900 truncate mb-2">{item.name}</div>
                    
                    {item.productUrl ? (
                      <a 
                        href={item.productUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <ShoppingBag size={12} />
                        Buy Now
                      </a>
                    ) : (
                      <button 
                        onClick={() => openEditModal(item)}
                        className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-medium text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                         Add Link
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {wardrobe.length === 0 && (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/30">
                  <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                     <Shirt className="h-8 w-8 text-gray-300" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">Your wardrobe is empty</h3>
                  <p className="mt-1 text-sm text-gray-500">Upload photos of clothes or add image URLs above.</p>
                </div>
              )}
            </div>

             <div className="flex justify-end pt-8 mt-8 border-t border-gray-100">
                <Button onClick={() => setActiveTab(Tab.STUDIO)} disabled={wardrobe.length === 0} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                  Go to Fitting Room <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>
          </div>
        )}

        {/* TAB 3: STUDIO */}
        {activeTab === Tab.STUDIO && (
          <div className="h-[calc(100vh-64px)] overflow-hidden flex flex-col animate-in fade-in duration-500">
            {!selectedPersonPhotoId && personPhotos.length > 0 && (
               <div className="flex-1 flex items-center justify-center bg-gray-50">
                 <div className="max-w-2xl w-full text-center px-4">
                   <h2 className="text-2xl font-bold mb-8 text-gray-900">Select a model to start fitting</h2>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {personPhotos.map(p => (
                        <button 
                          key={p.id} 
                          onClick={() => setSelectedPersonPhotoId(p.id)}
                          className="relative aspect-[3/4] group rounded-2xl overflow-hidden border-2 border-transparent hover:border-indigo-600 transition-all shadow-md hover:shadow-xl transform hover:-translate-y-1"
                        >
                           <img src={p.url} className="w-full h-full object-cover" />
                           <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur py-3 text-sm font-semibold border-t border-gray-100 text-gray-900">
                              {p.type} View
                           </div>
                        </button>
                      ))}
                   </div>
                 </div>
               </div>
            )}

            {!selectedPersonPhotoId && personPhotos.length === 0 && (
               <div className="flex-1 flex items-center justify-center">
                 <div className="text-center p-12 bg-white rounded-2xl border border-gray-100 shadow-xl max-w-lg mx-4">
                    <User className="mx-auto h-16 w-16 text-indigo-100 mb-6" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Profile Incomplete</h3>
                    <p className="text-gray-500 mb-8">You need to upload at least one photo of yourself before entering the fitting room.</p>
                    <Button onClick={() => setActiveTab(Tab.PROFILE)} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                      Go to Profile
                    </Button>
                 </div>
               </div>
            )}

            {selectedPersonPhotoId && (
              <div className="flex-1 flex flex-col h-full max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4">
                   <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                    <Sparkles className="text-indigo-600" size={20} />
                    Fitting Room
                   </h2>
                   <div className="flex gap-3 items-center">
                      <span className="text-sm text-gray-500 hidden sm:inline">Current View:</span>
                      <select 
                        className="text-sm border-gray-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 bg-gray-50"
                        value={selectedPersonPhotoId}
                        onChange={(e) => setSelectedPersonPhotoId(e.target.value)}
                      >
                        {personPhotos.map(p => (
                          <option key={p.id} value={p.id}>{p.type} View</option>
                        ))}
                      </select>
                   </div>
                </div>
                
                <div className="flex-1 min-h-0">
                  <FittingRoom 
                    personPhoto={personPhotos.find(p => p.id === selectedPersonPhotoId)!}
                    availableClothes={wardrobe}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Item Modal */}
        {editingItem && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                   <h3 className="font-bold text-gray-900">Edit Item Details</h3>
                   <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                     <X size={20} />
                   </button>
                </div>
                <div className="p-6 space-y-5">
                   <div className="flex justify-center bg-white rounded-xl p-4 border border-gray-200 shadow-inner mb-4">
                      <img src={editingItem.url} alt="Preview" className="h-32 object-contain" />
                   </div>
                   
                   <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Item Name</label>
                      <input 
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                   </div>

                   <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Page URL</label>
                      <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <ShoppingBag size={16} className="text-gray-400" />
                         </div>
                         <input 
                           type="text"
                           value={editProductUrl}
                           onChange={(e) => setEditProductUrl(e.target.value)}
                           placeholder="https://store.com/product..."
                           className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                         />
                      </div>
                      <p className="mt-1.5 text-xs text-gray-500">
                        Add a link to enable the "Buy Now" button in your wardrobe.
                      </p>
                   </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                   <Button variant="secondary" onClick={() => setEditingItem(null)}>Cancel</Button>
                   <Button onClick={saveEditItem} className="bg-indigo-600 hover:bg-indigo-700">Save Changes</Button>
                </div>
             </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
