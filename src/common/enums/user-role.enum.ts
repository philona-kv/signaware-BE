export enum UserRole {
  LEGAL_ADVISOR = 'legal_advisor',
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

export const USER_ROLE_NAMES = {
  [UserRole.LEGAL_ADVISOR]: 'Legal Advisor',
  [UserRole.CUSTOMER]: 'Customer',
  [UserRole.ADMIN]: 'Administrator',
}; 