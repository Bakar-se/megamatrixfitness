import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { ChevronDown, X } from 'lucide-react';

interface MultiSelectItem {
  label: string;
  value: string;
}

interface MultiSelectWithCheckboxProps {
  items: MultiSelectItem[];
  selectedValues: string[];
  onSelectionChange: (selectedValues: string[]) => void;
  placeholder?: string;
  maxDisplayItems?: number;
  className?: string;
}

const MultiSelectWithCheckbox: React.FC<MultiSelectWithCheckboxProps> = ({
  items,
  selectedValues,
  onSelectionChange,
  placeholder = 'Select items...',
  maxDisplayItems = 2,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCheckboxChange = (value: string) => {
    const newSelection = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onSelectionChange(newSelection);
  };

  const removeItem = (value: string) => {
    const newSelection = selectedValues.filter((v) => v !== value);
    onSelectionChange(newSelection);
  };

  const getSelectedItems = () => {
    return items.filter((item) => selectedValues.includes(item.value));
  };

  const getDisplayText = () => {
    const selectedItems = getSelectedItems();
    if (selectedItems.length === 0) return placeholder;

    if (selectedItems.length <= maxDisplayItems) {
      return selectedItems.map((item) => item.label).join(', ');
    }

    return `${selectedItems
      .slice(0, maxDisplayItems)
      .map((item) => item.label)
      .join(', ')} +${selectedItems.length - maxDisplayItems} more`;
  };

  return (
    <div className={`relative ${className}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={isOpen}
            className='h-auto min-h-[40px] min-w-[200px] justify-between p-2'
          >
            <div className='flex flex-1 flex-wrap gap-1'>
              {selectedValues.length === 0 ? (
                <span className='text-muted-foreground'>{placeholder}</span>
              ) : selectedValues.length <= maxDisplayItems ? (
                getSelectedItems().map((item) => (
                  <Badge
                    key={item.value}
                    variant='secondary'
                    className='flex items-center gap-1'
                  >
                    {item.label}
                    <button
                      type='button'
                      className='hover:text-destructive ml-1 focus:outline-none'
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeItem(item.value);
                      }}
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </Badge>
                ))
              ) : (
                <Badge variant='secondary' className='flex items-center gap-1'>
                  {selectedValues.length} items selected
                  <button
                    type='button'
                    className='hover:text-destructive ml-1 focus:outline-none'
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSelectionChange([]);
                    }}
                  >
                    <X className='h-3 w-3' />
                  </button>
                </Badge>
              )}
            </div>
            <ChevronDown className='h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-full min-w-[300px] p-0' align='start'>
          <div className='max-h-[300px] overflow-y-auto'>
            <div className='border-b p-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>
                  {selectedValues.length} of {items.length} selected
                </span>
                {selectedValues.length > 0 && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => onSelectionChange([])}
                    className='h-auto p-1 text-xs'
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </div>
            <div className='space-y-2 p-2'>
              {items.map((item) => (
                <div
                  key={item.value}
                  className='hover:bg-muted/50 flex cursor-pointer items-center space-x-2 rounded p-2'
                  onClick={() => handleCheckboxChange(item.value)}
                >
                  <Checkbox
                    id={item.value}
                    checked={selectedValues.includes(item.value)}
                    onChange={() => handleCheckboxChange(item.value)}
                  />
                  <Label
                    htmlFor={item.value}
                    className='flex-1 cursor-pointer text-sm'
                  >
                    {item.label}
                  </Label>
                </div>
              ))}
              {items.length === 0 && (
                <div className='text-muted-foreground py-4 text-center text-sm'>
                  No items available
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MultiSelectWithCheckbox;
