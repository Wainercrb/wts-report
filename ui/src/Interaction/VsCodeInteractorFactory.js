import Interactor from "./Interactor";

const VsCodeStateChangeCallbacks = {
  onModelInfo: modelInfo => {}
}

const VsCodeStateChangeBuffer = {
  modelInfo: null
}

window.addEventListener('message', event => {
  const message = event.data;

  if (message.modelInfo) {
    VsCodeStateChangeBuffer.modelInfo = message.modelInfo;
    VsCodeStateChangeCallbacks.onModelInfo(message.modelInfo);
  }
});

function createFromVsCodeApi(vscode) {
  Interactor.showInformationMessage = text =>
    vscode.postMessage({
    command: 'showInformationMessage',
    text: text
  });

  Interactor.sendFormValues = values =>
    vscode.postMessage({
      command: 'manualTimesheet',
      values: values
    });

  Interactor.sendGitUrls = (urls, storedItems) =>
    vscode.postMessage({
      command: 'automaticTimesheet',
      urls: urls,
      ...(storedItems && storedItems.length > 0 ? { storedItems } : {})
    });

  Interactor.requestModelInfo = callback => {
    VsCodeStateChangeCallbacks.onModelInfo = callback;
    vscode.postMessage({ command: 'getModelInfo' });
  }

  Interactor.selectModel = modelId =>
    vscode.postMessage({ command: 'selectModel', modelId });

  return Interactor;
}

const VsCodeInteractorFactory = {
  createFromVsCodeApi: vscode => createFromVsCodeApi(vscode)
}

export default VsCodeInteractorFactory;
