import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transfer } from '../../domain/entities/transfer.entity';
import { TransferRepository } from '../../domain/repositories/transfer.repository.interface';
import { TransferEntity } from '../database/entities/transfer.entity';

@Injectable()
export class TypeOrmTransferRepository implements TransferRepository {
  constructor(
    @InjectRepository(TransferEntity)
    private readonly transferRepository: Repository<TransferEntity>,
  ) {}

  async findAll(): Promise<Transfer[]> {
    const entities = await this.transferRepository.find();
    return entities.map((entity) => this.toDomainEntity(entity));
  }

  async findById(id: string): Promise<Transfer | null> {
    const entity = await this.transferRepository.findOne({ where: { id } });
    return entity ? this.toDomainEntity(entity) : null;
  }

  async findByCompanyId(companyId: string): Promise<Transfer[]> {
    const entities = await this.transferRepository.find({
      where: { companyId },
    });
    return entities.map((entity) => this.toDomainEntity(entity));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Transfer[]> {
    const entities = await this.transferRepository.find({
      where: {
        transferDate: Between(startDate, endDate),
      },
      order: {
        transferDate: 'DESC',
      },
    });
    return entities.map((entity) => this.toDomainEntity(entity));
  }

  async findCompaniesByTransferDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<string[]> {
    const result = await this.transferRepository
      .createQueryBuilder('transfer')
      .select('DISTINCT transfer.companyId', 'companyId')
      .where('transfer.transferDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getRawMany();

    return result.map((item) => item.companyId);
  }

  async save(transfer: Transfer): Promise<Transfer> {
    const entity = this.toEntity(transfer);
    const savedEntity = await this.transferRepository.save(entity);
    return this.toDomainEntity(savedEntity);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.transferRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  private toDomainEntity(entity: TransferEntity): Transfer {
    return new Transfer(
      entity.id,
      entity.companyId,
      entity.amount,
      entity.currency,
      entity.destinationAccount,
      entity.description,
      entity.transferDate,
    );
  }

  private toEntity(transfer: Transfer): TransferEntity {
    const entity = new TransferEntity();
    entity.id = transfer.id;
    entity.companyId = transfer.companyId;
    entity.amount = transfer.amount;
    entity.currency = transfer.currency;
    entity.destinationAccount = transfer.destinationAccount;
    entity.description = transfer.description;
    entity.transferDate = transfer.transferDate;
    return entity;
  }
}
