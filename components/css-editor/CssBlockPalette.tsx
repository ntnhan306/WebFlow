import React from 'react';
import { CSS_BLOCKS } from '../../css-constants';
import type { CssBlock } from '../../types';
import { CssBlockCategory } from '../../types';

const DraggableCssBlock: React.FC<{ block: CssBlock }> = ({ block }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('cssBlockId', block.id);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="p-2 cursor-grab bg-white rounded-md shadow text-sm font-medium text-gray-700 border border-gray-200 hover:shadow-md transition-shadow"
    >
      {block.name}
    </div>
  );
};

const CssBlockPalette: React.FC = () => {
  const groupedBlocks = CSS_BLOCKS.reduce((acc, block) => {
    if (!acc[block.category]) {
      acc[block.category] = [];
    }
    acc[block.category].push(block);
    return acc;
  }, {} as Record<CssBlockCategory, CssBlock[]>);

  const categoryOrder = Object.values(CssBlockCategory);

  return (
    <div className="w-72 bg-white flex flex-col border-r border-gray-200">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-xl font-bold text-gray-800">Khối Lệnh CSS</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {categoryOrder.map(category => (
          groupedBlocks[category] && (
            <div key={category}>
              <h3 className="text-sm font-bold mb-2 uppercase tracking-wider text-gray-500">{category}</h3>
              <div className="space-y-2">
                {groupedBlocks[category].map(block => (
                  <DraggableCssBlock key={block.id} block={block} />
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default CssBlockPalette;
