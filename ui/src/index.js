import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./styles.css";
import InteractorFactory from './Interaction/InteractorFactory';

const Interactor = InteractorFactory.create();

function Index() {
  const [items, setItems] = useState([{ tsType: 'meeting', tsText: '' }]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState('');
  // Using CSS-only tabs (radio inputs + labels) — no JS tab buttons
  const [gitResult, setGitResult] = useState('');

  useEffect(() => {
    function handleMessage(event) {
      const msg = event.data;
      if (!msg || !msg.command) return;
      if (msg.command === 'llmResult') {
        setResult(msg.result || '');
      }
      if (msg.command === 'gitHistoryResult') {
        setGitResult(msg.result || '');
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  function checkGitHistory() {
    setGitResult('Checking git history...');
    Interactor.showInformationMessage('Checking git history');
    try {
      window.postMessage({ command: 'checkGitHistory' }, '*');
    } catch (e) {
      // ignore
    }
  }

  function nextStep() {
    setItems(prevItems => {
      if (currentIndex < prevItems.length - 1) {
        setCurrentIndex(ci => ci + 1);
        return prevItems;
      }
      const newItems = prevItems.concat({ tsType: 'meeting', tsText: '' });
      setCurrentIndex(newItems.length - 1);
      return newItems;
    });
  }

  function prevStep() {
    setCurrentIndex(ci => Math.max(0, ci - 1));
  }

  function finishForm() {
    const filtered = items.filter(it => {
      if (!it) return false;
      if (!it.tsType) return false;
      if (!it.tsText) return false;
      if (String(it.tsText).trim() === '') return false;
      return true;
    });

    if (filtered.length === 0) {
      Interactor.showInformationMessage('No valid items to send');
      return;
    }

    Interactor.sendFormValues(filtered);
    Interactor.showInformationMessage(`Sent ${filtered.length} item${filtered.length > 1 ? 's' : ''} to extension`);
  }

  function updateCurrentItem(partial) {
    setItems(prevItems => {
      const copy = prevItems.slice();
      copy[currentIndex] = { ...copy[currentIndex], ...partial };
      return copy;
    });
  }

  const current = items[currentIndex] || { tsType: 'meeting', tsText: '' };

  return (
    <div className="container">
      <div className="form-card">
        <div className="tabs">
          {/* hidden radios (controls) placed before the UL so we can style labels via sibling selectors) */}
          <input type="radio" id="tab-form" name="tabs" defaultChecked className="tab-input" />
          <input type="radio" id="tab-git" name="tabs" className="tab-input" />

          <ul className="flex flex-wrap text-sm font-medium text-center text-gray-600 border-b border-gray-200">
            <li className="mr-2">
              <label htmlFor="tab-form" className="inline-block p-4 rounded-t-lg tab-link">Form</label>
            </li>
            <li className="mr-2">
              <label htmlFor="tab-git" className="inline-block p-4 rounded-t-lg tab-link">Git History</label>
            </li>
          </ul>

          <div className="tab-content">
            <div className="tab-panel tab-form">
              <form onSubmit={(e) => { e.preventDefault(); }}>
                <fieldset>
                  <div className="space-y-4">
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="tsType"
                          value="meeting"
                          checked={current.tsType === 'meeting'}
                          onChange={e => updateCurrentItem({ tsType: e.target.value })}
                        />
                        <span>Meeting</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="tsType"
                          value="tasks"
                          checked={current.tsType === 'tasks'}
                          onChange={e => updateCurrentItem({ tsType: e.target.value })}
                        />
                        <span>Tasks</span>
                      </label>
                    </div>

                    <div>
                      <label htmlFor="tsText" className="field-label">Notes</label>
                      <textarea
                        id="tsText"
                        className="textarea"
                        value={current.tsText}
                        onChange={e => updateCurrentItem({ tsText: e.target.value })}
                        rows={4}
                        placeholder="Enter details..."
                      />
                      <div className="text-sm text-gray-600 mt-2">Item {currentIndex + 1} of {items.length}</div>
                    </div>

                    <div className="button-row">
                      <button type="button" className="px-3 py-1 bg-gray-200 rounded" onClick={prevStep}>Back</button>
                      <button type="button" className="px-3 py-1 bg-blue-600 text-white rounded" onClick={nextStep}>Next</button>
                      <button type="button" className="px-3 py-1 bg-green-600 text-white rounded" onClick={finishForm}>Finish</button>
                    </div>

                    <div className="result-area">
                      <label htmlFor="result" className="field-label">Result</label>
                      <textarea
                        id="result"
                        className="textarea"
                        value={result}
                        readOnly
                        rows={8}
                        placeholder="LLM result will appear here"
                      />
                    </div>
                  </div>
                </fieldset>
              </form>
            </div>

            <div className="tab-panel tab-git">
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={checkGitHistory}>Check Git History</button>
              </div>

              <div className="mt-4">
                <label className="field-label">Git History</label>
                <textarea className="textarea" rows={12} value={gitResult} readOnly placeholder="Git history will appear here" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.render(<Index />, document.getElementById("index"));
