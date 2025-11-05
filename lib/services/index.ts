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

// File Upload Service
export { fileUploadService } from './file-upload.service';
export type {
  UploadProgress,
  UploadResult,
  UploadOptions,
} from './file-upload.service';

// Bank Info Service
export {
  bankInfoService,
  BankInfoService,
  getBankByCode,
  getBankFromIBAN,
  getAllBanks,
  searchBanks,
  validateIBANWithBank,
  formatIBANForDisplay,
  maskIBAN,
  isBankCodeValid,
  getBankStatistics,
  generateSampleIBAN,
} from './bank-info-service';
export type {
  BankSearchOptions,
  BankValidationOptions,
} from './bank-info-service';
