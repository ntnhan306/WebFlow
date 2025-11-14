import React, { useState, useCallback, useEffect } from 'react';
import BlockPalette from './components/BlockPalette';
import Workspace from './components/Workspace';
import RightPanel from './components/Preview';
import ContextMenu from './components/ContextMenu';
import EditorModeToggle from './components/EditorModeToggle';
import CssWorkspace from './components/css-editor/CssWorkspace';
import CssBlockPalette from './components/css-editor/CssBlockPalette';
import CssPropertiesPanel from './components/css-editor/CssPropertiesPanel';
import JsWorkspace from './components/js-editor/JsWorkspace';
import JsBlockPalette from './components/js-editor/JsBlockPalette';
import JsPropertiesPanel from './components/js-editor/JsPropertiesPanel';

import type { WorkspaceBlock, EditorMode, CssRule, CssProperty, JsRule, JsAction } from './types';
import { BLOCKS } from './constants';
import type { CSSProperties } from 'react';

// --- INITIAL STRUCTURE ---
const createInitialStructure = (): WorkspaceBlock[] => {
    const htmlDef = BLOCKS.find(b => b.id === 'html');
    const headDef = BLOCKS.find(b => b.id === 'head');
    const bodyDef = BLOCKS.find(b => b.id === 'body');
    const titleDef = BLOCKS.find(b => b.id === 'title');
    const styleDef = BLOCKS.find(b => b.id === 'style');
    const scriptDef = BLOCKS.find(b => b.id === 'script');

    if (!htmlDef || !headDef || !bodyDef || !titleDef || !styleDef || !scriptDef) return [];

    const titleBlock = titleDef.template(crypto.randomUUID());
    const styleBlock = { ...styleDef.template(crypto.randomUUID()), isDynamic: true, content: '' };
    const scriptBlock = { ...scriptDef.template(crypto.randomUUID()), isDynamic: true, content: '' };
    
    const headBlock = headDef.template(crypto.randomUUID());
    headBlock.children.push(titleBlock, styleBlock);
    
    const bodyBlock = bodyDef.template(crypto.randomUUID());
    bodyBlock.children.push(scriptBlock);

    const htmlBlock = htmlDef.template(crypto.randomUUID());
    htmlBlock.children = [headBlock, bodyBlock];

    return [htmlBlock];
}


// --- RECURSIVE HELPER FUNCTIONS ---
const findBlock = (blocks: WorkspaceBlock[], instanceId: string): WorkspaceBlock | null => {
  for (const block of blocks) {
    if (block.instanceId === instanceId) return block;
    if (block.children?.length > 0) {
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
    if (block.children?.length > 0) {
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
    if (block.children?.length > 0) {
      return { ...block, children: findAndAddBlock(block.children, newBlock, parentId) };
    }
    return block;
  });
};

const findAndRemoveBlock = (blocks: WorkspaceBlock[], instanceId: string): WorkspaceBlock[] => {
    return blocks.filter(b => b.instanceId !== instanceId).map(block => {
        if (block.children?.length > 0) {
            return { ...block, children: findAndRemoveBlock(block.children, instanceId) };
        }
        return block;
    });
};

const deepCloneBlock = (block: WorkspaceBlock): WorkspaceBlock => ({
    ...block,
    instanceId: crypto.randomUUID(),
    children: block.children.map(child => deepCloneBlock(child)),
});

const findAndDuplicateBlock = (blocks: WorkspaceBlock[], instanceId: string): WorkspaceBlock[] => {
    const newBlocks: WorkspaceBlock[] = [];
    for (const block of blocks) {
        if (block.instanceId === instanceId) {
            newBlocks.push(block, deepCloneBlock(block));
        } else {
             newBlocks.push({
                ...block,
                children: block.children?.length > 0 ? findAndDuplicateBlock(block.children, instanceId) : [],
             });
        }
    }
    return newBlocks;
};

const getAvailableSelectors = (blocks: WorkspaceBlock[]): string[] => {
    let selectors: string[] = [];
    for (const block of blocks) {
        if (block.attributes.id) selectors.push(`#${block.attributes.id}`);
        if (block.attributes.class) {
            block.attributes.class.split(' ').forEach(c => {
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
const generateCssCode = (rules: CssRule[]): string => {
    return rules.map(rule => {
        const properties = rule.properties.map(p => {
             const cssKey = p.property.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
             return `  ${cssKey}: ${p.value};`;
        }).join('\n');
        return `${rule.selector} {\n${properties}\n}`;
    }).join('\n\n');
}

const generateJsCode = (rules: JsRule[]): string => {
    const codeBySelector = rules.reduce((acc, rule) => {
        if (!acc[rule.selector]) {
            acc[rule.selector] = [];
        }
        acc[rule.selector].push(rule);
        return acc;
    }, {} as Record<string, JsRule[]>);

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
const App: React.FC = () => {
  const [editorMode, setEditorMode] = useState<EditorMode>('html');
  const [workspaceBlocks, setWorkspaceBlocks] = useState<WorkspaceBlock[]>(createInitialStructure);
  const [htmlContent, setHtmlContent] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<WorkspaceBlock | null>(null);
  
  // CSS State
  const [cssRules, setCssRules] = useState<CssRule[]>([]);
  const [selectedCssRule, setSelectedCssRule] = useState<CssRule | null>(null);
  const [selectedCssProperty, setSelectedCssProperty] = useState<CssProperty | null>(null);

  // JS State
  const [jsRules, setJsRules] = useState<JsRule[]>([]);
  const [selectedJsRule, setSelectedJsRule] = useState<JsRule | null>(null);
  const [selectedJsAction, setSelectedJsAction] = useState<JsAction | null>(null);
  
  // Cross-editor State
  const [availableSelectors, setAvailableSelectors] = useState<string[]>([]);

  // HTML Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean; instanceId: string | null }>({ x: 0, y: 0, visible: false, instanceId: null });
  const [styleClipboard, setStyleClipboard] = useState<CSSProperties | null>(null);
  

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
  const handleDrop = useCallback((blockId: string, parentId: string | null) => {
    const block = BLOCKS.find(b => b.id === blockId);
    if (!block) return;
    const newBlock = block.template(crypto.randomUUID());
    setWorkspaceBlocks(prevBlocks => {
      const bodyInstanceId = prevBlocks[0]?.children?.find(c => c.blockId === 'body')?.instanceId;
      return findAndAddBlock(prevBlocks, newBlock, parentId || bodyInstanceId || '');
    });
  }, []);
  
  const handleUpdateBlock = useCallback((instanceId: string, updates: Partial<WorkspaceBlock>) => {
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

  const handleContextMenu = useCallback((e: React.MouseEvent, instanceId: string) => {
      e.preventDefault(); e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY, visible: true, instanceId });
      setSelectedBlock(findBlock(workspaceBlocks, instanceId));
  }, [workspaceBlocks]);

  const handleDeleteBlock = () => {
    if (!contextMenu.instanceId) return;
    setWorkspaceBlocks(prev => findAndRemoveBlock(prev, contextMenu.instanceId!));
    if (selectedBlock?.instanceId === contextMenu.instanceId) setSelectedBlock(null);
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
