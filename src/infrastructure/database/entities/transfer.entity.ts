import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CompanyEntity } from './company.entity';

@Entity('transfers')
export class TransferEntity {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 36 })
  companyId: string;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column('varchar', { length: 3 })
  currency: string;

  @Column('varchar', { length: 50 })
  destinationAccount: string;

  @Column('text')
  description: string;

  @Column('datetime')
  transferDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  // Relación con Company
  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'companyId' })
  company: CompanyEntity;
}
