import { Adhesion } from '../entities/adhesion.entity';
import { Company } from '../entities/company.entity';

export interface AdhesionRepository {
  findAll(): Promise<Adhesion[]>;
  findById(id: string): Promise<Adhesion | null>;
  findByCompanyId(companyId: string): Promise<Adhesion[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Adhesion[]>;
  findCompaniesByAdhesionDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Company[]>;
  save(adhesion: Adhesion): Promise<Adhesion>;
  update(
    id: string,
    status: 'PENDING' | 'APPROVED' | 'REJECTED',
  ): Promise<Adhesion | null>;
  delete(id: string): Promise<boolean>;
}
