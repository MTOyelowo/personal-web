"use client";

import {
  FC,
  MouseEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useId,
} from "react";

export interface ModalProps {
  visible?: boolean;
  onClose?(): void;
}

interface Props extends ModalProps {
  children: ReactNode;
}

const ModalContainer: FC<Props> = ({ visible, children, onClose }) => {
  const containerId = useId();

  const handleClose = useCallback(() => onClose?.(), [onClose]);

  const handleClick: MouseEventHandler<HTMLDivElement> = ({ target }) => {
    if ((target as HTMLElement).id === containerId) handleClose();
  };

  useEffect(() => {
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [handleClose]);

  if (!visible) return null;

  return (
    <div
      id={containerId}
      onClick={handleClick}
      className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 flex items-center justify-center"
    >
      {children}
    </div>
  );
};

export default ModalContainer;
