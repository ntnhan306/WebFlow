import React, { useState } from 'react';
import type { WorkspaceBlock } from '../types';
import { BLOCKS } from '../constants';
import { BlockType } from '../types';

interface DropData {
    draggedId: string; // blockId from palette OR instanceId from workspace
    draggedType: 'new' | 'move';
    targetId: string | null;
    position: 'inside' | 'before' | 'after';
}

interface WorkspaceProps {
  blocks: WorkspaceBlock[];
  onBlockDrop: (data: DropData) => void;
  onUpdateBlock: (instanceId:string, updates: Partial<WorkspaceBlock>) => void;
  selectedBlock: WorkspaceBlock | null;
  setSelectedBlock: (block: WorkspaceBlock | null) => void;
  onContextMenu: (event: React.MouseEvent, instanceId: string) => void;
}

interface WorkspaceItemProps {
  block: WorkspaceBlock;
  onBlockDrop: (data: DropData) => void;
  onUpdateBlock: (instanceId:string, updates: Partial<WorkspaceBlock>) => void;
  selectedBlock: WorkspaceBlock | null;
  setSelectedBlock: (block: WorkspaceBlock | null) => void;
  onContextMenu: (event: React.MouseEvent, instanceId: string) => void;
}


const DropIndicator: React.FC<{ onDrop: () => void }> = ({ onDrop }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onDrop();
        setIsDragOver(false);
    }

    return (
        <div 
            onDragOver={e => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
            onDragLeave={e => { e.stopPropagation(); setIsDragOver(false); }}
            onDrop={handleDrop}
            className={`h-2 my-1 w-full transition-colors ${isDragOver ? 'bg-blue-500 rounded' : 'bg-transparent'}`}
        />
    )
}


const WorkspaceItem: React.FC<WorkspaceItemProps> = ({ block, ...props }) => {
  const [isDragOverContainer, setIsDragOverContainer] = useState(false);
  const blockDef = BLOCKS.find(b => b.id === block.blockId);
  const isContainer = blockDef?.type === BlockType.CONTAINER;
  const hasContent = block.content && !isContainer;


  // FIX: Updated function signature to accept a more generic event type to support both native DragEvent and React.DragEvent.
  // This resolves the type error when using `window.event`. Also added null-safety checks.
  const getDraggedData = (e: { dataTransfer: DataTransfer | null }): { id: string; type: 'new' | 'move' } => {
      const draggedInstanceId = e.dataTransfer?.getData('draggedInstanceId');
      if (draggedInstanceId) {
          return { id: draggedInstanceId, type: 'move' };
      }
      return { id: e.dataTransfer?.getData('blockId') || '', type: 'new' };
  }

  const handleDrop = (position: DropData['position']) => (e: React.DragEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const { id, type } = getDraggedData(e);
      if (id) {
          props.onBlockDrop({
              draggedId: id,
              draggedType: type,
              targetId: block.instanceId,
              position,
          });
      }
      setIsDragOverContainer(false);
  };
  
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData('draggedInstanceId', block.instanceId);
  }

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    props.setSelectedBlock(block);
  }
  
  const isSelected = props.selectedBlock?.instanceId === block.instanceId;

  return (
    <div>
        {/* FIX: Correctly construct the DropData object passed to onBlockDrop. */}
        {/* This resolves the error about missing 'draggedId' and 'draggedType' properties. */}
        <DropIndicator onDrop={() => {
            const e = window.event as unknown as DragEvent;
            const { id, type } = getDraggedData(e);
            if (id) {
                props.onBlockDrop({
                    draggedId: id,
                    draggedType: type,
                    targetId: block.instanceId,
                    position: 'before',
                });
            }
        }}/>
        <div 
            draggable
            onDragStart={handleDragStart}
            className={`p-3 rounded-lg shadow-md relative border-2 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-white'}`}
            onClick={handleSelect}
            onContextMenu={(e) => props.onContextMenu(e, block.instanceId)}
        >
        <div className="flex justify-between items-center cursor-pointer">
            <div>
                <p className="text-sm font-bold text-gray-700">{block.name}</p>
                {hasContent && <p className="text-xs text-gray-500 mt-1 truncate pr-4">"{block.content}"</p>}
            </div>
        </div>
        
        {isContainer && (
            <div 
            className={`ml-4 mt-2 p-2 min-h-[50px] border-2 border-dashed rounded-lg transition-colors ${isDragOverContainer ? 'border-blue-400 bg-blue-100' : 'border-gray-300'}`}
            onDrop={handleDrop('inside')}
            onDragOver={e => { e.preventDefault(); e.stopPropagation(); setIsDragOverContainer(true); }}
            onDragLeave={e => { e.stopPropagation(); setIsDragOverContainer(false);}}
            >
            {block.children.length > 0 
                ? block.children.map(child => <WorkspaceItem key={child.instanceId} block={child} {...props} />)
                : <p className="text-gray-400 text-xs text-center p-2">Thả khối lệnh vào đây</p>
            }
            </div>
        )}
        </div>
    </div>
  );
};


const Workspace: React.FC<WorkspaceProps> = ({ blocks, onBlockDrop, onUpdateBlock, selectedBlock, setSelectedBlock, onContextMenu }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  // This function is defined inside WorkspaceItem, but let's define it here for use in this component too.
  const getDraggedData = (e: { dataTransfer: DataTransfer | null }): { id: string; type: 'new' | 'move' } => {
    const draggedInstanceId = e.dataTransfer?.getData('draggedInstanceId');
    if (draggedInstanceId) {
        return { id: draggedInstanceId, type: 'move' };
    }
    return { id: e.dataTransfer?.getData('blockId') || '', type: 'new' };
  }
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const { id, type } = getDraggedData(e);
    if (id) {
       onBlockDrop({ draggedId: id, draggedType: type, targetId: null, position: 'inside' });
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
      onClick={handleDeselect}
    >
      <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-6">Vùng Làm Việc</h2>
      {blocks.length === 0 ? (
        <div className={`flex items-center justify-center h-full border-2 border-dashed rounded-lg transition-colors border-gray-300`}>
          <p className="text-gray-500">Kéo khối lệnh vào đây để bắt đầu xây dựng</p>
        </div>
      ) : (
        <div>
          {blocks.map(block => (
            <WorkspaceItem 
              key={block.instanceId} 
              block={block} 
              onBlockDrop={onBlockDrop}
              onUpdateBlock={onUpdateBlock}
              selectedBlock={selectedBlock}
              setSelectedBlock={setSelectedBlock}
              onContextMenu={onContextMenu}
            />
          ))}
          <DropIndicator onDrop={() => {
              const e = window.event as unknown as DragEvent;
              const { id, type } = getDraggedData(e);
               if (id) {
                onBlockDrop({ draggedId: id, draggedType: type, targetId: null, position: 'inside' });
              }
          }} />
        </div>
      )}
    </div>
  );
};

export default Workspace;