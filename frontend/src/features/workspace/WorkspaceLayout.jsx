import { Panel, Group, Separator } from 'react-resizable-panels';
import { GripVertical } from 'lucide-react';

export default function WorkspaceLayout({
  layout,
  contents,
  leftContent,
  rightContent,
}) {
  const panes = contents ?? [leftContent, rightContent];
  if (layout === 'single') {
    return <div className="h-full overflow-hidden">{panes[0]}</div>;
  }
  const divider = <Separator className="w-2 flex items-center justify-center group hover:bg-primary-50 transition-colors cursor-col-resize"><div className="w-1 h-10 rounded-full bg-surface-300"><GripVertical size={12} className="text-surface-400" /></div></Separator>;
  if (layout === 'split') return (
    <Group orientation="horizontal" className="h-full">
      <Panel defaultSize={50} minSize={25}>{panes[0]}</Panel>{divider}<Panel defaultSize={50} minSize={25}>{panes[1]}</Panel>
    </Group>
  );
  if (layout === 'triple') return <Group orientation="horizontal" className="h-full"><Panel minSize={28}>{panes[0]}</Panel>{divider}<Panel minSize={28}><Group orientation="vertical"><Panel minSize={25}>{panes[1]}</Panel><Separator className="h-2 hover:bg-primary-50"/><Panel minSize={25}>{panes[2]}</Panel></Group></Panel></Group>;
  return <Group orientation="horizontal" className="h-full"><Panel minSize={35}><Group orientation="vertical"><Panel minSize={25}>{panes[0]}</Panel><Separator className="h-2 hover:bg-primary-50"/><Panel minSize={25}>{panes[2]}</Panel></Group></Panel>{divider}<Panel minSize={35}><Group orientation="vertical"><Panel minSize={25}>{panes[1]}</Panel><Separator className="h-2 hover:bg-primary-50"/><Panel minSize={25}>{panes[3]}</Panel></Group></Panel></Group>;
}


