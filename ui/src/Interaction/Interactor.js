const Interactor = {
  showInformationMessage: text => console.log(`showInformationMessage ${text}`),
  sendFormValues: values => console.log('sendFormValues', values),
  sendGitUrls: (urls, storedItems) => console.log('sendGitUrls', urls, storedItems),
  requestModelInfo: callback => {
    console.log('requestModelInfo (default)');
    callback(null);
  },
  selectModel: modelId => console.log('selectModel (default):', modelId)
}

export default Interactor;
