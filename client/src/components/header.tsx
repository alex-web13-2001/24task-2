import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { SidebarTrigger } from './ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

type HeaderProps = {
  onCreateTask: () => void;
  onNavigate: (view: string) => void;
  onLogout: () => void;
};

export function Header({ onCreateTask, onNavigate, onLogout }: HeaderProps) {

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 flex items-center px-4 md:px-6">
      {/* Мобильное меню */}
      <div className="md:hidden mr-3">
        <SidebarTrigger />
      </div>

      {/* Логотип */}
      <div
        className="flex items-center gap-2 md:gap-3 cursor-pointer"
        onClick={() => onNavigate('dashboard')}
      >
        <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg">
          <span className="text-white text-sm md:text-base">24</span>
        </div>
        <span className="text-purple-600 text-lg md:text-xl">24Task</span>
      </div>

      {/* Правая часть */}
      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        <Button
          onClick={onCreateTask}
          className="bg-purple-600 hover:bg-purple-700 h-9 md:h-10"
          size="sm"
        >
          <Plus className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">Новая задача</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 md:h-10 md:w-10 rounded-full p-0">
              <Avatar className="h-8 w-8 md:h-10 md:w-10">
                <AvatarFallback className="bg-purple-100 text-purple-600 text-sm">
                  АП
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => onNavigate('profile')}>
              Профиль
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigate('categories')}>
              Справочники
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigate('archive')}>
              Архив
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-red-600">
              Выход
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
