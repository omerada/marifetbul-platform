/**
 * ================================================
 * SERVICES BARREL EXPORTS
 * ================================================
 * Centralized exports for service layer
 *
 * @author MarifetBul Development Team
 * @version 1.1.0
 * @updated November 5, 2025 - Added BankInfoService
 */

import bankInfoService from './bank-info-service';
import type { BankSearchOptions } from './bank-info-service';

// File Upload Service
export { fileUploadService } from './file-upload.service';
export type {
  UploadProgress,
  UploadResult,
  UploadOptions,
} from './file-upload.service';

// Bank Info Service
export {
  default as bankInfoService,
  bankInfoService as BankInfoServiceInstance,
  BankInfoService,
} from './bank-info-service';
export type {
  BankInfo,
  BankSearchOptions,
  BankValidationOptions,
} from './bank-info-service';

// Helper functions from bank service
export const getBankByCode = (code: string) =>
  bankInfoService.getBankByCode(code);
export const getBankFromIBAN = (iban: string) =>
  bankInfoService.getBankFromIBAN(iban);
export const getAllBanks = () => bankInfoService.getAllBanks();
export const searchBanks = (options?: BankSearchOptions) =>
  bankInfoService.searchBanks(options);
export const validateIBANWithBank = (iban: string) =>
  bankInfoService.validateWithBank(iban);
export const formatIBANForDisplay = (iban: string) =>
  bankInfoService.formatForDisplay(iban);
export const maskIBAN = (iban: string) => bankInfoService.maskIBAN(iban);
export const isBankCodeValid = (code: string) =>
  bankInfoService.hasBankCode(code);
export const getBankStatistics = () => bankInfoService.getStatistics();
export const generateSampleIBAN = (bankCode: string) =>
  bankInfoService.generateSampleIBAN(bankCode);
