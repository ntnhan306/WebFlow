import React, { useEffect, useRef } from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  onDuplicate: () => void;
  onDelete: () => void;
  onCopyStyles: () => void;
  onPasteStyles: () => void;
  canPaste: boolean;
  onClose: () => void;
}

const MenuItem: React.FC<{ onClick: () => void; children: React.ReactNode; disabled?: boolean }> = ({ onClick, children, disabled = false }) => (
    <li
        onClick={disabled ? undefined : onClick}
        className={`flex items-center px-4 py-2 text-sm text-gray-700 cursor-pointer ${
            disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-100 hover:text-gray-900'
        }`}
    >
        {children}
    </li>
);

const Icon: React.FC<{ path: string }> = ({ path }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-3">
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);


const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  visible,
  onDuplicate,
  onDelete,
  onCopyStyles,
  onPasteStyles,
  canPaste,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      style={{ top: y, left: x }}
      className="absolute z-50 w-56 bg-white rounded-md shadow-lg border border-gray-200"
    >
      <ul className="py-1">
        <MenuItem onClick={onDuplicate}>
            <Icon path="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.5c0-.621.504-1.125 1.125-1.125H7.5m1.125 6.375H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 9.75h-7.5" />
            Nhân bản
        </MenuItem>
        <MenuItem onClick={onCopyStyles}>
             <Icon path="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            Sao chép Style
        </MenuItem>
        <MenuItem onClick={onPasteStyles} disabled={!canPaste}>
            <Icon path="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.695v-2.695A8.25 8.25 0 005.68 9.348v2.695" />
            Dán Style
        </MenuItem>
        <div className="border-t my-1 border-gray-200"></div>
        <MenuItem onClick={onDelete}>
            <Icon path="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.036-2.134H8.036C6.91 2.75 6 3.704 6 4.874v.916m7.5 0h-7.5" />
            Xóa khối
        </MenuItem>
      </ul>
    </div>
  );
};

export default ContextMenu;
