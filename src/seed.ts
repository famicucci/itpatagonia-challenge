import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TypeOrmCompanyRepository } from './infrastructure/repositories/typeorm-company.repository';
import { TypeOrmTransferRepository } from './infrastructure/repositories/typeorm-transfer.repository';
import { TypeOrmAdhesionRepository } from './infrastructure/repositories/typeorm-adhesion.repository';
import { CompanyPyme } from './domain/entities/company-pyme.entity';
import { CompanyCorporativa } from './domain/entities/company-corporativa.entity';
import { Transfer } from './domain/entities/transfer.entity';
import { Adhesion } from './domain/entities/adhesion.entity';

async function seedDatabase() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const companyRepo = app.get(TypeOrmCompanyRepository);
  const transferRepo = app.get(TypeOrmTransferRepository);
  const adhesionRepo = app.get(TypeOrmAdhesionRepository);

  console.log('🌱 Seeding database with initial data...');

  try {
    // Create companies
    const companies = [
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
        'BNANC',
        new Date('2024-08-20'),
      ),
      new CompanyCorporativa(
        '4',
        'Petróleo Argentino Corp',
        '30-22222222-7',
        'contact@petroarg.com',
        'Energía',
        true,
        'PETRO',
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

    for (const company of companies) {
      await companyRepo.save(company);
      console.log(`✅ Created company: ${company.name}`);
    }

    // Create transfers
    const transfers = [
      // Transferencias del último mes (septiembre 2025)
      new Transfer(
        '1',
        '1', // TechStart Solutions
        150000,
        'ARS',
        '0001-0001-0001-12345678',
        'Pago a proveedor de software',
        new Date('2025-09-15'),
      ),
      new Transfer(
        '2',
        '3', // Banco Nacional SA
        500000,
        'USD',
        '0002-0002-0002-87654321',
        'Transferencia internacional',
        new Date('2025-09-20'),
      ),
      new Transfer(
        '3',
        '2', // Innovación Digital SRL
        75000,
        'ARS',
        '0003-0003-0003-11111111',
        'Pago de servicios',
        new Date('2025-09-25'),
      ),
      new Transfer(
        '4',
        '4', // Petróleo Argentino Corp
        1000000,
        'USD',
        '0004-0004-0004-22222222',
        'Inversión en exploración',
        new Date('2025-09-28'),
      ),
      new Transfer(
        '5',
        '1', // TechStart Solutions (segunda transferencia)
        200000,
        'ARS',
        '0005-0005-0005-33333333',
        'Pago de nómina',
        new Date('2025-09-30'),
      ),
      // Transferencias de meses anteriores (para verificar filtrado)
      new Transfer(
        '6',
        '3',
        300000,
        'ARS',
        '0006-0006-0006-44444444',
        'Transferencia histórica',
        new Date('2025-08-15'),
      ),
      new Transfer(
        '7',
        '2',
        50000,
        'ARS',
        '0007-0007-0007-55555555',
        'Pago histórico',
        new Date('2025-07-10'),
      ),
    ];

    for (const transfer of transfers) {
      await transferRepo.save(transfer);
      console.log(`✅ Created transfer: ${transfer.description}`);
    }

    // Create adhesions
    const adhesions = [
      new Adhesion(
        '1',
        companies[0], // TechStart Solutions
        new Date('2025-09-10'),
        'APPROVED',
      ),
      new Adhesion(
        '2',
        companies[1], // Innovación Digital SRL
        new Date('2025-09-15'),
        'APPROVED',
      ),
      new Adhesion(
        '3',
        companies[3], // Petróleo Argentino Corp
        new Date('2025-09-25'),
        'APPROVED',
      ),
      new Adhesion(
        '4',
        companies[4], // Desarrollo Web Buenos Aires
        new Date('2025-09-30'),
        'PENDING',
      ),
      new Adhesion(
        '5',
        companies[2], // Banco Nacional SA
        new Date('2025-08-20'),
        'APPROVED',
      ),
    ];

    for (const adhesion of adhesions) {
      await adhesionRepo.save(adhesion);
      console.log(`✅ Created adhesion for: ${adhesion.company.name}`);
    }

    console.log('🎉 Database seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   - ${companies.length} companies created`);
    console.log(`   - ${transfers.length} transfers created`);
    console.log(`   - ${adhesions.length} adhesions created`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await app.close();
  }
}

// Run the seeder
if (require.main === module) {
  seedDatabase().catch(console.error);
}
