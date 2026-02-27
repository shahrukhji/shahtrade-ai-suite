import { useToastContext } from '@/context/ToastContext';
import type { ToastType } from '@/types/trading';

export const useCustomToast = () => {
  const { showToast } = useToastContext();
  return {
    success: (msg: string) => showToast('success', msg),
    error: (msg: string) => showToast('error', msg),
    warning: (msg: string) => showToast('warning', msg),
    info: (msg: string) => showToast('info', msg),
    show: (type: ToastType, msg: string, duration?: number) => showToast(type, msg, duration),
  };
};
