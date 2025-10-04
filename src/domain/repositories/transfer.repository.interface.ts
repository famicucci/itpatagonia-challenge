import { Transfer } from '../entities/transfer.entity';

export interface TransferRepository {
  findAll(): Promise<Transfer[]>;
  findById(id: string): Promise<Transfer | null>;
  findByCompanyId(companyId: string): Promise<Transfer[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Transfer[]>;
  findCompaniesByTransferDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<string[]>;
  save(transfer: Transfer): Promise<Transfer>;
  delete(id: string): Promise<boolean>;
}
