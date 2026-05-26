import Interactor from "./Interactor";
import { COMMANDS, CONFIG } from '../../../out/consts';

const VsCodeStateChangeCallbacks = {
  onModelInfo: modelInfo => {}
}

const VsCodeStateChangeBuffer = {
  directoryInfo: "",
  modelInfo: null
}

window.addEventListener('message', event => {
  const message = event.data;

  switch(message.command){
    case COMMANDS.GET_AVAILABLE_MODELS:
      VsCodeStateChangeBuffer.modelInfo = message.modelInfo;
      VsCodeStateChangeCallbacks.onModelInfo(message.modelInfo);
    break;
  }
});

function createFromVsCodeApi(vscode) {
  Interactor.showInformationMessage = text =>
    vscode.postMessage({
    command: CONFIG.INFO_ALERT,
    text: text
  });

  Interactor.sendFormValues = values =>
    vscode.postMessage({
      command: COMMANDS.MANUAL_TIMESHEET_REPORT,
      values: values
    });

  Interactor.sendGitUrls = (urls, storedItems) =>
    vscode.postMessage({
      command: COMMANDS.AUTOMATIC_TIMESHEET_REPORT,
      urls: urls,
      ...(storedItems && storedItems.length > 0 ? { storedItems } : {})
    });

  Interactor.requestModelInfo = callback => {
    VsCodeStateChangeCallbacks.onModelInfo = callback;
    vscode.postMessage({ command: COMMANDS.GET_AVAILABLE_MODELS });
  }

  return Interactor;
}

const VsCodeInteractorFactory = {
  createFromVsCodeApi: vscode => createFromVsCodeApi(vscode)
}

export default VsCodeInteractorFactory;
