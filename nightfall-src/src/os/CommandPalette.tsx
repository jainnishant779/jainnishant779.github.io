import { BookOpen, Copy, ExternalLink, FileText, Github, Linkedin, LogOut, type LucideIcon } from 'lucide-react';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/components/ui/command';
import { profile } from '@/content/profile';
import { projects } from '@/content/projects';
import { getCVUrl } from '@/lib/assets';
import type { OSModuleId } from './OSShell';

export interface PaletteModule {
  id: OSModuleId;
  label: string;
  icon: LucideIcon;
  key?: string;
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modules: PaletteModule[];
  onNavigate: (module: OSModuleId, slug?: string) => void;
  /** Present in overlay mode: leaves the OS and returns to the film. */
  onClose?: () => void;
  onNotify: (message: string) => void;
}

/** Ctrl/Cmd+K: every module, every project and the contact actions in one list. All entries come from the content files. */
export function CommandPalette({ open, onOpenChange, modules, onNavigate, onClose, onNotify }: CommandPaletteProps) {
  const run = (fn: () => void) => () => {
    onOpenChange(false);
    fn();
  };
  const openLink = (href: string) => window.open(href, '_blank', 'noopener,noreferrer');

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      onNotify('Email copied');
    } catch {
      onNotify(profile.email);
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Command palette" description="Jump to a module or project, or run an action." className="border-line-strong bg-bg-1 sm:max-w-xl">
      <CommandInput placeholder="Search modules, projects, actions…" className="focus:outline-none focus-visible:outline-none" />
      <CommandList className="max-h-[min(60vh,420px)]">
        <CommandEmpty>Nothing matches that.</CommandEmpty>

        <CommandGroup heading="Modules">
          {modules.map(({ id, label, icon: Icon, key }) => (
            <CommandItem key={id} value={`module ${label}`} onSelect={run(() => onNavigate(id))}>
              <Icon aria-hidden />
              {label}
              {key && <CommandShortcut>{key}</CommandShortcut>}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />
        <CommandGroup heading="Projects">
          {projects.map((p) => (
            <CommandItem key={p.slug} value={`project ${p.title} ${p.stack.join(' ')}`} onSelect={run(() => onNavigate('projects', p.slug))}>
              <FileText aria-hidden />
              <span className="truncate">{p.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem value="read the story editorial vox edition" onSelect={run(() => { window.location.href = '/nightfall/story'; })}>
            <BookOpen aria-hidden />
            Read the story
          </CommandItem>
          <CommandItem value="download cv pdf resume" onSelect={run(() => openLink(getCVUrl()))}>
            <ExternalLink aria-hidden />
            Open CV (PDF)
          </CommandItem>
          <CommandItem value="copy email address" onSelect={run(copyEmail)}>
            <Copy aria-hidden />
            Copy email address
          </CommandItem>
          <CommandItem value="github profile" onSelect={run(() => openLink(profile.github))}>
            <Github aria-hidden />
            GitHub
          </CommandItem>
          <CommandItem value="linkedin profile" onSelect={run(() => openLink(profile.linkedin))}>
            <Linkedin aria-hidden />
            LinkedIn
          </CommandItem>
          {onClose && (
            <CommandItem value="return to the cave close exit" onSelect={run(onClose)}>
              <LogOut aria-hidden />
              Return to the cave
              <CommandShortcut>Esc</CommandShortcut>
            </CommandItem>
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
