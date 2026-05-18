interface TagFilterProps {
  label: string;
  tags: string[];
  selectedTags: string[];
  onToggle: (tag: string) => void;
  onClear: () => void;
}

function TagFilter({ label, tags, selectedTags, onToggle, onClear }: TagFilterProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-xs font-medium text-app-muted">{label}</p>
        {selectedTags.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-app-muted underline hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onToggle(tag)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs transition ${
                  isSelected
                    ? 'bg-primary text-white'
                    : 'border border-app-border bg-app-card text-foreground hover:border-primary hover:text-primary'
                }`}
              >
                {tag}
              </button>
            );
          })}
      </div>
    </div>
  );
}

export default TagFilter;
