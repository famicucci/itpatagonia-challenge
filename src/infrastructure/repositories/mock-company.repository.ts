import { Injectable } from '@nestjs/common';
import { Company } from '../../domain/entities/company.entity';
import { CompanyPyme } from '../../domain/entities/company-pyme.entity';
import { CompanyCorporativa } from '../../domain/entities/company-corporativa.entity';
import type { CompanyRepository } from '../../domain/repositories/company.repository.interface';

@Injectable()
export class MockCompanyRepository implements CompanyRepository {
  private companies: Company[] = [
    new CompanyPyme(
      '1',
      'TechStart Solutions',
      '20-12345678-5',
      'contact@techstart.com',
      15,
      2500000,
      new Date('2024-09-10'),
    ),
    new CompanyPyme(
      '2',
      'Innovación Digital SRL',
      '20-87654321-3',
      'info@innovacion.com',
      8,
      1800000,
      new Date('2024-09-15'),
    ),
    new CompanyCorporativa(
      '3',
      'Banco Nacional SA',
      '30-11111111-9',
      'corporate@banconacional.com',
      'Financiero',
      false,
      'BNA',
      new Date('2024-08-20'),
    ),
    new CompanyCorporativa(
      '4',
      'Petróleo Argentino Corp',
      '30-22222222-7',
      'contact@petroarg.com',
      'Energía',
      true,
      'PAC',
      new Date('2024-09-25'),
    ),
    new CompanyPyme(
      '5',
      'Desarrollo Web Buenos Aires',
      '20-33333333-1',
      'hello@devweb.com',
      12,
      3200000,
      new Date('2024-09-30'),
    ),
  ];

  async findAll(): Promise<Company[]> {
    await this.delay(100);
    return [...this.companies];
  }

  async findById(id: string): Promise<Company | null> {
    await this.delay(50);
    const company = this.companies.find((company) => company.id === id);
    return company || null;
  }

  async findByCuit(cuit: string): Promise<Company | null> {
    await this.delay(50);
    const company = this.companies.find((company) => company.cuit === cuit);
    return company || null;
  }

  async findByEmail(email: string): Promise<Company | null> {
    await this.delay(50);
    const company = this.companies.find((company) => company.email === email);
    return company || null;
  }

  async save(company: Company): Promise<Company> {
    await this.delay(100);
    this.companies.push(company);
    return company;
  }

  async update(
    id: string,
    updateData: Partial<Company>,
  ): Promise<Company | null> {
    await this.delay(100);
    const companyIndex = this.companies.findIndex(
      (company) => company.id === id,
    );

    if (companyIndex === -1) {
      return null;
    }

    const existingCompany = this.companies[companyIndex];

    // For simplicity, we'll recreate the company with updated data
    // In a real implementation, you'd need proper update logic
    const updatedCompany = { ...existingCompany, ...updateData } as Company;
    this.companies[companyIndex] = updatedCompany;

    return updatedCompany;
  }

  async delete(id: string): Promise<boolean> {
    await this.delay(100);
    const initialLength = this.companies.length;
    this.companies = this.companies.filter((company) => company.id !== id);
    return this.companies.length < initialLength;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
