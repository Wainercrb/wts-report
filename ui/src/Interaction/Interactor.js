const Interactor = {
  showInformationMessage: text => console.log(`showInformationMessage ${text}`),
  selectModel: modelId => console.log('selectModel', modelId),
  sendFormValues: values => console.log('sendFormValues', values),
  sendGitUrls: (urls, storedItems) => console.log('sendGitUrls', urls, storedItems),
  requestModelInfo: () => console.log('requestModelInfo')
}

export default Interactor;
