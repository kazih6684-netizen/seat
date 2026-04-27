import { useState, useMemo } from 'react';
import { Check, Search, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface SearchableDropdownProps {
  options: { id: string; name: string }[];
  placeholder: string;
  onSelect: (option: { id: string; name: string } | null) => void;
  selectedId?: string;
  disabled?: boolean;
}

export function SearchableDropdown({ options, placeholder, onSelect, selectedId, disabled }: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredOptions = useMemo(() => {
    return options.filter(opt => opt.name.toLowerCase().includes(search.toLowerCase()));
  }, [options, search]);

  const selectedOption = options.find(opt => opt.id === selectedId);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        <span className={cn("truncate", !selectedOption && "text-gray-400")}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="flex items-center px-3 py-2 border-bottom border-gray-100">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              autoFocus
              className="w-full text-sm focus:outline-none py-1"
              placeholder="সার্চ করুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onSelect(opt);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className="w-full flex items-center justify-between px-4 py-2 text-left hover:bg-blue-50 transition-colors"
                >
                  <span className="text-sm text-gray-700">{opt.name}</span>
                  {selectedId === opt.id && <Check className="w-4 h-4 text-blue-500" />}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">কিছু পাওয়া যায়নি</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
