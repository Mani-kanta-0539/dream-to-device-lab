import { toast } from '@/hooks/use-toast';

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

export const handleApiError = (error: unknown): AppError => {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Supabase errors
  if (errorMessage) {
    if (errorMessage.includes('JWT')) {
      return {
        code: 'AUTH_ERROR',
        message: 'Your session has expired. Please log in again.',
        details: error
      };
    }
    
    if (error instanceof Error && error.message.includes('row-level security')) {
      return {
        code: 'PERMISSION_ERROR',
        message: 'You do not have permission to perform this action.',
        details: error
      };
    }
    
    if (error instanceof Error && error.message.includes('Rate limit')) {
      return {
        code: 'RATE_LIMIT',
        message: 'Too many requests. Please try again later.',
        details: error
      };
    }

    if (error instanceof Error && error.message.includes('Payment required')) {
      return {
        code: 'PAYMENT_REQUIRED',
        message: 'Service quota exceeded. Please add credits to continue.',
        details: error
      };
    }
  }

  // Network errors
  if (!navigator.onLine) {
    return {
      code: 'OFFLINE',
      message: 'You are offline. Please check your internet connection.',
      details: error
    };
  }

  // Default error
  return {
    code: 'UNKNOWN_ERROR',
    message: errorMessage || 'An unexpected error occurred. Please try again.',
    details: error
  };
};

export const showErrorToast = (error: unknown) => {
  const appError = handleApiError(error);
  
  toast({
    title: "Error",
    description: appError.message,
    variant: "destructive"
  });

  // Log in development
  if (import.meta.env.DEV) {
    console.error('Error details:', appError);
  }
};
