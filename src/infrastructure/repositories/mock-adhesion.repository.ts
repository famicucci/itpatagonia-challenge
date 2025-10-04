import { Injectable } from '@nestjs/common';
import { Adhesion } from '../../domain/entities/adhesion.entity';
import { Company } from '../../domain/entities/company.entity';
import { CompanyPyme } from '../../domain/entities/company-pyme.entity';
import { CompanyCorporativa } from '../../domain/entities/company-corporativa.entity';
import type { AdhesionRepository } from '../../domain/repositories/adhesion.repository.interface';

@Injectable()
export class MockAdhesionRepository implements AdhesionRepository {
  private adhesions: Adhesion[] = [
    // Adhesiones del último mes (septiembre 2025)
    new Adhesion(
      '1',
      new CompanyPyme(
        '1',
        'TechStart Solutions',
        '20-12345678-5',
        'contact@techstart.com',
        15,
        2500000,
        new Date('2025-09-10'),
      ),
      new Date('2025-09-10'),
      'APPROVED',
    ),
    new Adhesion(
      '2',
      new CompanyPyme(
        '2',
        'Innovación Digital SRL',
        '20-87654321-3',
        'info@innovacion.com',
        8,
        1800000,
        new Date('2025-09-15'),
      ),
      new Date('2025-09-15'),
      'APPROVED',
    ),
    new Adhesion(
      '3',
      new CompanyCorporativa(
        '4',
        'Petróleo Argentino Corp',
        '30-22222222-7',
        'contact@petroarg.com',
        'Energía',
        true,
        'PAC',
        new Date('2025-09-25'),
      ),
      new Date('2025-09-25'),
      'APPROVED',
    ),
    new Adhesion(
      '4',
      new CompanyPyme(
        '5',
        'Desarrollo Web Buenos Aires',
        '20-33333333-1',
        'hello@devweb.com',
        12,
        3200000,
        new Date('2025-09-30'),
      ),
      new Date('2025-09-30'),
      'PENDING',
    ),
    // Adhesiones de meses anteriores (para verificar filtrado)
    new Adhesion(
      '5',
      new CompanyCorporativa(
        '3',
        'Banco Nacional SA',
        '30-11111111-9',
        'corporate@banconacional.com',
        'Financiero',
        false,
        'BNA',
        new Date('2025-08-20'),
      ),
      new Date('2025-08-20'),
      'APPROVED',
    ),
  ];

  async findAll(): Promise<Adhesion[]> {
    await this.delay(100);
    return [...this.adhesions];
  }

  async findById(id: string): Promise<Adhesion | null> {
    await this.delay(50);
    const adhesion = this.adhesions.find((adhesion) => adhesion.id === id);
    return adhesion || null;
  }

  async findByCompanyId(companyId: string): Promise<Adhesion[]> {
    await this.delay(50);
    return this.adhesions.filter(
      (adhesion) => adhesion.company.id === companyId,
    );
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Adhesion[]> {
    await this.delay(100);
    return this.adhesions.filter((adhesion) => {
      const adhesionDate = new Date(adhesion.adhesionDate);
      return adhesionDate >= startDate && adhesionDate <= endDate;
    });
  }

  async findCompaniesByAdhesionDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Company[]> {
    await this.delay(100);
    const adhesionsInRange = await this.findByDateRange(startDate, endDate);

    // Retornar las empresas que se adhirieron en el rango (solo aprobadas)
    return adhesionsInRange
      .filter((adhesion) => adhesion.status === 'APPROVED')
      .map((adhesion) => adhesion.company);
  }

  async save(adhesion: Adhesion): Promise<Adhesion> {
    await this.delay(100);
    this.adhesions.push(adhesion);
    return adhesion;
  }

  async update(
    id: string,
    status: 'PENDING' | 'APPROVED' | 'REJECTED',
  ): Promise<Adhesion | null> {
    await this.delay(100);
    const adhesionIndex = this.adhesions.findIndex(
      (adhesion) => adhesion.id === id,
    );

    if (adhesionIndex === -1) {
      return null;
    }

    const existingAdhesion = this.adhesions[adhesionIndex];
    let updatedAdhesion: Adhesion;

    if (status === 'APPROVED') {
      updatedAdhesion = existingAdhesion.approve();
    } else if (status === 'REJECTED') {
      updatedAdhesion = existingAdhesion.reject();
    } else {
      updatedAdhesion = new Adhesion(
        existingAdhesion.id,
        existingAdhesion.company,
        existingAdhesion.adhesionDate,
        status,
      );
    }

    this.adhesions[adhesionIndex] = updatedAdhesion;
    return updatedAdhesion;
  }

  async delete(id: string): Promise<boolean> {
    await this.delay(100);
    const initialLength = this.adhesions.length;
    this.adhesions = this.adhesions.filter((adhesion) => adhesion.id !== id);
    return this.adhesions.length < initialLength;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
