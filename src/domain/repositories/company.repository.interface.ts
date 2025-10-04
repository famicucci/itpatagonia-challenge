import { Company } from '../entities/company.entity';

export interface CompanyRepository {
  findAll(): Promise<Company[]>;
  findById(id: string): Promise<Company | null>;
  findByCuit(cuit: string): Promise<Company | null>;
  findByEmail(email: string): Promise<Company | null>;
  save(company: Company): Promise<Company>;
  update(id: string, company: Partial<Company>): Promise<Company | null>;
  delete(id: string): Promise<boolean>;
}
