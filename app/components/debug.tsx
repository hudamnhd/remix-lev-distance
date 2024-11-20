import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

export const Debug = ({ data }) => {
  return (
    <Accordion type="single" collapsible className="w-fit space-y-2">
      <AccordionItem value="item-1">
        <AccordionTrigger className="flex cursor-pointer items-center gap-1.5 rounded-sm border py-1 px-2 mb-1 text-sm max-w-[70px]">
          DEBUG
        </AccordionTrigger>
        <AccordionContent>
          <pre className="text-xs hyphens-auto break-word whitespace-pre-wrap break-all text-md max-h-[50vh] overflow-y-auto  border border-gray-300 p-4 rounded-l max-w-[50vw]">
            {JSON.stringify(data, null, 2)}
          </pre>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
