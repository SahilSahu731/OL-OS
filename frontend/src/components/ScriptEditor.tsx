'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import { 
    Bold, Italic, Strikethrough, Heading1, Heading2, 
    List, ListOrdered, Quote, Code, CheckSquare 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

interface ScriptEditorProps {
    content: string;
    onChange: (content: string) => void;
    editable?: boolean;
}

export function ScriptEditor({ content, onChange, editable = true }: ScriptEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Typography,
            Placeholder.configure({
                placeholder: "Type '/' for commands, or just start writing...",
                emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-muted-foreground/40 before:float-left before:pointer-events-none before:h-0',
            }),
        ],
        content: content || '',
        editorProps: {
            attributes: {
                class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px]',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editable,
        immediatelyRender: false
    });

    // Update content if it changes externally
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            // Only update if the content is significantly different to avoid cursor jumping
            // A simple check: if empty, set it.
            // For a robust collaboration app we'd need more, but for this local-first style:
            if (editor.getText() === '' && content) {
                editor.commands.setContent(content);
            }
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="relative w-full max-w-4xl mx-auto pb-32">
            {/* FIXED TOOLBAR */}
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b mb-8 flex items-center gap-1 p-2 rounded-lg shadow-sm transition-all dark:bg-zinc-900/80">
                <div className="flex items-center gap-1 mr-4">
                     <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={cn("h-8 w-8 p-0", editor.isActive('heading', { level: 1 }) && "bg-muted text-primary")} title="Heading 1"><Heading1 className="w-4 h-4" /></Button>
                     <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={cn("h-8 w-8 p-0", editor.isActive('heading', { level: 2 }) && "bg-muted text-primary")} title="Heading 2"><Heading2 className="w-4 h-4" /></Button>
                </div>
                <div className="w-px h-4 bg-border mx-2" />
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className={cn("h-8 w-8 p-0", editor.isActive('bold') && "bg-muted text-primary")}><Bold className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className={cn("h-8 w-8 p-0", editor.isActive('italic') && "bg-muted text-primary")}><Italic className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleStrike().run()} className={cn("h-8 w-8 p-0", editor.isActive('strike') && "bg-muted text-primary")}><Strikethrough className="w-4 h-4" /></Button>
                <div className="w-px h-4 bg-border mx-2" />
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={cn("h-8 w-8 p-0", editor.isActive('bulletList') && "bg-muted text-primary")}><List className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={cn("h-8 w-8 p-0", editor.isActive('orderedList') && "bg-muted text-primary")}><ListOrdered className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={cn("h-8 w-8 p-0", editor.isActive('blockquote') && "bg-muted text-primary")}><Quote className="w-4 h-4" /></Button>
                <div className="flex-1" />
                <div className="text-xs text-muted-foreground hidden md:block">
                    Markdown supported
                </div>
            </div>

            <EditorContent editor={editor} />
        </div>
    );
}
