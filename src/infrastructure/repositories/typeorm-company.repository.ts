import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../domain/entities/company.entity';
import { CompanyPyme } from '../../domain/entities/company-pyme.entity';
import { CompanyCorporativa } from '../../domain/entities/company-corporativa.entity';
import { CompanyRepository } from '../../domain/repositories/company.repository.interface';
import { CompanyEntity } from '../database/entities/company.entity';

@Injectable()
export class TypeOrmCompanyRepository implements CompanyRepository {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
  ) {}

  async findAll(): Promise<Company[]> {
    const entities = await this.companyRepository.find();
    return entities.map((entity) => this.toDomainEntity(entity));
  }

  async findById(id: string): Promise<Company | null> {
    const entity = await this.companyRepository.findOne({ where: { id } });
    return entity ? this.toDomainEntity(entity) : null;
  }

  async findByCuit(cuit: string): Promise<Company | null> {
    const entity = await this.companyRepository.findOne({ where: { cuit } });
    return entity ? this.toDomainEntity(entity) : null;
  }

  async findByEmail(email: string): Promise<Company | null> {
    const entity = await this.companyRepository.findOne({ where: { email } });
    return entity ? this.toDomainEntity(entity) : null;
  }

  async save(company: Company): Promise<Company> {
    const entity = this.toEntity(company);
    const savedEntity = await this.companyRepository.save(entity);
    return this.toDomainEntity(savedEntity);
  }

  async update(
    id: string,
    updateData: Partial<Company>,
  ): Promise<Company | null> {
    const existingEntity = await this.companyRepository.findOne({
      where: { id },
    });
    if (!existingEntity) {
      return null;
    }

    // Merge the update data with existing entity
    const updatedEntity = this.companyRepository.merge(existingEntity, {
      ...updateData,
      id: existingEntity.id, // Preservar el ID
    });

    const savedEntity = await this.companyRepository.save(updatedEntity);
    return this.toDomainEntity(savedEntity);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.companyRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  private toDomainEntity(entity: CompanyEntity): Company {
    if (entity.type === 'PYME') {
      return new CompanyPyme(
        entity.id,
        entity.name,
        entity.cuit,
        entity.email,
        entity.employeeCount!,
        entity.annualRevenue!,
        entity.createdAt,
      );
    } else {
      return new CompanyCorporativa(
        entity.id,
        entity.name,
        entity.cuit,
        entity.email,
        entity.sector!,
        entity.isPublic!,
        entity.stockSymbol!,
        entity.createdAt,
      );
    }
  }

  private toEntity(company: Company): CompanyEntity {
    const entity = new CompanyEntity();
    entity.id = company.id;
    entity.name = company.name;
    entity.cuit = company.cuit;
    entity.email = company.email;
    entity.type = company.type;
    entity.createdAt = company.createdAt;

    if (company instanceof CompanyPyme) {
      entity.employeeCount = company.employeeCount;
      entity.annualRevenue = company.annualRevenue;
    } else if (company instanceof CompanyCorporativa) {
      entity.sector = company.sector;
      entity.isPublic = company.isMultinational;
      entity.stockSymbol = company.stockSymbol;
    }

    return entity;
  }
}
