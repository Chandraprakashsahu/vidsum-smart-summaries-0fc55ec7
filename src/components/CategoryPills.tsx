import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface CategoryPillsProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

const CategoryPills = ({ categories, selected, onSelect }: CategoryPillsProps) => {
  return (
    <ScrollArea className="w-full whitespace-nowrap px-4 pb-4">
      <div className="flex gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selected === category ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect(category)}
            className="rounded-full px-4"
          >
            {category}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" className="invisible" />
    </ScrollArea>
  );
};

export default CategoryPills;
