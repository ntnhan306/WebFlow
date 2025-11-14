import React, { useState } from 'react';
import { JS_BLOCKS } from '../../js-constants.js';
import { generateUUID } from '../../utils/uuid.js';

const JsWorkspace = ({ 
    rules, setRules, availableSelectors, selectedRule, setSelectedRule, setSelectedAction 
}) => {
    const [newSelector, setNewSelector] = useState('');
    const [newEvent, setNewEvent] = useState('click');
    const [isDragOver, setIsDragOver] = useState(null);

    const handleAddRule = () => {
        if (newSelector) {
            const newRule = {
                instanceId: generateUUID(),
                selector: newSelector,
                event: newEvent,
                actions: [],
            };
            setRules(prev => [...prev, newRule]);
            setNewSelector('');
        }
    };

    const handleDrop = (e, ruleId) => {
        e.preventDefault();
        const jsBlockId = e.dataTransfer.getData('jsBlockId');
        const block = JS_BLOCKS.find(b => b.id === jsBlockId);
        if (block) {
            const newAction = block.template();
            setRules(prev => prev.map(rule => 
                rule.instanceId === ruleId 
                    ? { ...rule, actions: [...rule.actions, newAction] } 
                    : rule
            ));
        }
        setIsDragOver(null);
    };

    return (
        <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-6">Vùng Làm Việc JavaScript</h2>
            
            <div className="flex gap-2 mb-6 items-center">
                 <label className="font-semibold">Khi</label>
                <select 
                    value={newSelector} 
                    onChange={e => setNewSelector(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                    <option value="">Chọn phần tử...</option>
                    {availableSelectors.filter(s => s.startsWith('#')).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <label className="font-semibold">bị</label>
                 <select 
                    value={newEvent} 
                    onChange={e => setNewEvent(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                    <option value="click">click</option>
                    <option value="mouseover">di chuột qua</option>
                    <option value="change">thay đổi</option>
                </select>
                <button onClick={handleAddRule} className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600">
                    Thêm Sự Kiện
                </button>
            </div>

            <div className="space-y-4">
                {rules.map(rule => (
                    <div 
                        key={rule.instanceId}
                        onClick={() => setSelectedRule(rule)}
                        className={`p-4 rounded-lg bg-white shadow-md border-2 ${selectedRule?.instanceId === rule.instanceId ? 'border-yellow-500' : 'border-transparent'}`}
                    >
                        <h3 className="font-mono font-semibold text-lg text-gray-800">
                           Khi <span className="text-indigo-700">{rule.selector}</span> bị <span className="text-red-600">{rule.event}</span>:
                        </h3>
                        <div 
                            onDrop={(e) => handleDrop(e, rule.instanceId)}
                            onDragOver={e => { e.preventDefault(); setIsDragOver(rule.instanceId); }}
                            onDragLeave={() => setIsDragOver(null)}
                            className={`ml-4 mt-2 p-2 min-h-[50px] border-2 border-dashed rounded-lg transition-colors space-y-2 ${isDragOver === rule.instanceId ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                        >
                            {rule.actions.length > 0 ? (
                                rule.actions.map(action => {
                                    const blockDef = JS_BLOCKS.find(b => b.id === action.actionId);
                                    return (
                                        <div 
                                            key={action.instanceId}
                                            onClick={(e) => { e.stopPropagation(); setSelectedRule(rule); setSelectedAction(action); }}
                                            className="font-mono text-sm p-2 bg-gray-100 rounded cursor-pointer"
                                        >
                                            {blockDef?.name}: <span className="text-emerald-700">"{action.params.message}"</span>
                                        </div>
                                    )
                                })
                            ) : (
                               <p className="text-gray-400 text-xs text-center p-2">Thả hành động JS vào đây</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JsWorkspace;