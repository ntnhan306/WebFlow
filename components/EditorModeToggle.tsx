import React from 'react';
import type { EditorMode } from '../types';

interface EditorModeToggleProps {
  mode: EditorMode;
  setMode: (mode: EditorMode) => void;
}

const EditorModeToggle: React.FC<EditorModeToggleProps> = ({ mode, setMode }) => {
  const modes: EditorMode[] = ['html', 'css', 'js'];
  const modeNames: Record<EditorMode, string> = {
    html: 'HTML',
    css: 'CSS',
    js: 'JS',
  };

  return (
    <div className="w-full bg-white border-b border-gray-200 flex justify-center p-2">
      <div className="flex bg-gray-200 rounded-lg p-1">
        {modes.map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-6 py-2 text-sm font-bold rounded-md transition-all duration-200 ${
              mode === m ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-300'
            }`}
          >
            {modeNames[m]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EditorModeToggle;
