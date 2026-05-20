const Interactor = {
  showInformationMessage: text => console.log(`showInformationMessage ${text}`),
  getDirectoryInfo: callback => console.log(`getDirectoryInfo ${callback}`),
  sendFormValues: values => console.log('sendFormValues', values),
  sendGitUrls: urls => console.log('sendGitUrls', urls)
}

export default Interactor;
