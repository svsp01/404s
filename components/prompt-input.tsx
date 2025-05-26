"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createNew404Page } from '@/lib/actions';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export function PromptInput() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a description for your 404 page",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await createNew404Page(prompt);
      
      toast({
        title: "Success!",
        description: "Your 404 page has been created",
      });
      
      setPrompt('');
      router.refresh(); // Refresh the page to show the new 404 page
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create 404 page. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="w-full space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        <Textarea
          placeholder="Describe your perfect 404 page... (e.g., 'A space-themed 404 page with an astronaut lost in space')"
          className="min-h-32 p-4 text-base md:text-lg resize-none border-2 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all rounded-xl shadow-sm"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
        />
        <div className="absolute top-3 right-3">
          <Sparkles className="h-5 w-5 text-primary/50" />
        </div>
      </div>
      
      <motion.div 
        className="flex justify-end"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <Button 
          type="submit" 
          className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-5 w-5" />
              Generate 404 Page
            </>
          )}
        </Button>
      </motion.div>
    </motion.form>
  );
}