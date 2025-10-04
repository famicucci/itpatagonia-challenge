import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('companies')
export class CompanyEntity {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('varchar', { length: 13, unique: true })
  cuit: string;

  @Column('varchar', { length: 255, unique: true })
  email: string;

  @Column('varchar', { length: 20 })
  type: 'PYME' | 'CORPORATIVA';

  @CreateDateColumn()
  createdAt: Date;

  // Campos específicos para PYME
  @Column('int', { nullable: true })
  employeeCount?: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  annualRevenue?: number;

  // Campos específicos para CORPORATIVA
  @Column('varchar', { length: 100, nullable: true })
  sector?: string;

  @Column('boolean', { nullable: true })
  isPublic?: boolean;

  @Column('varchar', { length: 10, nullable: true })
  stockSymbol?: string;
}
