'use client';

import { Snowflake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface FreezeState {
  rows: number;
  cols: number;
}

interface FreezeControlProps {
  freezeState: FreezeState;
  onFreezeChange: (state: FreezeState) => void;
}

/**
 * FreezeControl — Dropdown menu for freezing rows/columns in the sheet.
 */
export function FreezeControl({ freezeState, onFreezeChange }: FreezeControlProps) {
  const hasFreeze = freezeState.rows > 0 || freezeState.cols > 0;

  return (
    <DropdownMenu>
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant={hasFreeze ? 'secondary' : 'ghost'}
                size="icon"
                className="size-7 shrink-0"
              >
                <Snowflake
                  size={14}
                  strokeWidth={hasFreeze ? 2.5 : 1.5}
                  className={hasFreeze ? 'text-[#FF3333]' : ''}
                />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Freeze Rows/Columns</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuItem
          onClick={() => onFreezeChange({ rows: 1, cols: freezeState.cols })}
          className={freezeState.rows === 1 && freezeState.cols === 0 ? 'bg-accent' : ''}
        >
          Freeze 1 row
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onFreezeChange({ rows: 2, cols: freezeState.cols })}
          className={freezeState.rows === 2 && freezeState.cols === 0 ? 'bg-accent' : ''}
        >
          Freeze 2 rows
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onFreezeChange({ rows: freezeState.rows, cols: 1 })}
          className={freezeState.cols === 1 && freezeState.rows === 0 ? 'bg-accent' : ''}
        >
          Freeze 1 column
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onFreezeChange({ rows: freezeState.rows, cols: 2 })}
          className={freezeState.cols === 2 && freezeState.rows === 0 ? 'bg-accent' : ''}
        >
          Freeze 2 columns
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onFreezeChange({ rows: 0, cols: 0 })}
          className={freezeState.rows === 0 && freezeState.cols === 0 ? 'bg-accent' : ''}
        >
          No freeze
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
