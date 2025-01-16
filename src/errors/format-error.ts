import { GraphQLError } from "graphql";
import { unwrapResolverError } from '@apollo/server/errors';

export class CustomError extends Error {
  code: number;
  details?: string;

  constructor(message: string, code: number, details?: string) {
    super(message);
    this.code = code;
    this.details = details;

    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export function formatError(error: GraphQLError) {
  const myCustomError = unwrapResolverError(error);

  if (myCustomError instanceof CustomError) {
    return {
      message: myCustomError.message,
      code: myCustomError.code,
      details: myCustomError.details,
    };
  }

  return {
    message: "Ocorreu um erro. Por favor, tente novamente.",
    code: 500,
    details: error.message,
  };
}
