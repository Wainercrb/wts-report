import React from "react";
import ReactDOM from "react-dom";
import "./styles.css";
import InteractorFactory from './Interaction/InteractorFactory';

const Interactor = InteractorFactory.create();

class Index extends React.Component {

  constructor(props) {
    super(props);
    this.state = { items: [{ tsType: 'meeting', tsText: '' }], currentIndex: 0, result: '' };
    this.handleMessage = this.handleMessage.bind(this);
  }

  componentDidMount() {
    // Listen for messages posted from the extension
    window.addEventListener('message', this.handleMessage);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleMessage);
  }

  handleMessage(event) {
    const msg = event.data;
    if (!msg || !msg.command) return;
    if (msg.command === 'llmResult') {
      // Show raw text in the result textarea
      this.setState({ result: msg.result || '' });
    }
  }

  nextStep() {
    this.setState(state => {
      const { items, currentIndex } = state;
      if (currentIndex < items.length - 1) {
        return { currentIndex: currentIndex + 1 };
      }
      // push a new item and navigate to it
      const newItems = items.concat({ tsType: 'meeting', tsText: '' });
      return { items: newItems, currentIndex: newItems.length - 1 };
    });
  }

  prevStep() {
    this.setState(state => ({ currentIndex: Math.max(0, state.currentIndex - 1) }));
  }

  finishForm() {
    const { items } = this.state;
    Interactor.sendFormValues(items);
    Interactor.showInformationMessage('All items sent to extension');
  }

  updateCurrentItem(partial) {
    this.setState(state => {
      const items = state.items.slice();
      items[state.currentIndex] = { ...items[state.currentIndex], ...partial };
      return { items };
    });
  }

  render() {
    return <>
      <div className="container">
        <div className="row">
          <div className="col-sm">
            <form onSubmit={(e) => { e.preventDefault(); }}>
              <fieldset>
                <legend>TS</legend>

                {(() => {
                  const { items, currentIndex } = this.state;
                  const current = items[currentIndex] || { tsType: 'meeting', tsText: '' };
                  return (
                    <div>
                      <div>
                        <label>
                          <input
                            type="radio"
                            name="tsType"
                            value="meeting"
                            checked={current.tsType === 'meeting'}
                            onChange={e => this.updateCurrentItem({ tsType: e.target.value })}
                          />
                          Meeting
                        </label>
                        <label style={{ marginLeft: '12px' }}>
                          <input
                            type="radio"
                            name="tsType"
                            value="tasks"
                            checked={current.tsType === 'tasks'}
                            onChange={e => this.updateCurrentItem({ tsType: e.target.value })}
                          />
                          Tasks
                        </label>
                      </div>

                      <div style={{ marginTop: '8px' }}>
                        <label htmlFor="tsText">Notes</label>
                        <br />
                        <textarea
                          id="tsText"
                          value={current.tsText}
                          onChange={e => this.updateCurrentItem({ tsText: e.target.value })}
                          rows={4}
                          cols={40}
                          placeholder="Enter details..."
                        />
                      </div>

                      <div style={{ marginTop: '8px' }}>
                        <small>Item {currentIndex + 1} of {items.length}</small>
                      </div>
                    </div>
                  );
                })()}

                <div style={{ marginTop: '12px' }}>
                  <button type="button" onClick={() => this.prevStep()}>Back</button>
                  <button type="button" onClick={() => this.nextStep()} style={{ marginLeft: '8px' }}>Next</button>
                  <button type="button" onClick={() => this.finishForm()} style={{ marginLeft: '8px' }}>Finish</button>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <label htmlFor="result">Result</label>
                  <br />
                  <textarea
                    id="result"
                    value={this.state.result}
                    readOnly
                    rows={8}
                    cols={60}
                    placeholder="LLM result will appear here"
                  />
                </div>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </>
  }
}

ReactDOM.render(<Index />, document.getElementById("index"));