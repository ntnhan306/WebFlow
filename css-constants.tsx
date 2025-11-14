import type { CssBlock, CssProperty } from './types';
import { CssBlockCategory } from './types';

export const CSS_BLOCKS: CssBlock[] = [
    // TYPOGRAPHY
    {
        id: 'color',
        name: 'Màu chữ',
        category: CssBlockCategory.TYPOGRAPHY,
        template: (): CssProperty => ({
            instanceId: crypto.randomUUID(),
            property: 'color',
            value: '#000000',
        }),
    },
    {
        id: 'fontSize',
        name: 'Cỡ chữ',
        category: CssBlockCategory.TYPOGRAPHY,
        template: (): CssProperty => ({
            instanceId: crypto.randomUUID(),
            property: 'fontSize',
            value: '16px',
        }),
    },
    {
        id: 'fontWeight',
        name: 'Độ đậm chữ',
        category: CssBlockCategory.TYPOGRAPHY,
        template: (): CssProperty => ({
            instanceId: crypto.randomUUID(),
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
            instanceId: crypto.randomUUID(),
            property: 'backgroundColor',
            value: '#ffffff',
        }),
    },
    {
        id: 'border',
        name: 'Viền',
        category: CssBlockCategory.BACKGROUND,
        template: (): CssProperty => ({
            instanceId: crypto.randomUUID(),
            property: 'border',
            value: '1px solid #cccccc',
        }),
    },
    {
        id: 'borderRadius',
        name: 'Bo góc viền',
        category: CssBlockCategory.BACKGROUND,
        template: (): CssProperty => ({
            instanceId: crypto.randomUUID(),
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
            instanceId: crypto.randomUUID(),
            property: 'padding',
            value: '10px',
        }),
    },
    {
        id: 'margin',
        name: 'Canh lề (Margin)',
        category: CssBlockCategory.SPACING,
        template: (): CssProperty => ({
            instanceId: crypto.randomUUID(),
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
            instanceId: crypto.randomUUID(),
            property: 'display',
            value: 'flex',
        }),
    },
     {
        id: 'flexDirection',
        name: 'Hướng Flex',
        category: CssBlockCategory.LAYOUT,
        template: (): CssProperty => ({
            instanceId: crypto.randomUUID(),
            property: 'flexDirection',
            value: 'row',
        }),
    },
    {
        id: 'justifyContent',
        name: 'Căn chỉnh ngang (Flex)',
        category: CssBlockCategory.LAYOUT,
        template: (): CssProperty => ({
            instanceId: crypto.randomUUID(),
            property: 'justifyContent',
            value: 'flex-start',
        }),
    },
    {
        id: 'alignItems',
        name: 'Căn chỉnh dọc (Flex)',
        category: CssBlockCategory.LAYOUT,
        template: (): CssProperty => ({
            instanceId: crypto.randomUUID(),
            property: 'alignItems',
            value: 'flex-start',
        }),
    },
];
