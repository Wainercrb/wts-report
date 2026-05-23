import Interactor from "./Interactor";

const VsCodeStateChangeCallbacks = {
  getDirectoryInfo: directoryInfo => {},
  onModelInfo: modelInfo => {}
}

const VsCodeStateChangeBuffer = {
  directoryInfo: "",
  modelInfo: null
}

window.addEventListener('message', event => {
  const message = event.data;

  switch(message.command){
    case 'getDirectoryInfo':
      VsCodeStateChangeBuffer.directoryInfo += message.directoryInfo;
      VsCodeStateChangeCallbacks.getDirectoryInfo(VsCodeStateChangeBuffer.directoryInfo);
    break;
    case 'modelInfo':
      VsCodeStateChangeBuffer.modelInfo = message.modelInfo;
      VsCodeStateChangeCallbacks.onModelInfo(message.modelInfo);
    break;
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
      command: 'formValues',
      values: values
    });

  Interactor.sendGitUrls = urls =>
    vscode.postMessage({
      command: 'checkGitHistory',
      urls: urls
    });

  Interactor.getDirectoryInfo = callback => {
    VsCodeStateChangeCallbacks.getDirectoryInfo = callback;
    VsCodeStateChangeBuffer.directoryInfo = "";
    vscode.postMessage({ command: 'getDirectoryInfo' });
  }

  Interactor.requestModelInfo = callback => {
    VsCodeStateChangeCallbacks.onModelInfo = callback;
    vscode.postMessage({ command: 'getModelInfo' });
  }

  return Interactor;
}

const VsCodeInteractorFactory = {
  createFromVsCodeApi: vscode => createFromVsCodeApi(vscode)
}

export default VsCodeInteractorFactory;
