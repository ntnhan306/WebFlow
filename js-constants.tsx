import { JsBlockCategory } from './enums.js';
import { generateUUID } from './utils/uuid.js';

export const JS_BLOCKS = [
    // ACTIONS
    {
        id: 'alert',
        name: 'Hiển thị Cảnh báo',
        category: JsBlockCategory.ACTIONS,
        template: () => ({
            instanceId: generateUUID(),
            actionId: 'alert',
            params: { message: 'Xin chào!' },
        }),
    },
    {
        id: 'console.log',
        name: 'Ghi ra Console',
        category: JsBlockCategory.ACTIONS,
        template: () => ({
            instanceId: generateUUID(),
            actionId: 'console.log',
            params: { message: 'Dữ liệu log' },
        }),
    },
];