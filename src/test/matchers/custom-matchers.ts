/**
 * Custom Jest matchers for domain entities
 */
export {};

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidCompany(): R;
      toBeValidTransfer(): R;
      toBeValidAdhesion(): R;
      toHaveValidAccountFormat(): R;
      toHaveValidCuitFormat(): R;
      toHaveValidEmailFormat(): R;
    }
  }
}

import { Company } from '../../domain/entities/company.entity';
import { Transfer } from '../../domain/entities/transfer.entity';
import { Adhesion } from '../../domain/entities/adhesion.entity';

/**
 * Custom matcher to validate Company entities
 */
expect.extend({
  toBeValidCompany(received: Company) {
    try {
      // Basic validations
      if (!received.id || received.id.trim().length === 0) {
        return {
          message: () => `Expected company to have a valid ID`,
          pass: false,
        };
      }

      if (!received.name || received.name.trim().length === 0) {
        return {
          message: () => `Expected company to have a valid name`,
          pass: false,
        };
      }

      if (!received.cuit || !this.toHaveValidCuitFormat(received.cuit).pass) {
        return {
          message: () => `Expected company to have a valid CUIT format`,
          pass: false,
        };
      }

      if (
        !received.email ||
        !this.toHaveValidEmailFormat(received.email).pass
      ) {
        return {
          message: () => `Expected company to have a valid email`,
          pass: false,
        };
      }

      if (!['PYME', 'CORPORATIVA'].includes(received.type)) {
        return {
          message: () => `Expected company type to be PYME or CORPORATIVA`,
          pass: false,
        };
      }

      return {
        message: () => `Expected company to be invalid`,
        pass: true,
      };
    } catch (error) {
      return {
        message: () => `Company validation failed: ${error.message}`,
        pass: false,
      };
    }
  },

  toBeValidTransfer(received: Transfer) {
    try {
      if (!received.id || received.id.trim().length === 0) {
        return {
          message: () => `Expected transfer to have a valid ID`,
          pass: false,
        };
      }

      if (!received.companyId || received.companyId.trim().length === 0) {
        return {
          message: () => `Expected transfer to have a valid company ID`,
          pass: false,
        };
      }

      if (received.amount <= 0) {
        return {
          message: () => `Expected transfer amount to be positive`,
          pass: false,
        };
      }

      if (!received.currency || received.currency.trim().length === 0) {
        return {
          message: () => `Expected transfer to have a valid currency`,
          pass: false,
        };
      }

      if (!this.toHaveValidAccountFormat(received.destinationAccount).pass) {
        return {
          message: () =>
            `Expected transfer to have a valid destination account format`,
          pass: false,
        };
      }

      if (!received.description || received.description.trim().length === 0) {
        return {
          message: () => `Expected transfer to have a valid description`,
          pass: false,
        };
      }

      return {
        message: () => `Expected transfer to be invalid`,
        pass: true,
      };
    } catch (error) {
      return {
        message: () => `Transfer validation failed: ${error.message}`,
        pass: false,
      };
    }
  },

  toBeValidAdhesion(received: Adhesion) {
    try {
      if (!received.id || received.id.trim().length === 0) {
        return {
          message: () => `Expected adhesion to have a valid ID`,
          pass: false,
        };
      }

      if (!received.company) {
        return {
          message: () => `Expected adhesion to have a valid company`,
          pass: false,
        };
      }

      if (!['PENDING', 'APPROVED', 'REJECTED'].includes(received.status)) {
        return {
          message: () =>
            `Expected adhesion status to be PENDING, APPROVED, or REJECTED`,
          pass: false,
        };
      }

      if (!(received.adhesionDate instanceof Date)) {
        return {
          message: () => `Expected adhesion to have a valid adhesion date`,
          pass: false,
        };
      }

      return {
        message: () => `Expected adhesion to be invalid`,
        pass: true,
      };
    } catch (error) {
      return {
        message: () => `Adhesion validation failed: ${error.message}`,
        pass: false,
      };
    }
  },

  toHaveValidAccountFormat(received: string) {
    const accountRegex = /^\d{4}-\d{4}-\d{4}-\d{8}$/;
    const pass = accountRegex.test(received);

    return {
      message: () =>
        pass
          ? `Expected ${received} not to have valid account format`
          : `Expected ${received} to have valid account format (XXXX-XXXX-XXXX-XXXXXXXX)`,
      pass,
    };
  },

  toHaveValidCuitFormat(received: string) {
    const cuitRegex = /^\d{2}-\d{8}-\d{1}$/;
    const pass = cuitRegex.test(received);

    return {
      message: () =>
        pass
          ? `Expected ${received} not to have valid CUIT format`
          : `Expected ${received} to have valid CUIT format (XX-XXXXXXXX-X)`,
      pass,
    };
  },

  toHaveValidEmailFormat(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);

    return {
      message: () =>
        pass
          ? `Expected ${received} not to have valid email format`
          : `Expected ${received} to have valid email format`,
      pass,
    };
  },
});
