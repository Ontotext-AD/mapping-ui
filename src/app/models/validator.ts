export interface Validator {
  validate(...args): ValidatorResult;
}

export type ValidatorResult = {
  valid: boolean;
  error: string;
};
