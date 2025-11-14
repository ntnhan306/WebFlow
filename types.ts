// FIX: Import ReactElement to resolve the 'Cannot find namespace JSX' error.
import type { ReactElement, CSSProperties } from 'react';

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
  attributes: { [key: string]: string };
  styles: CSSProperties;
  events: { [key: string]: string };
  children: WorkspaceBlock[];
  generateHtml: () => string;
}