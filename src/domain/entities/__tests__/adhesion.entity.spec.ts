import { Adhesion } from '../adhesion.entity';
import { CompanyPyme } from '../company-pyme.entity';
import { CompanyCorporativa } from '../company-corporativa.entity';

describe('Adhesion', () => {
  describe('Constructor', () => {
    it('should create a valid adhesion with Pyme company', () => {
      // Arrange
      const id = '1';
      const company = new CompanyPyme(
        'company-1',
        'TechStart Solutions',
        '20-12345678-3',
        'contact@techstart.com',
        15,
        50000000,
      );
      const adhesionDate = new Date('2025-09-10');

      // Act
      const adhesion = new Adhesion(id, company, adhesionDate);

      // Assert
      expect(adhesion.id).toBe(id);
      expect(adhesion.company).toBe(company);
      expect(adhesion.adhesionDate).toBe(adhesionDate);
      expect(adhesion.status).toBe('PENDING');
    });

    it('should create a valid adhesion with Corporate company', () => {
      // Arrange
      const id = '2';
      const company = new CompanyCorporativa(
        'company-2',
        'Banco Nacional SA',
        '30-11111111-9',
        'corporate@banconacional.com',
        'Financiero',
        false,
        'BNA',
      );

      // Act
      const adhesion = new Adhesion(id, company);

      // Assert
      expect(adhesion.id).toBe(id);
      expect(adhesion.company).toBe(company);
      expect(adhesion.status).toBe('PENDING');
      expect(adhesion.adhesionDate).toBeInstanceOf(Date);
    });

    it('should create adhesion with default current date', () => {
      // Arrange
      const beforeCreation = new Date();
      const company = new CompanyPyme(
        'company-1',
        'Test Company',
        '20-12345678-3',
        'test@company.com',
        5,
        1000000,
      );

      // Act
      const adhesion = new Adhesion('1', company);

      const afterCreation = new Date();

      // Assert
      expect(adhesion.adhesionDate.getTime()).toBeGreaterThanOrEqual(
        beforeCreation.getTime(),
      );
      expect(adhesion.adhesionDate.getTime()).toBeLessThanOrEqual(
        afterCreation.getTime(),
      );
    });

    it('should throw error when id is empty', () => {
      // Arrange
      const company = new CompanyPyme(
        'company-1',
        'Test Company',
        '20-12345678-3',
        'test@company.com',
        5,
        1000000,
      );

      // Act & Assert
      expect(() => {
        new Adhesion(
          '', // Empty id
          company,
        );
      }).toThrow('Adhesion ID is required');
    });

    it('should throw error when company is null', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Adhesion(
          '1',
          null as any, // Null company
        );
      }).toThrow('Company is required for adhesion');
    });

    it('should accept valid status values', () => {
      // Arrange
      const company = new CompanyPyme(
        'company-1',
        'Test Company',
        '20-12345678-3',
        'test@company.com',
        5,
        1000000,
      );

      // Act & Assert - PENDING
      const pendingAdhesion = new Adhesion('1', company, new Date(), 'PENDING');
      expect(pendingAdhesion.status).toBe('PENDING');

      // Act & Assert - APPROVED
      const approvedAdhesion = new Adhesion(
        '2',
        company,
        new Date(),
        'APPROVED',
      );
      expect(approvedAdhesion.status).toBe('APPROVED');

      // Act & Assert - REJECTED
      const rejectedAdhesion = new Adhesion(
        '3',
        company,
        new Date(),
        'REJECTED',
      );
      expect(rejectedAdhesion.status).toBe('REJECTED');
    });

    it('should throw error for invalid status', () => {
      // Arrange
      const company = new CompanyPyme(
        'company-1',
        'Test Company',
        '20-12345678-3',
        'test@company.com',
        5,
        1000000,
      );

      // Act & Assert
      expect(() => {
        new Adhesion('1', company, new Date(), 'INVALID' as any);
      }).toThrow('Invalid adhesion status');
    });
  });

  describe('approve', () => {
    it('should create new approved adhesion from pending', () => {
      // Arrange
      const company = new CompanyPyme(
        'company-1',
        'Test Company',
        '20-12345678-3',
        'test@company.com',
        5,
        1000000,
      );
      const originalDate = new Date('2025-09-10');
      const adhesion = new Adhesion('1', company, originalDate, 'PENDING');

      // Act
      const approvedAdhesion = adhesion.approve();

      // Assert
      expect(approvedAdhesion).not.toBe(adhesion); // New instance
      expect(approvedAdhesion.id).toBe(adhesion.id);
      expect(approvedAdhesion.company).toBe(adhesion.company);
      expect(approvedAdhesion.adhesionDate).toBe(originalDate);
      expect(approvedAdhesion.status).toBe('APPROVED');

      // Original should remain unchanged
      expect(adhesion.status).toBe('PENDING');
    });

    it('should create approved adhesion from any status', () => {
      // Arrange
      const company = new CompanyCorporativa(
        'company-1',
        'Corporate Co',
        '30-11111111-9',
        'corporate@company.com',
        'Technology',
        false,
      );
      const rejectedAdhesion = new Adhesion(
        '1',
        company,
        new Date(),
        'REJECTED',
      );

      // Act
      const approvedAdhesion = rejectedAdhesion.approve();

      // Assert
      expect(approvedAdhesion.status).toBe('APPROVED');
      expect(rejectedAdhesion.status).toBe('REJECTED'); // Original unchanged
    });
  });

  describe('reject', () => {
    it('should create new rejected adhesion from pending', () => {
      // Arrange
      const company = new CompanyPyme(
        'company-1',
        'Test Company',
        '20-12345678-3',
        'test@company.com',
        5,
        1000000,
      );
      const originalDate = new Date('2025-09-10');
      const adhesion = new Adhesion('1', company, originalDate, 'PENDING');

      // Act
      const rejectedAdhesion = adhesion.reject();

      // Assert
      expect(rejectedAdhesion).not.toBe(adhesion); // New instance
      expect(rejectedAdhesion.id).toBe(adhesion.id);
      expect(rejectedAdhesion.company).toBe(adhesion.company);
      expect(rejectedAdhesion.adhesionDate).toBe(originalDate);
      expect(rejectedAdhesion.status).toBe('REJECTED');

      // Original should remain unchanged
      expect(adhesion.status).toBe('PENDING');
    });

    it('should create rejected adhesion from any status', () => {
      // Arrange
      const company = new CompanyCorporativa(
        'company-1',
        'Corporate Co',
        '30-11111111-9',
        'corporate@company.com',
        'Technology',
        false,
      );
      const approvedAdhesion = new Adhesion(
        '1',
        company,
        new Date(),
        'APPROVED',
      );

      // Act
      const rejectedAdhesion = approvedAdhesion.reject();

      // Assert
      expect(rejectedAdhesion.status).toBe('REJECTED');
      expect(approvedAdhesion.status).toBe('APPROVED'); // Original unchanged
    });
  });

  describe('toJSON', () => {
    it('should return complete adhesion information as JSON with Pyme company', () => {
      // Arrange
      const adhesionDate = new Date('2025-09-10T14:30:00Z');
      const company = new CompanyPyme(
        'company-1',
        'TechStart Solutions',
        '20-12345678-3',
        'contact@techstart.com',
        15,
        50000000,
        new Date('2025-08-01'),
      );
      const adhesion = new Adhesion('1', company, adhesionDate, 'PENDING');

      // Act
      const json = adhesion.toJSON();

      // Assert
      expect(json).toEqual({
        id: '1',
        company: {
          id: 'company-1',
          name: 'TechStart Solutions',
          cuit: '20-12345678-3',
          email: 'contact@techstart.com',
          type: 'PYME',
          createdAt: new Date('2025-08-01'),
          employeeCount: 15,
          annualRevenue: 50000000,
        },
        adhesionDate,
        status: 'PENDING',
      });
    });

    it('should return complete adhesion information as JSON with Corporate company', () => {
      // Arrange
      const adhesionDate = new Date('2025-09-15T10:00:00Z');
      const company = new CompanyCorporativa(
        'company-2',
        'Banco Nacional SA',
        '30-11111111-9',
        'corporate@banconacional.com',
        'Financiero',
        false,
        'BNA',
        new Date('2025-07-01'),
      );
      const adhesion = new Adhesion('2', company, adhesionDate, 'APPROVED');

      // Act
      const json = adhesion.toJSON();

      // Assert
      expect(json).toEqual({
        id: '2',
        company: {
          id: 'company-2',
          name: 'Banco Nacional SA',
          cuit: '30-11111111-9',
          email: 'corporate@banconacional.com',
          type: 'CORPORATIVA',
          createdAt: new Date('2025-07-01'),
          sector: 'Financiero',
          isMultinational: false,
          stockSymbol: 'BNA',
        },
        adhesionDate,
        status: 'APPROVED',
      });
    });

    it('should return JSON with default date', () => {
      // Arrange
      const company = new CompanyPyme(
        'company-a',
        'Small Business',
        '20-87654321-9',
        'info@small.com',
        3,
        2000000,
      );
      const adhesion = new Adhesion('3', company);

      // Act
      const json = adhesion.toJSON();

      // Assert
      expect(json.id).toBe('3');
      expect(json.company.id).toBe('company-a');
      expect(json.company.name).toBe('Small Business');
      expect(json.status).toBe('PENDING');
      expect(json.adhesionDate).toBeInstanceOf(Date);
    });
  });

  describe('Edge Cases', () => {
    it('should handle immutability correctly', () => {
      // Arrange
      const company = new CompanyPyme(
        'company-1',
        'Test Company',
        '20-12345678-3',
        'test@company.com',
        5,
        1000000,
      );
      const originalAdhesion = new Adhesion(
        '1',
        company,
        new Date('2025-09-10'),
        'PENDING',
      );

      // Act
      const approvedAdhesion = originalAdhesion.approve();
      const rejectedAdhesion = originalAdhesion.reject();

      // Assert - All instances are different
      expect(originalAdhesion).not.toBe(approvedAdhesion);
      expect(originalAdhesion).not.toBe(rejectedAdhesion);
      expect(approvedAdhesion).not.toBe(rejectedAdhesion);

      // Assert - Original remains unchanged
      expect(originalAdhesion.status).toBe('PENDING');
      expect(approvedAdhesion.status).toBe('APPROVED');
      expect(rejectedAdhesion.status).toBe('REJECTED');
    });

    it('should handle future dates correctly', () => {
      // Arrange
      const futureDate = new Date('2026-12-31T23:59:59Z');
      const company = new CompanyCorporativa(
        'company-1',
        'Future Corp',
        '30-11111111-9',
        'future@corp.com',
        'Technology',
        true,
      );

      // Act
      const adhesion = new Adhesion('1', company, futureDate);

      // Assert
      expect(adhesion.adhesionDate).toBe(futureDate);
    });

    it('should handle past dates correctly', () => {
      // Arrange
      const pastDate = new Date('2020-01-01T00:00:00Z');
      const company = new CompanyPyme(
        'company-1',
        'Old Company',
        '20-12345678-3',
        'old@company.com',
        10,
        5000000,
      );

      // Act
      const adhesion = new Adhesion('1', company, pastDate);

      // Assert
      expect(adhesion.adhesionDate).toBe(pastDate);
    });

    it('should maintain company reference integrity', () => {
      // Arrange
      const company = new CompanyPyme(
        'company-1',
        'Reference Test',
        '20-12345678-3',
        'reference@test.com',
        8,
        3000000,
      );
      const adhesion = new Adhesion('1', company);

      // Act
      const approvedAdhesion = adhesion.approve();

      // Assert
      expect(adhesion.company).toBe(company);
      expect(approvedAdhesion.company).toBe(company); // Same reference maintained
      expect(adhesion.company).toBe(approvedAdhesion.company);
    });
  });
});
