import Interactor from "./Interactor";
import { COMMANDS, CONFIG } from '../../../out/consts';

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
    command: CONFIG.INFO_ALERT,
    text: text
  });

  Interactor.sendFormValues = values =>
    vscode.postMessage({
      command: COMMANDS.MANUAL_TIMESHEET,
      values
    });

  Interactor.sendGitUrls = (urls, storedItems) =>
    vscode.postMessage({
      command: COMMANDS.AUTOMATIC_TIMESHEET,
      urls,
      ...(storedItems && storedItems.length > 0 ? { storedItems } : {})
    });

  Interactor.requestModelInfo = callback => {
    VsCodeStateChangeCallbacks.onModelInfo = callback;
    vscode.postMessage({ command: COMMANDS.GET_MODEL_INFO });
  }

  Interactor.selectModel = modelId =>
    vscode.postMessage({
      command: COMMANDS.SELECT_MODEL,
      modelId
    });

  return Interactor;
}

const VsCodeInteractorFactory = {
  createFromVsCodeApi: vscode => createFromVsCodeApi(vscode)
}

export default VsCodeInteractorFactory;
