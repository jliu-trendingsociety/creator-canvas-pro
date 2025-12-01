import { Card } from "@/components/ui/card";

const steps = [
  {
    number: "01",
    title: "Choose motion",
    description: "Select a Motion to define how your image will move",
    image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=600&fit=crop"
  },
  {
    number: "02",
    title: "Add image",
    description: "Upload or generate an image to start your animation",
    image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=600&fit=crop"
  },
  {
    number: "03",
    title: "Get video",
    description: "Click generate to create your final animated video!",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=600&fit=crop"
  }
];

export const WorkflowSteps = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {steps.map((step, index) => (
        <Card 
          key={step.number}
          className="step-card bg-card border-border overflow-hidden cursor-pointer group relative"
        >
          <div className="relative h-80 overflow-hidden">
            <div className="absolute top-6 left-6 z-10 bg-neon text-background w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg">
              {step.number}
            </div>
            <img 
              src={step.image} 
              alt={step.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h3 className="text-2xl font-bold mb-3 text-foreground">{step.title}</h3>
              <p className="text-muted-foreground text-base">{step.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
