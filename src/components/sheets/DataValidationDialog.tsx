'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// ── Types ──

export type ValidationType = 'list' | 'number' | 'text' | 'date' | 'custom';

export interface DataValidationRule {
  id: string;
  range: string;
  type: ValidationType;
  listValues?: string; // comma-separated for 'list'
  numberOperator?: string;
  numberValue1?: string;
  numberValue2?: string;
  textOperator?: string;
  textValue?: string;
  dateOperator?: string;
  dateValue1?: string;
  dateValue2?: string;
  customFormula?: string;
  inputHint?: string;
  onInvalid: 'warning' | 'reject';
}

interface DataValidationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCell: string;
  currentRule: DataValidationRule | null;
  onApply: (rule: DataValidationRule) => void;
  onRemove: () => void;
}

const NUMBER_OPERATORS = [
  { value: 'between', label: 'Between' },
  { value: 'not-between', label: 'Not between' },
  { value: 'equal', label: 'Equal to' },
  { value: 'greater', label: 'Greater than' },
  { value: 'less', label: 'Less than' },
  { value: 'greater-equal', label: 'Greater than or equal to' },
  { value: 'less-equal', label: 'Less than or equal to' },
];

const TEXT_OPERATORS = [
  { value: 'contains', label: 'Contains' },
  { value: 'not-contains', label: "Doesn't contain" },
  { value: 'email', label: 'Is email' },
  { value: 'url', label: 'Is URL' },
];

const DATE_OPERATORS = [
  { value: 'before', label: 'Before' },
  { value: 'after', label: 'After' },
  { value: 'between', label: 'Between' },
];

const VALIDATION_TYPES: { value: ValidationType; label: string }[] = [
  { value: 'list', label: 'List' },
  { value: 'number', label: 'Number' },
  { value: 'text', label: 'Text' },
  { value: 'date', label: 'Date' },
  { value: 'custom', label: 'Custom formula' },
];

function createDefaultRule(cell: string): DataValidationRule {
  return {
    id: `dv-${Date.now()}`,
    range: cell,
    type: 'list',
    listValues: '',
    inputHint: '',
    onInvalid: 'warning',
  };
}

/**
 * DataValidationDialog — A dialog for configuring data validation on a cell/range.
 */
export function DataValidationDialog({
  open,
  onOpenChange,
  selectedCell,
  currentRule,
  onApply,
  onRemove,
}: DataValidationDialogProps) {
  const [type, setType] = useState<ValidationType>('list');
  const [listValues, setListValues] = useState('');
  const [numberOperator, setNumberOperator] = useState('between');
  const [numberValue1, setNumberValue1] = useState('');
  const [numberValue2, setNumberValue2] = useState('');
  const [textOperator, setTextOperator] = useState('contains');
  const [textValue, setTextValue] = useState('');
  const [dateOperator, setDateOperator] = useState('before');
  const [dateValue1, setDateValue1] = useState('');
  const [dateValue2, setDateValue2] = useState('');
  const [customFormula, setCustomFormula] = useState('');
  const [inputHint, setInputHint] = useState('');
  const [onInvalid, setOnInvalid] = useState<'warning' | 'reject'>('warning');

  // Sync state when dialog opens with existing rule
  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen && currentRule) {
        setType(currentRule.type);
        setListValues(currentRule.listValues || '');
        setNumberOperator(currentRule.numberOperator || 'between');
        setNumberValue1(currentRule.numberValue1 || '');
        setNumberValue2(currentRule.numberValue2 || '');
        setTextOperator(currentRule.textOperator || 'contains');
        setTextValue(currentRule.textValue || '');
        setDateOperator(currentRule.dateOperator || 'before');
        setDateValue1(currentRule.dateValue1 || '');
        setDateValue2(currentRule.dateValue2 || '');
        setCustomFormula(currentRule.customFormula || '');
        setInputHint(currentRule.inputHint || '');
        setOnInvalid(currentRule.onInvalid || 'warning');
      } else if (nextOpen) {
        // Reset to defaults
        setType('list');
        setListValues('');
        setNumberOperator('between');
        setNumberValue1('');
        setNumberValue2('');
        setTextOperator('contains');
        setTextValue('');
        setDateOperator('before');
        setDateValue1('');
        setDateValue2('');
        setCustomFormula('');
        setInputHint('');
        setOnInvalid('warning');
      }
      onOpenChange(nextOpen);
    },
    [currentRule, onOpenChange],
  );

  const handleApply = useCallback(() => {
    const rule: DataValidationRule = {
      id: currentRule?.id || `dv-${Date.now()}`,
      range: selectedCell,
      type,
      listValues: type === 'list' ? listValues : undefined,
      numberOperator: type === 'number' ? numberOperator : undefined,
      numberValue1: type === 'number' ? numberValue1 : undefined,
      numberValue2: type === 'number' && numberOperator === 'between' ? numberValue2 : undefined,
      textOperator: type === 'text' ? textOperator : undefined,
      textValue: type === 'text' ? textValue : undefined,
      dateOperator: type === 'date' ? dateOperator : undefined,
      dateValue1: type === 'date' ? dateValue1 : undefined,
      dateValue2: type === 'date' && dateOperator === 'between' ? dateValue2 : undefined,
      customFormula: type === 'custom' ? customFormula : undefined,
      inputHint: inputHint || undefined,
      onInvalid,
    };
    onApply(rule);
    onOpenChange(false);
  }, [
    type, listValues, numberOperator, numberValue1, numberValue2,
    textOperator, textValue, dateOperator, dateValue1, dateValue2,
    customFormula, inputHint, onInvalid, selectedCell, currentRule,
    onApply, onOpenChange,
  ]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Data Validation</DialogTitle>
          <DialogDescription>
            Set validation rules for <strong className="text-[var(--color-text-primary)]">{selectedCell}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* ── Validation Type ── */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Criteria Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as ValidationType)}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VALIDATION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ── List Type ── */}
          {type === 'list' && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Values (comma-separated)</Label>
              <Textarea
                className="text-sm min-h-[60px]"
                value={listValues}
                onChange={(e) => setListValues(e.target.value)}
                placeholder="Option A, Option B, Option C"
              />
            </div>
          )}

          {/* ── Number Type ── */}
          {type === 'number' && (
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Operator</Label>
                <Select value={numberOperator} onValueChange={setNumberOperator}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NUMBER_OPERATORS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 flex flex-col gap-1.5">
                  <Label className="text-xs">
                    {numberOperator === 'between' || numberOperator === 'not-between' ? 'From' : 'Value'}
                  </Label>
                  <Input
                    className="h-8 text-sm"
                    type="number"
                    value={numberValue1}
                    onChange={(e) => setNumberValue1(e.target.value)}
                    placeholder="0"
                  />
                </div>
                {(numberOperator === 'between' || numberOperator === 'not-between') && (
                  <div className="flex-1 flex flex-col gap-1.5">
                    <Label className="text-xs">To</Label>
                    <Input
                      className="h-8 text-sm"
                      type="number"
                      value={numberValue2}
                      onChange={(e) => setNumberValue2(e.target.value)}
                      placeholder="100"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Text Type ── */}
          {type === 'text' && (
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Operator</Label>
                <Select value={textOperator} onValueChange={setTextOperator}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEXT_OPERATORS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {textOperator !== 'email' && textOperator !== 'url' && (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Value</Label>
                  <Input
                    className="h-8 text-sm"
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    placeholder="search text"
                  />
                </div>
              )}
            </div>
          )}

          {/* ── Date Type ── */}
          {type === 'date' && (
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Operator</Label>
                <Select value={dateOperator} onValueChange={setDateOperator}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_OPERATORS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 flex flex-col gap-1.5">
                  <Label className="text-xs">{dateOperator === 'between' ? 'From' : 'Date'}</Label>
                  <Input
                    className="h-8 text-sm"
                    type="date"
                    value={dateValue1}
                    onChange={(e) => setDateValue1(e.target.value)}
                  />
                </div>
                {dateOperator === 'between' && (
                  <div className="flex-1 flex flex-col gap-1.5">
                    <Label className="text-xs">To</Label>
                    <Input
                      className="h-8 text-sm"
                      type="date"
                      value={dateValue2}
                      onChange={(e) => setDateValue2(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Custom Formula Type ── */}
          {type === 'custom' && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Formula</Label>
              <Input
                className="h-8 text-sm font-mono"
                value={customFormula}
                onChange={(e) => setCustomFormula(e.target.value)}
                placeholder="=A1>B1"
              />
            </div>
          )}

          {/* ── Input Hint ── */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Input Hint (shown on focus)</Label>
            <Input
              className="h-8 text-sm"
              value={inputHint}
              onChange={(e) => setInputHint(e.target.value)}
              placeholder="Enter a valid value..."
            />
          </div>

          {/* ── On Invalid ── */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">On Invalid Data</Label>
            <Select value={onInvalid} onValueChange={(v) => setOnInvalid(v as 'warning' | 'reject')}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="warning">Show Warning</SelectItem>
                <SelectItem value="reject">Reject Input</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          {currentRule && (
            <Button
              variant="outline"
              size="sm"
              className="mr-auto text-[var(--color-destructive)]"
              onClick={() => {
                onRemove();
                onOpenChange(false);
              }}
            >
              Remove Rule
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" className="bg-[#FF3333] hover:bg-[#e62e2e]" onClick={handleApply}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
