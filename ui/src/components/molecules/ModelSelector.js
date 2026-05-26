import React, { useState, useEffect } from 'react';
import InteractorFactory from '../../Interaction/InteractorFactory';
import { Badge } from '../atoms/Badge';

export function ModelSelector() {
  const Interactor = InteractorFactory.create();
  
  // Try to restore previous selection from localStorage
  const savedModel = React.useMemo(() => {
    try {
      const saved = localStorage.getItem('wts-report-selected-model');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  }, []);

  const [selectedModel, setSelectedModel] = useState(savedModel);
  const [availableModels, setAvailableModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const isFreeModel = selectedModel?.isFree ?? false;

  // Request model info on mount
  useEffect(() => {
    setIsLoading(true);
    Interactor.requestModelInfo((modelInfo) => {
      if (modelInfo?.models) {
        const models = modelInfo.models;
        setAvailableModels(models);

        // If previously saved model is still in the list, keep it selected
        if (selectedModel) {
          const stillExists = models.find(m => m.id === selectedModel.id);
          if (stillExists) {
            setIsLoading(false);
            return;
          }
        }

        // Otherwise auto-select first free model, or first model
        const free = models.find(m => m.isFree);
        if (free) {
          setSelectedModel(free);
          localStorage.setItem('wts-report-selected-model', JSON.stringify(free));
          Interactor.selectModel(free.id);
        } else if (models.length > 0) {
          setSelectedModel(models[0]);
          localStorage.setItem('wts-report-selected-model', JSON.stringify(models[0]));
          Interactor.selectModel(models[0].id);
        }
      }
      setIsLoading(false);
    });
  }, []);

  const handleModelChange = (e) => {
    const modelId = e.target.value;
    const selected = availableModels.find(m => m.id === modelId);
    if (selected) {
      setSelectedModel(selected);
      localStorage.setItem('wts-report-selected-model', JSON.stringify(selected));
      Interactor.selectModel(selected.id);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <p className="text-sm text-gray-500">Loading available models...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg border mb-4">
      {/* Header with Title and Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <label className="text-sm font-semibold text-gray-900">
          LLM Model
        </label>
        <div className="flex gap-2">
          {isFreeModel ? (
            <Badge variant="success">✓ Free (0x)</Badge>
          ) : selectedModel && (
            <Badge variant="warning">{selectedModel.pricing}</Badge>
          )}
        </div>
      </div>

      {/* Model Dropdown */}
      {availableModels.length > 0 ? (
        <div className="space-y-3">
          <select
            value={selectedModel?.id || ''}
            onChange={handleModelChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium text-gray-900 bg-white"
          >
              <option value="">-- Select a model --</option>
            {availableModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}{model.pricing ? ` (${model.pricing})` : ''}
              </option>
            ))}
          </select>

          {/* Currently Selected Model Details */}
          {selectedModel && (
            <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-600 font-medium">Vendor</p>
                  <p className="text-gray-900 font-semibold">{selectedModel.vendor ?? '—'}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Pricing</p>
                  <p className={`font-semibold ${selectedModel.isFree ? 'text-green-700' : 'text-amber-700'}`}>
                    {selectedModel.pricing ?? '—'} {selectedModel.isFree && '(Free)'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Context Window</p>
                  <p className="text-gray-900 font-semibold">{(selectedModel.maxInputTokens ?? 0).toLocaleString()} tokens</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Tier</p>
                  <p className={`font-semibold ${selectedModel.isFree ? 'text-green-700' : 'text-orange-700'}`}>
                    {selectedModel.isFree ? 'Free' : 'Paid'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600 font-medium">Model ID</p>
                  <p className="text-gray-900 font-mono text-xs truncate">{selectedModel.id}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700 font-medium">
            ⚠️ No models available. Please install a language model provider first.
          </p>
        </div>
      )}
    </div>
  );
}
