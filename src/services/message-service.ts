import * as vscode from 'vscode';
import { IMessageService } from '../types';
import { MESSAGES } from '../constants/messages';

export class MessageService implements IMessageService {
  showProcessing(message: string = MESSAGES.LOADING.PROCESSING_FORM_SUBMISSION): void {
    vscode.window.showInformationMessage(message);
  }

  showSuccess(message: string = MESSAGES.SUCCESS.FORM_PROCESSED_SUCCESSFULLY): void {
    vscode.window.showInformationMessage(message);
  }

  showError(message: string): void {
    vscode.window.showErrorMessage(message);
  }
}
