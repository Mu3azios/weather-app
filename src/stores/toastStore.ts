import { defineStore } from "pinia";
import { useToast } from "vue-toast-notification";
import "vue-toast-notification/dist/theme-sugar.css";

export const useToastStore = defineStore("toast", () => {
  const $toast = useToast();

  // Generic toast
  const showToast = (type: 'success' | 'error' | 'info' | 'warning' | 'info', message: string, ) => {
    $toast.open({
      message,
      type,
      duration: 1000,
      position: 'bottom-right',
    });
  };

  // Helper functions
  const success = (message: string) => showToast('success', message);
  const error = (message: string) => showToast('error', message);
  const info = (message: string) => showToast('info', message);
  const warning = (message: string) => showToast('warning', message);

  return {
    showToast,
    success,
    error,
    info,
    warning,
  };
});
