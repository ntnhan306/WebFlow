import React from 'react';
import type { Block, WorkspaceBlock } from './types';
import { BlockCategory, BlockType } from './types';
import type { CSSProperties } from 'react';

const escapeHtml = (unsafe: string) => {
  if (typeof unsafe !== 'string') {
    return '';
  }
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const generateFullAttributesString = (block: WorkspaceBlock): string => {
    const attrs: string[] = [];

    // HTML Attributes
    for (const [key, value] of Object.entries(block.attributes)) {
        if (value) attrs.push(`${key}="${escapeHtml(value)}"`);
    }

    // Styles
    const styleString = Object.entries(block.styles)
        .map(([key, value]) => {
            if (!value) return null;
            const cssKey = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
            return `${cssKey}: ${value}`;
        })
        .filter(Boolean)
        .join('; ');
    
    if (styleString) {
        attrs.push(`style="${escapeHtml(styleString)}"`);
    }

    // Events
    for (const [key, value] of Object.entries(block.events)) {
        if (value) attrs.push(`${key}="${escapeHtml(value)}"`);
    }

    return attrs.join(' ');
};


// --- Block Definitions ---

export const BLOCKS: Block[] = [
  // DOCUMENT BLOCKS
  {
    id: 'html',
    name: 'Tài liệu HTML',
    category: BlockCategory.DOCUMENT,
    type: BlockType.CONTAINER,
    component: () => <div className="hidden"></div>,
    template: (instanceId: string): WorkspaceBlock => ({
      instanceId,
      blockId: 'html',
      name: 'Tài liệu HTML',
      content: '',
      attributes: { lang: 'vi' },
      styles: {},
      events: {},
      children: [],
      generateHtml: function() {
        const childrenHtml = this.children.map(child => child.generateHtml()).join('\n');
        return `<!DOCTYPE html>\n<html ${generateFullAttributesString(this)}>\n${childrenHtml}\n</html>`;
      },
    }),
  },
  {
    id: 'head',
    name: 'Phần Head',
    category: BlockCategory.DOCUMENT,
    type: BlockType.CONTAINER,
    component: () => <div className="hidden"></div>,
    template: (instanceId: string): WorkspaceBlock => ({
      instanceId,
      blockId: 'head',
      name: 'Phần Head',
      content: '',
      attributes: {},
      styles: {},
      events: {},
      children: [],
      generateHtml: function() {
        const childrenHtml = this.children.map(child => child.generateHtml()).join('\n');
        return `<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <script src="https://cdn.tailwindcss.com"></script>\n${childrenHtml}\n</head>`;
      },
    }),
  },
  {
    id: 'body',
    name: 'Phần Body',
    category: BlockCategory.DOCUMENT,
    type: BlockType.CONTAINER,
    component: () => <div className="hidden"></div>,
    template: (instanceId: string): WorkspaceBlock => ({
      instanceId,
      blockId: 'body',
      name: 'Phần Body',
      content: '',
      attributes: {},
      styles: { fontFamily: 'sans-serif', padding: '1rem', backgroundColor: '#ffffff' },
      events: {},
      children: [],
      generateHtml: function() {
        const childrenHtml = this.children.map(child => child.generateHtml()).join('\n');
        return `<body ${generateFullAttributesString(this)}>\n${childrenHtml}\n</body>`;
      },
    }),
  },
   {
    id: 'title',
    name: 'Tiêu đề',
    category: BlockCategory.DOCUMENT,
    type: BlockType.LEAF,
     component: () => (
      <div className="w-full bg-gray-500 text-white p-2 rounded-md text-sm font-medium">
        Tiêu đề
        <div className="text-xs font-normal opacity-70">title</div>
      </div>
    ),
    template: (instanceId: string): WorkspaceBlock => ({
      instanceId,
      blockId: 'title',
      name: 'Tiêu đề',
      content: 'Trang Web Của Tôi',
      attributes: {},
      styles: {},
      events: {},
      children: [],
      generateHtml: function() {
        return `<title>${escapeHtml(this.content)}</title>`;
      },
    }),
  },

  // UTILITY BLOCKS
  {
    id: 'style',
    name: 'CSS Styles',
    category: BlockCategory.UTILITY,
    type: BlockType.LEAF,
    component: () => (
      <div className="w-full bg-purple-500 text-white p-2 rounded-md text-sm font-medium">
        CSS Styles
        <div className="text-xs font-normal opacity-70">style</div>
      </div>
    ),
    template: (instanceId: string): WorkspaceBlock => ({
      instanceId,
      blockId: 'style',
      name: 'CSS Styles',
      content: '/* body { background-color: #f0f0f0; } */',
      attributes: {},
      styles: {},
      events: {},
      children: [],
      generateHtml: function() {
        // Content will be injected by the CSS editor
        return `<style>${this.content}</style>`;
      },
    }),
  },
   {
    id: 'script',
    name: 'JavaScript',
    category: BlockCategory.UTILITY,
    type: BlockType.LEAF,
    component: () => (
      <div className="w-full bg-yellow-500 text-white p-2 rounded-md text-sm font-medium">
        JavaScript
        <div className="text-xs font-normal opacity-70">script</div>
      </div>
    ),
    template: (instanceId: string): WorkspaceBlock => ({
      instanceId,
      blockId: 'script',
      name: 'JavaScript',
      content: '// console.log("Xin chào!");',
      attributes: {},
      styles: {},
      events: {},
      children: [],
      generateHtml: function() {
        // Content will be injected by the JS editor
        return `<script>${this.content}</script>`;
      },
    }),
  },
  
  // STRUCTURE BLOCKS
  {
    id: 'div',
    name: 'Khối (div)',
    category: BlockCategory.STRUCTURE,
    type: BlockType.CONTAINER,
    component: () => (
      <div className="w-full bg-indigo-500 text-white p-2 rounded-md text-sm font-medium">
        Khối
        <div className="text-xs font-normal opacity-70">div</div>
      </div>
    ),
    template: (instanceId: string): WorkspaceBlock => ({
      instanceId,
      blockId: 'div',
      name: 'Khối (div)',
      content: '',
      attributes: { class: 'p-4 border border-dashed border-gray-300 min-h-[50px]', id: '' },
      styles: {},
      events: {},
      children: [],
      generateHtml: function() {
        const childrenHtml = this.children.map(child => child.generateHtml()).join('\n');
        return `<div ${generateFullAttributesString(this)}>${childrenHtml}</div>`;
      },
    }),
  },
    {
    id: 'header',
    name: 'Đầu trang (header)',
    category: BlockCategory.STRUCTURE,
    type: BlockType.CONTAINER,
    component: () => (
      <div className="w-full bg-indigo-500 text-white p-2 rounded-md text-sm font-medium">
        Đầu trang
        <div className="text-xs font-normal opacity-70">header</div>
      </div>
    ),
    template: (instanceId: string): WorkspaceBlock => ({
      instanceId,
      blockId: 'header',
      name: 'Đầu trang (header)',
      content: '',
      attributes: { class: 'p-4 bg-gray-100 border-b', id: '' },
      styles: {},
      events: {},
      children: [],
      generateHtml: function() {
        const childrenHtml = this.children.map(child => child.generateHtml()).join('\n');
        return `<header ${generateFullAttributesString(this)}>${childrenHtml}</header>`;
      },
    }),
  },
    {
    id: 'footer',
    name: 'Chân trang (footer)',
    category: BlockCategory.STRUCTURE,
    type: BlockType.CONTAINER,
    component: () => (
      <div className="w-full bg-indigo-500 text-white p-2 rounded-md text-sm font-medium">
        Chân trang
        <div className="text-xs font-normal opacity-70">footer</div>
      </div>
    ),
    template: (instanceId: string): WorkspaceBlock => ({
      instanceId,
      blockId: 'footer',
      name: 'Chân trang (footer)',
      content: '',
      attributes: { class: 'p-4 bg-gray-800 text-white text-center', id: '' },
      styles: {},
      events: {},
      children: [],
      generateHtml: function() {
        const childrenHtml = this.children.map(child => child.generateHtml()).join('\n');
        return `<footer ${generateFullAttributesString(this)}>${childrenHtml}</footer>`;
      },
    }),
  },
  {
    id: 'main',
    name: 'Nội dung chính (main)',
    category: BlockCategory.STRUCTURE,
    type: BlockType.CONTAINER,
    component: () => (
      <div className="w-full bg-indigo-500 text-white p-2 rounded-md text-sm font-medium">
        Nội dung chính
        <div className="text-xs font-normal opacity-70">main</div>
      </div>
    ),
    template: (instanceId: string): WorkspaceBlock => ({
      instanceId,
      blockId: 'main',
      name: 'Nội dung chính (main)',
      content: '',
      attributes: { class: 'container mx-auto p-4', id: '' },
      styles: {},
      events: {},
      children: [],
      generateHtml: function() {
        const childrenHtml = this.children.map(child => child.generateHtml()).join('\n');
        return `<main ${generateFullAttributesString(this)}>${childrenHtml}</main>`;
      },
    }),
  },
  {
    id: 'section',
    name: 'Khu vực (section)',
    category: BlockCategory.STRUCTURE,
    type: BlockType.CONTAINER,
    component: () => (
      <div className="w-full bg-indigo-500 text-white p-2 rounded-md text-sm font-medium">
        Khu vực
        <div className="text-xs font-normal opacity-70">section</div>
      </div>
    ),
    template: (instanceId: string): WorkspaceBlock => ({
      instanceId,
      blockId: 'section',
      name: 'Khu vực (section)',
      content: '',
      attributes: { class: 'py-8', id: '' },
      styles: {},
      events: {},
      children: [],
      generateHtml: function() {
        const childrenHtml = this.children.map(child => child.generateHtml()).join('\n');
        return `<section ${generateFullAttributesString(this)}>${childrenHtml}</section>`;
      },
    }),
  },

  // TYPOGRAPHY BLOCKS
  {
    id: 'h1',
    name: 'Tiêu đề 1',
    category: BlockCategory.TYPOGRAPHY,
    type: BlockType.LEAF,
    component: () => (
      <div className="w-full bg-sky-600 text-white p-2 rounded-md text-sm font-medium">
        Tiêu đề 1
        <div className="text-xs font-normal opacity-70">h1</div>
      </div>
    ),
    template: (instanceId: string): WorkspaceBlock => ({
      instanceId,
      blockId: 'h1',
      name: 'Tiêu đề 1',
      content: 'Tiêu đề chính',
      attributes: { class: 'text-4xl font-bold', id: '' },
      styles: {},
      events: {},
      children: [],
      generateHtml: function() {
        return `<h1 ${generateFullAttributesString(this)}>${escapeHtml(this.content)}</h1>`;
      },
    }),
  },
  {
    id: 'h2',
    name: 'Tiêu đề 2',
    category: BlockCategory.TYPOGRAPHY,
    type: BlockType.LEAF,
    component: () => (
      <div className="w-full bg-sky-500 text-white p-2 rounded-md text-sm font-medium">
        Tiêu đề 2
        <div className="text-xs font-normal opacity-70">h2</div>
      </div>
    ),
    template: (instanceId: string): WorkspaceBlock => ({
      instanceId,
      blockId: 'h2',
      name: 'Tiêu đề 2',
      content: 'Tiêu đề phụ',
      attributes: { class: 'text-3xl font-bold', id: '' },
      styles: {},
      events: {},
      children: [],
      generateHtml: function() {
        return `<h2 ${generateFullAttributesString(this)}>${escapeHtml(this.content)}</h2>`;
      },
    }),
  },
  {
    id: 'h3',
    name: 'Tiêu đề 3',
    category: BlockCategory.TYPOGRAPHY,
    type: BlockType.LEAF,
    component: () => (
      <div className="w-full bg-sky-500 text-white p-2 rounded-md text-sm font-medium">
        Tiêu đề 3
        <div className="text-xs font-normal opacity-70">h3</div>
      </div>
    ),
    template: (instanceId: string): WorkspaceBlock => ({
      instanceId,
      blockId: 'h3',
      name: 'Tiêu đề 3',
      content: 'Tiêu đề nhỏ hơn',
      attributes: { class: 'text-2xl font-bold', id: '' },
      styles: {},
      events: {},
      children: [],
      generateHtml: function() {
        return `<h3 ${generateFullAttributesString(this)}>${escapeHtml(this.content)}</h3>`;
      },
    }),
  },
  {
    id: 'p',
    name: 'Đoạn văn',
    category: BlockCategory.TYPOGRAPHY,
    type: BlockType.LEAF,
    component: () => (
      <div className="w-full bg-sky-500 text-white p-2 rounded-md text-sm font-medium">
        Đoạn văn
        <div className="text-xs font-normal opacity-70">p</div>
      </div>
    ),
    template: (instanceId: string): WorkspaceBlock => ({
      instanceId,
      blockId: 'p',
      name: 'Đoạn văn',
      content: 'Đây là một đoạn văn bản. Bạn có thể chỉnh sửa nội dung này.',
      attributes: { class: 'my-2', id: '' },
      styles: {},
      events: {},
      children: [],
      generateHtml: function() {
        return `<p ${generateFullAttributesString(this)}>${escapeHtml(this.content)}</p>`;
      },
    }),
  },
  {
    id: 'span',
    name: 'Khối nội dòng (span)',
    category: BlockCategory.TYPOGRAPHY,
    type: BlockType.LEAF,
    component: () => (
      <div className="w-full bg-sky-400 text-white p-2 rounded-md text-sm font-medium">
        Khối nội dòng
        <div className="text-xs font-normal opacity-70">span</div>
      </div>
    ),
    template: (instanceId: string): WorkspaceBlock => ({
      instanceId,
      blockId: 'span',
      name: 'Khối nội dòng (span)',
      content: 'Văn bản nội dòng',
      attributes: { class: '', id: '' },
      styles: {},
      events: {},
      children: [],
      generateHtml: function() {
        return `<span ${generateFullAttributesString(this)}>${escapeHtml(this.content)}</span>`;
      },
    }),
  },
  {
    id: 'strong',
    name: 'In đậm',
    category: BlockCategory.TYPOGRAPHY,
    type: BlockType.LEAF,
    component: () => (
      <div className="w-full bg-sky-400 text-white p-2 rounded-md text-sm font-medium">
        In đậm
        <div className="text-xs font-normal opacity-70">strong</div>
      </div>
    ),
    template: (instanceId: string): WorkspaceBlock => ({
      instanceId,
      blockId: 'strong',
      name: 'In đậm',
      content: 'Văn bản quan trọng',
      attributes: { class: '', id: '' },
      styles: {},
      events: {},
      children: [],
      generateHtml: function() {
        return `<strong ${generateFullAttributesString(this)}>${escapeHtml(this.content)}</strong>`;
      },
    }),
  },
  {
    id: 'hr',
    name: 'Đường kẻ ngang',
    category: BlockCategory.TYPOGRAPHY,
    type: BlockType.LEAF,
    component: () => (
      <div className="w-full bg-sky-400 text-white p-2 rounded-md text-sm font-medium">
        Đường kẻ ngang
        <div className="text-xs font-normal opacity-70">hr</div>
      </div>
    ),
    template: (instanceId: string): WorkspaceBlock => ({
      instanceId,
      blockId: 'hr',
      name: 'Đường kẻ ngang',
      content: '',
      attributes: { class: 'my-4 border-gray-300', id: '' },
      styles: {},
      events: {},
      children: [],
      generateHtml: function() {
        return `<hr ${generateFullAttributesString(this)} />`;
      },
    }),
  },
  
  // NAVIGATION
   {
    id: 'a',
    name: 'Liên kết',
    category: BlockCategory.NAVIGATION,
    type: BlockType.LEAF,
    component: () => (
      <div className="w-full bg-pink-500 text-white p-2 rounded-md text-sm font-medium">
        Liên kết
        <div className="text-xs font-normal opacity-70">a</div>
      </div>
    ),
    template: (instanceId: string): WorkspaceBlock => ({
      instanceId,
      blockId: 'a',
      name: 'Liên kết',
      content: 'Nhấn vào đây',
      attributes: { href: '#', class: 'text-blue-600 hover:underline', id: '' },
      styles: {},
      events: {},
      children: [],
      generateHtml: function() {
        return `<a ${generateFullAttributesString(this)}>${escapeHtml(this.content)}</a>`;
      },
    }),
  },
  // MEDIA
  {
    id: 'img',
    name: 'Hình ảnh',
    category: BlockCategory.MEDIA,
    type: BlockType.LEAF,
    component: () => (
      <div className="w-full bg-emerald-500 text-white p-2 rounded-md text-sm font-medium">
        Hình ảnh
        <div className="text-xs font-normal opacity-70">img</div>
      </div>
    ),
    template: (instanceId: string): WorkspaceBlock => ({
      instanceId,
      blockId: 'img',
      name: 'Hình ảnh',
      content: '',
      attributes: { src: 'https://picsum.photos/400/200', alt: 'Ảnh mẫu', class: 'rounded-lg', id: '' },
      styles: {},
      events: {},
      children: [],
      generateHtml: function() {
        return `<img ${generateFullAttributesString(this)} />`;
      },
    }),
  },
  // FORM
  {
    id: 'form',
    name: 'Biểu mẫu (form)',
    category: BlockCategory.FORM,
    type: BlockType.CONTAINER,
    component: () => (
      <div className="w-full bg-orange-500 text-white p-2 rounded-md text-sm font-medium">
        Biểu mẫu
        <div className="text-xs font-normal opacity-70">form</div>
      </div>
    ),
    template: (instanceId: string): WorkspaceBlock => ({
      instanceId,
      blockId: 'form',
      name: 'Biểu mẫu (form)',
      content: '',
      attributes: { action: '#', method: 'post', class: 'space-y-4', id: '' },
      styles: {},
      events: {},
      children: [],
      generateHtml: function() {
        const childrenHtml = this.children.map(child => child.generateHtml()).join('\n');
        return `<form ${generateFullAttributesString(this)}>${childrenHtml}</form>`;
      },
    }),
  },
  {
    id: 'label',
    name: 'Nhãn (label)',
    category: BlockCategory.FORM,
    type: BlockType.LEAF,
    component: () => (
      <div className="w-full bg-orange-400 text-white p-2 rounded-md text-sm font-medium">
        Nhãn
        <div className="text-xs font-normal opacity-70">label</div>
      </div>
    ),
    template: (instanceId: string): WorkspaceBlock => ({
      instanceId,
      blockId: 'label',
      name: 'Nhãn (label)',
      content: 'Đây là một nhãn',
      attributes: { for: '', class: 'block text-sm font-medium text-gray-700', id: '' },
      styles: {},
      events: {},
      children: [],
      generateHtml: function() {
        return `<label ${generateFullAttributesString(this)}>${escapeHtml(this.content)}</label>`;
      },
    }),
  },
   {
    id: 'button',
    name: 'Nút bấm',
    category: BlockCategory.FORM,
    type: BlockType.LEAF,
    component: () => (
      <div className="w-full bg-orange-600 text-white p-2 rounded-md text-sm font-medium">
        Nút bấm
        <div className="text-xs font-normal opacity-70">button</div>
      </div>
    ),
    template: (instanceId: string): WorkspaceBlock => ({
      instanceId,
      blockId: 'button',
      name: 'Nút bấm',
      content: 'Nhấn tôi',
      attributes: { class: 'px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75', id: '' },
      styles: {},
      events: { onclick: '' },
      children: [],
      generateHtml: function() {
        return `<button ${generateFullAttributesString(this)}>${escapeHtml(this.content)}</button>`;
      },
    }),
  },
  {
    id: 'input',
    name: 'Ô nhập liệu',
    category: BlockCategory.FORM,
    type: BlockType.LEAF,
    component: () => (
      <div className="w-full bg-orange-500 text-white p-2 rounded-md text-sm font-medium">
        Ô nhập liệu
        <div className="text-xs font-normal opacity-70">input</div>
      </div>
    ),
    template: (instanceId: string): WorkspaceBlock => ({
      instanceId,
      blockId: 'input',
      name: 'Ô nhập liệu',
      content: '',
      attributes: { type: 'text', placeholder: 'Nhập văn bản tại đây...', class: 'px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500', id: '' },
      styles: {},
      events: { onchange: '', oninput: '' },
      children: [],
      generateHtml: function() {
        return `<input ${generateFullAttributesString(this)} />`;
      },
    }),
  },
  {
    id: 'textarea',
    name: 'Vùng văn bản',
    category: BlockCategory.FORM,
    type: BlockType.LEAF,
    component: () => (
      <div className="w-full bg-orange-500 text-white p-2 rounded-md text-sm font-medium">
        Vùng văn bản
        <div className="text-xs font-normal opacity-70">textarea</div>
      </div>
    ),
    template: (instanceId: string): WorkspaceBlock => ({
      instanceId,
      blockId: 'textarea',
      name: 'Vùng văn bản',
      content: '',
      attributes: { placeholder: 'Nhập nội dung dài hơn...', class: 'px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full', id: '' },
      styles: {},
      events: {},
      children: [],
      generateHtml: function() {
        return `<textarea ${generateFullAttributesString(this)}>${escapeHtml(this.content)}</textarea>`;
      },
    }),
  },
  // LISTS
  {
    id: 'ul',
    name: 'Danh sách (không thứ tự)',
    category: BlockCategory.LISTS,
    type: BlockType.CONTAINER,
    component: () => (
      <div className="w-full bg-teal-500 text-white p-2 rounded-md text-sm font-medium">
        Danh sách
        <div className="text-xs font-normal opacity-70">ul</div>
      </div>
    ),
    template: (instanceId: string): WorkspaceBlock => ({
      instanceId,
      blockId: 'ul',
      name: 'Danh sách (không thứ tự)',
      content: '',
      attributes: { class: 'list-disc list-inside ml-4', id: '' },
      styles: {},
      events: {},
      children: [],
      generateHtml: function() {
        const childrenHtml = this.children.map(child => child.generateHtml()).join('\n');
        return `<ul ${generateFullAttributesString(this)}>${childrenHtml}</ul>`;
      },
    }),
  },
  {
    id: 'ol',
    name: 'Danh sách (có thứ tự)',
    category: BlockCategory.LISTS,
    type: BlockType.CONTAINER,
    component: () => (
      <div className="w-full bg-teal-500 text-white p-2 rounded-md text-sm font-medium">
        Danh sách có STT
        <div className="text-xs font-normal opacity-70">ol</div>
      </div>
    ),
    template: (instanceId: string): WorkspaceBlock => ({
      instanceId,
      blockId: 'ol',
      name: 'Danh sách (có thứ tự)',
      content: '',
      attributes: { class: 'list-decimal list-inside ml-4', id: '' },
      styles: {},
      events: {},
      children: [],
      generateHtml: function() {
        const childrenHtml = this.children.map(child => child.generateHtml()).join('\n');
        return `<ol ${generateFullAttributesString(this)}>${childrenHtml}</ol>`;
      },
    }),
  },
  {
    id: 'li',
    name: 'Mục trong danh sách',
    category: BlockCategory.LISTS,
    type: BlockType.LEAF,
    component: () => (
      <div className="w-full bg-teal-400 text-white p-2 rounded-md text-sm font-medium">
        Mục trong danh sách
        <div className="text-xs font-normal opacity-70">li</div>
      </div>
    ),
    template: (instanceId: string): WorkspaceBlock => ({
      instanceId,
      blockId: 'li',
      name: 'Mục trong danh sách',
      content: 'Nội dung mục',
      attributes: { class: '', id: '' },
      styles: {},
      events: {},
      children: [],
      generateHtml: function() {
        return `<li ${generateFullAttributesString(this)}>${escapeHtml(this.content)}</li>`;
      },
    }),
  },
];
