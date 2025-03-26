import { useMutation } from '@tanstack/react-query';
import { submitAuth } from '@/actions/auth/submit';
import { AuthRequest, UserRole } from '@/types/auth';

export function useAuth(role: UserRole) {
  return useMutation({
    mutationFn: (request: AuthRequest) => submitAuth(request, role),
    onError: (error) => {
      console.error('Authentication error:', error);
    }
  });
} 