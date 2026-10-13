import { Panel, Group, Separator } from 'react-resizable-panels';
import { GripVertical } from 'lucide-react';
import type { WorkspaceLayoutMode } from '@/types';
import type { ReactNode } from 'react';

interface WorkspaceLayoutProps {
  layout: WorkspaceLayoutMode;
  leftContent: ReactNode;
  rightContent: ReactNode;
}

export default function WorkspaceLayout({
  layout,
  leftContent,
  rightContent,
}: WorkspaceLayoutProps) {
  if (layout === 'single') {
    return <div className="h-full overflow-hidden">{leftContent}</div>;
  }

  return (
    <Group orientation="horizontal" className="h-full">
      <Panel defaultSize={50} minSize={30}>
        {leftContent}
      </Panel>

      <Separator className="w-2 flex items-center justify-center group hover:bg-primary-50 transition-colors cursor-col-resize">
        <div className="w-1 h-10 rounded-full bg-surface-300 group-hover:bg-primary-400 transition-colors flex items-center justify-center">
          <GripVertical size={12} className="text-surface-400 group-hover:text-primary-500" />
        </div>
      </Separator>

      <Panel defaultSize={50} minSize={30}>
        {rightContent}
      </Panel>
    </Group>
  );
}
