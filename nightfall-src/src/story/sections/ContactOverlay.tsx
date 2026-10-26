import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { profile } from '@/content/profile';
import { getCVUrl } from '@/lib/assets';
import { Copy, Check, Mail, Github, Linkedin, FileText } from 'lucide-react';

export interface ContactOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export const ContactOverlay: React.FC<ContactOverlayProps> = ({ open, onOpenChange, triggerRef }) => {
  const [copied, setCopied] = useState(false);
  const cvUrl = getCVUrl();

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-[#0e0d0b] border border-[#ece6d8]/20 text-[#ece6d8] sm:max-w-lg p-6 sm:p-8 rounded-lg shadow-2xl"
        showCloseButton={true}
        onCloseAutoFocus={(e) => {
          if (triggerRef?.current) {
            e.preventDefault();
            triggerRef.current.focus();
          }
        }}
      >
        <DialogHeader className="space-y-2 text-left">
          <div className="font-mono text-xs tracking-widest text-[#f2c230] uppercase">
            // TRANSMISSION PROTOCOL
          </div>
          <DialogTitle className="font-anton text-3xl sm:text-4xl uppercase tracking-tight text-white">
            LET'S COLLABORATE
          </DialogTitle>
          <DialogDescription className="font-mono text-xs text-[#ece6d8]/70">
            Open for full-time engineering roles, AI/ML consultancies, and edge hardware deployments.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-3">
          {/* Email Copy Card */}
          <div className="p-4 rounded bg-[#141310] border border-[#ece6d8]/15 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#ece6d8]/50 block">
                DIRECT INBOX
              </span>
              <a
                href={`mailto:${profile.email}`}
                className="font-mono text-sm sm:text-base font-semibold text-white hover:text-[#f2c230] transition-colors truncate block"
              >
                {profile.email}
              </a>
            </div>

            <button
              type="button"
              onClick={handleCopyEmail}
              className="px-3 py-1.5 rounded bg-[#ece6d8]/10 hover:bg-[#f2c230] hover:text-[#0b0a09] border border-[#ece6d8]/20 text-xs font-mono transition-colors flex items-center gap-1.5 shrink-0"
              title="Copy email to clipboard"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-green-400" />
                  <span>COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>COPY</span>
                </>
              )}
            </button>
          </div>

          {/* Direct Mailto Action Button */}
          <a
            href={`mailto:${profile.email}?subject=Project%20Inquiry%20%E2%80%94%20Nishant%20Jain`}
            className="w-full py-3 px-4 rounded bg-[#f2c230] hover:bg-[#ece6d8] text-[#0b0a09] font-mono text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 shadow-[0_0_18px_rgba(242,194,48,0.3)]"
          >
            <Mail className="size-4" />
            <span>START A PROJECT (SEND EMAIL) →</span>
          </a>

          {/* Social Links & CV Grid */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded bg-[#141310] border border-[#ece6d8]/15 hover:border-[#f2c230] text-[#ece6d8] hover:text-white font-mono text-xs flex flex-col items-center justify-center gap-1.5 transition-colors text-center"
            >
              <Linkedin className="size-4 text-[#5a7dff]" />
              <span>LinkedIn ↗</span>
            </a>

            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded bg-[#141310] border border-[#ece6d8]/15 hover:border-[#f2c230] text-[#ece6d8] hover:text-white font-mono text-xs flex flex-col items-center justify-center gap-1.5 transition-colors text-center"
            >
              <Github className="size-4 text-white" />
              <span>GitHub ↗</span>
            </a>

            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded bg-[#141310] border border-[#ece6d8]/15 hover:border-[#f2c230] text-[#ece6d8] hover:text-white font-mono text-xs flex flex-col items-center justify-center gap-1.5 transition-colors text-center"
            >
              <FileText className="size-4 text-[#f2c230]" />
              <span>CV (PDF) ↗</span>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
