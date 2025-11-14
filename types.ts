// FIX: Import ReactElement to resolve the 'Cannot find namespace JSX' error.
import type { ReactElement, CSSProperties } from 'react';

// --- General ---
export type EditorMode = 'html' | 'css' | 'js';

// --- HTML Blocks ---
export enum BlockCategory {
  DOCUMENT = 'Tài Liệu',
  STRUCTURE = 'Cấu Trúc',
  TYPOGRAPHY = 'Văn Bản',
  MEDIA = 'Đa Phương Tiện',
  FORM = 'Biểu Mẫu',
  NAVIGATION = 'Điều Hướng',
  LISTS = 'Danh Sách',
  UTILITY = 'Tiện Ích',
}

export enum BlockType {
  CONTAINER,
  LEAF,
}

export interface Block {
  id: string;
  name: string;
  category: BlockCategory;
  type: BlockType;
  component: (props: any) => ReactElement;
  template: (id: string) => WorkspaceBlock;
}

export interface WorkspaceBlock {
  instanceId: string;
  blockId: string;
  name: string;
  content: string;
  isDynamic?: boolean; // Used to mark style/script blocks managed by editors
  attributes: { [key: string]: string };
  styles: CSSProperties;
  events: { [key: string]: string };
  children: WorkspaceBlock[];
  generateHtml: () => string;
}


// --- CSS Blocks ---
export enum CssBlockCategory {
    LAYOUT = 'Bố Cục',
    SPACING = 'Khoảng Cách',
    TYPOGRAPHY = 'Chữ Viết',
    BACKGROUND = 'Nền & Viền',
    EFFECTS = 'Hiệu Ứng',
}

export interface CssBlock {
    id: string;
    name: string;
    category: CssBlockCategory;
    template: () => CssProperty;
}

export interface CssProperty {
    instanceId: string;
    property: keyof CSSProperties;
    value: string;
}

export interface CssRule {
    instanceId: string;
    selector: string;
    properties: CssProperty[];
}


// --- JS Blocks ---
export enum JsBlockCategory {
    EVENTS = 'Sự Kiện',
    ACTIONS = 'Hành Động',
    LOGIC = 'Logic',
}

export interface JsBlock {
    id: string;
    name: string;
    category: JsBlockCategory;
    template: () => JsAction;
}

export interface JsAction {
    instanceId: string;
    actionId: string; // e.g., 'alert', 'console.log'
    params: { [key: string]: any };
}

export interface JsRule {
    instanceId: string;
    selector: string;
    event: 'click' | 'mouseover' | 'change';
    actions: JsAction[];
}
