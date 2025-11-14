import type { JsBlock, JsAction } from './types';
import { JsBlockCategory } from './types';
import { generateUUID } from './utils/uuid';

export const JS_BLOCKS: JsBlock[] = [
    // ACTIONS
    {
        id: 'alert',
        name: 'Hiển thị Cảnh báo',
        category: JsBlockCategory.ACTIONS,
        template: (): JsAction => ({
            instanceId: generateUUID(),
            actionId: 'alert',
            params: { message: 'Xin chào!' },
        }),
    },
    {
        id: 'console.log',
        name: 'Ghi ra Console',
        category: JsBlockCategory.ACTIONS,
        template: (): JsAction => ({
            instanceId: generateUUID(),
            actionId: 'console.log',
            params: { message: 'Dữ liệu log' },
        }),
    },
];