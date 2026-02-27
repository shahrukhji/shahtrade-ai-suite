import { useToastContext } from '@/context/ToastContext';
import Toast from './Toast';

const ToastContainer = () => {
  const { toasts } = useToastContext();
  return (
    <div className="fixed top-[60px] right-4 left-4 z-[9999] flex flex-col gap-2 max-w-[400px] mx-auto pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <Toast id={t.id} type={t.type} message={t.message} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
