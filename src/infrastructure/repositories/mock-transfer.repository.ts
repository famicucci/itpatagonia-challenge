import { Injectable } from '@nestjs/common';
import { Transfer } from '../../domain/entities/transfer.entity';
import type { TransferRepository } from '../../domain/repositories/transfer.repository.interface';

@Injectable()
export class MockTransferRepository implements TransferRepository {
  private transfers: Transfer[] = [
    // Transferencias del último mes (septiembre 2025)
    new Transfer(
      '1',
      '1', // TechStart Solutions
      150000,
      'ARS',
      '0001-0001-0001-12345678',
      'Pago a proveedor de software',
      new Date('2025-09-15'),
    ),
    new Transfer(
      '2',
      '3', // Banco Nacional SA
      500000,
      'USD',
      '0002-0002-0002-87654321',
      'Transferencia internacional',
      new Date('2025-09-20'),
    ),
    new Transfer(
      '3',
      '2', // Innovación Digital SRL
      75000,
      'ARS',
      '0003-0003-0003-11111111',
      'Pago de servicios',
      new Date('2025-09-25'),
    ),
    new Transfer(
      '4',
      '4', // Petróleo Argentino Corp
      1000000,
      'USD',
      '0004-0004-0004-22222222',
      'Inversión en exploración',
      new Date('2025-09-28'),
    ),
    new Transfer(
      '5',
      '1', // TechStart Solutions (segunda transferencia)
      200000,
      'ARS',
      '0005-0005-0005-33333333',
      'Pago de nómina',
      new Date('2025-09-30'),
    ),
    // Transferencias de meses anteriores (para verificar filtrado)
    new Transfer(
      '6',
      '3',
      300000,
      'ARS',
      '0006-0006-0006-44444444',
      'Transferencia histórica',
      new Date('2025-08-15'),
    ),
    new Transfer(
      '7',
      '2',
      50000,
      'ARS',
      '0007-0007-0007-55555555',
      'Pago histórico',
      new Date('2025-07-10'),
    ),
  ];

  async findAll(): Promise<Transfer[]> {
    await this.delay(100);
    return [...this.transfers];
  }

  async findById(id: string): Promise<Transfer | null> {
    await this.delay(50);
    const transfer = this.transfers.find((transfer) => transfer.id === id);
    return transfer || null;
  }

  async findByCompanyId(companyId: string): Promise<Transfer[]> {
    await this.delay(50);
    return this.transfers.filter(
      (transfer) => transfer.companyId === companyId,
    );
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Transfer[]> {
    await this.delay(100);
    return this.transfers.filter((transfer) => {
      const transferDate = new Date(transfer.transferDate);
      return transferDate >= startDate && transferDate <= endDate;
    });
  }

  async findCompaniesByTransferDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<string[]> {
    await this.delay(100);
    const transfersInRange = await this.findByDateRange(startDate, endDate);

    // Obtener IDs únicos de empresas que realizaron transferencias en el rango
    const uniqueCompanyIds = [
      ...new Set(transfersInRange.map((transfer) => transfer.companyId)),
    ];

    return uniqueCompanyIds;
  }

  async save(transfer: Transfer): Promise<Transfer> {
    await this.delay(100);
    this.transfers.push(transfer);
    return transfer;
  }

  async delete(id: string): Promise<boolean> {
    await this.delay(100);
    const initialLength = this.transfers.length;
    this.transfers = this.transfers.filter((transfer) => transfer.id !== id);
    return this.transfers.length < initialLength;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
