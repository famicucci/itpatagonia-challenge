import { Adhesion } from '../../../src/domain/entities/adhesion.entity';
import { CompanyPyme } from '../../../src/domain/entities/company-pyme.entity';
import { CompanyCorporativa } from '../../../src/domain/entities/company-corporativa.entity';

describe('Adhesion', () => {
  let mockCompanyPyme: CompanyPyme;
  let mockCompanyCorporativa: CompanyCorporativa;

  beforeEach(() => {
    mockCompanyPyme = new CompanyPyme(
      '1',
      'TechStart Solutions',
      '20-12345678-5',
      'contact@techstart.com',
      15,
      2500000,
    );

    mockCompanyCorporativa = new CompanyCorporativa(
      '2',
      'Banco Nacional SA',
      '30-11111111-9',
      'corporate@banconacional.com',
      'Financiero',
      false,
      'BNA',
    );
  });

  describe('Constructor', () => {
    it('should create a valid adhesion with default PENDING status', () => {
      // Arrange
      const id = '1';
      const adhesionDate = new Date('2025-09-10');

      // Act
      const adhesion = new Adhesion(id, mockCompanyPyme, adhesionDate);

      // Assert
      expect(adhesion.id).toBe(id);
      expect(adhesion.company).toBe(mockCompanyPyme);
      expect(adhesion.adhesionDate).toBe(adhesionDate);
      expect(adhesion.status).toBe('PENDING');
    });

    it('should create adhesion with current date when not provided', () => {
      // Arrange
      const beforeCreation = new Date();

      // Act
      const adhesion = new Adhesion('1', mockCompanyPyme);

      // Assert
      const afterCreation = new Date();
      expect(adhesion.adhesionDate.getTime()).toBeGreaterThanOrEqual(
        beforeCreation.getTime(),
      );
      expect(adhesion.adhesionDate.getTime()).toBeLessThanOrEqual(
        afterCreation.getTime(),
      );
    });

    it('should create adhesion with specified status', () => {
      // Arrange & Act
      const adhesion = new Adhesion(
        '1',
        mockCompanyPyme,
        new Date(),
        'APPROVED',
      );

      // Assert
      expect(adhesion.status).toBe('APPROVED');
    });

    it('should throw error when ID is empty', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Adhesion('', mockCompanyPyme);
      }).toThrow('Adhesion ID is required');
    });

    it('should throw error when company is null', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Adhesion('1', null as any);
      }).toThrow('Company is required for adhesion');
    });

    it('should throw error when company is undefined', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Adhesion('1', undefined as any);
      }).toThrow('Company is required for adhesion');
    });

    it('should throw error for invalid status', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Adhesion('1', mockCompanyPyme, new Date(), 'INVALID_STATUS' as any);
      }).toThrow('Invalid adhesion status');
    });

    it('should accept valid statuses', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Adhesion('1', mockCompanyPyme, new Date(), 'PENDING');
      }).not.toThrow();

      expect(() => {
        new Adhesion('2', mockCompanyPyme, new Date(), 'APPROVED');
      }).not.toThrow();

      expect(() => {
        new Adhesion('3', mockCompanyPyme, new Date(), 'REJECTED');
      }).not.toThrow();
    });
  });

  describe('approve', () => {
    it('should return new adhesion with APPROVED status', () => {
      // Arrange
      const originalAdhesion = new Adhesion(
        '1',
        mockCompanyPyme,
        new Date('2025-09-10'),
        'PENDING',
      );

      // Act
      const approvedAdhesion = originalAdhesion.approve();

      // Assert
      expect(approvedAdhesion.id).toBe(originalAdhesion.id);
      expect(approvedAdhesion.company).toBe(originalAdhesion.company);
      expect(approvedAdhesion.adhesionDate).toBe(originalAdhesion.adhesionDate);
      expect(approvedAdhesion.status).toBe('APPROVED');

      // Original should remain unchanged (immutability)
      expect(originalAdhesion.status).toBe('PENDING');
    });

    it('should work with corporate company', () => {
      // Arrange
      const originalAdhesion = new Adhesion(
        '1',
        mockCompanyCorporativa,
        new Date('2025-09-10'),
        'PENDING',
      );

      // Act
      const approvedAdhesion = originalAdhesion.approve();

      // Assert
      expect(approvedAdhesion.company).toBe(mockCompanyCorporativa);
      expect(approvedAdhesion.status).toBe('APPROVED');
    });
  });

  describe('reject', () => {
    it('should return new adhesion with REJECTED status', () => {
      // Arrange
      const originalAdhesion = new Adhesion(
        '1',
        mockCompanyPyme,
        new Date('2025-09-10'),
        'PENDING',
      );

      // Act
      const rejectedAdhesion = originalAdhesion.reject();

      // Assert
      expect(rejectedAdhesion.id).toBe(originalAdhesion.id);
      expect(rejectedAdhesion.company).toBe(originalAdhesion.company);
      expect(rejectedAdhesion.adhesionDate).toBe(originalAdhesion.adhesionDate);
      expect(rejectedAdhesion.status).toBe('REJECTED');

      // Original should remain unchanged (immutability)
      expect(originalAdhesion.status).toBe('PENDING');
    });
  });

  describe('toJSON', () => {
    it('should return complete adhesion information as JSON for PYME', () => {
      // Arrange
      const adhesionDate = new Date('2025-09-10');
      const adhesion = new Adhesion(
        '1',
        mockCompanyPyme,
        adhesionDate,
        'APPROVED',
      );

      // Act
      const json = adhesion.toJSON();

      // Assert
      expect(json).toEqual({
        id: '1',
        company: mockCompanyPyme.toJSON(),
        adhesionDate,
        status: 'APPROVED',
      });
    });

    it('should return complete adhesion information as JSON for Corporate', () => {
      // Arrange
      const adhesionDate = new Date('2025-09-10');
      const adhesion = new Adhesion(
        '1',
        mockCompanyCorporativa,
        adhesionDate,
        'PENDING',
      );

      // Act
      const json = adhesion.toJSON();

      // Assert
      expect(json).toEqual({
        id: '1',
        company: mockCompanyCorporativa.toJSON(),
        adhesionDate,
        status: 'PENDING',
      });
    });
  });
});
