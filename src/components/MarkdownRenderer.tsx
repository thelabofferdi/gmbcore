import React from 'react';
import DOMPurify from 'dompurify';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
    const renderMarkdown = (text: string): React.ReactElement[] => {
        const lines = text.split('\n');
        const elements: React.ReactElement[] = [];
        let inCodeBlock = false;
        let codeBlockContent: string[] = [];
        let listItems: string[] = [];
        let inList = false;

        lines.forEach((line, index) => {
            // Code blocks
            if (line.trim().startsWith('```')) {
                if (inCodeBlock) {
                    elements.push(
                        <pre key={`code-${index}`} className="bg-slate-800 text-slate-100 p-4 rounded-lg overflow-x-auto my-2">
                            <code>{codeBlockContent.join('\n')}</code>
                        </pre>
                    );
                    codeBlockContent = [];
                    inCodeBlock = false;
                } else {
                    inCodeBlock = true;
                }
                return;
            }

            if (inCodeBlock) {
                codeBlockContent.push(line);
                return;
            }

            // Lists
            if (line.trim().match(/^[-*•]\s/)) {
                const listContent = line.trim().replace(/^[-*•]\s/, '');
                listItems.push(listContent);
                inList = true;
                return;
            } else if (inList && listItems.length > 0) {
                elements.push(
                    <ul key={`list-${index}`} className="list-disc list-inside my-2 space-y-1">
                        {listItems.map((item, i) => (
                            <li key={i} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatInline(item)) }} />
                        ))}
                    </ul>
                );
                listItems = [];
                inList = false;
            }

            // Numbered lists
            if (line.trim().match(/^\d+\.\s/)) {
                const listContent = line.trim().replace(/^\d+\.\s/, '');
                listItems.push(listContent);
                inList = true;
                return;
            }

            // Headers
            if (line.startsWith('### ')) {
                elements.push(<h3 key={index} className="text-lg font-bold mt-4 mb-2">{line.replace('### ', '')}</h3>);
                return;
            }
            if (line.startsWith('## ')) {
                elements.push(<h2 key={index} className="text-xl font-bold mt-4 mb-2">{line.replace('## ', '')}</h2>);
                return;
            }
            if (line.startsWith('# ')) {
                elements.push(<h1 key={index} className="text-2xl font-bold mt-4 mb-2">{line.replace('# ', '')}</h1>);
                return;
            }

            // Horizontal rule
            if (line.trim() === '---' || line.trim() === '***') {
                elements.push(<hr key={index} className="my-4 border-slate-300" />);
                return;
            }

            // Empty lines
            if (line.trim() === '') {
                elements.push(<br key={index} />);
                return;
            }

            // Regular paragraphs with inline formatting
            elements.push(
                <p key={index} className="my-2" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatInline(line)) }} />
            );
        });

        // Flush remaining list items
        if (listItems.length > 0) {
            elements.push(
                <ul key="final-list" className="list-disc list-inside my-2 space-y-1">
                    {listItems.map((item, i) => (
                        <li key={i} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatInline(item)) }} />
                    ))}
                </ul>
            );
        }

        return elements;
    };

    const formatInline = (text: string): string => {
        let formatted = text;

        // Links [text](url)
        formatted = formatted.replace(
            /\[([^\]]+)\]\(([^)]+)\)/g,
            '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline font-medium">$1</a>'
        );

        // Bold **text** or __text__
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold">$1</strong>');
        formatted = formatted.replace(/__([^_]+)__/g, '<strong class="font-bold">$1</strong>');

        // Italic *text* or _text_
        formatted = formatted.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
        formatted = formatted.replace(/_([^_]+)_/g, '<em class="italic">$1</em>');

        // Inline code `code`
        formatted = formatted.replace(
            /`([^`]+)`/g,
            '<code class="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>'
        );

        // Emojis and special characters (preserve them)
        return formatted;
    };

    return (
        <div className={`markdown-content ${className}`}>
            {renderMarkdown(content)}
        </div>
    );
};
