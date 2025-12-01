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
export const getAllBanks = (options?: BankSearchOptions) =>
  bankInfoService.getAllBanks(options);
export const searchBanks = (query: string, options?: BankSearchOptions) =>
  bankInfoService.searchBanks(query, options);
export const validateIBANWithBank = (iban: string) =>
  bankInfoService.validateIBANWithBank(iban);
// REMOVED: formatForDisplay, maskIBAN, getStatistics, generateSampleIBAN - use utils/iban-validator instead
export const isBankCodeValid = (code: string) =>
  bankInfoService.hasBankCode(code);
