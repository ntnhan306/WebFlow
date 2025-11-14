import React, { useState, useCallback, useEffect } from 'react';
import BlockPalette from './components/BlockPalette.jsx';
import Workspace from './components/Workspace.jsx';
import RightPanel from './components/Preview.jsx';
import ContextMenu from './components/ContextMenu.jsx';
import EditorModeToggle from './components/EditorModeToggle.jsx';
import CssWorkspace from './components/css-editor/CssWorkspace.jsx';
import CssBlockPalette from './components/css-editor/CssBlockPalette.jsx';
import CssPropertiesPanel from './components/css-editor/CssPropertiesPanel.jsx';
import JsWorkspace from './components/js-editor/JsWorkspace.jsx';
import JsBlockPalette from './components/js-editor/JsBlockPalette.jsx';
import JsPropertiesPanel from './components/js-editor/JsPropertiesPanel.jsx';
import { BLOCKS } from './constants.jsx';
import { generateUUID } from './utils/uuid.js';

// --- INITIAL STRUCTURE ---
const createInitialStructure = () => {
    const htmlDef = BLOCKS.find(b => b.id === 'html');
    const headDef = BLOCKS.find(b => b.id === 'head');
    const bodyDef = BLOCKS.find(b => b.id === 'body');
    const titleDef = BLOCKS.find(b => b.id === 'title');
    const styleDef = BLOCKS.find(b => b.id === 'style');
    const scriptDef = BLOCKS.find(b => b.id === 'script');

    if (!htmlDef || !headDef || !bodyDef || !titleDef || !styleDef || !scriptDef) return [];

    const titleBlock = titleDef.template(generateUUID());
    const styleBlock = { ...styleDef.template(generateUUID()), isDynamic: true, content: '' };
    const scriptBlock = { ...scriptDef.template(generateUUID()), isDynamic: true, content: '' };
    
    const headBlock = headDef.template(generateUUID());
    headBlock.children.push(titleBlock, styleBlock);
    
    const bodyBlock = bodyDef.template(generateUUID());
    bodyBlock.children.push(scriptBlock);

    const htmlBlock = htmlDef.template(generateUUID());
    htmlBlock.children = [headBlock, bodyBlock];

    return [htmlBlock];
}


// --- RECURSIVE HELPER FUNCTIONS ---
const findBlock = (blocks, instanceId) => {
  for (const block of blocks) {
    if (block.instanceId === instanceId) return block;
    if (block.children?.length > 0) {
      const found = findBlock(block.children, instanceId);
      if (found) return found;
    }
  }
  return null;
};

const findAndUpdateBlock = (blocks, instanceId, updates) => {
  return blocks.map(block => {
    if (block.instanceId === instanceId) {
      const updatedBlock = { ...block, ...updates };
      if (updates.attributes) updatedBlock.attributes = { ...block.attributes, ...updates.attributes };
      if (updates.styles) updatedBlock.styles = { ...block.styles, ...updates.styles };
      if (updates.events) updatedBlock.events = { ...block.events, ...updates.events };
      return updatedBlock;
    }
    if (block.children?.length > 0) {
      return { ...block, children: findAndUpdateBlock(block.children, instanceId, updates) };
    }
    return block;
  });
};


const findAndRemoveBlock = (blocks, instanceId) => {
    let removedBlock = null;
    const newBlocks = blocks.filter(b => {
        if (b.instanceId === instanceId) {
            removedBlock = b;
            return false;
        }
        return true;
    }).map(block => {
        if (block.children?.length > 0) {
            const result = findAndRemoveBlock(block.children, instanceId);
            if (result.removedBlock) {
                 removedBlock = result.removedBlock;
            }
            return { ...block, children: result.newBlocks };
        }
        return block;
    });
    return { newBlocks, removedBlock };
};

const findAndInsertBlock = (
    blocks, 
    blockToInsert, 
    targetId, 
    position
) => {
    if (position === 'inside') {
        return blocks.map(block => {
            if (block.instanceId === targetId) {
                return { ...block, children: [...block.children, blockToInsert] };
            }
            if (block.children?.length > 0) {
                return { ...block, children: findAndInsertBlock(block.children, blockToInsert, targetId, position) };
            }
            return block;
        });
    }

    const newBlocks = [];
    let inserted = false;
    for (const block of blocks) {
        if (block.instanceId === targetId) {
            if (position === 'before') {
                newBlocks.push(blockToInsert);
                newBlocks.push(block);
            } else { // after
                newBlocks.push(block);
                newBlocks.push(blockToInsert);
            }
            inserted = true;
        } else {
            if (block.children?.length > 0) {
                 const result = findAndInsertBlock(block.children, blockToInsert, targetId, position);
                 if (result.length !== block.children.length) inserted = true;
                 newBlocks.push({...block, children: result});
            } else {
                newBlocks.push(block);
            }
        }
    }
    return newBlocks;
};

const deepCloneBlock = (block) => ({
    ...block,
    instanceId: generateUUID(),
    children: block.children.map(child => deepCloneBlock(child)),
});

const findAndDuplicateBlock = (blocks, instanceId) => {
    const newBlocks = [];
    for (const block of blocks) {
        newBlocks.push(block);
        if (block.instanceId === instanceId) {
            newBlocks.push(deepCloneBlock(block));
        } else {
             if (block.children?.length > 0) {
                block.children = findAndDuplicateBlock(block.children, instanceId);
             }
        }
    }
    return newBlocks;
};

// FIX: Added explicit types for parameters and return value to help TypeScript's type inference with recursion.
const getAvailableSelectors = (blocks: any[]): string[] => {
    if (!Array.isArray(blocks)) return [];
    let selectors: string[] = [];
    for (const block of blocks) {
        if (block.attributes.id) selectors.push(`#${block.attributes.id}`);
        if (block.attributes.class && typeof block.attributes.class === 'string') {
            block.attributes.class.split(' ').forEach((c: string) => {
                if (c && !selectors.includes(`.${c}`)) selectors.push(`.${c}`);
            });
        }
        if (block.blockId) {
             if (!selectors.includes(block.blockId)) selectors.push(block.blockId);
        }
        if (block.children?.length > 0) {
            selectors = [...selectors, ...getAvailableSelectors(block.children)];
        }
    }
    return [...new Set(selectors)];
}

// --- CODE GENERATION ---
const generateCssCode = (rules) => {
    return rules.map(rule => {
        const properties = rule.properties.map(p => {
             const cssKey = p.property.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
             return `  ${cssKey}: ${p.value};`;
        }).join('\n');
        return `${rule.selector} {\n${properties}\n}`;
    }).join('\n\n');
}

const generateJsCode = (rules) => {
    const codeBySelector = rules.reduce((acc, rule) => {
        if (!acc[rule.selector]) {
            acc[rule.selector] = [];
        }
        acc[rule.selector].push(rule);
        return acc;
    }, {});

    let finalCode = "document.addEventListener('DOMContentLoaded', () => {\n";
    for (const [selector, selectorRules] of Object.entries(codeBySelector)) {
        finalCode += `  document.querySelectorAll('${selector.replace(/'/g, "\\'")}').forEach(el => {\n`;
        for (const rule of selectorRules) {
            const actions = rule.actions.map(action => {
                switch (action.actionId) {
                    case 'alert':
                        return `      alert('${action.params.message.replace(/'/g, "\\'")}');`;
                    case 'console.log':
                         return `      console.log('${action.params.message.replace(/'/g, "\\'")}');`;
                    default:
                        return '';
                }
            }).join('\n');
            finalCode += `    el.addEventListener('${rule.event}', () => {\n${actions}\n    });\n`;
        }
        finalCode += `  });\n`;
    }
    finalCode += "});";
    return finalCode;
}


// --- MAIN APP COMPONENT ---
const App = () => {
  const [editorMode, setEditorMode] = useState('html');
  const [workspaceBlocks, setWorkspaceBlocks] = useState(createInitialStructure);
  const [htmlContent, setHtmlContent] = useState('');
  const [selectedBlock, setSelectedBlock] = useState(null);
  
  // CSS State
  const [cssRules, setCssRules] = useState([]);
  const [selectedCssRule, setSelectedCssRule] = useState(null);
  const [selectedCssProperty, setSelectedCssProperty] = useState(null);

  // JS State
  const [jsRules, setJsRules] = useState([]);
  const [selectedJsRule, setSelectedJsRule] = useState(null);
  const [selectedJsAction, setSelectedJsAction] = useState(null);
  
  // Cross-editor State
  const [availableSelectors, setAvailableSelectors] = useState([]);

  // HTML Context Menu State
  const [contextMenu, setContextMenu] = useState({ x: 0, y: 0, visible: false, instanceId: null });
  const [styleClipboard, setStyleClipboard] = useState(null);
  

  useEffect(() => {
    // Generate CSS & JS
    const cssCode = generateCssCode(cssRules);
    const jsCode = generateJsCode(jsRules);

    // Inject into workspace blocks
    let blocksWithInjections = [...workspaceBlocks];
    const styleBlock = findBlock(blocksWithInjections, blocksWithInjections[0]?.children[0]?.children?.find(c => c.isDynamic && c.blockId === 'style')?.instanceId || '');
    if (styleBlock) {
        blocksWithInjections = findAndUpdateBlock(blocksWithInjections, styleBlock.instanceId, { content: cssCode });
    }
    const scriptBlock = findBlock(blocksWithInjections, blocksWithInjections[0]?.children[1]?.children?.find(c => c.isDynamic && c.blockId === 'script')?.instanceId || '');
    if (scriptBlock) {
        blocksWithInjections = findAndUpdateBlock(blocksWithInjections, scriptBlock.instanceId, { content: jsCode });
    }

    // Generate final HTML and update selectors
    setHtmlContent(blocksWithInjections[0]?.generateHtml() || '');
    setAvailableSelectors(getAvailableSelectors(workspaceBlocks));
  }, [workspaceBlocks, cssRules, jsRules]);

  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false, instanceId: null }));
  }, []);

  // --- HTML Handlers ---
  const handleBlockDrop = useCallback((data) => {
    const { draggedId, draggedType, targetId, position } = data;

    setWorkspaceBlocks(prevBlocks => {
        let blockToMove = null;
        let blocksAfterRemove = prevBlocks;
        
        if (draggedType === 'move') {
            const { newBlocks, removedBlock } = findAndRemoveBlock(prevBlocks, draggedId);
            if (!removedBlock) return prevBlocks; // Should not happen
            blockToMove = removedBlock;
            blocksAfterRemove = newBlocks;
        } else { // 'new'
            const blockDef = BLOCKS.find(b => b.id === draggedId);
            if (!blockDef) return prevBlocks;
            blockToMove = blockDef.template(generateUUID());
        }

        if (!blockToMove) return prevBlocks;

        const bodyInstanceId = prevBlocks[0]?.children?.find(c => c.blockId === 'body')?.instanceId;
        const finalTargetId = targetId || bodyInstanceId;

        if (!finalTargetId) {
           return [...blocksAfterRemove, blockToMove];
        }

        return findAndInsertBlock(blocksAfterRemove, blockToMove, finalTargetId, position);
    });

  }, []);
  
  const handleUpdateBlock = useCallback((instanceId, updates) => {
    setWorkspaceBlocks(prev => findAndUpdateBlock(prev, instanceId, updates));
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

  const handleContextMenu = useCallback((e, instanceId) => {
      e.preventDefault(); e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY, visible: true, instanceId });
      setSelectedBlock(findBlock(workspaceBlocks, instanceId));
  }, [workspaceBlocks]);

  const handleDeleteBlock = () => {
    if (!contextMenu.instanceId) return;
    setWorkspaceBlocks(prev => findAndRemoveBlock(prev, contextMenu.instanceId).newBlocks);
    if (selectedBlock?.instanceId === contextMenu.instanceId) setSelectedBlock(null);
    closeContextMenu();
  };

  const handleDuplicateBlock = () => {
    if (!contextMenu.instanceId) return;
    setWorkspaceBlocks(prev => findAndDuplicateBlock(prev, contextMenu.instanceId));
    closeContextMenu();
  };

  const handleCopyStyles = () => {
    if (!contextMenu.instanceId) return;
    const block = findBlock(workspaceBlocks, contextMenu.instanceId);
    if (block) setStyleClipboard(block.styles);
    closeContextMenu();
  };

  const handlePasteStyles = () => {
    if (!contextMenu.instanceId || !styleClipboard) return;
    handleUpdateBlock(contextMenu.instanceId, { styles: styleClipboard });
    closeContextMenu();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-gray-800 font-sans" onClick={closeContextMenu}>
      <EditorModeToggle mode={editorMode} setMode={setEditorMode} />
      <div className="flex flex-1 overflow-hidden">
        {editorMode === 'html' && (
          <>
            <BlockPalette />
            <Workspace 
              blocks={workspaceBlocks} 
              onBlockDrop={handleBlockDrop} 
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
          </>
        )}
        {editorMode === 'css' && (
           <>
            <CssBlockPalette />
            <CssWorkspace
              rules={cssRules}
              setRules={setCssRules}
              availableSelectors={availableSelectors}
              selectedRule={selectedCssRule}
              setSelectedRule={setSelectedCssRule}
              setSelectedProperty={setSelectedCssProperty}
            />
            <CssPropertiesPanel 
              selectedProperty={selectedCssProperty}
              selectedRule={selectedCssRule}
              setRules={setCssRules}
            />
          </>
        )}
         {editorMode === 'js' && (
           <>
            <JsBlockPalette />
            <JsWorkspace
              rules={jsRules}
              setRules={setJsRules}
              availableSelectors={availableSelectors}
              selectedRule={selectedJsRule}
              setSelectedRule={setSelectedJsRule}
              setSelectedAction={setSelectedJsAction}
            />
            <JsPropertiesPanel 
              selectedAction={selectedJsAction}
              selectedRule={selectedJsRule}
              // FIX: Corrected typo from `setRules` to `setJsRules`.
              setRules={setJsRules}
            />
          </>
        )}
      </div>

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