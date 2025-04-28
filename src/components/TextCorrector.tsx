import React, { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { correctText, TargetLanguage } from "@/services/textCorrectionService";
import { Loader2, Copy, Check, Languages, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TextCorrector = () => {
  const [inputText, setInputText] = useState("");
  const [correctedText, setCorrectedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [untranslatableWords, setUntranslatableWords] = useState<string[]>([]);
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>('English');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Focus the textarea on component mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Reset copy state after 2 seconds
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  // Clear corrected text when input is empty
  useEffect(() => {
    if (!inputText) {
      setCorrectedText("");
      setUntranslatableWords([]);
      setIsTranslated(false);
    }
  }, [inputText]);

  const handleTranslate = async () => {
    if (!inputText) {
      setCorrectedText("");
      setUntranslatableWords([]);
      return;
    }

    setIsProcessing(true);
    
    try {
      const result = await correctText(inputText, false, targetLanguage); // Pass false to avoid debouncing
      setCorrectedText(result.correctedText);
      setIsTranslated(result.isTranslated);
      setUntranslatableWords(result.untranslatableWords || []);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  };

  const handleCopy = () => {
    if (!correctedText || !outputRef.current) return;
    
    // Get the text content while excluding the untranslatable words
    const selection = window.getSelection();
    const range = document.createRange();
    const clonedOutput = outputRef.current.cloneNode(true) as HTMLElement;
    
    // Remove untranslatable (red) spans before copying
    const untranslatableSpans = clonedOutput.querySelectorAll('.untranslatable');
    untranslatableSpans.forEach(span => {
      span.innerHTML = span.textContent || '';
    });
    
    // Get clean text without HTML tags
    const cleanText = clonedOutput.textContent || '';
    
    navigator.clipboard.writeText(cleanText)
      .then(() => {
        setIsCopied(true);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  // Render corrected text with untranslatable words highlighted
  const renderCorrectedText = () => {
    if (!correctedText) return null;
    
    let renderedText = correctedText;
    
    // Replace untranslatable words with span elements
    untranslatableWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      renderedText = renderedText.replace(regex, `<span class="untranslatable" style="color:black; background-color:#FDFF00;">${word}</span>`);
    });
    
    return (
      <p 
        ref={outputRef}
        className="whitespace-pre-wrap break-words"
        dangerouslySetInnerHTML={{ __html: renderedText }}
      />
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      <Card className="p-6 shadow-sm border border-slate-200 bg-white relative">

        <div className="flex justify-end mb-4 items-center relative">
          <Select value={targetLanguage} onValueChange={(value) => {
            setTargetLanguage(value as TargetLanguage);
            setInputText("");
            setCorrectedText("");
            setUntranslatableWords([]);
            setIsTranslated(false);
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Roman Urdu">Roman Urdu</SelectItem>
              <SelectItem value="Prompt Enhance">Prompt Enhance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground mb-4 text-center">
        Choose any language or enhanced mode, click, and get a quick translation and enhanced prompt.

        </p>
        
        <div className="space-y-4">
          {/* Input area with updated styling */}
          <div>
            <Textarea
              ref={inputRef}
              placeholder="Start typing here..."
              className="min-h-[150px] resize-none text-lg p-4 border-slate-200 focus-visible:ring-app-blue focus-visible:border-app-blue focus-visible:ring-offset-1"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="mt-2 flex justify-end">
              <Button
                onClick={handleTranslate}
                disabled={isProcessing || !inputText}
                className="font-normal flex items-center gap-1.5 bg-app-blue hover:bg-app-blue/90"
              >
                {targetLanguage === 'Prompt Enhance' ? (
                  <Wand2 className="h-4 w-4" />
                ) : (
                  <Languages className="h-4 w-4" />
                )}
                <span>
                  {isProcessing 
                    ? (targetLanguage === 'Prompt Enhance' ? "Enhancing..." : "Translating...") 
                    : (targetLanguage === 'Prompt Enhance' ? "Enhance" : "Translate")}
                </span>
              </Button>
            </div>
          </div>
          
          {/* Output area with improved loading state */}
          <div className="relative">
            <div className={`min-h-[150px] p-4 rounded-md border ${
              isProcessing 
                ? "bg-blue-50/50 border-blue-100 transition-colors duration-300" 
                : "bg-slate-50 border-slate-200"
            }`}>
              {correctedText && !isProcessing && renderCorrectedText()}
              {isProcessing && (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-5 w-5 animate-spin text-app-blue" />
                  <span className="ml-2 text-muted-foreground">
                    {targetLanguage === 'Prompt Enhance' ? "Enhancing..." : "Translating..."}
                  </span>
                </div>
              )}
              {!correctedText && !isProcessing && (
                <span className="text-muted-foreground italic">
                  {targetLanguage === 'Prompt Enhance' ? "Enhanced Prompt will appear here" : "Translated text will appear here"}
                </span>
              )}
            </div>
            
            {correctedText && (
              <div className="mt-2 flex justify-end">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="text-sm font-normal border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 py-1 px-3 rounded shadow-sm"
                >
                  {isCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span>{isCopied ? "Copied" : "Copy"}</span>
                </Button>
              </div>
            )}
            

          </div>
        </div>
      </Card>
    </div>
  );
};

export default TextCorrector;
