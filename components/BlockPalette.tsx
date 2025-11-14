import React from 'react';
import { BLOCKS } from '../constants';
import type { Block } from '../types';
import { BlockCategory } from '../types';

const DraggableBlock: React.FC<{ block: Block }> = ({ block }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('blockId', block.id);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="p-1 cursor-grab"
    >
      <block.component />
    </div>
  );
};

const CATEGORY_COLORS: Record<BlockCategory, { bg: string; border: string; text: string; }> = {
  [BlockCategory.DOCUMENT]: { bg: 'bg-slate-100', border: 'border-slate-200', text: 'text-slate-800' },
  [BlockCategory.STRUCTURE]: { bg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-800' },
  [BlockCategory.TYPOGRAPHY]: { bg: 'bg-sky-100', border: 'border-sky-200', text: 'text-sky-800' },
  [BlockCategory.NAVIGATION]: { bg: 'bg-pink-100', border: 'border-pink-200', text: 'text-pink-800' },
  [BlockCategory.MEDIA]: { bg: 'bg-emerald-100', border: 'border-emerald-200', text: 'text-emerald-800' },
  [BlockCategory.FORM]: { bg: 'bg-orange-100', border: 'border-orange-200', text: 'text-orange-800' },
  [BlockCategory.LISTS]: { bg: 'bg-teal-100', border: 'border-teal-200', text: 'text-teal-800' },
  [BlockCategory.UTILITY]: { bg: 'bg-purple-100', border: 'border-purple-200', text: 'text-purple-800' },
};

const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');


const BlockPalette: React.FC = () => {
  const groupedBlocks = BLOCKS.reduce((acc, block) => {
    if (!acc[block.category]) {
      acc[block.category] = [];
    }
    acc[block.category].push(block);
    return acc;
  }, {} as Record<BlockCategory, Block[]>);
  
  const categoryOrder = Object.values(BlockCategory);

  const orderedGroupedBlocks = categoryOrder.reduce((acc, category) => {
    if (groupedBlocks[category]) {
      acc[category] = groupedBlocks[category];
    }
    return acc;
  }, {} as Record<BlockCategory, Block[]>);


  return (
    <div className="w-72 bg-white flex flex-col border-r border-gray-200">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-xl font-bold text-gray-800">Khối Lệnh</h2>
      </div>

      <div className="p-2 border-b border-gray-200 flex-shrink-0">
        <h3 className="text-xs font-bold text-gray-500 uppercase mb-2 px-2">Điều hướng nhanh</h3>
        <div className="flex flex-wrap gap-1">
          {Object.keys(orderedGroupedBlocks).map(category => (
            <a 
              key={category} 
              href={`#category-${slugify(category)}`}
              className={`px-2 py-1 text-xs font-semibold rounded-full transition-colors ${CATEGORY_COLORS[category as BlockCategory].bg} ${CATEGORY_COLORS[category as BlockCategory].text} hover:opacity-80`}
            >
              {category}
            </a>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(orderedGroupedBlocks).map(([category, blocks]) => (
          <div 
            key={category}
            id={`category-${slugify(category)}`}
            className={`p-3 rounded-lg border ${CATEGORY_COLORS[category as BlockCategory].bg} ${CATEGORY_COLORS[category as BlockCategory].border}`}
          >
            <h3 className={`text-sm font-bold mb-2 uppercase tracking-wider ${CATEGORY_COLORS[category as BlockCategory].text}`}>{category}</h3>
            <div className="space-y-2">
              {blocks.map(block => (
                <DraggableBlock key={block.id} block={block} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockPalette;