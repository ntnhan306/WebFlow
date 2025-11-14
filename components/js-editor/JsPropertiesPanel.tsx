import React from 'react';
import { JS_BLOCKS } from '../../js-constants.js';

const JsPropertiesPanel = ({ selectedRule, selectedAction, setRules }) => {
    
    const blockDef = selectedAction ? JS_BLOCKS.find(b => b.id === selectedAction.actionId) : null;

    const handleParamChange = (key, value) => {
        if (!selectedRule || !selectedAction) return;

        setRules(prevRules => prevRules.map(rule => {
            if (rule.instanceId !== selectedRule.instanceId) return rule;
            return {
                ...rule,
                actions: rule.actions.map(action => 
                    action.instanceId === selectedAction.instanceId 
                        ? { ...action, params: { ...action.params, [key]: value } }
                        : action
                )
            };
        }));
    };
    
    if (!selectedAction || !blockDef) {
        return (
            <div className="w-96 bg-white flex flex-col border-l border-gray-200 p-6 text-center text-gray-500">
                <p>Chọn một hành động trong vùng làm việc để chỉnh sửa.</p>
            </div>
        );
    }

    return (
        <div className="w-96 bg-white flex flex-col border-l border-gray-200">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Thuộc tính JS</h2>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-4 text-sm">
                <div>
                    <h3 className="font-semibold text-gray-800 mb-1">{blockDef.name}</h3>
                    <p className="text-xs text-gray-500">Sự kiện: <span className="font-mono">{selectedRule?.event}</span> trên <span className="font-mono">{selectedRule?.selector}</span></p>
                </div>
                {Object.keys(selectedAction.params).map(key => (
                    <div key={key}>
                        <label className="font-medium text-gray-600 block mb-1 capitalize">{key}</label>
                        <textarea
                            value={selectedAction.params[key]}
                            onChange={(e) => handleParamChange(key, e.target.value)}
                            rows={3}
                            className="w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-gray-900 focus:ring-2 focus:ring-yellow-500 focus:outline-none font-mono text-xs"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JsPropertiesPanel;