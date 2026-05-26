const Interactor = {
  showInformationMessage: text => console.log(`showInformationMessage ${text}`),
  sendFormValues: values => console.log('sendFormValues', values),
  sendGitUrls: (urls, storedItems) => console.log('sendGitUrls', urls, storedItems),
  requestModelInfo: () => console.log('requestModelInfo')
}

export default Interactor;
