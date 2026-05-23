const Interactor = {
  showInformationMessage: text => console.log(`showInformationMessage ${text}`),
  getDirectoryInfo: callback => console.log(`getDirectoryInfo ${callback}`),
  sendFormValues: values => console.log('sendFormValues', values),
  sendGitUrls: (urls, storedItems) => console.log('sendGitUrls', urls, storedItems),
  requestModelInfo: () => console.log('requestModelInfo')
}

export default Interactor;
