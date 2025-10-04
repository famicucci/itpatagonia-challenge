import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Adhesion } from '../../domain/entities/adhesion.entity';
import { Company } from '../../domain/entities/company.entity';
import { AdhesionRepository } from '../../domain/repositories/adhesion.repository.interface';
import { AdhesionEntity } from '../database/entities/adhesion.entity';
import { TypeOrmCompanyRepository } from './typeorm-company.repository';

@Injectable()
export class TypeOrmAdhesionRepository implements AdhesionRepository {
  constructor(
    @InjectRepository(AdhesionEntity)
    private readonly adhesionRepository: Repository<AdhesionEntity>,
    private readonly companyRepository: TypeOrmCompanyRepository,
  ) {}

  async findAll(): Promise<Adhesion[]> {
    const entities = await this.adhesionRepository.find({
      relations: ['company'],
    });

    const adhesions: Adhesion[] = [];
    for (const entity of entities) {
      const company = await this.companyRepository.findById(entity.companyId);
      if (company) {
        adhesions.push(this.toDomainEntity(entity, company));
      }
    }
    return adhesions;
  }

  async findById(id: string): Promise<Adhesion | null> {
    const entity = await this.adhesionRepository.findOne({
      where: { id },
      relations: ['company'],
    });

    if (!entity) return null;

    const company = await this.companyRepository.findById(entity.companyId);
    return company ? this.toDomainEntity(entity, company) : null;
  }

  async findByCompanyId(companyId: string): Promise<Adhesion[]> {
    const entities = await this.adhesionRepository.find({
      where: { companyId },
      relations: ['company'],
    });

    const adhesions: Adhesion[] = [];
    for (const entity of entities) {
      const company = await this.companyRepository.findById(entity.companyId);
      if (company) {
        adhesions.push(this.toDomainEntity(entity, company));
      }
    }
    return adhesions;
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Adhesion[]> {
    const entities = await this.adhesionRepository.find({
      where: {
        adhesionDate: Between(startDate, endDate),
      },
      relations: ['company'],
      order: {
        adhesionDate: 'DESC',
      },
    });

    const adhesions: Adhesion[] = [];
    for (const entity of entities) {
      const company = await this.companyRepository.findById(entity.companyId);
      if (company) {
        adhesions.push(this.toDomainEntity(entity, company));
      }
    }
    return adhesions;
  }

  async findCompaniesByAdhesionDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Company[]> {
    const entities = await this.adhesionRepository.find({
      where: {
        adhesionDate: Between(startDate, endDate),
        status: 'APPROVED',
      },
      relations: ['company'],
    });

    const companies: Company[] = [];
    for (const entity of entities) {
      const company = await this.companyRepository.findById(entity.companyId);
      if (company) {
        companies.push(company);
      }
    }
    return companies;
  }

  async save(adhesion: Adhesion): Promise<Adhesion> {
    const entity = this.toEntity(adhesion);
    const savedEntity = await this.adhesionRepository.save(entity);
    return this.toDomainEntity(savedEntity, adhesion.company);
  }

  async update(
    id: string,
    status: 'PENDING' | 'APPROVED' | 'REJECTED',
  ): Promise<Adhesion | null> {
    const existingEntity = await this.adhesionRepository.findOne({
      where: { id },
      relations: ['company'],
    });

    if (!existingEntity) return null;

    const company = await this.companyRepository.findById(
      existingEntity.companyId,
    );
    if (!company) return null;

    // Crear la adhesión actual para usar los métodos del dominio
    const currentAdhesion = this.toDomainEntity(existingEntity, company);

    let updatedAdhesion: Adhesion;
    if (status === 'APPROVED') {
      updatedAdhesion = currentAdhesion.approve();
    } else if (status === 'REJECTED') {
      updatedAdhesion = currentAdhesion.reject();
    } else {
      updatedAdhesion = new Adhesion(
        currentAdhesion.id,
        currentAdhesion.company,
        currentAdhesion.adhesionDate,
        status,
      );
    }

    const entityToUpdate = this.toEntity(updatedAdhesion);
    entityToUpdate.updatedAt = new Date();

    const savedEntity = await this.adhesionRepository.save(entityToUpdate);
    return this.toDomainEntity(savedEntity, company);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.adhesionRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  private toDomainEntity(entity: AdhesionEntity, company: Company): Adhesion {
    return new Adhesion(entity.id, company, entity.adhesionDate, entity.status);
  }

  private toEntity(adhesion: Adhesion): AdhesionEntity {
    const entity = new AdhesionEntity();
    entity.id = adhesion.id;
    entity.companyId = adhesion.company.id;
    entity.adhesionDate = adhesion.adhesionDate;
    entity.status = adhesion.status;
    return entity;
  }
}
