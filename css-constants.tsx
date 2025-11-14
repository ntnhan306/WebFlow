import type { CssBlock, CssProperty } from './types';
import { CssBlockCategory } from './types';
import { generateUUID } from './utils/uuid';

export const CSS_BLOCKS: CssBlock[] = [
    // TYPOGRAPHY
    {
        id: 'color',
        name: 'Màu chữ',
        category: CssBlockCategory.TYPOGRAPHY,
        template: (): CssProperty => ({
            instanceId: generateUUID(),
            property: 'color',
            value: '#000000',
        }),
    },
    {
        id: 'fontSize',
        name: 'Cỡ chữ',
        category: CssBlockCategory.TYPOGRAPHY,
        template: (): CssProperty => ({
            instanceId: generateUUID(),
            property: 'fontSize',
            value: '16px',
        }),
    },
    {
        id: 'fontWeight',
        name: 'Độ đậm chữ',
        category: CssBlockCategory.TYPOGRAPHY,
        template: (): CssProperty => ({
            instanceId: generateUUID(),
            property: 'fontWeight',
            value: 'normal',
        }),
    },
    // BACKGROUND & BORDER
    {
        id: 'backgroundColor',
        name: 'Màu nền',
        category: CssBlockCategory.BACKGROUND,
        template: (): CssProperty => ({
            instanceId: generateUUID(),
            property: 'backgroundColor',
            value: '#ffffff',
        }),
    },
    {
        id: 'border',
        name: 'Viền',
        category: CssBlockCategory.BACKGROUND,
        template: (): CssProperty => ({
            instanceId: generateUUID(),
            property: 'border',
            value: '1px solid #cccccc',
        }),
    },
    {
        id: 'borderRadius',
        name: 'Bo góc viền',
        category: CssBlockCategory.BACKGROUND,
        template: (): CssProperty => ({
            instanceId: generateUUID(),
            property: 'borderRadius',
            value: '4px',
        }),
    },
    // SPACING
    {
        id: 'padding',
        name: 'Đệm trong (Padding)',
        category: CssBlockCategory.SPACING,
        template: (): CssProperty => ({
            instanceId: generateUUID(),
            property: 'padding',
            value: '10px',
        }),
    },
    {
        id: 'margin',
        name: 'Canh lề (Margin)',
        category: CssBlockCategory.SPACING,
        template: (): CssProperty => ({
            instanceId: generateUUID(),
            property: 'margin',
            value: '10px',
        }),
    },
     // LAYOUT
    {
        id: 'displayFlex',
        name: 'Layout Flex',
        category: CssBlockCategory.LAYOUT,
        template: (): CssProperty => ({
            instanceId: generateUUID(),
            property: 'display',
            value: 'flex',
        }),
    },
     {
        id: 'flexDirection',
        name: 'Hướng Flex',
        category: CssBlockCategory.LAYOUT,
        template: (): CssProperty => ({
            instanceId: generateUUID(),
            property: 'flexDirection',
            value: 'row',
        }),
    },
    {
        id: 'justifyContent',
        name: 'Căn chỉnh ngang (Flex)',
        category: CssBlockCategory.LAYOUT,
        template: (): CssProperty => ({
            instanceId: generateUUID(),
            property: 'justifyContent',
            value: 'flex-start',
        }),
    },
    {
        id: 'alignItems',
        name: 'Căn chỉnh dọc (Flex)',
        category: CssBlockCategory.LAYOUT,
        template: (): CssProperty => ({
            instanceId: generateUUID(),
            property: 'alignItems',
            value: 'flex-start',
        }),
    },
];