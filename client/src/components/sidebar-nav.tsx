import React from 'react';
import { Home, CheckSquare, FolderKanban, Tag } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from './ui/sidebar';

type NavigationItem = {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  view: string;
};

const navigationItems: NavigationItem[] = [
  { title: 'Дашборд', icon: Home, view: 'dashboard' },
  { title: 'Мои задачи', icon: CheckSquare, view: 'tasks' },
  { title: 'Проекты', icon: FolderKanban, view: 'projects' },
  { title: 'Категории', icon: Tag, view: 'categories' },
];

export function SidebarNav({
  currentView,
  onViewChange,
  onLogout,
}: {
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}) {
  return (
    <Sidebar className="pt-16">
      <SidebarContent>
        <SidebarMenu className="px-2 py-2">
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.view}>
              <SidebarMenuButton
                isActive={currentView === item.view}
                onClick={() => onViewChange(item.view)}
                className="w-full"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
