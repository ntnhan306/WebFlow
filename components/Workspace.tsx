import React, { useState } from 'react';
import type { WorkspaceBlock } from '../types';
import { BLOCKS } from '../constants';
import { BlockType } from '../types';

interface WorkspaceProps {
  blocks: WorkspaceBlock[];
  onDrop: (blockId: string, parentId: string | null) => void;
  onUpdateBlock: (instanceId:string, updates: Partial<WorkspaceBlock>) => void;
  selectedBlock: WorkspaceBlock | null;
  setSelectedBlock: (block: WorkspaceBlock | null) => void;
  onContextMenu: (event: React.MouseEvent, instanceId: string) => void;
}

interface WorkspaceItemProps {
  block: WorkspaceBlock;
  onDrop: (blockId: string, parentId: string | null) => void;
  onUpdateBlock: (instanceId:string, updates: Partial<WorkspaceBlock>) => void;
  selectedBlock: WorkspaceBlock | null;
  setSelectedBlock: (block: WorkspaceBlock | null) => void;
  onContextMenu: (event: React.MouseEvent, instanceId: string) => void;
}

const WorkspaceItem: React.FC<WorkspaceItemProps> = ({ block, ...props }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const blockDef = BLOCKS.find(b => b.id === block.blockId);
  const isContainer = blockDef?.type === BlockType.CONTAINER;

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const blockId = e.dataTransfer.getData('blockId');
    if (blockId) {
      props.onDrop(blockId, block.instanceId);
    }
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    props.setSelectedBlock(block);
  }
  
  const isSelected = props.selectedBlock?.instanceId === block.instanceId;

  return (
    <div 
        className={`p-3 rounded-lg mb-2 shadow-md relative border-2 ${isSelected ? 'border-blue-500' : 'border-transparent'} bg-white`}
        onClick={handleSelect}
        onContextMenu={(e) => props.onContextMenu(e, block.instanceId)}
    >
      <div className="flex justify-between items-center cursor-pointer">
          <p className="text-sm font-bold text-gray-700">{block.name}</p>
      </div>
      
      {isContainer && (
        <div 
          className={`ml-4 mt-2 p-2 min-h-[50px] border-2 border-dashed rounded-lg transition-colors ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {block.children.length > 0 
            ? block.children.map(child => <WorkspaceItem key={child.instanceId} block={child} {...props} />)
            : <p className="text-gray-400 text-xs text-center p-2">Thả khối lệnh vào đây</p>
          }
        </div>
      )}
    </div>
  );
};


const Workspace: React.FC<WorkspaceProps> = ({ blocks, onDrop, onUpdateBlock, selectedBlock, setSelectedBlock, onContextMenu }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const blockId = e.dataTransfer.getData('blockId');
    if (blockId) {
      onDrop(blockId, null); // Drop at root level
    }
    setIsDragOver(false);
  };

  const handleDeselect = () => {
    setSelectedBlock(null);
  }

  return (
    <div 
      className="flex-1 bg-gray-50 p-6 overflow-y-auto"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleDeselect}
    >
      <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-6">Vùng Làm Việc</h2>
      {blocks.length === 0 ? (
        <div className={`flex items-center justify-center h-full border-2 border-dashed rounded-lg transition-colors ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}>
          <p className="text-gray-500">Kéo khối lệnh vào đây để bắt đầu xây dựng</p>
        </div>
      ) : (
        <div>
          {blocks.map(block => (
            <WorkspaceItem 
              key={block.instanceId} 
              block={block} 
              onDrop={onDrop}
              onUpdateBlock={onUpdateBlock}
              selectedBlock={selectedBlock}
              setSelectedBlock={setSelectedBlock}
              onContextMenu={onContextMenu}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Workspace;