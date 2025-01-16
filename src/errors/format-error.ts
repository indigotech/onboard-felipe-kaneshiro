import { GraphQLError } from "graphql";

export class CustomError extends Error {
  code: number;
  details?: string;

  constructor(message: string, code: number, details?: string) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export function formatError(error: GraphQLError) {
  const exception = error.extensions?.exception;

  if (exception && exception.code && 'details' in exception) {
    console.log('Custom error returned', exception);
    return {
      message: error.message,
      code: exception.code,
      details: exception.details,
    };
  }

  console.log('Default error returned', error.message);
  return {
    message: "Ocorreu um erro. Por favor, tente novamente.",
    code: 500,
    details: error.message,
  };
}
