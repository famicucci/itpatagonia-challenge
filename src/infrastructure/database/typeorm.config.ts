import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CompanyEntity } from './entities/company.entity';
import { TransferEntity } from './entities/transfer.entity';
import { AdhesionEntity } from './entities/adhesion.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'database/challenge.sqlite',
  entities: [CompanyEntity, TransferEntity, AdhesionEntity],
  synchronize: true, // Solo para desarrollo - crea las tablas automáticamente
  logging: false, // Cambiar a true si quieres ver las queries SQL
  migrations: ['dist/infrastructure/database/migrations/*.js'],
  migrationsRun: false,
};

export const typeOrmTestConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: ':memory:', // Base de datos en memoria para tests
  entities: [CompanyEntity, TransferEntity, AdhesionEntity],
  synchronize: true,
  logging: false,
  dropSchema: true, // Limpia la BD antes de cada test
};
