/**
 * Test configuration and setup utilities
 */

import { DataSource } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity } from '../../infrastructure/database/entities/company.entity';
import { TransferEntity } from '../../infrastructure/database/entities/transfer.entity';
import { AdhesionEntity } from '../../infrastructure/database/entities/adhesion.entity';

/**
 * Global test configuration
 */
export const TEST_CONFIG = {
  database: {
    type: 'sqlite' as const,
    database: ':memory:',
    synchronize: true,
    logging: false,
    entities: [CompanyEntity, TransferEntity, AdhesionEntity] as any[],
  },
  timeouts: {
    default: 5000,
    database: 10000,
    integration: 15000,
  },
  dates: {
    defaultTestDate: new Date('2024-10-01'),
    lastMonth: new Date('2024-09-01'),
    thisMonth: new Date('2024-10-01'),
    nextMonth: new Date('2024-11-01'),
  },
} as const;

/**
 * Common test data constants
 */
export const TEST_DATA = {
  companies: {
    pyme: {
      cuit: '20-12345678-9',
      name: 'Test PYME Company',
      email: 'test.pyme@company.com',
      type: 'PYME' as const,
      employeeCount: 25,
      annualRevenue: 5000000,
    },
    corporativa: {
      cuit: '30-87654321-2',
      name: 'Test CORPORATIVA Company',
      email: 'test.corporativa@company.com',
      type: 'CORPORATIVA' as const,
      sector: 'Technology',
      isMultinational: true,
      stockSymbol: 'TST',
    },
  },
  transfers: {
    valid: {
      destinationAccount: '1234-5678-9012-34567890',
      amount: 10000,
      currency: 'ARS',
      description: 'Test transfer',
    },
    invalid: {
      destinationAccount: '1234', // Invalid format
      amount: -1000, // Negative amount
      currency: '',
      description: '',
    },
  },
  adhesions: {
    pending: {
      status: 'PENDING' as const,
      adhesionDate: new Date('2024-10-01'),
    },
    approved: {
      status: 'APPROVED' as const,
      adhesionDate: new Date('2024-09-15'),
    },
    rejected: {
      status: 'REJECTED' as const,
      adhesionDate: new Date('2024-09-20'),
    },
  },
} as const;

/**
 * Test utilities class
 */
export class TestUtils {
  /**
   * Creates a consistent test module for integration tests
   */
  static async createTestModule(
    additionalProviders: any[] = [],
  ): Promise<TestingModule> {
    return Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(TEST_CONFIG.database),
        TypeOrmModule.forFeature([
          CompanyEntity,
          TransferEntity,
          AdhesionEntity,
        ]),
      ],
      providers: additionalProviders,
    }).compile();
  }

  /**
   * Waits for a specified amount of time (for async operations)
   */
  static async wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generates a random string for unique identifiers
   */
  static randomString(length: number = 8): string {
    return Math.random().toString(36).substr(2, length);
  }

  /**
   * Generates a unique CUIT for testing
   */
  static generateUniqueCuit(prefix: string = '20'): string {
    const randomNumber = Math.floor(Math.random() * 99999999)
      .toString()
      .padStart(8, '0');
    const checkDigit = Math.floor(Math.random() * 9);
    return `${prefix}-${randomNumber}-${checkDigit}`;
  }

  /**
   * Generates a unique email for testing
   */
  static generateUniqueEmail(domain: string = 'test.com'): string {
    const randomString = this.randomString(8);
    return `test.${randomString}@${domain}`;
  }

  /**
   * Generates a valid account number for testing
   */
  static generateValidAccount(): string {
    const part1 = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, '0');
    const part2 = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, '0');
    const part3 = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, '0');
    const part4 = Math.floor(Math.random() * 99999999)
      .toString()
      .padStart(8, '0');
    return `${part1}-${part2}-${part3}-${part4}`;
  }

  /**
   * Creates a date in the past for testing
   */
  static pastDate(daysAgo: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date;
  }

  /**
   * Creates a date in the future for testing
   */
  static futureDate(daysFromNow: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date;
  }

  /**
   * Checks if two dates are in the same month
   */
  static isSameMonth(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth()
    );
  }

  /**
   * Gets the start and end of a month for date range queries
   */
  static getMonthRange(date: Date): { start: Date; end: Date } {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
    return { start, end };
  }

  /**
   * Cleans up test data from database
   */
  static async cleanupDatabase(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Delete in reverse order of dependencies
      await queryRunner.query('DELETE FROM adhesions');
      await queryRunner.query('DELETE FROM transfers');
      await queryRunner.query('DELETE FROM companies');

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Asserts that an array is sorted by a specific property
   */
  static assertSortedBy<T>(
    array: T[],
    propertyGetter: (item: T) => any,
    order: 'asc' | 'desc' = 'asc',
  ): boolean {
    for (let i = 1; i < array.length; i++) {
      const current = propertyGetter(array[i]);
      const previous = propertyGetter(array[i - 1]);

      if (order === 'asc' && current < previous) {
        return false;
      }
      if (order === 'desc' && current > previous) {
        return false;
      }
    }
    return true;
  }

  /**
   * Creates a mock repository with common methods
   */
  static createMockRepository<T>(): any {
    return {
      find: jest.fn(),
      findOne: jest.fn(),
      findBy: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      remove: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
        getOne: jest.fn(),
        getCount: jest.fn(),
      }),
    };
  }
}
