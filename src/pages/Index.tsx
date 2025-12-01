import { ControlPanel } from "@/components/VideoCreator/ControlPanel";
import { WorkflowSteps } from "@/components/VideoCreator/WorkflowSteps";
import { Header } from "@/components/VideoCreator/Header";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <ControlPanel />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-8 py-12 space-y-16">
            <section className="space-y-6">
              <h2 className="text-5xl font-bold leading-tight">
                Control Every Camera Move
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Animate your scenes with precision and style. Get full cinematic control over how the camera moves to enhance emotion, rhythm, and storytelling.
              </p>
            </section>

            <WorkflowSteps />

            <section className="text-center py-12">
              <p className="text-sm text-muted-foreground">
                Image to Video
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
