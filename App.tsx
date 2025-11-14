import React, { useState, useCallback, useEffect } from 'react';
import BlockPalette from './components/BlockPalette';
import Workspace from './components/Workspace';
import RightPanel from './components/Preview';
import ContextMenu from './components/ContextMenu';
import type { WorkspaceBlock } from './types';
import { BLOCKS } from './constants';
import type { CSSProperties } from 'react';


const createInitialStructure = (): WorkspaceBlock[] => {
    const htmlDef = BLOCKS.find(b => b.id === 'html');
    const headDef = BLOCKS.find(b => b.id === 'head');
    const bodyDef = BLOCKS.find(b => b.id === 'body');
    const titleDef = BLOCKS.find(b => b.id === 'title');

    if (!htmlDef || !headDef || !bodyDef || !titleDef) return [];

    const titleBlock = titleDef.template(crypto.randomUUID());
    
    const headBlock = headDef.template(crypto.randomUUID());
    headBlock.children.push(titleBlock);
    
    const bodyBlock = bodyDef.template(crypto.randomUUID());

    const htmlBlock = htmlDef.template(crypto.randomUUID());
    htmlBlock.children = [headBlock, bodyBlock];

    return [htmlBlock];
}

// --- Recursive Helper Functions ---

const findBlock = (blocks: WorkspaceBlock[], instanceId: string): WorkspaceBlock | null => {
  for (const block of blocks) {
    if (block.instanceId === instanceId) {
      return block;
    }
    if (block.children && block.children.length > 0) {
      const found = findBlock(block.children, instanceId);
      if (found) return found;
    }
  }
  return null;
};

const findAndUpdateBlock = (blocks: WorkspaceBlock[], instanceId: string, updates: Partial<WorkspaceBlock>): WorkspaceBlock[] => {
  return blocks.map(block => {
    if (block.instanceId === instanceId) {
      const updatedBlock = { ...block, ...updates };
      if (updates.attributes) updatedBlock.attributes = { ...block.attributes, ...updates.attributes };
      if (updates.styles) updatedBlock.styles = { ...block.styles, ...updates.styles };
      if (updates.events) updatedBlock.events = { ...block.events, ...updates.events };
      return updatedBlock;
    }
    if (block.children && block.children.length > 0) {
      return { ...block, children: findAndUpdateBlock(block.children, instanceId, updates) };
    }
    return block;
  });
};

const findAndAddBlock = (blocks: WorkspaceBlock[], newBlock: WorkspaceBlock, parentId: string): WorkspaceBlock[] => {
  return blocks.map(block => {
    if (block.instanceId === parentId) {
      return { ...block, children: [...block.children, newBlock] };
    }
    if (block.children && block.children.length > 0) {
      return { ...block, children: findAndAddBlock(block.children, newBlock, parentId) };
    }
    return block;
  });
};

const findAndRemoveBlock = (blocks: WorkspaceBlock[], instanceId: string): WorkspaceBlock[] => {
    const filteredBlocks = blocks.filter(block => block.instanceId !== instanceId);
    if (filteredBlocks.length !== blocks.length) {
        return filteredBlocks;
    }
    return blocks.map(block => {
        if (block.children && block.children.length > 0) {
            return { ...block, children: findAndRemoveBlock(block.children, instanceId) };
        }
        return block;
    });
};

const deepCloneBlock = (block: WorkspaceBlock): WorkspaceBlock => {
    return {
        ...block,
        instanceId: crypto.randomUUID(),
        children: block.children.map(child => deepCloneBlock(child)),
    };
};

const findAndDuplicateBlock = (blocks: WorkspaceBlock[], instanceId: string): WorkspaceBlock[] => {
    const newBlocks: WorkspaceBlock[] = [];
    for (const block of blocks) {
        if (block.instanceId === instanceId) {
            const clone = deepCloneBlock(block);
            newBlocks.push(block, clone);
        } else {
             const newBlock = { ...block };
             if (newBlock.children && newBlock.children.length > 0) {
                 newBlock.children = findAndDuplicateBlock(newBlock.children, instanceId);
             }
             newBlocks.push(newBlock);
        }
    }
    return newBlocks;
};

// --- Main App Component ---

const App: React.FC = () => {
  const [workspaceBlocks, setWorkspaceBlocks] = useState<WorkspaceBlock[]>(createInitialStructure);
  const [htmlContent, setHtmlContent] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<WorkspaceBlock | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean; instanceId: string | null }>({ x: 0, y: 0, visible: false, instanceId: null });
  const [styleClipboard, setStyleClipboard] = useState<CSSProperties | null>(null);
  
  const generateFullHtml = (blocks: WorkspaceBlock[]): string => {
    if (!blocks || blocks.length === 0) {
        return '<!DOCTYPE html><html><head><title>Lỗi</title></head><body>Không có nội dung</body></html>';
    }
    return blocks.map(block => block.generateHtml()).join('\n');
  };

  useEffect(() => {
    const newHtml = generateFullHtml(workspaceBlocks);
    setHtmlContent(newHtml);
  }, [workspaceBlocks]);

  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false, instanceId: null }));
  }, []);

  const handleDrop = useCallback((blockId: string, parentId: string | null) => {
    const block = BLOCKS.find(b => b.id === blockId);
    if (!block) return;

    const newBlock = block.template(crypto.randomUUID());
    
    setWorkspaceBlocks(prevBlocks => {
      if (parentId) {
        return findAndAddBlock(prevBlocks, newBlock, parentId);
      } else {
        const bodyInstanceId = prevBlocks[0]?.children?.find(c => c.blockId === 'body')?.instanceId;
        if (bodyInstanceId) {
            return findAndAddBlock(prevBlocks, newBlock, bodyInstanceId);
        }
        return prevBlocks;
      }
    });
  }, []);
  
  const handleUpdateBlock = useCallback((instanceId: string, updates: Partial<WorkspaceBlock>) => {
    setWorkspaceBlocks(prevBlocks => 
      findAndUpdateBlock(prevBlocks, instanceId, updates)
    );
    if (selectedBlock?.instanceId === instanceId) {
       setSelectedBlock(prev => {
           if (!prev) return null;
           const updatedBlock = { ...prev, ...updates };
            if (updates.attributes) updatedBlock.attributes = { ...prev.attributes, ...updates.attributes };
            if (updates.styles) updatedBlock.styles = { ...prev.styles, ...updates.styles };
            if (updates.events) updatedBlock.events = { ...prev.events, ...updates.events };
           return updatedBlock;
       });
    }
  }, [selectedBlock]);

  // --- Context Menu Handlers ---
  const handleContextMenu = useCallback((e: React.MouseEvent, instanceId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY, visible: true, instanceId });
      const block = findBlock(workspaceBlocks, instanceId);
      setSelectedBlock(block);
  }, [workspaceBlocks]);

  const handleDeleteBlock = () => {
    if (!contextMenu.instanceId) return;
    setWorkspaceBlocks(prev => findAndRemoveBlock(prev, contextMenu.instanceId!));
    if (selectedBlock?.instanceId === contextMenu.instanceId) {
      setSelectedBlock(null);
    }
    closeContextMenu();
  };

  const handleDuplicateBlock = () => {
    if (!contextMenu.instanceId) return;
    setWorkspaceBlocks(prev => findAndDuplicateBlock(prev, contextMenu.instanceId!));
    closeContextMenu();
  };

  const handleCopyStyles = () => {
    if (!contextMenu.instanceId) return;
    const block = findBlock(workspaceBlocks, contextMenu.instanceId);
    if (block) {
      setStyleClipboard(block.styles);
    }
    closeContextMenu();
  };

  const handlePasteStyles = () => {
    if (!contextMenu.instanceId || !styleClipboard) return;
    handleUpdateBlock(contextMenu.instanceId, { styles: styleClipboard });
    closeContextMenu();
  };


  return (
    <div className="flex h-screen bg-gray-100 text-gray-800 font-sans" onClick={closeContextMenu}>
      <BlockPalette />
      <Workspace 
        blocks={workspaceBlocks} 
        onDrop={handleDrop} 
        onUpdateBlock={handleUpdateBlock}
        selectedBlock={selectedBlock}
        setSelectedBlock={setSelectedBlock}
        onContextMenu={handleContextMenu}
      />
      <RightPanel 
        htmlContent={htmlContent} 
        selectedBlock={selectedBlock}
        onUpdateBlock={handleUpdateBlock}
      />
      <ContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        onDelete={handleDeleteBlock}
        onDuplicate={handleDuplicateBlock}
        onCopyStyles={handleCopyStyles}
        onPasteStyles={handlePasteStyles}
        canPaste={!!styleClipboard}
        onClose={closeContextMenu}
      />
    </div>
  );
};

export default App;
