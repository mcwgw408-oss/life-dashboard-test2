import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { X } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Card({ className, children, onClick }: { className?: string, children: React.ReactNode, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-card/80 backdrop-blur-md rounded-3xl p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60",
        onClick && "cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Button({ 
  className, variant = 'primary', size = 'md', children, ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger',
  size?: 'sm' | 'md' | 'lg' | 'icon'
}) {
  const variants = {
    primary: "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground shadow-sm shadow-secondary/20 hover:bg-secondary/80",
    outline: "border-2 border-primary/20 text-primary hover:bg-primary/5",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-muted/50",
    danger: "bg-red-100 text-red-600 hover:bg-red-200"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5",
    lg: "px-6 py-3 text-lg",
    icon: "p-2"
  };

  return (
    <button 
      className={cn(
        "rounded-2xl font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      className={cn(
        "w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea 
      className={cn(
        "w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select 
      className={cn(
        "w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all appearance-none cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Checkbox({ checked, onChange, className }: { checked: boolean, onChange: (c: boolean) => void, className?: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 border-2 shrink-0",
        checked ? "bg-secondary border-secondary text-secondary-foreground" : "border-muted-foreground/30 hover:border-primary/40",
        className
      )}
    >
      {checked && (
        <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </motion.svg>
      )}
    </button>
  );
}

export function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md max-h-[90vh] overflow-y-auto bg-card p-6 rounded-[2rem] shadow-2xl z-50 border border-white/50"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{title}</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-muted/50">
                <X size={20} />
              </Button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function PageHeader({ title, subtitle, icon: Icon }: { title: string, subtitle?: string, icon?: React.ElementType }) {
  return (
    <div className="mb-8 flex items-center gap-4">
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <Icon size={24} />
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
