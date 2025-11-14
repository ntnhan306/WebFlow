import React from 'react';
import type { CssRule, CssProperty } from '../../types';

interface CssPropertiesPanelProps {
    selectedRule: CssRule | null;
    selectedProperty: CssProperty | null;
    setRules: React.Dispatch<React.SetStateAction<CssRule[]>>;
}

const CssPropertiesPanel: React.FC<CssPropertiesPanelProps> = ({ selectedRule, selectedProperty, setRules }) => {

    const handleValueChange = (newValue: string) => {
        if (!selectedRule || !selectedProperty) return;

        setRules(prevRules => prevRules.map(rule => {
            if (rule.instanceId !== selectedRule.instanceId) return rule;
            return {
                ...rule,
                properties: rule.properties.map(prop => 
                    prop.instanceId === selectedProperty.instanceId 
                        ? { ...prop, value: newValue } 
                        : prop
                )
            };
        }));
    };
    
    if (!selectedProperty) {
        return (
            <div className="w-96 bg-white flex flex-col border-l border-gray-200 p-6 text-center text-gray-500">
                <p>Chọn một thuộc tính trong vùng làm việc để chỉnh sửa.</p>
            </div>
        );
    }
    
    const isColor = ['color', 'backgroundColor'].includes(selectedProperty.property);

    return (
        <div className="w-96 bg-white flex flex-col border-l border-gray-200">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Thuộc tính CSS</h2>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-4 text-sm">
                <div>
                    <h3 className="font-semibold text-gray-800 mb-1 capitalize">
                        {selectedProperty.property.replace(/[A-Z]/g, match => ` ${match.toLowerCase()}`)}
                    </h3>
                    <p className="text-xs text-gray-500">Trong bộ chọn: <span className="font-mono">{selectedRule?.selector}</span></p>
                </div>
                <div>
                    <label className="font-medium text-gray-600 block mb-1">Giá trị</label>
                    <div className="flex gap-2">
                        <input
                            type={isColor ? 'color' : 'text'}
                            value={selectedProperty.value}
                            onChange={(e) => handleValueChange(e.target.value)}
                            className={`p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${isColor ? 'h-10' : 'w-full'}`}
                        />
                        {isColor && (
                             <input
                                type="text"
                                value={selectedProperty.value}
                                onChange={(e) => handleValueChange(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CssPropertiesPanel;
