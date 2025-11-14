import React, { useState } from 'react';
import type { WorkspaceBlock } from '../types';
import type { CSSProperties } from 'react';

interface RightPanelProps {
  htmlContent: string;
  selectedBlock: WorkspaceBlock | null;
  onUpdateBlock: (instanceId: string, updates: Partial<WorkspaceBlock>) => void;
}

type Tab = 'Thuộc tính' | 'Xem trước' | 'Mã nguồn';

const AttributeEditor: React.FC<{
    selectedBlock: WorkspaceBlock,
    onUpdateBlock: (instanceId: string, updates: Partial<WorkspaceBlock>) => void;
}> = ({ selectedBlock, onUpdateBlock }) => {
    
    const handleAttributeChange = (key: string, value: string) => {
        onUpdateBlock(selectedBlock.instanceId, {
            attributes: { ...selectedBlock.attributes, [key]: value }
        });
    };
    
    const handleStyleChange = (key: keyof CSSProperties, value: string) => {
        onUpdateBlock(selectedBlock.instanceId, {
            styles: { ...selectedBlock.styles, [key]: value }
        });
    };

    const handleEventChange = (key: string, value: string) => {
        onUpdateBlock(selectedBlock.instanceId, {
            events: { ...selectedBlock.events, [key]: value }
        });
    }
    
    const handleContentChange = (value: string) => {
        onUpdateBlock(selectedBlock.instanceId, { content: value });
    }

    const hasContent = !['img', 'input', 'div', 'ul', 'ol', 'html', 'head', 'body', 'header', 'footer', 'main', 'section', 'form', 'hr'].includes(selectedBlock.blockId);
    const hasSpecialContent = ['style', 'script'].includes(selectedBlock.blockId);

    return (
        <div className="p-4 space-y-4 text-sm">
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{selectedBlock.name}</h3>
                <p className="text-xs text-gray-500">ID: {selectedBlock.instanceId}</p>
            </div>
            
            {(hasContent || hasSpecialContent) && (
                 <div>
                    <label className="font-medium text-gray-600 block mb-1">
                        {hasSpecialContent ? "Nội dung Mã" : "Nội dung Văn bản"}
                    </label>
                    <textarea
                        value={selectedBlock.content}
                        onChange={(e) => handleContentChange(e.target.value)}
                        rows={hasSpecialContent ? 8 : 3}
                        className="w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-xs"
                    />
                </div>
            )}
            
            <details className="space-y-2" open>
                <summary className="font-semibold text-gray-700 cursor-pointer">Thuộc tính HTML</summary>
                {Object.entries(selectedBlock.attributes).map(([key, value]) => (
                    <div key={key}>
                        <label className="font-medium text-gray-600 block mb-1 capitalize">{key}</label>
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => handleAttributeChange(key, e.target.value)}
                            className="w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                ))}
            </details>
            
            <details className="space-y-3 pt-2" open>
                <summary className="font-semibold text-gray-700 cursor-pointer">Định dạng (CSS)</summary>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="font-medium text-gray-600 block mb-1">Màu chữ</label>
                        <input type="color" value={selectedBlock.styles.color || '#000000'} onChange={e => handleStyleChange('color', e.target.value)} className="w-full h-9 bg-white border border-gray-300 rounded-md p-1" />
                    </div>
                    <div>
                        <label className="font-medium text-gray-600 block mb-1">Màu nền</label>
                        <input type="color" value={selectedBlock.styles.backgroundColor || '#ffffff'} onChange={e => handleStyleChange('backgroundColor', e.target.value)} className="w-full h-9 bg-white border border-gray-300 rounded-md p-1" />
                    </div>
                </div>
                <div>
                    <label className="font-medium text-gray-600 block mb-1">Cỡ chữ</label>
                    <input type="text" placeholder="vd: 16px, 1.2rem" value={selectedBlock.styles.fontSize || ''} onChange={e => handleStyleChange('fontSize', e.target.value)} className="w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                 <div>
                    <label className="font-medium text-gray-600 block mb-1">Đệm trong (Padding)</label>
                    <input type="text" placeholder="vd: 10px, 1rem" value={selectedBlock.styles.padding || ''} onChange={e => handleStyleChange('padding', e.target.value)} className="w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                 <div>
                    <label className="font-medium text-gray-600 block mb-1">Canh lề (Margin)</label>
                    <input type="text" placeholder="vd: 10px, 1rem" value={selectedBlock.styles.margin || ''} onChange={e => handleStyleChange('margin', e.target.value)} className="w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
            </details>

            {Object.keys(selectedBlock.events).length > 0 && (
                <details className="space-y-2 pt-2">
                    <summary className="font-semibold text-gray-700 cursor-pointer">Sự kiện (JS)</summary>
                    {Object.entries(selectedBlock.events).map(([key, value]) => (
                        <div key={key}>
                            <label className="font-medium text-gray-600 block mb-1 capitalize">{key}</label>
                             <textarea
                                value={value}
                                onChange={(e) => handleEventChange(key, e.target.value)}
                                rows={2}
                                placeholder={`alert('Sự kiện: ${key}')`}
                                className="w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-xs"
                            />
                        </div>
                    ))}
                </details>
            )}

        </div>
    );
};

const RightPanel: React.FC<RightPanelProps> = ({ htmlContent, selectedBlock, onUpdateBlock }) => {
  const [activeTab, setActiveTab] = useState<Tab>('Xem trước');

  return (
    <div className="w-1/3 bg-white flex flex-col border-l border-gray-200">
      <div className="flex-shrink-0 border-b border-gray-200">
          <nav className="flex space-x-2 p-2">
            {(['Thuộc tính', 'Xem trước', 'Mã nguồn'] as Tab[]).map(tab => (
              <button 
                key={tab}
                disabled={tab === 'Thuộc tính' && !selectedBlock}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {tab}
              </button>
            ))}
          </nav>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        {activeTab === 'Thuộc tính' && selectedBlock && (
            <AttributeEditor selectedBlock={selectedBlock} onUpdateBlock={onUpdateBlock} />
        )}
        {activeTab === 'Thuộc tính' && !selectedBlock && (
            <div className="p-6 text-center text-gray-500">
                <p>Chọn một khối trong vùng làm việc để xem thuộc tính.</p>
            </div>
        )}

        {activeTab === 'Xem trước' && (
             <div className="p-4 h-full bg-gray-100">
                <iframe
                srcDoc={htmlContent}
                title="Live Preview"
                sandbox="allow-scripts"
                className="w-full h-full bg-white rounded-lg shadow-inner border border-gray-200"
                />
            </div>
        )}
        
        {activeTab === 'Mã nguồn' && (
             <div className="p-4">
                <pre className="text-xs bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <code>{htmlContent.trim()}</code>
                </pre>
            </div>
        )}

       </div>
    </div>
  );
};

export default RightPanel;