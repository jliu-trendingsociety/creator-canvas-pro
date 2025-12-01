import { Card } from "@/components/ui/card";

const steps = [
  {
    number: "01",
    title: "Choose motion",
    description: "Select a Motion to define how your image will move",
    image: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800&h=600&fit=crop"
  },
  {
    number: "02",
    title: "Add image",
    description: "Upload or generate an image to start your animation",
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop"
  },
  {
    number: "03",
    title: "Get video",
    description: "Click generate to create your final animated video!",
    image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&h=600&fit=crop"
  }
];

export const WorkflowSteps = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {steps.map((step) => (
        <Card 
          key={step.number}
          className="step-card bg-card border-border overflow-hidden cursor-pointer group"
        >
          <div className="relative h-64 overflow-hidden">
            <div className="absolute top-4 left-4 z-10 bg-neon text-primary-foreground w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg">
              {step.number}
            </div>
            <img 
              src={step.image} 
              alt={step.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            <p className="text-muted-foreground text-sm">{step.description}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};
