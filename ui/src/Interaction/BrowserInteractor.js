import Interactor from "./Interactor";

Interactor.showInformationMessage = text => alert(text);
Interactor.sendFormValues = values => alert('Form values (browser): ' + JSON.stringify(values));
Interactor.sendGitUrls = (urls, storedItems) => alert('Git URLs (browser): ' + JSON.stringify(urls) + (storedItems ? ' storedItems: ' + JSON.stringify(storedItems) : ''));
Interactor.requestModelInfo = callback => {
  console.log('requestModelInfo called in browser mode');
  callback(null);
};
Interactor.selectModel = modelId => console.log('selectModel called in browser mode:', modelId);

export default Interactor;
