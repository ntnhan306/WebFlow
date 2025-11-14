import React, { useState } from 'react';
import type { CssRule, CssProperty } from '../../types';
import { CSS_BLOCKS } from '../../css-constants';
import { generateUUID } from '../../utils/uuid';

interface CssWorkspaceProps {
    rules: CssRule[];
    setRules: React.Dispatch<React.SetStateAction<CssRule[]>>;
    availableSelectors: string[];
    selectedRule: CssRule | null;
    setSelectedRule: (rule: CssRule | null) => void;
    setSelectedProperty: (prop: CssProperty | null) => void;
}

const CssWorkspace: React.FC<CssWorkspaceProps> = ({ 
    rules, setRules, availableSelectors, selectedRule, setSelectedRule, setSelectedProperty 
}) => {
    const [newSelector, setNewSelector] = useState('');
    const [isDragOver, setIsDragOver] = useState<string | null>(null);

    const handleAddRule = () => {
        if (newSelector && !rules.find(r => r.selector === newSelector)) {
            const newRule: CssRule = {
                instanceId: generateUUID(),
                selector: newSelector,
                properties: [],
            };
            setRules(prev => [...prev, newRule]);
            setNewSelector('');
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, ruleId: string) => {
        e.preventDefault();
        const cssBlockId = e.dataTransfer.getData('cssBlockId');
        const block = CSS_BLOCKS.find(b => b.id === cssBlockId);
        if (block) {
            const newProperty = block.template();
            setRules(prev => prev.map(rule => 
                rule.instanceId === ruleId 
                    ? { ...rule, properties: [...rule.properties, newProperty] } 
                    : rule
            ));
        }
        setIsDragOver(null);
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-6">Vùng Làm Việc CSS</h2>
            
            <div className="flex gap-2 mb-6">
                <select 
                    value={newSelector} 
                    onChange={e => setNewSelector(e.target.value)}
                    className="flex-grow p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                    <option value="">Chọn bộ chọn có sẵn...</option>
                    {availableSelectors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input 
                    type="text" 
                    value={newSelector}
                    onChange={e => setNewSelector(e.target.value)}
                    placeholder="... hoặc gõ bộ chọn mới (vd: .my-class)"
                    className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button onClick={handleAddRule} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
                    Thêm Quy Tắc
                </button>
            </div>

            <div className="space-y-4">
                {rules.map(rule => (
                    <div 
                        key={rule.instanceId}
                        onClick={() => setSelectedRule(rule)}
                        className={`p-4 rounded-lg bg-white shadow-md border-2 ${selectedRule?.instanceId === rule.instanceId ? 'border-blue-500' : 'border-transparent'}`}
                    >
                        <h3 className="font-mono font-bold text-lg text-indigo-700">{rule.selector} {'{'}</h3>
                        <div 
                            onDrop={(e) => handleDrop(e, rule.instanceId)}
                            onDragOver={e => { e.preventDefault(); setIsDragOver(rule.instanceId); }}
                            onDragLeave={() => setIsDragOver(null)}
                            className={`ml-4 mt-2 p-2 min-h-[50px] border-2 border-dashed rounded-lg transition-colors space-y-2 ${isDragOver === rule.instanceId ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}
                        >
                            {rule.properties.length > 0 ? (
                                rule.properties.map(prop => (
                                    <div 
                                        key={prop.instanceId}
                                        onClick={(e) => { e.stopPropagation(); setSelectedRule(rule); setSelectedProperty(prop); }}
                                        className="font-mono text-sm p-2 bg-gray-100 rounded cursor-pointer"
                                    >
                                        <span className="text-purple-600">{prop.property.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)}:</span>{' '}
                                        <span className="text-emerald-700">{prop.value}</span>;
                                    </div>
                                ))
                            ) : (
                               <p className="text-gray-400 text-xs text-center p-2">Thả thuộc tính CSS vào đây</p>
                            )}
                        </div>
                        <h3 className="font-mono font-bold text-lg text-indigo-700 mt-1">{'}'}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CssWorkspace;