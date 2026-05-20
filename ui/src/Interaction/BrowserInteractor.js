import Interactor from "./Interactor";

Interactor.showInformationMessage = text => alert(text);
Interactor.getDirectoryInfo = callback => callback('Directory: C:\\somewhere\\somedir\\ \n SomeFile.sql, SomeOtherFile.sql')
Interactor.sendFormValues = values => alert('Form values (browser): ' + JSON.stringify(values));
Interactor.sendGitUrls = urls => alert('Git URLs (browser): ' + JSON.stringify(urls));

export default Interactor;
