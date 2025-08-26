import { useState, useEffect, useRef } from "react";
import type { DragEvent, KeyboardEvent } from "react";

interface PromptTemplate {
    name: string;
    prompt_template: string;
}

interface PromptTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CloseIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export function PromptTemplateModal({ isOpen, onClose }: PromptTemplateModalProps) {
    const [templates, setTemplates] = useState<PromptTemplate[]>([]);
    const [templateName, setTemplateName] = useState("");
    const [promptContent, setPromptContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen) {
            const fetchAllTemplates = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const res = await fetch("http://localhost:3000/conversation/get_all_prompt_templates");
                    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                    const data = await res.json();
                    if (data.status === 'success') {
                        setTemplates(data.templates);
                    } else {
                        throw new Error("Failed to fetch templates from API");
                    }
                } catch (err) {
                    setError("Could not load templates.");
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchAllTemplates();
        }
    }, [isOpen]);

    const handleSelectTemplate = (name: string) => {
        setTemplateName(name);
        const selected = templates.find(t => t.name === name);
        if (selected) {
            setPromptContent(selected.prompt_template);
        }
    };
    
    const handleSave = async () => {
        if (!templateName.trim()) {
            setError("Template name cannot be empty.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch("http://localhost:3000/conversation/new_prompt_template", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    template_name: templateName,
                    template: promptContent
                }),
            });
            const data = await res.json();
            if (!res.ok || data.status !== 'success') {
                throw new Error(data.detail || "Failed to save template");
            }
            const updatedTemplates = await (await fetch("http://localhost:3000/conversation/get_all_prompt_templates")).json();
            if(updatedTemplates.status === 'success') {
                setTemplates(updatedTemplates.templates);
            }
        } catch (err: any) {
            setError(err.message);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDragStart = (e: DragEvent<HTMLSpanElement>, text: string) => {
        e.dataTransfer.setData("text/plain", text);
    };

    const handleDragOver = (e: DragEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: DragEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        const textToInsert = e.dataTransfer.getData("text/plain");
        const textarea = textareaRef.current;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newText = promptContent.substring(0, start) + textToInsert + promptContent.substring(end);
            setPromptContent(newText);
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
                textarea.focus();
            }, 0);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        const { selectionStart, selectionEnd, value } = e.currentTarget;
        if (e.key === "Backspace" || e.key === "Delete") {
                const placeholders = ["{context}", "{question}"];
                for (const placeholder of placeholders) {
                let startIndex = value.indexOf(placeholder);
                while (startIndex !== -1) {
                    const endIndex = startIndex + placeholder.length;
                    if (selectionStart === startIndex && selectionEnd === endIndex) {
                        return;
                    }
                    if ((selectionStart === endIndex && e.key === "Backspace") || (selectionStart === startIndex && e.key === "Delete")) {
                            e.preventDefault();
                            e.currentTarget.setSelectionRange(startIndex, endIndex);
                            return;
                    }
                    startIndex = value.indexOf(placeholder, startIndex + 1);
                }
            }
        }
        
        const placeholders = ["{context}", "{question}"];
        for (const placeholder of placeholders) {
            let startIndex = value.indexOf(placeholder);
            while (startIndex !== -1) {
                const endIndex = startIndex + placeholder.length;
                if (selectionStart > startIndex && selectionEnd < endIndex) {
                    e.preventDefault();
                    return;
                }
                startIndex = value.indexOf(placeholder, startIndex + 1);
            }
        }
    };

    const DraggableTag = ({ tag }: { tag: string }) => (
        <span draggable onDragStart={(e) => handleDragStart(e, tag)} className="cursor-grab bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded-md text-sm font-mono transition-colors">
            {tag}
        </span>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 backdrop-blur-sm">
            <div className="bg-[#1F2937] border border-gray-700 rounded-xl shadow-2xl w-full max-w-5xl h-[75vh] text-white flex flex-col p-6">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
                    <h3 className="text-2xl font-bold text-gray-100">Prompt Template Editor</h3>
                    <button onClick={onClose} className="p-2 rounded-md text-gray-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer">
                        {CloseIcon}
                    </button>
                </div>

                <div className="flex-1 grid grid-cols-4 gap-6 overflow-hidden">
                    {/* Left Column: List of Templates */}
                    <div className="col-span-1 flex flex-col overflow-hidden">
                        <h4 className="text-lg font-semibold mb-3 text-gray-300 cursor-pointer">Saved Templates</h4>
                        <div className="flex-1 bg-[#111827] p-2 rounded-lg overflow-y-auto">
                            {isLoading && !templates.length ? <p className="text-gray-400 p-2">Loading...</p> : null}
                            {templates.length > 0 ? (
                                <ul className="space-y-1">
                                    {templates.map(template => (
                                        <li key={template.name}>
                                            <button onClick={() => handleSelectTemplate(template.name)} className={`w-full text-left p-2.5 rounded-md text-sm transition-colors cursor-pointer ${templateName === template.name ? 'bg-blue-600 font-semibold' : 'hover:bg-gray-700/50'}`}>
                                                {template.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : !isLoading && <p className="text-gray-500 text-sm p-2">No templates found.</p>}
                        </div>
                    </div>

                    {/* Right Column: Editor */}
                    <div className="col-span-3 flex flex-col gap-4">
                        <div>
                            <label htmlFor="templateName" className="block text-sm font-medium text-gray-300 mb-1.5">Template Name</label>
                            <input type="text" id="templateName" value={templateName} onChange={(e) => setTemplateName(e.target.value)} className="w-full p-2.5 bg-[#374151] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Draggable Placeholders</label>
                            <div className="flex gap-3">
                                <DraggableTag tag="{context}" />
                                <DraggableTag tag="{question}" />
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col">
                            <label htmlFor="promptContent" className="block text-sm font-medium text-gray-300 mb-1.5">Template Content</label>
                            <textarea
                                id="promptContent"
                                ref={textareaRef}
                                value={promptContent}
                                onChange={(e) => setPromptContent(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                className="w-full flex-1 p-4 bg-[#111827] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm transition-colors resize-none"
                                placeholder="Drag placeholders and type your template here..."
                            />
                        </div>
                    </div>
                </div>

                 {/* Modal Footer */}
                <div className="flex justify-end items-center gap-4 mt-6 pt-4 border-t border-gray-700">
                    {error && <p className="text-red-400 text-sm mr-auto">{error}</p>}
                    <button onClick={onClose} className="px-5 py-2 bg-gray-600 hover:bg-gray-500 rounded-md font-medium transition-colors cursor-pointer">Cancel</button>
                    <button onClick={handleSave} disabled={isLoading} className="px-5 py-2 bg-green-600 hover:bg-green-500 rounded-md font-medium disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors cursor-pointer">
                        {isLoading ? 'Saving...' : 'Save Template'}
                    </button>
                </div>
            </div>
        </div>
    );
}
