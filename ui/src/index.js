import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./styles.css";
import InteractorFactory from './Interaction/InteractorFactory';

// Import components
import { ManualTab } from './components/templates/ManualTab';
import { AutomaticTab } from './components/templates/AutomaticTab';

console.log('Index.js loading...', React, ReactDOM);
const Interactor = InteractorFactory.create();
console.log('Interactor created:', Interactor);

function Index() {
  console.log('Index component rendering');
  
  // Tab state
  const [activeTab, setActiveTab] = useState('Manual');

  // Form state - for current item being edited
  const [currentItem, setCurrentItem] = useState({ tsType: 'meeting', tsText: '' });

  // Added Items - items that are filled but not yet saved to storage
  const [addedItems, setAddedItems] = useState([]);

  // Stored Items - items that have been saved to localStorage
  const [storedItems, setStoredItems] = useState(() => {
    try {
      const saved = localStorage.getItem('wts-report-stored-items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Track which stored items are checked for submission
  const [checkedStoredItems, setCheckedStoredItems] = useState(() => {
    try {
      const saved = localStorage.getItem('wts-report-checked-items');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Result from LLM
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  // Git state
  const [gitUrls, setGitUrls] = useState(() => {
    try {
      const saved = localStorage.getItem('wts-report-git-urls');
      return saved ? JSON.parse(saved) : [{ id: 'url-1', url: '' }];
    } catch {
      return [{ id: 'url-1', url: '' }];
    }
  });
  const [gitResult, setGitResult] = useState('');

  // Listen for messages from extension
  useEffect(() => {
    function handleMessage(event) {
      const msg = event.data;
      if (!msg || !msg.command) return;

      if (msg.command === 'llmResult') {
        setResult(msg.result || '');
        setLoading(false);
      }
      if (msg.command === 'gitHistoryResult') {
        setGitResult(msg.result || '');
        setLoading(false);
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Persist stored items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('wts-report-stored-items', JSON.stringify(storedItems));
    } catch (e) {
      console.error('localStorage error:', e);
    }
  }, [storedItems]);

  // Persist git URLs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('wts-report-git-urls', JSON.stringify(gitUrls));
    } catch (e) {
      console.error('localStorage error:', e);
    }
  }, [gitUrls]);

  // Persist checked items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('wts-report-checked-items', JSON.stringify(Array.from(checkedStoredItems)));
    } catch (e) {
      console.error('localStorage error:', e);
    }
  }, [checkedStoredItems]);

  // === MANUAL TAB HANDLERS ===

  function handleTypeChange(type) {
    setCurrentItem(prev => ({ ...prev, tsType: type }));
  }

  function handleTextChange(text) {
    setCurrentItem(prev => ({ ...prev, tsText: text }));
  }

  function handleAddItem() {
    if (!currentItem.tsText?.trim()) {
      Interactor.showInformationMessage('Please enter text before adding a new item');
      return;
    }
    // Clear the form for next item
    setCurrentItem({ tsType: 'meeting', tsText: '' });
  }

  function handleNextStep() {
    // Move current item to added items and clear form
    if (!currentItem.tsText?.trim()) {
      Interactor.showInformationMessage('Please enter text before proceeding');
      return;
    }
    
    // Add to added items
    const newAddedItem = {
      id: `added-${Date.now()}`,
      ...currentItem
    };
    setAddedItems(prev => [...prev, newAddedItem]);
    
    // Clear form
    setCurrentItem({ tsType: 'meeting', tsText: '' });
  }

  function handlePrevStep() {
    // Remove last item from added items and restore to form
    if (addedItems.length > 0) {
      const lastItem = addedItems[addedItems.length - 1];
      setCurrentItem({ tsType: lastItem.tsType, tsText: lastItem.tsText });
      setAddedItems(prev => prev.slice(0, -1));
    }
  }

  function handleSaveAddedItem(itemId) {
    // Move item from addedItems to storedItems
    const itemToSave = addedItems.find(item => item.id === itemId);
    if (!itemToSave) return;

    // Create stored item
    const storedItem = {
      id: `stored-${Date.now()}`,
      tsType: itemToSave.tsType,
      tsText: itemToSave.tsText
    };

    // Add to stored items
    setStoredItems(prev => [...prev, storedItem]);
    
    // Remove from added items
    setAddedItems(prev => prev.filter(item => item.id !== itemId));
  }

  function handleDeleteStoredItem(itemId) {
    // Remove item from stored items
    setStoredItems(prev => prev.filter(item => item.id !== itemId));
    
    // Also remove from checked items if it was checked
    const indexToRemove = storedItems.findIndex(item => item.id === itemId);
    if (indexToRemove !== -1) {
      setCheckedStoredItems(prev => {
        const newChecked = new Set(prev);
        newChecked.delete(indexToRemove);
        return newChecked;
      });
    }
  }

  function handleFinish() {
    // Submit ALL added items + only CHECKED stored items
    const checkedStoredItemsList = storedItems.filter((_, idx) => checkedStoredItems.has(idx));
    
    // Combine added items and checked stored items
    const itemsToSubmit = [
      ...addedItems,
      ...checkedStoredItemsList
    ];

    if (itemsToSubmit.length === 0) {
      Interactor.showInformationMessage('Please add items or check stored items to submit');
      return;
    }

    setLoading(true);
    Interactor.sendFormValues(itemsToSubmit);
  }

  function handleToggleCheck(itemIndex) {
    setCheckedStoredItems(prev => {
      const newChecked = new Set(prev);
      if (newChecked.has(itemIndex)) {
        newChecked.delete(itemIndex);
      } else {
        newChecked.add(itemIndex);
      }
      return newChecked;
    });
  }

  // === AUTOMATIC TAB HANDLERS ===

  function handleUrlChange(id, url) {
    setGitUrls(prev =>
      prev.map(item => item.id === id ? { ...item, url } : item)
    );
  }

  function handleAddUrl() {
    setGitUrls(prev => [
      ...prev,
      { id: `url-${Date.now()}`, url: '' }
    ]);
  }

  function handleDeleteUrl(id) {
    setGitUrls(prev => prev.filter(item => item.id !== id));
  }

  function handleCheckHistory() {
    const validUrls = gitUrls.filter(item => item.url.trim() !== '');

    if (validUrls.length === 0) {
      Interactor.showInformationMessage('Please enter at least one git URL');
      return;
    }

    setLoading(true);
    setGitResult(`Processing ${validUrls.length} git URL${validUrls.length > 1 ? 's' : ''}...`);
    Interactor.sendGitUrls(validUrls);
  }

  // === RENDER ===

  return (
    <main className="max-w-[512px] mx-auto flex flex-col">
      {/* Top Level Tabs (Manual / Automatic (Git)) */}
      <nav aria-label="Tracking type" className="bg-white m-4 mt-6 rounded-lg flex border-b border-ant-border">
        <button
          onClick={() => setActiveTab('Manual')}
          className={`relative px-4 py-3 text-sm transition-colors duration-200 font-medium bg-transparent border-0 cursor-pointer ${
            activeTab === 'Manual'
              ? 'text-ant-primary border-b-2 border-ant-primary'
              : 'text-ant-text-tertiary border-b-2 border-transparent'
          }`}
        >
          Manual
        </button>
        <button
          onClick={() => setActiveTab('Automatic (Git)')}
          className={`relative px-4 py-3 text-sm transition-colors duration-200 font-medium bg-transparent border-0 cursor-pointer ${
            activeTab === 'Automatic (Git)'
              ? 'text-ant-primary border-b-2 border-ant-primary'
              : 'text-ant-text-tertiary border-b-2 border-transparent'
          }`}
        >
          Automatic (Git)
        </button>
      </nav>

      {/* Content container */}
      <div className="pt-6 flex flex-col gap-4 px-4">
        {activeTab === 'Manual' && (
          <ManualTab
            currentItem={currentItem}
            onTypeChange={handleTypeChange}
            onTextChange={handleTextChange}
            onNext={handleNextStep}
            onBack={handlePrevStep}
            onFinish={handleFinish}
            result={result}
            loading={loading}
            addedItems={addedItems}
            onSaveAddedItem={handleSaveAddedItem}
            storedItems={storedItems}
            checkedStoredItems={checkedStoredItems}
            onToggleCheck={handleToggleCheck}
            onDeleteStoredItem={handleDeleteStoredItem}
          />
        )}

        {activeTab === 'Automatic (Git)' && (
          <AutomaticTab
            gitUrls={gitUrls}
            onUrlChange={handleUrlChange}
            onAddUrl={handleAddUrl}
            onDeleteUrl={handleDeleteUrl}
            onCheckHistory={handleCheckHistory}
            gitResult={gitResult}
            loading={loading}
          />
        )}
      </div>
    </main>
  );
}

console.log('About to render Index component');
try {
  ReactDOM.render(<Index />, document.getElementById("index"));
  console.log('Index component rendered');
} catch (error) {
  console.error('Error rendering Index component:', error);
  document.getElementById("index").innerHTML = `<h1>Error: ${error.message}</h1><pre>${error.stack}</pre>`;
}
