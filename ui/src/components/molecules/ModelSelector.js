import React, { useState, useEffect } from 'react';
import InteractorFactory from '../../Interaction/InteractorFactory';
import { Badge } from '../atoms/Badge';

export function ModelSelector() {
  const Interactor = InteractorFactory.create();
  
  const [selectedModel, setSelectedModel] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);
  const [isFreeModel, setIsFreeModel] = useState(false);
  const [freeModelNotFound, setFreeModelNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Request model info on mount
  useEffect(() => {
    setIsLoading(true);
    Interactor.requestModelInfo((modelInfo) => {
      if (modelInfo) {
        setSelectedModel(modelInfo.selectedModel);
        setAvailableModels(modelInfo.availableModels || []);
        setIsFreeModel(modelInfo.isFreeModel);
        setFreeModelNotFound(modelInfo.freeModelNotFound);
      }
      setIsLoading(false);
    });
  }, []);

  const handleModelChange = (e) => {
    const modelId = e.target.value;
    const selected = availableModels.find(m => m.id === modelId);
    if (selected) {
      setSelectedModel(selected);
      // Update free model status
      setIsFreeModel(selected.isFree);
      // Store selection in localStorage for future use
      localStorage.setItem('wts-report-selected-model', JSON.stringify(selected));
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <p className="text-sm text-gray-500">Loading available models...</p>
      </div>
    );
  }

  // Extract pricing multiplier value for display
  const extractPricingValue = (pricing) => {
    const match = pricing.match(/^([\d.]+)x$/);
    return match ? match[1] : '?';
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-4">
      {/* Header with Title and Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <label className="text-sm font-semibold text-gray-900">
          LLM Model
        </label>
        <div className="flex gap-2">
          {freeModelNotFound && availableModels.length > 0 && (
            <Badge variant="error">✗ No Free Model</Badge>
          )}
          {!freeModelNotFound && isFreeModel && (
            <Badge variant="success">✓ Free (0x)</Badge>
          )}
          {!freeModelNotFound && !isFreeModel && selectedModel && (
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
                {model.name} {model.pricing && `(${model.pricing})`}
              </option>
            ))}
          </select>

          {/* Currently Selected Model Details */}
          {selectedModel && (
            <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-600 font-medium">Vendor</p>
                  <p className="text-gray-900 font-semibold">{selectedModel.vendor}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Pricing</p>
                  <p className={`font-semibold ${selectedModel.isFree ? 'text-green-700' : 'text-amber-700'}`}>
                    {selectedModel.pricing} {selectedModel.isFree && '(Free)'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Context Window</p>
                  <p className="text-gray-900 font-semibold">{selectedModel.maxTokens.toLocaleString()} tokens</p>
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

          {/* Warning Messages */}
          {freeModelNotFound && availableModels.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-xs text-red-800 font-medium">
                ⚠️ No free tier models found (0x pricing). The selected model requires payment.
              </p>
            </div>
          )}

          {/* Free Models Highlight */}
          {availableModels.some(m => m.isFree) && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-xs font-semibold text-green-900 mb-2">💚 Free Models Available (0x Pricing):</p>
              <div className="flex flex-wrap gap-2">
                {availableModels
                  .filter(m => m.isFree)
                  .sort((a, b) => b.maxTokens - a.maxTokens)
                  .map(model => (
                    <div key={model.id} className="flex flex-col gap-1 bg-white px-2 py-1 rounded border border-green-200">
                      <span className="text-xs font-medium text-gray-900">{model.name}</span>
                      <span className="text-xs text-green-700 font-semibold">{model.pricing} • {model.maxTokens.toLocaleString()} tokens</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Paid Models Summary */}
          {availableModels.some(m => !m.isFree) && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-xs font-semibold text-amber-900 mb-2">💰 Paid Models:</p>
              <div className="flex flex-wrap gap-2">
                {availableModels
                  .filter(m => !m.isFree)
                  .sort((a, b) => {
                    const valueA = parseFloat(a.pricing);
                    const valueB = parseFloat(b.pricing);
                    return valueA - valueB;
                  })
                  .map(model => (
                    <div key={model.id} className="flex flex-col gap-1 bg-white px-2 py-1 rounded border border-amber-200">
                      <span className="text-xs font-medium text-gray-900">{model.name}</span>
                      <span className="text-xs text-amber-700 font-semibold">{model.pricing}x • {model.maxTokens.toLocaleString()} tokens</span>
                    </div>
                  ))}
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
