import type { JsBlock, JsAction } from './types';
import { JsBlockCategory } from './types';

export const JS_BLOCKS: JsBlock[] = [
    // ACTIONS
    {
        id: 'alert',
        name: 'Hiển thị Cảnh báo',
        category: JsBlockCategory.ACTIONS,
        template: (): JsAction => ({
            instanceId: crypto.randomUUID(),
            actionId: 'alert',
            params: { message: 'Xin chào!' },
        }),
    },
    {
        id: 'console.log',
        name: 'Ghi ra Console',
        category: JsBlockCategory.ACTIONS,
        template: (): JsAction => ({
            instanceId: crypto.randomUUID(),
            actionId: 'console.log',
            params: { message: 'Dữ liệu log' },
        }),
    },
];
